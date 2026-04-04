-- AlterTable
ALTER TABLE "Model" ADD COLUMN     "file_format" TEXT NOT NULL DEFAULT 'glb',
ADD COLUMN     "is_printable" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "license" "License_Type" NOT NULL DEFAULT 'PERSONAL_USE';
