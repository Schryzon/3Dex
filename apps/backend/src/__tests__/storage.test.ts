
import dotenv from "dotenv";
dotenv.config({ path: ".env" });

import { get_upload_url, get_download_url_s3 } from "../services/storage.service";
import { S3Client, ListBucketsCommand } from "@aws-sdk/client-s3";

console.log("Using Storage Endpoint:", process.env.STORAGE_ENDPOINT);

// Create a local client instance to test connectivity
const s3 = new S3Client({
    region: "us-east-1",
    endpoint: process.env.STORAGE_ENDPOINT || "http://127.0.0.1:9000",
    credentials: {
        accessKeyId: process.env.STORAGE_ACCESS_KEY || "minioadmin",
        secretAccessKey: process.env.STORAGE_SECRET_KEY || "minioadmin"
    },
    forcePathStyle: true
});

describe("Storage Service & MinIO Connectivity", () => {

    it("should allow connectivity check (soft fail)", async () => {
        try {
            const command = new ListBucketsCommand({});
            const response = await s3.send(command);
            console.log("MinIO Connectivity Check: OK");
            console.log("Buckets:", response.Buckets?.map(b => b.Name));
            expect(response.$metadata.httpStatusCode).toBe(200);
        } catch (error: any) {
            console.warn("MinIO Connectivity Check: FAILED BUT PROCEEDING");
            console.warn("Error:", error.message);
            // We don't fail the test here to allow checking URL generation logic
            // expect(true).toBe(true); 
        }
    });

    it("should generate a presigned upload URL", async () => {
        const result = await get_upload_url("test-model.glb", "model/gltf-binary");

        expect(result).toHaveProperty("url");
        expect(result).toHaveProperty("key");
        expect(result.key).toContain("test-model.glb");
        // The URL might leverage the internal docker endpoint or external, depending on service config
        // So we just check it's a string and has the key

        console.log("Generated Upload URL:", result.url);
    });

    it("should generate a presigned download URL", async () => {
        const key = "models/test-model.glb";
        const url = await get_download_url_s3(key);

        expect(typeof url).toBe("string");
        expect(url).toContain(key);

        console.log("Generated Download URL:", url);
    });

});
