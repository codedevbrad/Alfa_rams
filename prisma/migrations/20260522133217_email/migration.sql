-- CreateTable
CREATE TABLE "EmailSenders" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "EmailSenders_name_key" ON "EmailSenders"("name");

-- CreateIndex
CREATE UNIQUE INDEX "EmailSenders_email_key" ON "EmailSenders"("email");

-- CreateIndex
CREATE INDEX "EmailSenders_email_idx" ON "EmailSenders"("email");
