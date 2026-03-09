/**
 * worker.ts
 * 
 * Multi-purpose worker for MinIO sync and Database Model Registration.
 * Usage:
 *   npx ts-node scripts/worker.ts sync-minio [pull|push]
 *   npx ts-node scripts/worker.ts register-models
 */

import "dotenv/config";
import { S3Client, ListObjectsV2Command, GetObjectCommand, PutObjectCommand, HeadBucketCommand, CreateBucketCommand } from "@aws-sdk/client-s3";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const command = process.argv[2];

async function getPrisma() {
    const connectionString = process.env.DATABASE_URL?.replace("localhost", "127.0.0.1");
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter }) as any;
}

async function streamToBuffer(stream: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const chunks: any[] = [];
        stream.on("data", (chunk: any) => chunks.push(chunk));
        stream.on("error", reject);
        stream.on("end", () => resolve(Buffer.concat(chunks)));
    });
}

async function syncMinio(mode: string = "pull") {
    const remoteConfig = {
        endpoint: process.env.STORAGE_ENDPOINT,
        region: "us-east-1",
        credentials: {
            accessKeyId: process.env.STORAGE_ACCESS_KEY || "",
            secretAccessKey: process.env.STORAGE_SECRET_KEY || ""
        },
        forcePathStyle: true
    };

    const localConfig = {
        endpoint: process.env.LOCAL_STORAGE_ENDPOINT || "http://100.73.191.15:9000",
        region: "us-east-1",
        credentials: {
            accessKeyId: process.env.LOCAL_STORAGE_ACCESS_KEY || "minioadmin",
            secretAccessKey: process.env.LOCAL_STORAGE_SECRET_KEY || "minioadmin"
        },
        forcePathStyle: true
    };

    const BUCKET = process.env.STORAGE_BUCKET || "3dex-models";
    const sourceS3 = new S3Client(mode === "pull" ? remoteConfig : localConfig);
    const destS3 = new S3Client(mode === "pull" ? localConfig : remoteConfig);

    console.log(`--- MinIO Sync: ${mode.toUpperCase()} ---`);
    console.log(`Source: ${mode === "pull" ? remoteConfig.endpoint : localConfig.endpoint}`);
    console.log(`Destination: ${mode === "pull" ? localConfig.endpoint : remoteConfig.endpoint}`);

    try {
        try { await destS3.send(new HeadBucketCommand({ Bucket: BUCKET })); }
        catch {
            console.log(`Info: Destination bucket not found, creating bucket: ${BUCKET}`);
            await destS3.send(new CreateBucketCommand({ Bucket: BUCKET }));
        }

        const { Contents } = await sourceS3.send(new ListObjectsV2Command({ Bucket: BUCKET }));
        if (!Contents || Contents.length === 0) { console.log("Source bucket is empty."); return; }

        console.log(`Found ${Contents.length} items to sync.`);
        for (const item of Contents) {
            const key = item.Key!;
            process.stdout.write(`  Syncing: ${key} ... `);
            const { Body, ContentType } = await sourceS3.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
            const buffer = await streamToBuffer(Body);
            await destS3.send(new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: buffer, ContentType }));
            console.log("done");
        }
    } catch (e: any) {
        console.error("\n[!] MinIO Sync failed:", e.message);
        if (e.code === 'ECONNREFUSED') {
            console.error("    Check if your local MinIO server is running on port 9000.");
        }
        process.exit(1);
    }
}

async function registerModels() {
    console.log("--- Registering MinIO models into local DB ---");
    const prisma = await getPrisma();
    const BUCKET = process.env.STORAGE_BUCKET || "3dex-models";
    const s3 = new S3Client({
        endpoint: process.env.LOCAL_STORAGE_ENDPOINT || "http://127.0.0.1:9000",
        region: "us-east-1",
        credentials: {
            accessKeyId: process.env.LOCAL_STORAGE_ACCESS_KEY || "minioadmin",
            secretAccessKey: process.env.LOCAL_STORAGE_SECRET_KEY || "minioadmin",
        },
        forcePathStyle: true,
    });

    try {
        const { Contents } = await s3.send(new ListObjectsV2Command({ Bucket: BUCKET }));
        if (!Contents) { console.log("No files found in local bucket."); return; }

        const glbKeys = Contents.filter(f => f.Key?.match(/\.(glb|obj|fbx|stl)$/i)).map(f => f.Key!);
        const imageKeys = Contents.filter(f => f.Key?.match(/\.(png|jpg|jpeg|webp)$/i)).map(f => f.Key!);

        const adminUser = await prisma.user.findFirst({ where: { role: "ADMIN" } });
        if (!adminUser) { console.error("Error: No ADMIN user found in database. Run 'npm run setup' first."); process.exit(1); }

        const existing = await prisma.model.findMany({ select: { file_url: true } });
        const existingUrls = new Set(existing.map((m: any) => m.file_url));

        let createdCount = 0;
        for (const glbKey of glbKeys) {
            if (existingUrls.has(glbKey)) continue;

            const ts = (glbKey.match(/^models\/(\d+)-/) || [])[1] || "0";
            const title = glbKey.split("/").pop()?.replace(/^\d+-/, "").replace(/\.[^.]+$/, "").replace(/[+|_]/g, " ") || "Untitled";

            const preview = imageKeys.find(img => img.includes(ts));

            await prisma.model.create({
                data: {
                    title,
                    file_url: glbKey,
                    preview_url: preview || null,
                    status: "APPROVED",
                    artist_id: adminUser.id,
                    price: 0,
                    description: `Automatically registered ${title}`
                }
            });
            console.log(`  Registered: ${title}`);
            createdCount++;
        }
        console.log(`\nRegistration complete! Created: ${createdCount} entries.`);
    } catch (e: any) {
        console.error("\n[!] Registration failed:", e.message);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

(async () => {
    if (command === "sync-minio") await syncMinio(process.argv[3]);
    else if (command === "register-models") await registerModels();
    else {
        console.log("Usage: npx ts-node scripts/worker.ts [sync-minio [pull|push] | register-models]");
        process.exit(1);
    }
})();
