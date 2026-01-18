import prisma from "../prisma";

export async function create_model(
    data:{
        title: string;
        description?: string;
        price: number;
        file_url: string;
        preview_url?: string;
        artist_id: string;
    }
){
    return prisma.model.create({
        data,
    });
}

export function get_all_models(){
    return prisma.model.findMany({
        include: {
            artist: {
                select:{
                    id: true,
                    username: true
                },
            },
        },
    });
}