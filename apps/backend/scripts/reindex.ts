/**
 * reindex.ts
 * 
 * Generates vector embeddings for all approved models that are missing them.
 * Usage: npx ts-node scripts/reindex.ts
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { embed_and_save_model } from "../src/services/embedding.service";

async function getPrisma() {
    const connectionString = process.env.DATABASE_URL?.replace("localhost", "127.0.0.1");
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter }) as any;
}

async function run() {
    console.log("--- Dēxie Re-indexing Task ---");
    const prisma = await getPrisma();
    
    try {
        const models = await prisma.$queryRaw`
            SELECT id, title FROM "Model" 
            WHERE status = 'APPROVED' AND embedding IS NULL
        `;

        if (models.length === 0) {
            console.log("All models are already indexed. ✨");
            return;
        }

        console.log(`Found ${models.length} models needing embeddings.`);

        for (let i = 0; i < models.length; i++) {
            const m = models[i];
            process.stdout.write(`[${i + 1}/${models.length}] Embedding: "${m.title}" ... `);
            try {
                await embed_and_save_model(m.id);
                console.log("OK");
            } catch (err: any) {
                console.log(`FAILED: ${err.message}`);
            }
        }

        console.log("\nRe-indexing complete!");
    } catch (e: any) {
        console.error("\n[!] Re-indexing failed:", e.message);
    } finally {
        await prisma.$disconnect();
    }
}

run();
