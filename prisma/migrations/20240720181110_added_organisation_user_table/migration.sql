/*
  Warnings:

  - You are about to drop the `_OrganisationRoleToUser` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_OrganisationToUser` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `organisation_roles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `organisations` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- DropForeignKey
ALTER TABLE "_OrganisationRoleToUser" DROP CONSTRAINT "_OrganisationRoleToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_OrganisationRoleToUser" DROP CONSTRAINT "_OrganisationRoleToUser_B_fkey";

-- DropForeignKey
ALTER TABLE "_OrganisationToUser" DROP CONSTRAINT "_OrganisationToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_OrganisationToUser" DROP CONSTRAINT "_OrganisationToUser_B_fkey";

-- DropForeignKey
ALTER TABLE "organisation_roles" DROP CONSTRAINT "organisation_roles_org_id_fkey";

-- AlterTable
ALTER TABLE "user_tokens" ALTER COLUMN "expires_at" SET DEFAULT NOW() + INTERVAL '7 DAYS';

-- DropTable
DROP TABLE "_OrganisationRoleToUser";

-- DropTable
DROP TABLE "_OrganisationToUser";

-- DropTable
DROP TABLE "organisation_roles";

-- DropTable
DROP TABLE "organisations";

-- CreateTable
CREATE TABLE "organisation_users" (
    "user_id" TEXT NOT NULL,
    "organisation_id" TEXT NOT NULL,
    "invitation_status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "user_role" "UserRole" NOT NULL DEFAULT 'USER'
);

-- CreateTable
CREATE TABLE "organisation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organisation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "color" TEXT NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timesheets" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,

    CONSTRAINT "timesheets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timesheet_props" (
    "id" TEXT NOT NULL,
    "timesheet_id" TEXT NOT NULL,
    "target_date" TIMESTAMP(3) NOT NULL,
    "day_amount" DECIMAL(65,30) NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "timesheet_props_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ProjectToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "organisation_users_user_id_organisation_id_key" ON "organisation_users"("user_id", "organisation_id");

-- CreateIndex
CREATE UNIQUE INDEX "_ProjectToUser_AB_unique" ON "_ProjectToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_ProjectToUser_B_index" ON "_ProjectToUser"("B");

-- AddForeignKey
ALTER TABLE "organisation_users" ADD CONSTRAINT "organisation_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organisation_users" ADD CONSTRAINT "organisation_users_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timesheets" ADD CONSTRAINT "timesheets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timesheets" ADD CONSTRAINT "timesheets_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timesheets" ADD CONSTRAINT "timesheets_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timesheet_props" ADD CONSTRAINT "timesheet_props_timesheet_id_fkey" FOREIGN KEY ("timesheet_id") REFERENCES "timesheets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProjectToUser" ADD CONSTRAINT "_ProjectToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProjectToUser" ADD CONSTRAINT "_ProjectToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
