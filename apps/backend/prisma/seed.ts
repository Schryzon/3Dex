import "dotenv/config";
import * as fs from 'fs';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as bcrypt from "bcrypt";

fs.writeFileSync('seed_debug.log', 'Seed script started\n');

// Force 127.0.0.1 to avoid Windows IPv6 localhost issues
const connectionString = process.env.DATABASE_URL?.replace('localhost', '127.0.0.1');

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🌱 Starting full non-model seed...');
    console.log('DB URL (Effective):', connectionString ? connectionString.replace(/:[^:]*@/, ':****@') : 'UNDEFINED');

    const p = prisma as any;

    // Hash the standard exhibition password
    const hashedPassword = await bcrypt.hash('12345678', 10);

    // Note: Model-related tables (Model, Order, Review, Wishlist, Cart_Item, etc.)
    // are NOT seeded here because object storage is currently empty.

    // -------------------------------------------------------------
    // 1. Categories
    // -------------------------------------------------------------
    const categoryData = [
        { name: 'Characters', slug: 'characters' },
        { name: 'Vehicles', slug: 'vehicles' },
        { name: 'Architecture', slug: 'architecture' },
        { name: 'Nature', slug: 'nature' },
        { name: 'Props & Weapons', slug: 'props-weapons' },
        { name: 'Electronics', slug: 'electronics' },
        { name: 'Miniatures', slug: 'miniatures' },
        { name: 'Robotics & Sci-Fi', slug: 'robotics-scifi' },
    ];

    const categories: any[] = [];
    for (const cat of categoryData) {
        const item = await p.category.upsert({
            where: { name: cat.name },
            update: { slug: cat.slug },
            create: cat,
        });
        categories.push(item);
    }
    console.log(`📁 Seeded ${categories.length} categories`);

    // -------------------------------------------------------------
    // 2. Tags
    // -------------------------------------------------------------
    const tagNames = [
        'Low Poly',
        'Sci-Fi',
        'Game Ready',
        'Architecture',
        'Nature',
        'Cyberpunk',
        'Fantasy',
        '3D Printable',
        'Rigged',
        'Animated',
        'Photorealistic',
        'FDM Ready'
    ];

    const tags: any[] = [];
    for (const tagName of tagNames) {
        const tag = await p.tag.upsert({
            where: { name: tagName },
            update: {},
            create: { name: tagName },
        });
        tags.push(tag);
    }
    console.log(`🏷️ Seeded ${tags.length} tags`);

    // -------------------------------------------------------------
    // 3. Comprehensive Users (Role & Status permutations + OSM Address)
    // -------------------------------------------------------------
    const usersData = [
        // --- ADMIN ---
        {
            email: 'admin@3dex.com',
            username: '3DexAdmin',
            display_name: '3Dēx Administrator',
            role: 'ADMIN',
            account_status: 'APPROVED',
            bio: 'Master administrator of the 3Dēx platform. Moderating quality and keeping systems healthy.',
            location: 'Jakarta Pusat, DKI Jakarta, Indonesia',
            phone_number: '081122334455',
            rating: 5.0,
            review_count: 0,
            addresses: [
                {
                    label: 'Jl. M.H. Thamrin No. 1, Menteng',
                    city: 'Jakarta Pusat',
                    province: 'DKI Jakarta',
                    region: 'DKI Jakarta',
                    country: 'Indonesia',
                    details: 'Gedung Wisma Nusantara Lantai 18',
                    postalCode: '10310',
                    postal_code: '10310',
                    lat: -6.1924,
                    lng: 106.8227,
                }
            ],
            social_twitter: 'https://twitter.com/3dex_official',
            social_artstation: 'https://artstation.com',
            social_behance: 'https://behance.net',
            social_instagram: 'https://instagram.com',
        },

        // --- ARTIST: APPROVED ---
        {
            email: 'artist@3dex.com',
            username: 'artist_approved',
            display_name: 'AeroSculpt Studio',
            role: 'ARTIST',
            account_status: 'APPROVED',
            bio: 'Senior 3D Artist specializing in game-ready hard surface assets, mech concepts, and stylized environments.',
            location: 'Bandung, Jawa Barat, Indonesia',
            phone_number: '081234567890',
            rating: 4.9,
            review_count: 14,
            addresses: [
                {
                    label: 'Jl. Ir. H. Juanda (Dago) No. 88',
                    city: 'Bandung',
                    province: 'Jawa Barat',
                    region: 'Jawa Barat',
                    country: 'Indonesia',
                    details: 'Studio AeroCreative Lt. 2',
                    postalCode: '40132',
                    postal_code: '40132',
                    lat: -6.8905,
                    lng: 107.6105,
                }
            ],
            portfolio: [
                { title: 'Cyberpunk Mech Suit', url: 'https://picsum.photos/600/400?random=21', description: 'Hard surface mech model with 4K PBR textures' },
                { title: 'Fantasy Dragon Bust', url: 'https://picsum.photos/600/400?random=22', description: 'High-poly ZBrush sculpture optimized for 3D printing' }
            ],
            social_artstation: 'https://artstation.com/aerosculpt',
            social_instagram: 'https://instagram.com/aerosculpt.3d',
            approved_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },

        // --- ARTIST: PENDING ---
        {
            email: 'artist_pending@3dex.com',
            username: 'artist_pending',
            display_name: 'VoxelCraft Design',
            role: 'ARTIST',
            account_status: 'PENDING',
            bio: 'Aspiring low-poly modeler and environment artist seeking creator approval.',
            location: 'Yogyakarta, DI Yogyakarta, Indonesia',
            phone_number: '081398765432',
            rating: 0,
            review_count: 0,
            addresses: [
                {
                    label: 'Jl. Malioboro No. 42',
                    city: 'Yogyakarta',
                    province: 'DI Yogyakarta',
                    region: 'DI Yogyakarta',
                    country: 'Indonesia',
                    details: 'Ruko Malioboro Creative Hub',
                    postalCode: '55271',
                    postal_code: '55271',
                    lat: -7.7928,
                    lng: 110.3658,
                }
            ],
            portfolio: [
                { title: 'Low Poly Isometric Island', url: 'https://picsum.photos/600/400?random=23', description: 'Blender low-poly environment' }
            ],
            status_history: [
                { status: 'PENDING', date: new Date().toISOString(), note: 'Applied for artist role' }
            ]
        },

        // --- ARTIST: REJECTED ---
        {
            email: 'artist_rejected@3dex.com',
            username: 'artist_rejected',
            display_name: 'QuickRip Renders',
            role: 'ARTIST',
            account_status: 'REJECTED',
            bio: '3D model collector and exporter.',
            location: 'Surabaya, Jawa Timur, Indonesia',
            phone_number: '081555667788',
            rating: 1.0,
            review_count: 1,
            addresses: [
                {
                    label: 'Jl. Pemuda No. 31',
                    city: 'Surabaya',
                    province: 'Jawa Timur',
                    region: 'Jawa Timur',
                    country: 'Indonesia',
                    details: 'Unit 4B',
                    postalCode: '60271',
                    postal_code: '60271',
                    lat: -7.2655,
                    lng: 112.7483,
                }
            ],
            rejected_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            status_history: [
                { status: 'REJECTED', date: new Date().toISOString(), reason: 'Portfolio quality does not meet our minimum guidelines. Please provide original meshes.' }
            ]
        },

        // --- PROVIDER: APPROVED ---
        {
            email: 'provider@3dex.com',
            username: 'provider_approved',
            display_name: 'ProPrint Lab Jakarta',
            role: 'PROVIDER',
            account_status: 'APPROVED',
            bio: 'Top-tier 3D printing hub in South Jakarta. Equipped with industrial Bambu Lab X1C and Elegoo Saturn 4 Ultra printers.',
            location: 'Jakarta Selatan, DKI Jakarta, Indonesia',
            phone_number: '081809112233',
            rating: 4.95,
            review_count: 28,
            addresses: [
                {
                    label: 'Jl. Senopati No. 15, Kebayoran Baru',
                    city: 'Jakarta Selatan',
                    province: 'DKI Jakarta',
                    region: 'DKI Jakarta',
                    country: 'Indonesia',
                    details: 'ProPrint Studio & Workshop',
                    postalCode: '12190',
                    postal_code: '12190',
                    lat: -6.2301,
                    lng: 106.8105,
                }
            ],
            provider_config: {
                materials: ['PLA+', 'PETG', 'ABS', 'Resin 8K', 'TPU 95A', 'Nylon PA12'],
                colors: ['Matte Black', 'Pure White', 'Space Grey', 'Signal Red', 'Navy Blue', 'Cyber Yellow', 'Transparent Clear'],
                printerTypes: ['FDM (Bambu X1C)', 'SLA (Elegoo Saturn 4)', 'MSLA', 'SLS'],
                basePrice: 35000,
                maxDimensions: { x: 300, y: 300, z: 350 }
            },
            approved_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        },

        // --- PROVIDER: PENDING ---
        {
            email: 'provider_pending@3dex.com',
            username: 'provider_pending',
            display_name: 'Banten Rapid Prototyping',
            role: 'PROVIDER',
            account_status: 'PENDING',
            bio: 'New workshop offering rapid 3D printing and custom architectural mockups.',
            location: 'Tangerang, Banten, Indonesia',
            phone_number: '081777889900',
            rating: 0,
            review_count: 0,
            addresses: [
                {
                    label: 'Jl. Boulevard Gading Serpong',
                    city: 'Tangerang',
                    province: 'Banten',
                    region: 'Banten',
                    country: 'Indonesia',
                    details: 'Ruko Fluorite No. 12',
                    postalCode: '15810',
                    postal_code: '15810',
                    lat: -6.2422,
                    lng: 106.6288,
                }
            ],
            provider_config: {
                materials: ['PLA', 'PETG', 'ABS'],
                colors: ['Black', 'White', 'Grey'],
                printerTypes: ['FDM (Ender 3 V3)'],
                basePrice: 25000,
                maxDimensions: { x: 220, y: 220, z: 250 }
            },
            status_history: [
                { status: 'PENDING', date: new Date().toISOString(), note: 'Submitted provider onboarding request' }
            ]
        },

        // --- PROVIDER: REJECTED ---
        {
            email: 'provider_rejected@3dex.com',
            username: 'provider_rejected',
            display_name: 'BudgetPrints99',
            role: 'PROVIDER',
            account_status: 'REJECTED',
            bio: 'Small hobbyist printing desk.',
            location: 'Bekasi, Jawa Barat, Indonesia',
            phone_number: '081999887766',
            rating: 2.0,
            review_count: 3,
            addresses: [
                {
                    label: 'Jl. Ahmad Yani No. 10',
                    city: 'Bekasi',
                    province: 'Jawa Barat',
                    region: 'Jawa Barat',
                    country: 'Indonesia',
                    details: 'Rumah Tinggal Blok B2',
                    postalCode: '17141',
                    postal_code: '17141',
                    lat: -6.2383,
                    lng: 106.9924,
                }
            ],
            provider_config: {
                materials: ['PLA'],
                colors: ['White'],
                printerTypes: ['FDM'],
                basePrice: 10000,
                maxDimensions: { x: 150, y: 150, z: 150 }
            },
            rejected_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
            status_history: [
                { status: 'REJECTED', date: new Date().toISOString(), reason: 'Provider did not pass bed leveling and calibration verification.' }
            ]
        },

        // --- CUSTOMER 1: APPROVED ---
        {
            email: 'customer@3dex.com',
            username: 'customer_main',
            display_name: 'Rian Pratama',
            role: 'CUSTOMER',
            account_status: 'APPROVED',
            bio: '3D printing enthusiast, tabletop miniature collector, and tech enthusiast.',
            location: 'Jakarta Pusat, DKI Jakarta, Indonesia',
            phone_number: '081288990011',
            rating: 5.0,
            review_count: 0,
            addresses: [
                {
                    label: 'Jl. Salemba Raya No. 4',
                    city: 'Jakarta Pusat',
                    province: 'DKI Jakarta',
                    region: 'DKI Jakarta',
                    country: 'Indonesia',
                    details: 'Apartemen Salemba Residence Tower B 14-08',
                    postalCode: '10430',
                    postal_code: '10430',
                    lat: -6.1955,
                    lng: 106.8524,
                }
            ],
        },

        // --- CUSTOMER 2: APPROVED ---
        {
            email: 'buyer@3dex.com',
            username: 'customer_buyer',
            display_name: 'Siti Rahma',
            role: 'CUSTOMER',
            account_status: 'APPROVED',
            bio: 'Interior designer and digital asset buyer.',
            location: 'Denpasar, Bali, Indonesia',
            phone_number: '081377889922',
            rating: 5.0,
            review_count: 0,
            addresses: [
                {
                    label: 'Jl. Teuku Umar No. 50',
                    city: 'Denpasar',
                    province: 'Bali',
                    region: 'Bali',
                    country: 'Indonesia',
                    details: 'Denpasar Design Studio',
                    postalCode: '80113',
                    postal_code: '80113',
                    lat: -8.6705,
                    lng: 115.2126,
                }
            ],
        },
    ];

    const seededUsers: Record<string, any> = {};

    for (const u of usersData) {
        const user = await p.user.upsert({
            where: { email: u.email },
            update: {
                username: u.username,
                display_name: u.display_name,
                password: hashedPassword,
                role: u.role,
                account_status: u.account_status,
                bio: u.bio,
                location: u.location,
                phone_number: u.phone_number,
                addresses: u.addresses,
                provider_config: (u as any).provider_config || undefined,
                portfolio: (u as any).portfolio || [],
                rating: u.rating,
                review_count: u.review_count,
                social_twitter: u.social_twitter,
                social_artstation: u.social_artstation,
                social_behance: u.social_behance,
                social_instagram: u.social_instagram,
                approved_at: (u as any).approved_at || undefined,
                rejected_at: (u as any).rejected_at || undefined,
                status_history: (u as any).status_history || [],
            },
            create: {
                email: u.email,
                username: u.username,
                display_name: u.display_name,
                password: hashedPassword,
                role: u.role,
                account_status: u.account_status,
                bio: u.bio,
                location: u.location,
                phone_number: u.phone_number,
                addresses: u.addresses,
                provider_config: (u as any).provider_config || undefined,
                portfolio: (u as any).portfolio || [],
                rating: u.rating,
                review_count: u.review_count,
                social_twitter: u.social_twitter,
                social_artstation: u.social_artstation,
                social_behance: u.social_behance,
                social_instagram: u.social_instagram,
                approved_at: (u as any).approved_at || undefined,
                rejected_at: (u as any).rejected_at || undefined,
                status_history: (u as any).status_history || [],
            },
        });
        seededUsers[u.email] = user;
        console.log(`👤 Seeded User: [${user.role}] ${user.username} (${user.email}) - Status: ${user.account_status}`);
    }

    // -------------------------------------------------------------
    // 4. Social Feed (Posts, Comments, Likes)
    // -------------------------------------------------------------
    const artist = seededUsers['artist@3dex.com'];
    const provider = seededUsers['provider@3dex.com'];
    const customer = seededUsers['customer@3dex.com'];
    const buyer = seededUsers['buyer@3dex.com'];

    if (artist && provider && customer) {
        // Post 1 by Artist
        let post1 = await p.post.findFirst({
            where: { user_id: artist.id, caption: { startsWith: 'Excited to showcase' } }
        });
        if (!post1) {
            post1 = await p.post.create({
                data: {
                    user_id: artist.id,
                    caption: 'Excited to showcase our latest hard-surface robotic arm concept! Engineered for both VFX and high-tolerance resin printing. 🤖✨ #3DModeling #Robotics',
                    media_urls: ['https://picsum.photos/800/600?random=30'],
                    like_count: 2,
                    comment_count: 2,
                    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                }
            });

            await p.post_Like.upsert({
                where: { user_id_post_id: { user_id: customer.id, post_id: post1.id } },
                update: {},
                create: { user_id: customer.id, post_id: post1.id }
            });
            if (buyer) {
                await p.post_Like.upsert({
                    where: { user_id_post_id: { user_id: buyer.id, post_id: post1.id } },
                    update: {},
                    create: { user_id: buyer.id, post_id: post1.id }
                });
            }

            await p.post_Comment.create({
                data: {
                    user_id: customer.id,
                    post_id: post1.id,
                    content: 'The topology on that robotic joint looks super clean! Amazing work 🙌',
                }
            });

            await p.post_Comment.create({
                data: {
                    user_id: provider.id,
                    post_id: post1.id,
                    content: 'Ready to test print this anytime at our South Jakarta workshop! ⚡',
                }
            });
        }

        // Post 2 by Provider
        let post2 = await p.post.findFirst({
            where: { user_id: provider.id, caption: { startsWith: 'Fresh off the Bambu' } }
        });
        if (!post2) {
            post2 = await p.post.create({
                data: {
                    user_id: provider.id,
                    caption: 'Fresh off the Bambu Lab X1C print bed! Carbon-fiber reinforced PETG housing prototype. Crisp 0.12mm layer lines and zero warping. DM or order via print services! 🖨️🚀 #3DPrinting #Prototyping #BambuLab',
                    media_urls: ['https://picsum.photos/800/600?random=31'],
                    like_count: 2,
                    comment_count: 1,
                    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
                }
            });

            await p.post_Like.upsert({
                where: { user_id_post_id: { user_id: customer.id, post_id: post2.id } },
                update: {},
                create: { user_id: customer.id, post_id: post2.id }
            });
            if (buyer) {
                await p.post_Like.upsert({
                    where: { user_id_post_id: { user_id: buyer.id, post_id: post2.id } },
                    update: {},
                    create: { user_id: buyer.id, post_id: post2.id }
                });
            }

            await p.post_Comment.create({
                data: {
                    user_id: customer.id,
                    post_id: post2.id,
                    content: 'Those layer lines are practically invisible. Ordering my custom enclosure today! 📦',
                }
            });
        }

        console.log('💬 Seeded social posts, likes, and comments');
    }

    // -------------------------------------------------------------
    // 5. Follow Relationships
    // -------------------------------------------------------------
    if (customer && artist) {
        await p.follow.upsert({
            where: { follower_id_following_id: { follower_id: customer.id, following_id: artist.id } },
            update: {},
            create: { follower_id: customer.id, following_id: artist.id },
        });
    }

    if (customer && provider) {
        await p.follow.upsert({
            where: { follower_id_following_id: { follower_id: customer.id, following_id: provider.id } },
            update: {},
            create: { follower_id: customer.id, following_id: provider.id },
        });
    }

    if (buyer && artist) {
        await p.follow.upsert({
            where: { follower_id_following_id: { follower_id: buyer.id, following_id: artist.id } },
            update: {},
            create: { follower_id: buyer.id, following_id: artist.id },
        });
    }

    console.log('👥 Seeded follower relationships');

    // -------------------------------------------------------------
    // 6. User Reviews (Customer reviews Provider service)
    // -------------------------------------------------------------
    if (customer && provider) {
        await p.user_Review.upsert({
            where: { reviewer_id_target_user_id: { reviewer_id: customer.id, target_user_id: provider.id } },
            update: { rating: 5, comment: 'Exceptional print quality and super fast turnaround in Jakarta! Highly recommended.' },
            create: {
                reviewer_id: customer.id,
                target_user_id: provider.id,
                rating: 5,
                comment: 'Exceptional print quality and super fast turnaround in Jakarta! Highly recommended.'
            }
        });
        console.log('⭐ Seeded User Reviews');
    }

    console.log('🎉 Full non-model seed completed successfully!');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error('❌ Seed execution failed:', e);
        await prisma.$disconnect();
        process.exit(1);
    });
