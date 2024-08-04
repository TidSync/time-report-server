-- CreateEnum
CREATE TYPE "TimesheetStatus" AS ENUM ('APPROVED', 'PENDING', 'CHANGE_REQUESTED');

-- AlterTable
ALTER TABLE "timesheets" ADD COLUMN     "status" "TimesheetStatus" NOT NULL DEFAULT 'PENDING';
