-- DropForeignKey
ALTER TABLE "organisation_users" DROP CONSTRAINT "organisation_users_organisation_id_fkey";

-- DropForeignKey
ALTER TABLE "projects" DROP CONSTRAINT "projects_organisation_id_fkey";

-- DropForeignKey
ALTER TABLE "timesheets" DROP CONSTRAINT "timesheets_project_id_fkey";

-- AddForeignKey
ALTER TABLE "organisation_users" ADD CONSTRAINT "organisation_users_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timesheets" ADD CONSTRAINT "timesheets_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
