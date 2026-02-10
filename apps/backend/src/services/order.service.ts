import prisma from "../prisma";
import { create_snap_transaction, verify_signature } from "./midtrans.service";

/**
 * create_order
 * Creates a new order and initiates Midtrans Snap transaction
 */
export async function create_order(user_id: string, model_ids: string[]) {
    // 1. Fetch models to get current prices
    const models = await prisma.model.findMany({
        where: {
            id: { in: model_ids },
        },
    });

    if (models.length !== model_ids.length) {
        throw new Error("One or more items not found");
    }

    // 2. Calculate Total (IDR)
    const total_amount = models.reduce((sum, model) => sum + model.price, 0);

    // 3. Create Pending Order
    const order = await prisma.order.create({
        data: {
            user_id,
            total_amount,
            status: "PENDING",
            type: "ASSET", // Default for now
            items: {
                create: models.map((model) => ({
                    model_id: model.id,
                    price: model.price,
                })),
            },
        },
    });

    // 4. Get Snap Token
    const snap_response = await create_snap_transaction(order.id, total_amount);

    // 5. Update Order with Token
    await prisma.order.update({
        where: { id: order.id },
        data: {
            snap_token: snap_response.token,
            snap_redirect_url: snap_response.redirect_url,
        },
    });

    return {
        order_id: order.id,
        token: snap_response.token,
        redirect_url: snap_response.redirect_url,
    };
}

/**
 * handle_payment_webhook
 * Processes Midtrans notification
 */
export async function handle_payment_webhook(notification: any) {
    const {
        order_id,
        status_code,
        gross_amount,
        signature_key,
        transaction_status,
        payment_type,
        transaction_id,
        fraud_status,
    } = notification;

    // 1. Verify Signature
    const is_valid = verify_signature(
        order_id,
        status_code,
        gross_amount,
        signature_key
    );

    if (!is_valid) {
        throw new Error("Invalid Signature");
    }

    // 2. Determine New Status
    let new_status: "PAID" | "PENDING" | "FAILED" | "CANCELLED" = "PENDING";

    if (transaction_status == "capture") {
        if (fraud_status == "challenge") {
            // TODO: Handle excessive fraud challenge
            new_status = "PENDING";
        } else if (fraud_status == "accept") {
            new_status = "PAID";
        }
    } else if (transaction_status == "settlement") {
        new_status = "PAID";
    } else if (
        transaction_status == "cancel" ||
        transaction_status == "deny" ||
        transaction_status == "expire"
    ) {
        new_status = "FAILED";
    } else if (transaction_status == "pending") {
        new_status = "PENDING";
    }

    // 3. Update Order and Log Payment
    const order = await prisma.order.update({
        where: { id: order_id },
        data: {
            status: new_status,
            payments: {
                create: {
                    transaction_id,
                    payment_type,
                    gross_amount: Number(gross_amount),
                    transaction_status,
                    fraud_status,
                    raw_response: notification,
                },
            },
        },
        include: {
            items: true,
        },
    });

    // 4. If PAID, Grant Access (Create Purchases)
    if (new_status === "PAID") {
        // Check for existing purchases to avoid duplicates
        // (Prisma createMany is safer, or loop)
        for (const item of order.items) {
            if (item.model_id) {
                // Upsert to be safe
                await prisma.purchase.upsert({
                    where: {
                        user_id_model_id: {
                            user_id: order.user_id,
                            model_id: item.model_id,
                        },
                    },
                    update: {}, // Already exists, do nothing
                    create: {
                        user_id: order.user_id,
                        model_id: item.model_id,
                        price_paid: item.price,
                        license: "PERSONAL_USE",
                    },
                });
            }
        }
    }

    return { status: "OK", order_status: new_status };
}
