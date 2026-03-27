/*
  Warnings:

  - The `status` column on the `Model` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `print_status` column on the `Order_Item` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `account_status` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `CartItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CollectionItem` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Model_Status" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "Account_Status" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "Print_Status" AS ENUM ('PENDING', 'ACCEPTED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED');

-- DropForeignKey
ALTER TABLE "CartItem" DROP CONSTRAINT "CartItem_model_id_fkey";

-- DropForeignKey
ALTER TABLE "CartItem" DROP CONSTRAINT "CartItem_user_id_fkey";

-- DropForeignKey
ALTER TABLE "CollectionItem" DROP CONSTRAINT "CollectionItem_collection_id_fkey";

-- DropForeignKey
ALTER TABLE "CollectionItem" DROP CONSTRAINT "CollectionItem_model_id_fkey";

-- AlterTable
ALTER TABLE "Model" DROP COLUMN "status",
ADD COLUMN     "status" "Model_Status" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Order_Item" DROP COLUMN "print_status",
ADD COLUMN     "print_status" "Print_Status" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "account_status",
ADD COLUMN     "account_status" "Account_Status" NOT NULL DEFAULT 'PENDING';

-- DropTable
DROP TABLE "CartItem";

-- DropTable
DROP TABLE "CollectionItem";

-- DropEnum
DROP TYPE "AccountStatus";

-- DropEnum
DROP TYPE "ModelStatus";

-- DropEnum
DROP TYPE "PrintStatus";

-- CreateTable
CREATE TABLE "Cart_Item" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "model_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cart_Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Collection_Item" (
    "id" TEXT NOT NULL,
    "collection_id" TEXT NOT NULL,
    "model_id" TEXT NOT NULL,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Collection_Item_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Cart_Item_user_id_idx" ON "Cart_Item"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Cart_Item_user_id_model_id_key" ON "Cart_Item"("user_id", "model_id");

-- CreateIndex
CREATE UNIQUE INDEX "Collection_Item_collection_id_model_id_key" ON "Collection_Item"("collection_id", "model_id");

-- AddForeignKey
ALTER TABLE "Cart_Item" ADD CONSTRAINT "Cart_Item_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cart_Item" ADD CONSTRAINT "Cart_Item_model_id_fkey" FOREIGN KEY ("model_id") REFERENCES "Model"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collection_Item" ADD CONSTRAINT "Collection_Item_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "Collection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collection_Item" ADD CONSTRAINT "Collection_Item_model_id_fkey" FOREIGN KEY ("model_id") REFERENCES "Model"("id") ON DELETE CASCADE ON UPDATE CASCADE;
