-- AlterTable
ALTER TABLE "InboundEmail" ADD COLUMN "openedAt" DATETIME;

-- CreateIndex
CREATE INDEX "InboundEmail_openedAt_idx" ON "InboundEmail"("openedAt");
