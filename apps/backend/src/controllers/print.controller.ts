import { Response } from "express";
import { Auth_Request } from "../middlewares/auth.middleware";
import prisma from "../prisma";

/**
 * Get available printing providers
 * Filter by: Location (City/Country), Rating, Material
 */
export async function get_providers(req: Auth_Request, res: Response): Promise<void> {
    const city = req.query.city as string;
    const country = req.query.country as string;
    const material = req.query.material as string;
    const sort = req.query.sort as string;

    // 1. Fetch all approved providers
    const providers = await prisma.user.findMany({
        where: {
            role: 'PROVIDER',
            account_status: 'APPROVED'
        },
        select: {
            id: true,
            username: true,
            display_name: true,
            avatar_url: true,
            location: true,
            addresses: true,
            provider_config: true,
            rating: true,
            review_count: true
        }
    });

    // 2. Filter in memory (for flexibility with JSON fields)
    let results = providers.filter(p => {
        // Material Filter
        if (material) {
            const config = p.provider_config as any;
            if (!config || !config.materials || !Array.isArray(config.materials)) return false;
            // Case insensitive check
            const has_material = config.materials.some((m: string) => m.toLowerCase().includes(String(material).toLowerCase()));
            if (!has_material) return false;
        }
        return true;
    });

    // 3. Score/Sort by Location
    if (city || country) {
        results = results.map(p => {
            let score = 0;
            const addresses = p.addresses as any[];
            if (addresses && addresses.length > 0) {
                // Check if any address matches
                for (const addr of addresses) {
                    if (city && addr.city && addr.city.toLowerCase() === String(city).toLowerCase()) {
                        score += 10;
                    }
                    if (country && addr.country && addr.country.toLowerCase() === String(country).toLowerCase()) {
                        score += 5;
                    }
                }
            }
            return { ...p, location_score: score };
        }).sort((a, b) => b.location_score - a.location_score);
    } else if (sort === 'rating') {
        results.sort((a, b) => b.rating - a.rating);
    }

    res.json(results);
}

/**
 * Create a Print Order
 */
export async function create_print_order(req: Auth_Request, res: Response): Promise<void> {
    const { id: user_id } = req.user;
    const { provider_id, items, shipping_address, courier_name } = req.body;
    // items: [{ model_id, print_config: { material, color, scale } }]

    if (!provider_id || !items || !Array.isArray(items) || items.length === 0) {
        res.status(400).json({ message: "Provider and items are required!" });
        return;
    }

    // Verify Provider
    const provider = await prisma.user.findUnique({
        where: { id: String(provider_id) }
    });
    if (!provider || provider.role !== 'PROVIDER') {
        res.status(400).json({ message: "Invalid provider!" });
        return;
    }

    // Create Order
    // Calculate total? For now assume 0 or calculated by Provider later? 
    // Usually marketplace calculates price based on volume * provider rate.
    // For MVP, let's set status to PENDING and user might need to pay later?
    // OR assume fixed price?
    // Let's assume price is 0 (Quotable) or sum of model prices (if buying models too)?
    // If it's a Print Service on OWNED models?
    // "create_print_order" -> implies purchasing the service.
    // Let's set type PRINT_JOB and status PENDING.

    try {
        const order = await prisma.order.create({
            data: {
                user_id,
                provider_id,
                type: 'PRINT_JOB',
                status: 'PENDING', // Payment pending? or Approval pending?
                // If it's a quote system, it starts as PENDING acceptance.
                // Let's assume regular flow:
                shipping_address: shipping_address,
                courier_name: courier_name,

                items: {
                    create: items.map((item: any) => ({
                        model_id: item.model_id,
                        price: 0, // Quote needed? Or calculated?
                        print_config: item.print_config,
                        print_status: 'PENDING'
                    }))
                }
            }
        });

        res.status(201).json(order);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

/**
 * Manage Print Order (Provider)
 * Accept, Reject, Update Status
 */
export async function manage_print_order(req: Auth_Request, res: Response): Promise<void> {
    const { id: provider_id } = req.user;
    const order_id = req.params.order_id as string;
    const { action, tracking_number } = req.body; // action: 'ACCEPT', 'REJECT', 'SHIP', 'COMPLETE'

    const order = await prisma.order.findUnique({
        where: { id: order_id },
        include: { items: true }
    });

    if (!order) {
        res.status(404).json({ message: "Order not found!" });
        return;
    }

    if (order.provider_id !== provider_id) {
        res.status(403).json({ message: "Not your order!" });
        return;
    }

    let updateData: any = {};
    let itemStatus = '';

    switch (action) {
        case 'ACCEPT':
            itemStatus = 'ACCEPTED';
            // Maybe set total_amount here if quoting?
            break;
        case 'REJECT':
            itemStatus = 'CANCELLED';
            updateData.status = 'CANCELLED';
            break;
        case 'SHIP':
            if (!tracking_number) {
                res.status(400).json({ message: "Tracking number required for shipping!" });
                return;
            }
            itemStatus = 'SHIPPED';
            updateData.tracking_number = tracking_number;
            break;
        case 'COMPLETE':
            itemStatus = 'DELIVERED';
            break;
        default:
            res.status(400).json({ message: "Invalid action!" });
            return;
    }

    // Update all items status (Simplification: order has one status or all items move together)
    // The schema has print_status on Order_Item.

    await prisma.order.update({
        where: { id: order_id },
        data: updateData
    });

    // Update items
    if (itemStatus) {
        // Need to loop or updateMany
        // updateMany doesn't support relation filtering well until recent Prisma versions?
        // But here we can find by order_id
        await prisma.order_Item.updateMany({
            where: { order_id: order_id },
            data: { print_status: itemStatus as any }
        });
    }

    res.json({ message: `Order ${action}ED successfully!` });
}

/**
 * Get Provider Orders (Incoming Jobs)
 */
export async function get_provider_jobs(req: Auth_Request, res: Response): Promise<void> {
    const { id: provider_id } = req.user;

    const jobs = await prisma.order.findMany({
        where: {
            provider_id,
            type: 'PRINT_JOB'
        },
        include: {
            user: { select: { username: true, avatar_url: true } },
            items: { include: { model: true } }
        },
        orderBy: { created_at: 'desc' }
    });

    res.json(jobs);
}
