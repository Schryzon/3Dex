import prisma from "../prisma";

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
