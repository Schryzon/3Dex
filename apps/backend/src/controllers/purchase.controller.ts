import { Request, Response } from "express";
import { create_purchase, has_purchased } from "../services/purchase.service";
import { get_model_by_id } from "../services/model.service";

export async function buy_model(req: Request, res: Response) {
  const { id: model_id } = req.params;
  const { license } = req.body;
  const user_id = (req as any).user.user_id;

  if (!license) {
    return res.status(400).json({
      message: "License type required!",
    });
  }

  if (!["PERSONAL_USE", "COMMERCIAL_USE"].includes(license)) {
    return res.status(400).json({
      message: "Invalid license type!",
    });
  }

  try {
    const model = await get_model_by_id(model_id);

    if (!model) {
      return res.status(404).json({
        message: "Model not found!",
      });
    }

    const already_bought = await has_purchased(user_id, model_id);

    if (already_bought) {
      return res.status(409).json({
        message: "Already purchased!",
      });
    }

    const purchase = await create_purchase({
      user_id,
      model_id,
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
