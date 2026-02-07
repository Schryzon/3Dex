import "dotenv/config"
import * as fs from 'fs';
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

fs.writeFileSync('seed_debug.log', 'Seed script started\n');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🌱 Starting seed...')

    // 1. Create Artist
    const artistEmail = 'artist@3dex.com'
    const artist = await prisma.user.upsert({
        where: { email: artistEmail },
        update: {},
        create: {
            email: artistEmail,
            username: '3DexArtist',
            password: 'password123', // In real app, hash this!
            role: 'ARTIST',
        },
    })
    console.log(`👤 Created user: ${artist.username}`)

    // 2. Create Category
    const categoryName = '3D Assets'
    const category = await prisma.category.upsert({
        where: { name: categoryName },
        update: {},
        create: {
            name: categoryName,
            slug: '3d-assets',
        },
    })
    console.log(`xB4 Created category: ${category.name}`)

    // 3. Create Model
    const modelTitle = 'Low Poly Tree'
    const model = await prisma.model.create({
        data: {
            title: modelTitle,
            description: 'A beautiful low poly tree for your game.',
            price: 16800, // IDR 16,800
            file_url: 'https://example.com/tree.obj',
            preview_url: 'https://example.com/tree.jpg',
            status: 'APPROVED',
            artist_id: artist.id,
            category_id: category.id,
        },
    })
    console.log(`📦 Created model: ${model.title} (ID: ${model.id})`)

    // 4. Create Customer (for login testing)
    const customerEmail = 'meow@a.com'
    const customer = await prisma.user.upsert({
        where: { email: customerEmail },
        update: {},
        create: {
            email: customerEmail,
            username: 'MeowCustomer',
            password: 'meowfish',
            role: 'CUSTOMER',
        },
    })
    console.log(`👤 Created customer: ${customer.username}`)

    // 5. Create 3D Printer User (Service Provider)
    const printerEmail = 'printer@3dex.com'
    const printer = await prisma.user.upsert({
        where: { email: printerEmail },
        update: {},
        create: {
            email: printerEmail,
            username: 'The3DPrinter',
            password: 'password123',
            role: 'ARTIST', // Assuming they offer printing services
        },
    })
    console.log(`👤 Created printer user: ${printer.username}`)

    console.log('✅ Seed complete!')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
