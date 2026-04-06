import prisma from "../prisma";

export async function create_model(data: {
  title: string;
  description?: string;
  price: number;
  file_url: string;
  preview_url?: string;
  gallery_urls?: string[];
  artist_id: string;
  category_id?: string;
  tags?: string[];
  is_nsfw?: boolean;
  license?: "PERSONAL_USE" | "COMMERCIAL_USE";
  is_printable?: boolean;
  file_format?: string;
}) {
  const { tags, ...rest } = data;

  return prisma.model.create({
    data: {
      ...rest,
      tags: tags ? {
        connectOrCreate: tags.map(tag => ({
          where: { name: tag },
          create: { name: tag }
        }))
      } : undefined
    },
    include: {
      tags: true,
      category: true
    }
  });
}

export function get_all_models() {
  return prisma.model.findMany({
    select: {
      id: true,
      title: true,
      price: true,
      preview_url: true,
      gallery_urls: true,
      is_nsfw: true,
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
      gallery_urls: true,
      created_at: true,
      is_nsfw: true,
      status: true,
      license: true,
      is_printable: true,
      file_format: true,
      artist_id: true,
      artist: {
        select: {
          id: true,
          username: true,
        },
      },
    },
  });
}

export async function update_model_by_id(
  model_id: string,
  data: {
    title?: string;
    description?: string;
    price?: number;
    category?: string;
    license?: "PERSONAL_USE" | "COMMERCIAL_USE";
    is_printable?: boolean;
    is_nsfw?: boolean;
    tags?: string[];
    file_format?: string;
  }
) {
  let category_id: string | undefined = undefined;

  if (data.category) {
    const cat = await prisma.category.findUnique({ where: { slug: data.category } });
    if (!cat) {
      // Try by name (case-insensitive fallback)
      const catByName = await prisma.category.findFirst({
        where: { name: { equals: data.category, mode: 'insensitive' } }
      });
      if (catByName) category_id = catByName.id;
    } else {
      category_id = cat.id;
    }
  }

  return prisma.model.update({
    where: { id: model_id },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.price !== undefined && { price: data.price }),
      ...(category_id !== undefined && { category_id }),
      ...(data.license !== undefined && { license: data.license }),
      ...(data.is_printable !== undefined && { is_printable: data.is_printable }),
      ...(data.is_nsfw !== undefined && { is_nsfw: data.is_nsfw }),
      ...(data.file_format !== undefined && { file_format: data.file_format }),
      ...(data.tags !== undefined && {
        tags: {
          set: [], // Clear existing
          connectOrCreate: data.tags.map(tag => ({
            where: { name: tag },
            create: { name: tag }
          }))
        }
      }),
    },
    include: {
      tags: true,
      category: true,
      artist: { select: { id: true, username: true, avatar_url: true } }
    }
  });
}

export function delete_model_by_id(model_id: string) {
  return prisma.model.delete({
    where: { id: model_id },
  });
}
