-- DropForeignKey
ALTER TABLE "Cart_Item" DROP CONSTRAINT "Cart_Item_model_id_fkey";

-- DropForeignKey
ALTER TABLE "Purchase" DROP CONSTRAINT "Purchase_model_id_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_model_id_fkey";

-- DropForeignKey
ALTER TABLE "Wishlist" DROP CONSTRAINT "Wishlist_model_id_fkey";

-- DropIndex
DROP INDEX "Purchase_user_id_model_id_key";

-- AlterTable
ALTER TABLE "Purchase" ALTER COLUMN "model_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_model_id_fkey" FOREIGN KEY ("model_id") REFERENCES "Model"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_model_id_fkey" FOREIGN KEY ("model_id") REFERENCES "Model"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wishlist" ADD CONSTRAINT "Wishlist_model_id_fkey" FOREIGN KEY ("model_id") REFERENCES "Model"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cart_Item" ADD CONSTRAINT "Cart_Item_model_id_fkey" FOREIGN KEY ("model_id") REFERENCES "Model"("id") ON DELETE CASCADE ON UPDATE CASCADE;
