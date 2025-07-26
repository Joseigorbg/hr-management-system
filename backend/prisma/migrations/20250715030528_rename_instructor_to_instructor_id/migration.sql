/*
  Warnings:

  - You are about to drop the column `instructor` on the `trainings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "admissions" ADD COLUMN     "terminationDate" TIMESTAMP(3),
ADD COLUMN     "terminationReason" TEXT;

-- AlterTable
ALTER TABLE "trainings" DROP COLUMN "instructor",
ADD COLUMN     "instructor_id" TEXT;

-- CreateTable
CREATE TABLE "training_documents" (
    "id" TEXT NOT NULL,
    "user_training_id" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "file_path" TEXT NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploaded_by" TEXT,

    CONSTRAINT "training_documents_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "training_documents" ADD CONSTRAINT "training_documents_user_training_id_fkey" FOREIGN KEY ("user_training_id") REFERENCES "training_participations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
