import { Request, Response } from "express";
import { create_purchase, has_purchased, get_user_purchases } from "../services/purchase.service";
import { get_model_by_id } from "../services/model.service";

export async function buy_model(req: Request, res: Response) {
  // Funny ass hack to make it accept string | string[]
  const id = String(req.params.id);
  
  const license = String(req.body.license) as "PERSONAL_USE" | "COMMERCIAL_USE";
  const user_id = String((req as any).user.user_id);

  if (!license) {
    return res.status(400).json({
      message: "License type required!",
    });
  }

  if (!(["PERSONAL_USE", "COMMERCIAL_USE"].includes(license))) {
    return res.status(400).json({
      message: "Invalid license type!",
    });
  }

  try {
    const model = await get_model_by_id(id);

    if (!model) {
      return res.status(404).json({
        message: "Model not found!",
      });
    }
    const already_bought = await has_purchased(user_id, model.id);

    if (already_bought) {
      return res.status(409).json({
        message: "Already purchased!",
      });
    }

    const purchase = await create_purchase({
      user_id,
      model_id: model.id,
      price_paid: model.price, // Snapshot price
      license,
    });

    res.status(201).json({
      message: "Purchase successful",
      purchase,
    });
  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
}

export async function my_purchases(req: Request, res: Response){
  const user_id = String((req as any).user.user_id);
  
  try{
    const purchases = await get_user_purchases(user_id);
    res.json(purchases);

  }catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
}
