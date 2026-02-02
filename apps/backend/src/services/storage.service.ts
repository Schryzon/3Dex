import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
    region: "us-east-1", // MinIO doesn't care, but SDK needs it
    endpoint: process.env.STORAGE_ENDPOINT || "http://127.0.0.1:9000",
    credentials: {
        accessKeyId: process.env.STORAGE_ACCESS_KEY || "minioadmin",
        secretAccessKey: process.env.STORAGE_SECRET_KEY || "minioadmin"
    },
    forcePathStyle: true // Needed for MinIO
});

const BUCKET = process.env.STORAGE_BUCKET || "3dex-models";

export async function get_upload_url(filename: string, content_type: string) {
    const key = `models/${Date.now()}-${filename}`;
    const command = new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        ContentType: content_type
    });

    const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
    return { url, key };
}

export async function get_download_url_s3(key: string) {
    const command = new GetObjectCommand({
        Bucket: BUCKET,
        Key: key
    });

    return await getSignedUrl(s3, command, { expiresIn: 3600 });
}
