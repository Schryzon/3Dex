/*
  Warnings:

  - You are about to drop the column `artistId` on the `Model` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Model` table. All the data in the column will be lost.
  - You are about to drop the column `fileUrl` on the `Model` table. All the data in the column will be lost.
  - You are about to drop the column `previewUrl` on the `Model` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Purchase` table. All the data in the column will be lost.
  - You are about to drop the column `modelId` on the `Purchase` table. All the data in the column will be lost.
  - You are about to drop the column `pricePaid` on the `Purchase` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Purchase` table. All the data in the column will be lost.
  - The `license` column on the `Purchase` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `createdAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_id,model_id]` on the table `Purchase` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `artist_id` to the `Model` table without a default value. This is not possible if the table is not empty.
  - Added the required column `file_url` to the `Model` table without a default value. This is not possible if the table is not empty.
  - Added the required column `model_id` to the `Purchase` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price_paid` to the `Purchase` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `Purchase` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "License_Type" AS ENUM ('PERSONAL_USE', 'COMMERCIAL_USE');

-- DropForeignKey
ALTER TABLE "Model" DROP CONSTRAINT "Model_artistId_fkey";

-- DropForeignKey
ALTER TABLE "Purchase" DROP CONSTRAINT "Purchase_modelId_fkey";

-- DropForeignKey
ALTER TABLE "Purchase" DROP CONSTRAINT "Purchase_userId_fkey";

-- DropIndex
DROP INDEX "Purchase_userId_modelId_key";

-- AlterTable
ALTER TABLE "Model" DROP COLUMN "artistId",
DROP COLUMN "createdAt",
DROP COLUMN "fileUrl",
DROP COLUMN "previewUrl",
ADD COLUMN     "artist_id" TEXT NOT NULL,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "file_url" TEXT NOT NULL,
ADD COLUMN     "preview_url" TEXT;

-- AlterTable
ALTER TABLE "Purchase" DROP COLUMN "createdAt",
DROP COLUMN "modelId",
DROP COLUMN "pricePaid",
DROP COLUMN "userId",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "model_id" TEXT NOT NULL,
ADD COLUMN     "price_paid" INTEGER NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL,
DROP COLUMN "license",
ADD COLUMN     "license" "License_Type" NOT NULL DEFAULT 'PERSONAL_USE';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- DropEnum
DROP TYPE "LicenseType";

-- CreateIndex
CREATE INDEX "Purchase_user_id_idx" ON "Purchase"("user_id");

-- CreateIndex
CREATE INDEX "Purchase_model_id_idx" ON "Purchase"("model_id");

-- CreateIndex
CREATE UNIQUE INDEX "Purchase_user_id_model_id_key" ON "Purchase"("user_id", "model_id");

-- AddForeignKey
ALTER TABLE "Model" ADD CONSTRAINT "Model_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_model_id_fkey" FOREIGN KEY ("model_id") REFERENCES "Model"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
