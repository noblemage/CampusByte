-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Warden" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'HOSTEL_WARDEN',
    "vendorId" INTEGER,
    CONSTRAINT "Warden_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Warden" ("id", "name", "passwordHash", "username") SELECT "id", "name", "passwordHash", "username" FROM "Warden";
DROP TABLE "Warden";
ALTER TABLE "new_Warden" RENAME TO "Warden";
CREATE UNIQUE INDEX "Warden_username_key" ON "Warden"("username");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
