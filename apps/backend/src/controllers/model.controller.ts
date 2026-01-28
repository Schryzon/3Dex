import { Request, Response } from "express";
import {
  create_model,
  get_all_models,
  get_model_by_id,
} from "../services/model.service";
import { get_purchase } from "../services/purchase.service";

export async function list_models(req: Request, res: Response) {
  const models = await get_all_models();
  res.json(models);
}

export async function get_model_detail(req: Request, res: Response) {
  const id = String(req.params.id);

  try {
    const model = await get_model_by_id(id);

    if (!model) {
      return res.status(404).json({
        message: "Model not found",
      });
    }

    res.json(model);
  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
}

export async function upload_model(req: Request, res: Response) {
  const { title, description, price, file_url, preview_url, artist_id } =
    req.body;

  if (!title || !price || !file_url || !artist_id) {
    return res.status(400).json({
      message: "Missing fields!",
    });
  }

  try {
    const model = await create_model({
      title,
      description,
      price: Number(price),
      file_url,
      preview_url,
      artist_id,
    });

    res.status(201).json(model);
  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
}

export async function download_model(req: Request, res: Response){
  const model_id = String(req.params.id);
  const user_id = String((req as any).user.user_id);

  try{
    const model = await get_model_by_id(model_id);

    if(!model){
      return res.status(404).json({
        message: "Model not found!",
      });
    }

    const purchase = await get_purchase(user_id, model_id);

    if(!purchase){
      return res.status(403).json({
        message: "You have not purchased this model!"
      });
    }

    return res.json({
      download_url: model.file_url,
      license: purchase.license,
    });

  }catch(error: any){
    res.status(500).json({
      message: error.message
    });
  }
}