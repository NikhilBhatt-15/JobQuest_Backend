/*
  Warnings:

  - You are about to drop the column `resume_url` on the `Profile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "resume_url",
ADD COLUMN     "resumePublicId" TEXT,
ADD COLUMN     "resumeUrl" TEXT;
