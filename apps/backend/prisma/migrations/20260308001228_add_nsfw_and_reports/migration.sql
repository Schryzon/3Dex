-- CreateEnum
CREATE TYPE "Report_Target" AS ENUM ('MODEL', 'POST', 'COMMENT');

-- CreateEnum
CREATE TYPE "Report_Status" AS ENUM ('PENDING', 'REVIEWED', 'DISMISSED');

-- AlterTable
ALTER TABLE "Model" ADD COLUMN     "gallery_urls" TEXT[],
ADD COLUMN     "is_nsfw" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "is_nsfw" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "show_nsfw" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "reporter_id" TEXT NOT NULL,
    "target_type" "Report_Target" NOT NULL,
    "model_id" TEXT,
    "post_id" TEXT,
    "comment_id" TEXT,
    "reason" TEXT NOT NULL,
    "status" "Report_Status" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
