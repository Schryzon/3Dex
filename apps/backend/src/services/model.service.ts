import prisma from "../prisma";

export async function create_model(data: {
  title: string;
  description?: string;
  price: number;
  file_url: string;
  preview_url?: string;
  artist_id: string;
}) {
  return prisma.model.create({
    data,
  });
}

export function get_all_models() {
  return prisma.model.findMany({
    select: {
      id: true,
      title: true,
      price: true,
      preview_url: true,
      artist: {
        select: { username: true },
      },
    },
  });
}

export function get_model_by_id(model_id: string) {
  return prisma.model.findUnique({
    where: { id: model_id },
    select: {
      id: true,
      title: true,
      description: true,
      price: true,
      file_url: true,
      preview_url: true,
      created_at: true,
      artist: {
        select: {
          id: true,
          username: true,
        },
      },
    },
  });
}
