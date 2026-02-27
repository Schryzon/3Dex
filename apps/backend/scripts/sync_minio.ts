import { S3Client, ListObjectsV2Command, GetObjectCommand, PutObjectCommand, HeadBucketCommand, CreateBucketCommand } from "@aws-sdk/client-s3";
import "dotenv/config";

const mode = process.argv[2] || "pull";

// REMOTE (Server Asal/Tujuan Pusat)
const remoteConfig = {
    endpoint: process.env.STORAGE_ENDPOINT, 
    region: "us-east-1",
    credentials: {
        accessKeyId: process.env.STORAGE_ACCESS_KEY || "",
        secretAccessKey: process.env.STORAGE_SECRET_KEY || ""
    },
    forcePathStyle: true
};

// LOCAL (Laptop Kamu)
const localConfig = {
    endpoint: "http://localhost:9000",
    region: "us-east-1",
    credentials: {
        accessKeyId: process.env.LOCAL_STORAGE_ACCESS_KEY || "minioadmin",
        secretAccessKey: process.env.LOCAL_STORAGE_SECRET_KEY || "minioadmin"
    },
    forcePathStyle: true
};

const BUCKET_NAME = process.env.STORAGE_BUCKET || "3dex-models";

// Tentukan arah berdasarkan argumen
const sourceConfig = mode === "pull" ? remoteConfig : localConfig;
const destConfig = mode === "pull" ? localConfig : remoteConfig;

const sourceS3 = new S3Client(sourceConfig);
const destS3 = new S3Client(destConfig);

async function streamToBuffer(stream: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const chunks: any[] = [];
        stream.on("data", (chunk: any) => chunks.push(chunk));
        stream.on("error", reject);
        stream.on("end", () => resolve(Buffer.concat(chunks)));
    });
}

async function sync() {
    console.log(`Starting MinIO Sync [${mode.toUpperCase()}]...`);
    console.log(`Source: ${sourceConfig.endpoint}`);
    console.log(`Destination: ${destConfig.endpoint}`);
    console.log(`Bucket: ${BUCKET_NAME}`);

    if (sourceConfig.endpoint === destConfig.endpoint) {
        console.error("Error: Source dan Destination sama! Pastikan STORAGE_ENDPOINT bukan localhost jika ingin Pull.");
        process.exit(1);
    }

    try {
        // Ensure bucket exists in destination
        try {
            await destS3.send(new HeadBucketCommand({ Bucket: BUCKET_NAME }));
        } catch (err: any) {
            console.log(`Destination bucket not found, creating bucket: ${BUCKET_NAME}`);
            await destS3.send(new CreateBucketCommand({ Bucket: BUCKET_NAME }));
        }

        const listCommand = new ListObjectsV2Command({ Bucket: BUCKET_NAME });
        const { Contents } = await sourceS3.send(listCommand);

        if (!Contents || Contents.length === 0) {
            console.log("Source bucket is empty.");
            return;
        }

        console.log(`Found ${Contents.length} items.`);

        for (const item of Contents) {
            const key = item.Key!;
            console.log(`Syncing: ${key}...`);

            const getCommand = new GetObjectCommand({ Bucket: BUCKET_NAME, Key: key });
            const { Body, ContentType } = await sourceS3.send(getCommand);
            const buffer = await streamToBuffer(Body);

            const putCommand = new PutObjectCommand({
                Bucket: BUCKET_NAME,
                Key: key,
                Body: buffer,
                ContentType: ContentType
            });
            await destS3.send(putCommand);
            console.log(`Done: ${key}`);
        }

        console.log("\nMinIO Sync completed!");
    } catch (error: any) {
        console.error("\nSync failed:", error.message);
    }
}

sync();
