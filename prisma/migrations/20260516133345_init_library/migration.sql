-- CreateTable
CREATE TABLE "ActivityCategory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ActivityHazard" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "categoryId" INTEGER NOT NULL,
    "activity" TEXT NOT NULL,
    "hazard" TEXT NOT NULL,
    "likelihood" INTEGER NOT NULL,
    "severity" INTEGER NOT NULL,
    "who" TEXT NOT NULL,
    "controls" TEXT NOT NULL,
    "residualLikelihood" INTEGER NOT NULL,
    "residualSeverity" INTEGER NOT NULL,
    "residualWho" TEXT NOT NULL,
    "monitoring" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ActivityHazard_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ActivityCategory" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PpeGroup" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PpeItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "groupId" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "requirement" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PpeItem_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "PpeGroup" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ActivityCategory_name_key" ON "ActivityCategory"("name");

-- CreateIndex
CREATE INDEX "ActivityHazard_categoryId_idx" ON "ActivityHazard"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "PpeGroup_name_key" ON "PpeGroup"("name");

-- CreateIndex
CREATE INDEX "PpeItem_groupId_idx" ON "PpeItem"("groupId");
