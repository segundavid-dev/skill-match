-- DropIndex
DROP INDEX IF EXISTS "swipes_userId_opportunityId_key";

-- CreateIndex
CREATE UNIQUE INDEX "swipes_userId_opportunityId_volunteerId_key" ON "swipes"("userId", "opportunityId", "volunteerId");
