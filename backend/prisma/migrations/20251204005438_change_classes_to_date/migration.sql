/*
  Warnings:

  - You are about to drop the column `dayOfWeek` on the `GymClass` table. All the data in the column will be lost.
  - Added the required column `date` to the `GymClass` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "GymClass" DROP COLUMN "dayOfWeek",
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "groupId" TEXT;
