/**
 * register_minio_models.ts
 * 
 * Scans local MinIO for .glb files and registers them in the database
 * as PENDING models (waiting admin approval), pairing each with a
 * preview image that has a matching or close timestamp.
 * 
 * Usage: npx ts-node scripts/register_minio_models.ts
 */

import "dotenv/config";
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// --- Config ---
const localMinioConfig = {
    endpoint: "http://localhost:9000",
    region: "us-east-1",
    credentials: {
        accessKeyId: "minioadmin",           // docker-compose default
        secretAccessKey: "minioadmin",       // docker-compose default
    },
    forcePathStyle: true,
};

const BUCKET = process.env.STORAGE_BUCKET || "3dex-models";

const connectionString = process.env.DATABASE_URL?.replace("localhost", "127.0.0.1");
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter }) as any;

const s3 = new S3Client(localMinioConfig);

// --- Helper: extract timestamp from key like "models/1771594423632-filename.glb" ---
function extractTimestamp(key: string): number {
    const filename = key.split("/").pop() || "";
    const match = filename.match(/^(\d+)-/);
    return match ? parseInt(match[1]) : 0;
}

function extractTitle(key: string): string {
    const filename = key.split("/").pop() || "";
    // Remove timestamp prefix and extension
    return filename
        .replace(/^\d+-/, "")
        .replace(/\.(glb|obj|fbx|stl|blend)$/i, "")
        .replace(/[_+]/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        || "Untitled Model";
}

async function main() {
    console.log("Scanning local MinIO for .glb files...");

    // List all objects
    const { Contents } = await s3.send(new ListObjectsV2Command({ Bucket: BUCKET }));
    if (!Contents || Contents.length === 0) {
        console.log("No files found in local MinIO bucket.");
        return;
    }

    // Separate GLB files and image files
    const glbKeys = Contents.filter(f => f.Key?.match(/\.(glb|obj|fbx|stl)$/i)).map(f => f.Key!);
    const imageKeys = Contents.filter(f => f.Key?.match(/\.(png|jpg|jpeg|webp)$/i)).map(f => f.Key!);

    console.log(`Found: ${glbKeys.length} model files, ${imageKeys.length} image files`);

    // Get existing model file_urls so we don't duplicate
    const existing = await prisma.model.findMany({ select: { file_url: true } });
    const existingUrls = new Set(existing.map((m: any) => m.file_url));

    // Find admin user to attribute models to
    const adminUser = await prisma.user.findFirst({ where: { role: "ADMIN" } });
    if (!adminUser) {
        console.error("No ADMIN user found in DB. Please create one first.");
        process.exit(1);
    }
    console.log(`Attributing to admin: ${adminUser.username} (${adminUser.id})`);

    let created = 0;
    let skipped = 0;

    for (const glbKey of glbKeys) {
        // Skip if already registered
        if (existingUrls.has(glbKey)) {
            console.log(`Skip (already in DB): ${glbKey}`);
            skipped++;
            continue;
        }

        const glbTimestamp = extractTimestamp(glbKey);
        const title = extractTitle(glbKey);

        // Find the closest image (within 5 minutes of the GLB timestamp)
        let bestImageKey: string | undefined;
        let bestDiff = Infinity;
        for (const imgKey of imageKeys) {
            const imgTs = extractTimestamp(imgKey);
            const diff = Math.abs(imgTs - glbTimestamp);
            if (diff < bestDiff && diff < 5 * 60 * 1000) { // within 5 min
                bestDiff = diff;
                bestImageKey = imgKey;
            }
        }

        console.log(`Creating: "${title}"`);
        console.log(`  GLB:     ${glbKey}`);
        console.log(`  Preview: ${bestImageKey || "(none)"}`);

        await prisma.model.create({
            data: {
                title,
                description: "",
                price: 0,
                file_url: glbKey,
                preview_url: bestImageKey || null,
                status: "PENDING", // Requires admin approval
                artist_id: adminUser.id,
            },
        });

        created++;
    }

    console.log(`\nDone! Created: ${created}, Skipped (already existed): ${skipped}`);
    console.log("New models are PENDING — approve them at /admin/models");
}

main()
    .then(() => prisma.$disconnect())
    .catch((e) => {
        console.error(e);
        prisma.$disconnect();
        process.exit(1);
    });
