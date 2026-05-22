-- CreateTable
CREATE TABLE "InboundEmail" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "gmailMessageId" TEXT NOT NULL,
    "threadId" TEXT,
    "fromEmail" TEXT NOT NULL,
    "subject" TEXT,
    "fulfilledAt" DATETIME,
    "repliedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "InboundEmail_gmailMessageId_key" ON "InboundEmail"("gmailMessageId");

-- CreateIndex
CREATE INDEX "InboundEmail_fulfilledAt_idx" ON "InboundEmail"("fulfilledAt");
