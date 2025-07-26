/*
  Warnings:

  - You are about to drop the `benefits` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_benefits` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "user_benefits" DROP CONSTRAINT "user_benefits_benefitId_fkey";

-- DropForeignKey
ALTER TABLE "user_benefits" DROP CONSTRAINT "user_benefits_user_id_fkey";

-- DropTable
DROP TABLE "benefits";

-- DropTable
DROP TABLE "user_benefits";

-- CreateTable
CREATE TABLE "tasks" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
