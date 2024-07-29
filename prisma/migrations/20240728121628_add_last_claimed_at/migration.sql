/*
  Warnings:

  - Added the required column `lastClaimedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastClaimedAt" TIMESTAMP(3) NOT NULL;
