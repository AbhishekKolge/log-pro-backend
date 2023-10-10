-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
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

-- CreateTable
CREATE TABLE "Log" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "processingTime" INTEGER NOT NULL,
    "rawHeaders" TEXT NOT NULL,
    "body" TEXT,
    "httpVersion" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "remoteAddress" TEXT NOT NULL,
    "remoteFamily" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "statusCode" INTEGER NOT NULL,
    "statusMessage" TEXT NOT NULL,
    "headers" TEXT NOT NULL,
    "errorData" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Log_userId_idx" ON "Log"("userId");

-- AddForeignKey
ALTER TABLE "Log" ADD CONSTRAINT "Log_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
