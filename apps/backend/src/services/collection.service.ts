import prisma from "../prisma";

export async function create_collection(userId: string, name: string, description?: string, isPublic: boolean = true) {
    return prisma.collection.create({
        data: {
            user_id: userId,
            name,
            description,
            is_public: isPublic
        }
    });
}

export async function get_user_collections(userId: string) {
    return prisma.collection.findMany({
        where: { user_id: userId },
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
}

export async function get_public_collections(userId: string) {
    return prisma.collection.findMany({
        where: { user_id: userId, is_public: true },
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
}

export async function get_collection_details(collectionId: string) {
    return prisma.collection.findUnique({
        where: { id: collectionId },
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
}

export async function update_collection(collectionId: string, userId: string, data: { name?: string, description?: string, isPublic?: boolean }) {
    const collection = await prisma.collection.findUnique({ where: { id: collectionId } });
    if (!collection || collection.user_id !== userId) throw new Error("Collection not found or unauthorized");

    return prisma.collection.update({
        where: { id: collectionId },
        data: {
            name: data.name,
            description: data.description,
            is_public: data.isPublic
        }
    });
}

export async function delete_collection(collectionId: string, userId: string) {
    const collection = await prisma.collection.findUnique({ where: { id: collectionId } });
    if (!collection || collection.user_id !== userId) throw new Error("Collection not found or unauthorized");

    return prisma.collection.delete({ where: { id: collectionId } });
}

export async function add_to_collection(collectionId: string, modelId: string, userId: string) {
    const collection = await prisma.collection.findUnique({ where: { id: collectionId } });
    if (!collection || collection.user_id !== userId) throw new Error("Collection not found or unauthorized");

    // Check if model exists
    const model = await prisma.model.findUnique({ where: { id: modelId } });
    if (!model) throw new Error("Model not found");

    // Check if already in collection
    const existing = await prisma.collectionItem.findFirst({
        where: {
            collection_id: collectionId,
            model_id: modelId
        }
    });

    if (existing) return existing;

    return prisma.collectionItem.create({
        data: {
            collection_id: collectionId,
            model_id: modelId
        }
    });
}

export async function remove_from_collection(collectionId: string, modelId: string, userId: string) {
    const collection = await prisma.collection.findUnique({ where: { id: collectionId } });
    if (!collection || collection.user_id !== userId) throw new Error("Collection not found or unauthorized");

    const item = await prisma.collectionItem.findFirst({
        where: {
            collection_id: collectionId,
            model_id: modelId
        }
    });

    if (!item) throw new Error("Item not found in collection");

    return prisma.collectionItem.delete({
        where: { id: item.id }
    });
}
