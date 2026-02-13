import { S3Client, GetBucketCorsCommand, PutBucketCorsCommand, CreateBucketCommand, HeadBucketCommand, ListBucketsCommand } from "@aws-sdk/client-s3";
import { NodeHttpHandler } from "@aws-sdk/node-http-handler";
import "dotenv/config";

const s3 = new S3Client({
    region: "us-east-1",
    endpoint: process.env.STORAGE_ENDPOINT || "http://127.0.0.1:9000",
    credentials: {
        accessKeyId: process.env.STORAGE_ACCESS_KEY || "minioadmin", // USERNAME
        secretAccessKey: process.env.STORAGE_SECRET_KEY || "minioadmin" // PASSWORD
    },
    forcePathStyle: true,
    requestHandler: new NodeHttpHandler({
        connectionTimeout: 2000,
        socketTimeout: 2000
    })
});

const BUCKET = process.env.STORAGE_BUCKET || "3dex-models";

async function main() {
    console.log(`Setting up MinIO for bucket: ${BUCKET} at ${process.env.STORAGE_ENDPOINT}`);

    // 0. List Buckets to verify connection/auth
    try {
        console.log("Listing buckets...");
        const { Buckets } = await s3.send(new ListBucketsCommand({}));
        console.log("Buckets found:", Buckets?.map((b: any) => b.Name).join(", "));
    } catch (err: any) {
        console.error("Failed to list buckets (Connection/Auth error):", err.message);
        // Continue anyway to try creation
    }

    // 1. Check if bucket exists, create if not
    try {
        await s3.send(new HeadBucketCommand({ Bucket: BUCKET }));
        console.log("Bucket already exists.");
    } catch (err: any) {
        if (err.name === "NotFound" || err.$metadata?.httpStatusCode === 404) {
            console.log("Bucket not found. Creating...");
            try {
                await s3.send(new CreateBucketCommand({ Bucket: BUCKET }));
                console.log("Bucket created successfully!");
            } catch (createErr: any) {
                console.error("Failed to create bucket:", createErr.message);
                return;
            }
        } else {
            console.error("Error checking bucket:", err.message);
            return;
        }
    }

    // 2. Set CORS
    console.log("Setting CORS configuration...");
    try {
        await s3.send(new PutBucketCorsCommand({
            Bucket: BUCKET,
            CORSConfiguration: {
                CORSRules: [
                    {
                        AllowedHeaders: ["*"],
                        AllowedMethods: ["PUT", "POST", "GET", "HEAD"],
                        AllowedOrigins: ["*"], // Verify this matches your frontend URL in production
                        ExposeHeaders: ["ETag"]
                    }
                ]
            }
        }));
        console.log("Successfully set CORS configuration!");
    } catch (setErr: any) {
        console.error("Error setting CORS configuration:", setErr.message);
    }

    // 3. Verify CORS
    try {
        const data = await s3.send(new GetBucketCorsCommand({ Bucket: BUCKET }));
        console.log("Current CORS Rules:", JSON.stringify(data.CORSRules, null, 2));
    } catch (err) {
        console.log("Could not verify CORS (might take a moment to propagate or MinIO specific behavior).");
    }
}

main();
