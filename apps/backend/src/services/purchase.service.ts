import prisma from "../prisma";
import { get_download_url_s3 } from "./storage.service";

export async function create_purchase(data: {
  user_id: string;
  model_id: string;
  price_paid: number;
  license: "PERSONAL_USE" | "COMMERCIAL_USE";
}) {
  return prisma.purchase.create({
    data,
  });
}

export async function has_purchased(user_id: string, model_id: string) {
  const existing = await prisma.purchase.findFirst({
    where: { user_id, model_id },
  });

  return !!existing;
}

// Same thing as above tbh, but not bool
export async function get_purchase(user_id: string, model_id: string) {
  return prisma.purchase.findFirst({
    where: { user_id, model_id },
  });
}

export async function get_user_purchases(user_id: string) {
  const purchases = await prisma.purchase.findMany({
    where: { user_id },
    orderBy: { created_at: "desc" },
    select: {
      id: true,
      price_paid: true,
      license: true,
      created_at: true,
      model: {
        select: {
          id: true,
          title: true,
          preview_url: true,
        },
      },
    },
  });
  return Promise.all(
    purchases.map(async (purchase) => ({
      ...purchase,
      model: purchase.model?.preview_url && !purchase.model.preview_url.startsWith("http")
        ? {
          ...purchase.model,
          preview_url: await get_download_url_s3(purchase.model.preview_url),
        }
        : purchase.model,
    }))
  );
}
