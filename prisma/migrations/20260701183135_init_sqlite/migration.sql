-- CreateTable
CREATE TABLE "Student" (
    "studentId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "paidStatus" INTEGER NOT NULL,
    "passwordHash" TEXT,
    "currentWebAuthnChallenge" TEXT
);

-- CreateTable
CREATE TABLE "Authenticator" (
    "credentialID" TEXT NOT NULL PRIMARY KEY,
    "credentialPublicKey" BLOB NOT NULL,
    "counter" BIGINT NOT NULL,
    "credentialDeviceType" TEXT NOT NULL,
    "credentialBackedUp" BOOLEAN NOT NULL,
    "transports" TEXT,
    "studentId" INTEGER NOT NULL,
    CONSTRAINT "Authenticator_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("studentId") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MealRedemption" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "studentId" INTEGER NOT NULL,
    "date" TEXT NOT NULL,
    "mealSlot" TEXT NOT NULL,
    "redeemedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "wardenId" INTEGER,
    CONSTRAINT "MealRedemption_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("studentId") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MealRedemption_wardenId_fkey" FOREIGN KEY ("wardenId") REFERENCES "Warden" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Warden" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "DailyMenu" (
    "date" TEXT NOT NULL PRIMARY KEY,
    "breakfast" TEXT,
    "lunch" TEXT,
    "dinner" TEXT
);

-- CreateIndex
CREATE INDEX "MealRedemption_date_idx" ON "MealRedemption"("date");

-- CreateIndex
CREATE UNIQUE INDEX "MealRedemption_studentId_date_mealSlot_key" ON "MealRedemption"("studentId", "date", "mealSlot");

-- CreateIndex
CREATE UNIQUE INDEX "Warden_username_key" ON "Warden"("username");
