/*
  Warnings:

  - You are about to drop the column `userId` on the `admissions` table. All the data in the column will be lost.
  - You are about to drop the column `is_bot` on the `chat_messages` table. All the data in the column will be lost.
  - You are about to drop the column `is_read` on the `chat_messages` table. All the data in the column will be lost.
  - You are about to drop the column `message_type` on the `chat_messages` table. All the data in the column will be lost.
  - You are about to drop the column `senderId` on the `chat_messages` table. All the data in the column will be lost.
  - You are about to drop the column `evaluatorId` on the `performance_evaluations` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `performance_evaluations` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `trainingId` on the `training_participations` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `training_participations` table. All the data in the column will be lost.
  - You are about to drop the column `end_date` on the `user_benefits` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `user_benefits` table. All the data in the column will be lost.
  - You are about to drop the column `start_date` on the `user_benefits` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `user_benefits` table. All the data in the column will be lost.
  - You are about to drop the column `approved_at` on the `vacations` table. All the data in the column will be lost.
  - You are about to drop the column `approved_by` on the `vacations` table. All the data in the column will be lost.
  - You are about to drop the column `end_date` on the `vacations` table. All the data in the column will be lost.
  - You are about to drop the column `start_date` on the `vacations` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `vacations` table. All the data in the column will be lost.
  - You are about to drop the `positions` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[user_id]` on the table `admissions` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id]` on the table `profiles` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id,training_id]` on the table `training_participations` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id,benefitId]` on the table `user_benefits` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `user_id` to the `admissions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sender_id` to the `chat_messages` table without a default value. This is not possible if the table is not empty.
  - Made the column `receiverId` on table `chat_messages` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `evaluator_id` to the `performance_evaluations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `performance_evaluations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `profiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `training_id` to the `training_participations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `training_participations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endDate` to the `user_benefits` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `user_benefits` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `user_benefits` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endDate` to the `vacations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `vacations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `vacations` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "admissions" DROP CONSTRAINT "admissions_userId_fkey";

-- DropForeignKey
ALTER TABLE "chat_messages" DROP CONSTRAINT "chat_messages_senderId_fkey";

-- DropForeignKey
ALTER TABLE "performance_evaluations" DROP CONSTRAINT "performance_evaluations_evaluatorId_fkey";

-- DropForeignKey
ALTER TABLE "performance_evaluations" DROP CONSTRAINT "performance_evaluations_userId_fkey";

-- DropForeignKey
ALTER TABLE "profiles" DROP CONSTRAINT "profiles_userId_fkey";

-- DropForeignKey
ALTER TABLE "training_participations" DROP CONSTRAINT "training_participations_trainingId_fkey";

-- DropForeignKey
ALTER TABLE "training_participations" DROP CONSTRAINT "training_participations_userId_fkey";

-- DropForeignKey
ALTER TABLE "user_benefits" DROP CONSTRAINT "user_benefits_userId_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_position_id_fkey";

-- DropForeignKey
ALTER TABLE "vacations" DROP CONSTRAINT "vacations_userId_fkey";

-- DropIndex
DROP INDEX "admissions_userId_key";

-- DropIndex
DROP INDEX "profiles_userId_key";

-- DropIndex
DROP INDEX "training_participations_userId_trainingId_key";

-- DropIndex
DROP INDEX "user_benefits_userId_benefitId_key";

-- AlterTable
ALTER TABLE "admissions" DROP COLUMN "userId",
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "chat_messages" DROP COLUMN "is_bot",
DROP COLUMN "is_read",
DROP COLUMN "message_type",
DROP COLUMN "senderId",
ADD COLUMN     "isBot" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isRead" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "messageType" TEXT NOT NULL DEFAULT 'text',
ADD COLUMN     "sender_id" TEXT NOT NULL,
ALTER COLUMN "receiverId" SET NOT NULL;

-- AlterTable
ALTER TABLE "performance_evaluations" DROP COLUMN "evaluatorId",
DROP COLUMN "userId",
ADD COLUMN     "evaluator_id" TEXT NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "profiles" DROP COLUMN "userId",
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "training_participations" DROP COLUMN "trainingId",
DROP COLUMN "userId",
ADD COLUMN     "training_id" TEXT NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "user_benefits" DROP COLUMN "end_date",
DROP COLUMN "is_active",
DROP COLUMN "start_date",
DROP COLUMN "userId",
ADD COLUMN     "endDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "vacations" DROP COLUMN "approved_at",
DROP COLUMN "approved_by",
DROP COLUMN "end_date",
DROP COLUMN "start_date",
DROP COLUMN "userId",
ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "approvedBy" TEXT,
ADD COLUMN     "endDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- DropTable
DROP TABLE "positions";

-- CreateTable
CREATE TABLE "Position" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "salary" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'Não definido',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Position_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admissions_user_id_key" ON "admissions"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_userId_key" ON "profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "training_participations_userId_trainingId_key" ON "training_participations"("user_id", "training_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_benefits_user_id_benefitId_key" ON "user_benefits"("user_id", "benefitId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "Position"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performance_evaluations" ADD CONSTRAINT "performance_evaluations_evaluator_id_fkey" FOREIGN KEY ("evaluator_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performance_evaluations" ADD CONSTRAINT "performance_evaluations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admissions" ADD CONSTRAINT "admissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_benefits" ADD CONSTRAINT "user_benefits_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_participations" ADD CONSTRAINT "training_participations_training_id_fkey" FOREIGN KEY ("training_id") REFERENCES "trainings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_participations" ADD CONSTRAINT "training_participations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vacations" ADD CONSTRAINT "vacations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
