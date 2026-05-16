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
const url_cache = new Map<string, { url: string; expires: number }>();

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

export async function get_download_url_s3(key: string, expiry = 3600) {
    if (!key) return "";

    // If it's already a full URL, just return it
    if (key.startsWith("http")) return key;

    // Check cache
    const cached = url_cache.get(key);
    if (cached && cached.expires > Date.now()) {
        return cached.url;
    }

    const command = new GetObjectCommand({
        Bucket: BUCKET,
        Key: key
    });

    const url = await getSignedUrl(s3, command, { expiresIn: expiry });
    
    // Cache it (minus a 60s safety buffer)
    url_cache.set(key, { 
        url, 
        expires: Date.now() + (expiry * 1000) - 60000 
    });

    return url;
}

export async function sign_user_urls(user: any) {
    if (!user) return user;
    const u = { ...user };
    
    // Use parallel signing to improve performance
    const promises = [];
    
    if (u.avatar_url && !u.avatar_url.startsWith("http")) {
        promises.push(get_download_url_s3(u.avatar_url).then(url => { u.avatar_url = url; }));
    }
    if (u.banner_url && !u.banner_url.startsWith("http")) {
        promises.push(get_download_url_s3(u.banner_url).then(url => { u.banner_url = url; }));
    }
    
    if (promises.length > 0) await Promise.all(promises);
    return u;
}
