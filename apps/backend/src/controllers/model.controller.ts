import { Request, Response } from "express";
import {
  create_model,
  get_all_models,
  get_model_by_id,
  update_model_by_id,
  delete_model_by_id,
} from "../services/model.service";
import { get_download_url_s3, sign_user_urls } from "../services/storage.service";
import { get_purchase } from "../services/purchase.service";
import { embed_and_save_model } from "../services/embedding.service";
import prisma from "../prisma";
import { Auth_Request } from "../middlewares/auth.middleware";

export async function list_models(req: Request, res: Response) {
  const {
    search,
    min_price,
    max_price,
    artist_id,
    category_id,
    format,
    types,
    exclude_id,
    sort,
    status, // 'APPROVED' | 'PENDING' | 'REJECTED' | 'ALL'
    is_nsfw,
    page = 1,
    limit = 20
  } = req.query;

  const where: any = {};

  // 1. Filter by Status (Default: APPROVED)
  const user = (req as any).user;
  const is_self = user && artist_id && user.id === artist_id;
  const is_admin = user && user.role === 'ADMIN';

  if (status && status !== 'ALL') {
    where.status = status;
  } else if (status === 'ALL') {
    // Only allow seeing ALL if admin or if looking at own models
    if (is_admin || is_self) {
      // Do nothing, results in no status filter (shows all)
    } else {
      where.status = 'APPROVED';
    }
  } else if (!status) {
    if (is_self) {
      // Show ALL own models by default when looking at own profile
    } else {
      where.status = 'APPROVED';
    }
  }

  // Double check: if NOT admin and NOT self, only show models from active Artists
  if (!is_admin && !is_self) {
    where.artist = {
      role: 'ARTIST'
    };
    // Secara default, Sembunyikan NSFW untuk user biasa/guest kecuali mereka request tampil
    if (is_nsfw !== 'true') {
      where.is_nsfw = false;
    }
  } else {
    // Untuk admin / owner, sembunyikan jika secara eksplisit request false
    if (is_nsfw === 'false') {
      where.is_nsfw = false;
    }
  }

  // 2. Search (Title, Description, Tags, or Category)
  if (search) {
    const searchStr = String(search);
    where.OR = [
      { title: { contains: searchStr, mode: 'insensitive' } },
      { description: { contains: searchStr, mode: 'insensitive' } },
      {
        tags: {
          some: {
            name: { contains: searchStr, mode: 'insensitive' }
          }
        }
      },
      {
        category: {
          name: { contains: searchStr, mode: 'insensitive' }
        }
      }
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

  // 5. Category Filter
  if (category_id) {
    where.category_id = String(category_id);
  }

  // 6. Format Filter (Tags)
  if (format) {
    const formats = Array.isArray(format) ? format : [String(format)];
    if (!where.AND) where.AND = [];
    where.AND.push({
      tags: {
        some: {
          name: { in: formats, mode: 'insensitive' }
        }
      }
    });
  }

  // 7. Types Filter (Tags)
  if (types) {
    const typeList = Array.isArray(types) ? types : [String(types)];
    if (!where.AND) where.AND = [];
    where.AND.push({
      tags: {
        some: {
          name: { in: typeList, mode: 'insensitive' }
        }
      }
    });
  }

  // 8. Exclusion (for Related Products)
  if (exclude_id) {
    where.id = { not: String(exclude_id) };
  }

  // 5. Sorting
  let orderBy: any = { created_at: 'desc' }; // Default: Newest
  if (sort === 'price_asc') orderBy = { price: 'asc' };
  if (sort === 'price_desc') orderBy = { price: 'desc' };
  if (sort === 'oldest') orderBy = { created_at: 'asc' };
  if (sort === 'newest') orderBy = { created_at: 'desc' };
  if (sort === 'rating') orderBy = { avg_rating: 'desc' };
  if (sort === 'popular') orderBy = { review_count: 'desc' };

  // 6. Pagination
  const take = Number(limit);
  const skip = (Number(page) - 1) * take;

  try {
    let raw_models;
    if (search) {
      const searchStr = `%${String(search)}%`;
      // Use raw SQL for better performance/flexibility with ILIKE across multiple fields
      // or stick to Prisma if we want to keep it simple.
      // Given pg_trgm is enabled, we could use % but Prisma's contains already does this.
      raw_models = await prisma.model.findMany({
        where,
        orderBy,
        take,
        skip,
        include: {
          artist: {
            select: { username: true, id: true, avatar_url: true }
          },
          category: true,
          tags: true
        }
      });
    } else {
      raw_models = await prisma.model.findMany({
        where,
        orderBy,
        take,
        skip,
        include: {
          artist: {
            select: { username: true, id: true, avatar_url: true }
          },
          category: true,
          tags: true
        }
      });
    }

    // Helper to sign URLs
    const sign_model = async (m: any) => {
      const model = { ...m };
      if (model.preview_url && !model.preview_url.startsWith("http")) {
        model.preview_url = await get_download_url_s3(model.preview_url);
      }
      // Note: We sign file_url too so frontend can use it (e.g. for viewer)
      // Ideally we should restrict this for paid models, but mimicking existing behavior for now
      if (model.file_url && !model.file_url.startsWith("http")) {
        model.file_url = await get_download_url_s3(model.file_url);
      }
      if (model.artist) {
        model.artist = await sign_user_urls(model.artist);
      }
      return model;
    };

    const models = await Promise.all(raw_models.map(sign_model));

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
  const user = (req as any).user;
  const user_id = user ? String(user.id) : null;

  try {
    const raw_model = await get_model_by_id(id);

    if (!raw_model) {
      return res.status(404).json({
        message: "Model not found!",
      });
    }

    const model: any = { ...raw_model };

    // Check purchase status
    let isPurchased = false;
    if (user_id) {
      const purchase = await get_purchase(user_id, raw_model.id);
      isPurchased = !!purchase;

      // Also treat artist as owner
      if (raw_model.artist_id === user_id) {
        isPurchased = true;
      }
    }
    model.isPurchased = isPurchased;

    if (model.preview_url && !model.preview_url.startsWith("http")) {
      model.preview_url = await get_download_url_s3(model.preview_url);
    }
    if (model.gallery_urls && model.gallery_urls.length > 0) {
      model.gallery_urls = await Promise.all(
        model.gallery_urls.map(async (url: string) => {
          return url.startsWith("http") ? url : await get_download_url_s3(url);
        })
      );
    }
    if (model.file_url && !model.file_url.startsWith("http")) {
      model.file_url = await get_download_url_s3(model.file_url);
    }
    if (model.artist) {
      model.artist = await sign_user_urls(model.artist);
    }

    res.json(model);
  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
}

export async function get_similar_models(req: Request, res: Response) {
  const id = String(req.params.id);
  const limit = Number(req.query.limit) || 4;

  try {
    // Fetch similar models using pgvector cosine distance (<=>)
    const similar_raw: any[] = await prisma.$queryRaw`
      SELECT m.id, m.title, m.price, m.preview_url, m.is_nsfw, m.avg_rating, m.review_count, m.created_at,
             json_build_object('id', u.id, 'username', u.username, 'avatar_url', u.avatar_url) as artist
      FROM "Model" m
      JOIN "User" u ON m.artist_id = u.id
      WHERE m.id != ${id} 
        AND m.status = 'APPROVED'
        AND m.embedding IS NOT NULL
      ORDER BY m.embedding <=> (SELECT embedding FROM "Model" WHERE id = ${id})
      LIMIT ${limit};
    `;

    // Helper to sign URLs
    const sign_model = async (m: any) => {
      const model = { ...m };
      if (model.preview_url && !model.preview_url.startsWith("http")) {
        model.preview_url = await get_download_url_s3(model.preview_url);
      }
      if (model.artist) {
        model.artist = await sign_user_urls(model.artist);
      }
      return model;
    };

    const models = await Promise.all(similar_raw.map(sign_model));

    res.json({ data: models });
  } catch (error: any) {
    console.error("Error in get_similar_models:", error);
    res.status(500).json({ message: error.message });
  }
}

export async function upload_model(req: Request, res: Response) {
  const { title, description, price, file_url, preview_url, gallery_urls, artist_id, category, tags, is_nsfw, license, is_printable } =
    req.body;

  if (!title || price === undefined || !file_url || !artist_id) {
    return res.status(400).json({
      message: "Missing fields!",
    });
  }

  // Auto-determine file format from extension
  const file_format = file_url.split('.').pop()?.toLowerCase();
  if (file_format !== 'glb' && file_format !== 'gltf') {
    return res.status(400).json({
      message: "Invalid file format! Only .glb and .gltf are allowed.",
    });
  }

  try {
    // Lookup category if provided as string (slug)
    let category_id = undefined;
    if (category) {
      const cat = await prisma.category.findUnique({ where: { slug: category } });
      if (cat) category_id = cat.id;
    }

    const model = await create_model({
      title,
      description,
      price: Number(price),
      file_url,
      preview_url,
      gallery_urls: Array.isArray(gallery_urls) ? gallery_urls : undefined,
      artist_id,
      category_id,
      tags: Array.isArray(tags) ? tags : undefined,
      is_nsfw: !!is_nsfw,
      license: license,
      is_printable: is_printable !== undefined ? !!is_printable : true,
      file_format: file_format
    });

    // Fire & Forget: Background Embedding for Dēxie
    embed_and_save_model(model.id).catch(err => console.error("[Dēxie Background] Failed to embed:", err.message));

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

    // Check purchase
    const purchase = await get_purchase(user_id, model_id);

    // Allow download if:
    // 1. User has purchased it
    // 2. User is the artist (owner)
    // 3. User is an ADMIN
    // 4. Model is FREE (price === 0)
    if (!purchase && model.artist_id !== user_id && user.role !== "ADMIN" && model.price > 0) {
      return res.status(403).json({
        message: "You have not purchased this model!"
      });
    }

    let download_url = model.file_url;
    if (model.file_url && !model.file_url.startsWith("http")) {
      download_url = await get_download_url_s3(model.file_url);
    }

    return res.json({
      download_url: download_url,
      license: purchase ? purchase.license : "creator",
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

    if (model.artist_id !== user_id && user_role !== "ADMIN") {
      return res.status(403).json({
        message: "You are not authorized to delete this model!",
      });
    }

    // Audit log — always written (admin requires a reason, artist gets auto-reason)
    if (user_role === "ADMIN") {
      const { reason } = req.body;
      if (!reason || !reason.trim()) {
        return res.status(400).json({ message: "Admins must provide a reason when deleting a model." });
      }

      await prisma.admin_Audit_Log.create({
        data: {
          admin_id: user_id,
          action: "DELETE_MODEL",
          target_id: model_id,
          target_type: "MODEL",
          reason: reason.trim(),
          metadata: {
            title: (model as any).title,
            artist_id: (model as any).artist_id,
            artist_username: (model as any).artist?.username || null,
            price: (model as any).price,
            deleted_by: "ADMIN",
          },
        },
      });
    } else {
      // Artist deleting their own model — audited automatically, no reason required
      await prisma.admin_Audit_Log.create({
        data: {
          admin_id: user_id,           // the artist acts as the "actor" in this log
          action: "DELETE_MODEL",
          target_id: model_id,
          target_type: "MODEL",
          reason: "Owner-initiated deletion",
          metadata: {
            title: (model as any).title,
            artist_id: (model as any).artist_id,
            artist_username: (model as any).artist?.username || null,
            price: (model as any).price,
            deleted_by: "OWNER",
          },
        },
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

export async function update_model(req: Request, res: Response) {
  const model_id = String(req.params.id);
  const user = (req as Auth_Request).user;
  const user_id = String(user.id);
  const user_role = user.role;

  try {
    const model = await get_model_by_id(model_id);

    if (!model) {
      return res.status(404).json({ message: "Model not found!" });
    }

    if (model.artist_id !== user_id && user_role !== "ADMIN") {
      return res.status(403).json({ message: "You are not authorized to edit this model!" });
    }

    const { title, description, price, category, license, is_printable, is_nsfw, tags } = req.body;

    const updated = await update_model_by_id(model_id, {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(price !== undefined && { price: Number(price) }),
      ...(category !== undefined && { category }),
      ...(license !== undefined && { license }),
      ...(is_printable !== undefined && { is_printable: !!is_printable }),
      ...(is_nsfw !== undefined && { is_nsfw: !!is_nsfw }),
      ...(tags !== undefined && { tags: Array.isArray(tags) ? tags : undefined }),
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

import { get_upload_url } from "../services/storage.service";

export async function get_upload_signed_url(req: Request, res: Response) {
  const { filename, content_type } = req.body;

  if (!filename || !content_type) {
    return res.status(400).json({
      message: "Missing filename or content_type!",
    });
  }

  // Allowed types: GLB for models, Images for thumbnails
  const allowed_types = [
    "model/gltf-binary",
    "image/jpeg",
    "image/png",
    "image/webp"
  ];

  const allowed_extensions = [".glb", ".jpg", ".jpeg", ".png", ".webp"];

  const has_valid_extension = allowed_extensions.some(ext => filename.toLowerCase().endsWith(ext));

  if (!has_valid_extension || !allowed_types.includes(content_type)) {
    return res.status(400).json({
      message: "Invalid file type! Only .glb and images (.jpg, .png, .webp) are allowed.",
    });
  }

  try {
    const { url, key } = await get_upload_url(filename, content_type);

    res.json({
      upload_url: url,
      key: key
    });
  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
}
