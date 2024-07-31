/*
  Warnings:

  - You are about to drop the `timesheet_props` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `target_date` to the `timesheets` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "timesheet_props" DROP CONSTRAINT "timesheet_props_timesheet_id_fkey";

-- AlterTable
ALTER TABLE "timesheets" ADD COLUMN     "description" TEXT,
ADD COLUMN     "hours" INTEGER,
ADD COLUMN     "link" TEXT,
ADD COLUMN     "minutes" INTEGER,
ADD COLUMN     "target_date" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "timesheet_props";
