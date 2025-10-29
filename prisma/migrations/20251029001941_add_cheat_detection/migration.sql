-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Analysis" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "game" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "clipPath" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'completed',
    "summary" TEXT NOT NULL,
    "statsJson" TEXT NOT NULL,
    "cheatFlag" BOOLEAN NOT NULL DEFAULT false,
    "cheatScore" REAL NOT NULL DEFAULT 0.0,
    CONSTRAINT "Analysis_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Analysis" ("clipPath", "createdAt", "game", "id", "region", "statsJson", "status", "summary", "userId") SELECT "clipPath", "createdAt", "game", "id", "region", "statsJson", "status", "summary", "userId" FROM "Analysis";
DROP TABLE "Analysis";
ALTER TABLE "new_Analysis" RENAME TO "Analysis";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
