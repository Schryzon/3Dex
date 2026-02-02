-- CreateEnum
CREATE TYPE "ModelStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "Model" ADD COLUMN     "status" "ModelStatus" NOT NULL DEFAULT 'PENDING';
