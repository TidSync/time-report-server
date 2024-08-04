/*
  Warnings:

  - You are about to drop the column `activity_id` on the `timesheets` table. All the data in the column will be lost.
  - You are about to drop the `activities` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `project_id` on table `timesheets` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "timesheets" DROP CONSTRAINT "timesheets_project_id_fkey";

-- AlterTable
ALTER TABLE "timesheets" DROP COLUMN "activity_id",
ALTER COLUMN "project_id" SET NOT NULL;

-- DropTable
DROP TABLE "activities";

-- AddForeignKey
ALTER TABLE "timesheets" ADD CONSTRAINT "timesheets_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
