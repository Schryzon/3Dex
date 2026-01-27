import { Request, Response } from "express";
import {
  create_model,
  get_all_models,
  get_model_by_id,
} from "../services/model.service";

export async function list_models(req: Request, res: Response) {
  const models = await get_all_models();
  res.json(models);
}

export async function get_model_detail(req: Request, res: Response) {
  const { id } = req.params;

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
