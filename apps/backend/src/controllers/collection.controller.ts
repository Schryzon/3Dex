import { Request, Response } from "express";
import * as collectionService from "../services/collection.service";

export async function create_collection(req: Request, res: Response) {
    const userId = req.user!.id;
    const { name, description, isPublic } = req.body;

    if (!name) return res.status(400).json({ message: "Name is required" });

    try {
        const collection = await collectionService.create_collection(userId, name, description, isPublic);
        res.status(201).json(collection);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
}

export async function get_my_collections(req: Request, res: Response) {
    const userId = req.user!.id;
    try {
        const collections = await collectionService.get_user_collections(userId);
        res.json({ data: collections });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

export async function get_user_public_collections(req: Request, res: Response) {
    const targetUserId = req.params.userId as string;
    try {
        const collections = await collectionService.get_public_collections(targetUserId);
        res.json({ data: collections });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

export async function get_collection(req: Request, res: Response) {
    const collectionId = req.params.id as string;
    const currentUserId = req.user?.id; // May be undefined if not logged in

    try {
        const collection = await collectionService.get_collection_details(collectionId);
        if (!collection) return res.status(404).json({ message: "Collection not found" });

        // If private, only owner can view
        if (!collection.is_public && collection.user_id !== currentUserId) {
            return res.status(403).json({ message: "Unauthorized access to private collection" });
        }

        res.json(collection);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

export async function update_collection(req: Request, res: Response) {
    const userId = req.user!.id;
    const collectionId = req.params.id as string;
    const { name, description, isPublic } = req.body;

    try {
        const updated = await collectionService.update_collection(collectionId, userId, { name, description, isPublic });
        res.json(updated);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
}

export async function delete_collection(req: Request, res: Response) {
    const userId = req.user!.id;
    const collectionId = req.params.id as string;

    try {
        await collectionService.delete_collection(collectionId, userId);
        res.json({ message: "Collection deleted" });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
}

export async function add_item(req: Request, res: Response) {
    const userId = req.user!.id;
    const collectionId = req.params.id as string;
    const { modelId } = req.body;

    if (!modelId) return res.status(400).json({ message: "modelId is required" });

    try {
        const item = await collectionService.add_to_collection(collectionId, modelId, userId);
        res.json(item);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
}

export async function remove_item(req: Request, res: Response) {
    const userId = req.user!.id;
    const collectionId = req.params.id as string;
    const modelId = req.params.modelId as string;

    try {
        await collectionService.remove_from_collection(collectionId, modelId, userId);
        res.json({ message: "Item removed from collection" });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
}
