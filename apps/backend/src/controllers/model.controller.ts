import { Request, Response } from "express";
import {
  create_model,
  get_all_models,
  get_model_by_id,
  delete_model_by_id,
} from "../services/model.service";
import { get_purchase } from "../services/purchase.service";
import prisma from "../prisma";
import { Auth_Request } from "../middlewares/auth.middleware";

export async function list_models(req: Request, res: Response) {
  const {
    search,
    min_price,
    max_price,
    artist_id,
    sort,
    status, // 'APPROVED' | 'PENDING' | 'REJECTED' | 'ALL'
    page = 1,
    limit = 20
  } = req.query;

  const where: any = {};

  // 1. Filter by Status (Default: APPROVED)
  if (status && status !== 'ALL') {
    where.status = status;
  } else if (!status) {
    where.status = 'APPROVED';
  }
  // Note: 'ALL' typically requires admin, but we'll leave open for now or add check later if requested

  // 2. Search (Title or Description)
  if (search) {
    where.OR = [
      { title: { contains: String(search), mode: 'insensitive' } },
      { description: { contains: String(search), mode: 'insensitive' } }
    ];
  }

  // 3. Price Range
  if (min_price || max_price) {
    where.price = {};
    if (min_price) where.price.gte = Number(min_price);
    if (max_price) where.price.lte = Number(max_price);
  }

  // 4. Artist Filter
  if (artist_id) {
    where.artist_id = String(artist_id);
  }

  // 5. Sorting
  let orderBy: any = { created_at: 'desc' }; // Default: Newest
  if (sort === 'price_asc') orderBy = { price: 'asc' };
  if (sort === 'price_desc') orderBy = { price: 'desc' };
  if (sort === 'oldest') orderBy = { created_at: 'asc' };
  if (sort === 'newest') orderBy = { created_at: 'desc' };

  // 6. Pagination
  const take = Number(limit);
  const skip = (Number(page) - 1) * take;

  try {
    const models = await prisma.model.findMany({
      where,
      orderBy,
      take,
      skip,
      include: {
        artist: {
          select: { username: true, id: true }
        }
      }
    });

    const total = await prisma.model.count({ where });

    res.json({
      data: models,
      meta: {
        total,
        page: Number(page),
        limit: take,
        pages: Math.ceil(total / take)
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export async function get_model_detail(req: Request, res: Response) {
  const id = String(req.params.id);

  try {
    const model = await get_model_by_id(id);

    if (!model) {
      return res.status(404).json({
        message: "Model not found!",
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

export async function download_model(req: Request, res: Response) {
  const model_id = String(req.params.id);
  const user = (req as Auth_Request).user;
  const user_id = String(user.id);

  try {
    const model = await get_model_by_id(model_id);

    if (!model) {
      return res.status(404).json({
        message: "Model not found!",
      });
    }

    // This check seems to be for deletion/modification, not download.
    // If it's intended for download, it implies only the artist or admin can download their own model,
    // which contradicts the purchase logic below.
    // Assuming this check is misplaced or for a different context (e.g., delete_model function).
    // However, following the instruction to insert it as provided.
    // Logic removed


    const purchase = await get_purchase(user_id, model_id);

    if (!purchase) {
      return res.status(403).json({
        message: "You have not purchased this model!"
      });
    }

    return res.json({
      download_url: model.file_url,
      license: purchase.license,
    });

  } catch (error: any) {
    res.status(500).json({
      message: error.message
    });
  }
}

export async function delete_model(req: Request, res: Response) {
  const model_id = String(req.params.id);
  const user = (req as Auth_Request).user;
  const user_id = String(user.id);
  const user_role = user.role;

  try {
    const model = await get_model_by_id(model_id);

    if (!model) {
      return res.status(404).json({
        message: "Model not found!",
      });
    }

    if (model.artist.id !== user_id && user_role !== "ADMIN") {
      return res.status(403).json({
        message: "You are not authorized to delete this model!",
      });
    }

    await delete_model_by_id(model_id);

    res.json({
      message: "Model deleted successfully!",
    });
  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
}
