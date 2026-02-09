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

    // 2. Create Categories
    const categories = await Promise.all([
        prisma.category.upsert({
            where: { name: 'Characters' },
            update: {},
            create: { name: 'Characters', slug: 'characters' },
        }),
        prisma.category.upsert({
            where: { name: 'Vehicles' },
            update: {},
            create: { name: 'Vehicles', slug: 'vehicles' },
        }),
        prisma.category.upsert({
            where: { name: 'Architecture' },
            update: {},
            create: { name: 'Architecture', slug: 'architecture' },
        }),
        prisma.category.upsert({
            where: { name: 'Nature' },
            update: {},
            create: { name: 'Nature', slug: 'nature' },
        }),
    ])
    console.log(`📁 Created ${categories.length} categories`)

    // 3. Create Sample Models
    const models = [
        {
            title: 'Low Poly Tree',
            description: 'A beautiful low poly tree perfect for game environments.',
            price: 50000,
            file_url: 'https://example.com/tree.obj',
            preview_url: 'https://picsum.photos/400/300?random=1',
            category: categories[3], // Nature
        },
        {
            title: 'Sci-Fi Character',
            description: 'Futuristic character model with detailed textures.',
            price: 150000,
            file_url: 'https://example.com/scifi-char.fbx',
            preview_url: 'https://picsum.photos/400/300?random=2',
            category: categories[0], // Characters
        },
        {
            title: 'Sports Car',
            description: 'High-detail sports car model with interior.',
            price: 200000,
            file_url: 'https://example.com/car.blend',
            preview_url: 'https://picsum.photos/400/300?random=3',
            category: categories[1], // Vehicles
        },
        {
            title: 'Modern House',
            description: 'Contemporary residential building with full interior.',
            price: 300000,
            file_url: 'https://example.com/house.obj',
            preview_url: 'https://picsum.photos/400/300?random=4',
            category: categories[2], // Architecture
        },
        {
            title: 'Fantasy Sword',
            description: 'Detailed medieval fantasy sword with magical effects.',
            price: 75000,
            file_url: 'https://example.com/sword.fbx',
            preview_url: 'https://picsum.photos/400/300?random=5',
            category: categories[0], // Characters
        },
        {
            title: 'Drone Model',
            description: 'Modern quadcopter drone with animated propellers.',
            price: 120000,
            file_url: 'https://example.com/drone.blend',
            preview_url: 'https://picsum.photos/400/300?random=6',
            category: categories[1], // Vehicles
        },
        {
            title: 'Office Building',
            description: 'Commercial office tower with detailed facade.',
            price: 250000,
            file_url: 'https://example.com/office.obj',
            preview_url: 'https://picsum.photos/400/300?random=7',
            category: categories[2], // Architecture
        },
        {
            title: 'Rock Formation',
            description: 'Realistic rock cluster for outdoor scenes.',
            price: 40000,
            file_url: 'https://example.com/rocks.fbx',
            preview_url: 'https://picsum.photos/400/300?random=8',
            category: categories[3], // Nature
        },
    ]

    for (const modelData of models) {
        await prisma.model.create({
            data: {
                title: modelData.title,
                description: modelData.description,
                price: modelData.price,
                file_url: modelData.file_url,
                preview_url: modelData.preview_url,
                status: 'APPROVED',
                artist_id: artist.id,
                category_id: modelData.category.id,
            },
        })
        console.log(`� Created model: ${modelData.title}`)
    }

    console.log(`✅ Created ${models.length} models`)

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
