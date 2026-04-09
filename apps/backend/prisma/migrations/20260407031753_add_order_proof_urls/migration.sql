-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "proof_urls" TEXT[] DEFAULT ARRAY[]::TEXT[];
