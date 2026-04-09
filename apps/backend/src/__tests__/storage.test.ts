import { describe, it, expect } from '@jest/globals';
import { get_upload_url, get_download_url_s3 } from "../services/storage.service";

describe("Storage Service", () => {
    it("should generate a presigned upload URL locally without throwing", async () => {
        const result = await get_upload_url("test-model.glb", "model/gltf-binary");

        expect(result).toHaveProperty("url");
        expect(result).toHaveProperty("key");
        expect(typeof result.url).toBe("string");
        expect(result.key).toContain("test-model.glb");
        expect(result.key).toContain("models/");
    });

    it("should generate a presigned download URL locally without throwing", async () => {
        const key = "models/test-model.glb";
        const url = await get_download_url_s3(key);

        expect(typeof url).toBe("string");
    });
});
