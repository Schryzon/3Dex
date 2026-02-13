-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'PROVIDER';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatar_url" TEXT,
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "display_name" TEXT,
ADD COLUMN     "last_login_at" TIMESTAMP(3),
ADD COLUMN     "location" TEXT,
ADD COLUMN     "social_artstation" TEXT,
ADD COLUMN     "social_behance" TEXT,
ADD COLUMN     "social_instagram" TEXT,
ADD COLUMN     "social_twitter" TEXT,
ADD COLUMN     "two_factor_enabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "website" TEXT;
