-- AlterTable
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "phone_number" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Purchase_user_id_model_id_key" ON "Purchase"("user_id", "model_id");
