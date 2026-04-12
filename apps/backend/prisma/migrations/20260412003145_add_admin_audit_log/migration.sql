-- CreateEnum
CREATE TYPE "Audit_Action" AS ENUM ('DELETE_MODEL', 'DELETE_POST', 'DELETE_COMMENT', 'BAN_USER', 'REJECT_MODEL');

-- CreateTable
CREATE TABLE "Admin_Audit_Log" (
    "id" TEXT NOT NULL,
    "admin_id" TEXT NOT NULL,
    "action" "Audit_Action" NOT NULL,
    "target_id" TEXT NOT NULL,
    "target_type" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Admin_Audit_Log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Admin_Audit_Log_admin_id_idx" ON "Admin_Audit_Log"("admin_id");

-- CreateIndex
CREATE INDEX "Admin_Audit_Log_created_at_idx" ON "Admin_Audit_Log"("created_at");

-- AddForeignKey
ALTER TABLE "Admin_Audit_Log" ADD CONSTRAINT "Admin_Audit_Log_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
