import prisma from "../prisma";
import { get_download_url_s3, sign_user_urls } from "./storage.service";

async function sign_preview(preview_url?: string | null) {
    if (!preview_url || preview_url.startsWith("http")) return preview_url;
    return get_download_url_s3(preview_url);
}

/**
 * Create a new collection
 */
export async function create_collection(user_id: string, name: string, desc?: string, is_public: boolean = true){
    return prisma.collection.create({
        data: {
            user_id,
            name,
            description: desc,
            is_public
        }
    });
}

/**
 * Get collections for a user
 */
export async function get_user_collections(user_id: string){
    const collections = await prisma.collection.findMany({
        where: { user_id },
        include: {
            _count: {
                select: { items: true }
            },
            items: {
                take: 3,
                orderBy: { added_at: 'desc' },
                include: {
                    model: {
                        select: { preview_url: true }
                    }
                }
            }
        },
        orderBy: { created_at: 'desc' }
    });
    return Promise.all(
        collections.map(async (collection) => ({
            ...collection,
            items: await Promise.all(
                collection.items.map(async (item) => ({
                    ...item,
                    model: {
                        ...item.model,
                        preview_url: await sign_preview(item.model?.preview_url),
                    },
                }))
            ),
        }))
    );
}

/**
 * Get public collections for a user
 */
export async function get_public_collections(user_id: string){
    const collections = await prisma.collection.findMany({
        where: { user_id, is_public: true },
        include: {
            _count: {
                select: { items: true }
            },
            items: {
                take: 3,
                orderBy: { added_at: 'desc' },
                include: {
                    model: {
                        select: { preview_url: true }
                    }
                }
            }
        },
        orderBy: { created_at: 'desc' }
    });
    return Promise.all(
        collections.map(async (collection) => ({
            ...collection,
            items: await Promise.all(
                collection.items.map(async (item) => ({
                    ...item,
                    model: {
                        ...item.model,
                        preview_url: await sign_preview(item.model?.preview_url),
                    },
                }))
            ),
        }))
    );
}

/**
 * Get detailed collection info
 */
export async function get_collection_details(coll_id: string){
    const collection = await prisma.collection.findUnique({
        where: { id: coll_id },
        include: {
            user: { select: { username: true, display_name: true, avatar_url: true } },
            items: {
                include: {
                    model: {
                        select: {
                            id: true,
                            title: true,
                            price: true,
                            preview_url: true,
                            artist: { select: { username: true, display_name: true } },
                        }
                    }
                },
                orderBy: { added_at: 'desc' }
            }
        }
    });
    if (!collection) return collection;
    return {
        ...collection,
        user: await sign_user_urls(collection.user),
        items: await Promise.all(
            collection.items.map(async (item) => ({
                ...item,
                model: {
                    ...item.model,
                    preview_url: await sign_preview(item.model?.preview_url),
                },
            }))
        ),
    };
}

/**
 * Update collection metadata
 */
export async function update_collection(coll_id: string, user_id: string, data: { name?: string, desc?: string, is_public?: boolean }){
    const coll = await prisma.collection.findUnique({ where: { id: coll_id } });
    if(!coll || coll.user_id !== user_id){
        throw new Error("Collection not found or unauthorized");
    }

    return prisma.collection.update({
        where: { id: coll_id },
        data: {
            name: data.name,
            description: data.desc,
            is_public: data.is_public
        }
    });
}

/**
 * Delete a collection
 */
export async function delete_collection(coll_id: string, user_id: string){
    const coll = await prisma.collection.findUnique({ where: { id: coll_id } });
    if(!coll || coll.user_id !== user_id){
        throw new Error("Collection not found or unauthorized");
    }

    return prisma.collection.delete({ where: { id: coll_id } });
}

/**
 * Add model to collection
 */
export async function add_to_collection(coll_id: string, mod_id: string, user_id: string){
    const coll = await prisma.collection.findUnique({ where: { id: coll_id } });
    if(!coll || coll.user_id !== user_id){
        throw new Error("Collection not found or unauthorized");
    }

    const model = await prisma.model.findUnique({ where: { id: mod_id } });
    if(!model){
        throw new Error("Model not found");
    }

    const exist = await prisma.collection_Item.findFirst({
        where: {
            collection_id: coll_id,
            model_id: mod_id
        }
    });

    if(exist){
        return exist;
    }

    return prisma.collection_Item.create({
        data: {
            collection_id: coll_id,
            model_id: mod_id
        }
    });
}

/**
 * Remove model from collection
 */
export async function remove_from_collection(coll_id: string, mod_id: string, user_id: string){
    const coll = await prisma.collection.findUnique({ where: { id: coll_id } });
    if(!coll || coll.user_id !== user_id){
        throw new Error("Collection not found or unauthorized");
    }

    const item = await prisma.collection_Item.findFirst({
        where: {
            collection_id: coll_id,
            model_id: mod_id
        }
    });

    if(!item){
        throw new Error("Item not found in collection");
    }

    return prisma.collection_Item.delete({
        where: { id: item.id }
    });
}
