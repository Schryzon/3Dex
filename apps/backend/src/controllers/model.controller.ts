import { Request, Response } from "express";
import { create_model, get_all_models } from "../services/model.service";
import { messageLink } from "discord.js";

export async function list_models(req: Request, res: Response){
    const models = await get_all_models();
    res.json(models);
}

export async function upload_model(req: Request, res: Response){
    const {
        title, description, price,
        file_url, preview_url, artist_id
    } = req.body;

    if(!title || !price || !file_url || !artist_id){
        return res.status(400).json({
            message: "Missing fields!"
        });
    }

    try{
        const model = await create_model({
            title,
            description,
            price: Number(price),
            file_url,
            preview_url,
            artist_id,
        });

        res.status(201).json(model);
    }catch(error: any){
        res.status(500).json({
            message: error.message
        });
    }
}