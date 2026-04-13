-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- AlterTable
ALTER TABLE "Model" ADD COLUMN     "embedding" vector(384);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "dexie_enabled" BOOLEAN NOT NULL DEFAULT true;
