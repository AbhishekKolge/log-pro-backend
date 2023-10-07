-- CreateEnum
CREATE TYPE "Status" AS ENUM ('ACTIVE', 'LOCKED');

-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('APP', 'GOOGLE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "key" TEXT,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "authenticationPlatform" "Platform" NOT NULL DEFAULT 'APP',
    "dob" TIMESTAMP(3),
    "profileImage" TEXT,
    "profileImageId" TEXT,
    "verificationToken" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verified" TIMESTAMP(3),
    "passwordToken" TEXT,
    "passwordTokenExpiration" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
