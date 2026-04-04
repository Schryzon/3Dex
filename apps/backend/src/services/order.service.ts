import prisma from "../prisma";
import { create_snap_transaction, verify_signature } from "./midtrans.service";
import { get_download_url_s3 } from "./storage.service";

export type CheckoutLine = { model_id: string; quantity: number };

/**
 * create_order
 * Creates a new order from cart-aligned line items and initiates Midtrans Snap.
 * Validates that requested lines match the user's cart (model_id + quantity per line).
 */
export async function create_order(user_id: string, items: CheckoutLine[]) {
    if (!items?.length) {
        throw new Error("items array is required");
    }

    for (const it of items) {
        if (!it.model_id || it.quantity < 1) {
            throw new Error("Each item needs model_id and quantity >= 1");
        }
    }

    const cart_rows = await prisma.cart_Item.findMany({
        where: { user_id },
    });

    const cartQty = new Map<string, number>();
    for (const row of cart_rows) {
        cartQty.set(row.model_id, row.quantity);
    }

    const requestQty = new Map<string, number>();
    for (const it of items) {
        requestQty.set(it.model_id, (requestQty.get(it.model_id) ?? 0) + it.quantity);
    }

    if (cartQty.size !== requestQty.size) {
        throw new Error("Checkout items must match your cart");
    }
    for (const [model_id, qty] of requestQty) {
        if (cartQty.get(model_id) !== qty) {
            throw new Error("Checkout items must match your cart");
        }
    }

    const model_ids = [...requestQty.keys()];
    const models = await prisma.model.findMany({
        where: { id: { in: model_ids } },
    });
    const modelMap = new Map(models.map((m) => [m.id, m]));

    let total_amount = 0;
    const lineCreates: { model_id: string; price: number; quantity: number }[] = [];

    for (const [model_id, quantity] of requestQty) {
        const model = modelMap.get(model_id);
        if (!model) {
            throw new Error("One or more items not found");
        }
        if (model.price === 0) {
            throw new Error("Free models are not sold via checkout");
        }
        const line_total = model.price * quantity;
        total_amount += line_total;
        lineCreates.push({
            model_id: model.id,
            price: model.price,
            quantity,
        });
    }

    const order = await prisma.order.create({
        data: {
            user_id,
            total_amount,
            status: "PENDING",
            type: "ASSET",
            items: {
                create: lineCreates.map((line) => ({
                    model_id: line.model_id,
                    price: line.price,
                    quantity: line.quantity,
                })),
            },
        },
    });

    const snap_response = await create_snap_transaction(order.id, total_amount);

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

    const is_valid = verify_signature(
        order_id,
        status_code,
        gross_amount,
        signature_key
    );

    if (!is_valid) {
        throw new Error("Invalid Signature");
    }

    let new_status: "PAID" | "PENDING" | "FAILED" | "CANCELLED" = "PENDING";

    if (transaction_status == "capture") {
        if (fraud_status == "challenge") {
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

    const existingOrder = await prisma.order.findUnique({
        where: { id: order_id }
    });

    if (!existingOrder) {
        console.warn(`Order ${order_id} not found. Likely a Midtrans test webhook.`);
        return { status: "OK", message: "Order not found, skipping update" };
    }

    const order = await prisma.order.update({
        where: { id: order_id },
        data: {
            status: new_status,
        },
        include: {
            items: true,
        },
    });

    await prisma.payment.upsert({
        where: { transaction_id },
        update: {
            transaction_status,
            fraud_status,
            raw_response: notification,
        },
        create: {
            order_id,
            transaction_id,
            payment_type,
            gross_amount: Number(gross_amount),
            transaction_status,
            fraud_status,
            raw_response: notification,
        },
    });

    if (new_status === "PAID") {
        for (const item of order.items) {
            if (item.model_id) {
                const line_total = item.price * (item.quantity ?? 1);
                await prisma.purchase.upsert({
                    where: {
                        user_id_model_id: {
                            user_id: order.user_id,
                            model_id: item.model_id,
                        },
                    },
                    update: {},
                    create: {
                        user_id: order.user_id,
                        model_id: item.model_id,
                        price_paid: line_total,
                        license: "PERSONAL_USE",
                    },
                });
            }
        }
    }

    return { status: "OK", order_status: new_status };
}

export async function get_user_orders(user_id: string) {
    const orders = await prisma.order.findMany({
        where: { user_id },
        include: {
            items: {
                include: {
                    model: {
                        select: {
                            id: true,
                            title: true,
                            preview_url: true,
                            price: true,
                            artist: {
                                select: {
                                    username: true,
                                    avatar_url: true
                                }
                            }
                        }
                    }
                }
            }
        },
        orderBy: {
            created_at: 'desc'
        }
    });

    return Promise.all(
        orders.map(async (order) => ({
            ...order,
            items: await Promise.all(
                order.items.map(async (item) => {
                    if (!item.model?.preview_url || item.model.preview_url.startsWith("http")) {
                        return item;
                    }
                    return {
                        ...item,
                        model: {
                            ...item.model,
                            preview_url: await get_download_url_s3(item.model.preview_url),
                        },
                    };
                })
            ),
        }))
    );
}
