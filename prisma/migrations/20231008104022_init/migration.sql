/*
  Warnings:

  - Changed the type of `processingTime` on the `Log` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Log" DROP COLUMN "processingTime",
ADD COLUMN     "processingTime" INTEGER NOT NULL;
