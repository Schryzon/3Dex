import { Request, Response } from "express";
import * as collectionService from "../services/collection.service";

/**
 * Handle collection creation
 */
export async function create_collection(req: Request, res: Response){
    const user_id = req.user!.id;
    const { name, description: desc, isPublic: is_pub } = req.body;

    if(!name){
        return res.status(400).json({ message: "Name is required" });
    }

    try{
        const coll = await collectionService.create_collection(user_id, name, desc, is_pub);
        res.status(201).json(coll);
    }catch(err: any){
        res.status(400).json({ message: err.message });
    }
}

/**
 * Get current user's collections
 */
export async function get_my_collections(req: Request, res: Response){
    const user_id = req.user!.id;
    try{
        const colls = await collectionService.get_user_collections(user_id);
        res.json({ data: colls });
    }catch(err: any){
        res.status(500).json({ message: err.message });
    }
}

/**
 * Get public collections for a target user
 */
export async function get_user_public_collections(req: Request, res: Response){
    const target_id = req.params.userId as string;
    try{
        const colls = await collectionService.get_public_collections(target_id);
        res.json({ data: colls });
    }catch(err: any){
        res.status(500).json({ message: err.message });
    }
}

/**
 * Get collection by id
 */
export async function get_collection(req: Request, res: Response){
    const coll_id = req.params.id as string;
    const current_id = req.user?.id;

    try{
        const coll = await collectionService.get_collection_details(coll_id);
        if(!coll){
            return res.status(404).json({ message: "Collection not found" });
        }

        if(!coll.is_public && coll.user_id !== current_id){
            return res.status(403).json({ message: "Unauthorized access to private collection" });
        }

        res.json(coll);
    }catch(err: any){
        res.status(500).json({ message: err.message });
    }
}

/**
 * Update collection details
 */
export async function update_collection(req: Request, res: Response){
    const user_id = req.user!.id;
    const coll_id = req.params.id as string;
    const { name, description: desc, isPublic: is_pub } = req.body;

    try{
        const updated = await collectionService.update_collection(coll_id, user_id, { 
            name, 
            desc, 
            is_public: is_pub 
        });
        res.json(updated);
    }catch(err: any){
        res.status(400).json({ message: err.message });
    }
}

/**
 * Delete a collection
 */
export async function delete_collection(req: Request, res: Response){
    const user_id = req.user!.id;
    const coll_id = req.params.id as string;

    try{
        await collectionService.delete_collection(coll_id, user_id);
        res.json({ message: "Collection deleted" });
    }catch(err: any){
        res.status(400).json({ message: err.message });
    }
}

/**
 * Add model to collection
 */
export async function add_item(req: Request, res: Response){
    const user_id = req.user!.id;
    const coll_id = req.params.id as string;
    const { modelId: mod_id } = req.body;

    if(!mod_id){
        return res.status(400).json({ message: "modelId is required" });
    }

    try{
        const item = await collectionService.add_to_collection(coll_id, mod_id, user_id);
        res.json(item);
    }catch(err: any){
        res.status(400).json({ message: err.message });
    }
}

/**
 * Remove model from collection
 */
export async function remove_item(req: Request, res: Response){
    const user_id = req.user!.id;
    const coll_id = req.params.id as string;
    const mod_id = req.params.modelId as string;

    try{
        await collectionService.remove_from_collection(coll_id, mod_id, user_id);
        res.json({ message: "Item removed from collection" });
    }catch(err: any){
        res.status(400).json({ message: err.message });
    }
}
