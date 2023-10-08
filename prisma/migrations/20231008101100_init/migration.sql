-- CreateTable
CREATE TABLE "Log" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "processingTime" TIMESTAMP(3) NOT NULL,
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

    CONSTRAINT "Log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Log_userId_idx" ON "Log"("userId");

-- AddForeignKey
ALTER TABLE "Log" ADD CONSTRAINT "Log_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
