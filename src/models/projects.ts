import { Prisma, User, UserRole } from '@prisma/client';
import { prismaClient } from 'index';
import { canSeeAllEntities } from 'utils/permissions';
import {
  addRedisArrayData,
  deleteRedisArrayData,
  deleteRedisData,
  getOrSetRedisData,
  setRedisData,
} from 'utils/redis';

export const createProject = async (data: Prisma.ProjectUncheckedCreateInput) => {
  return setRedisData(['project', '$id'], () => prismaClient.project.create({ data }));
};

export const updateProject = async (
  project_id: string,
  updateData: Prisma.ProjectUncheckedUpdateInput,
) => {
  return setRedisData([`project:${project_id}`], () =>
    prismaClient.project.update({ where: { id: project_id }, data: updateData }),
  );
};

export const deleteProject = async (project_id: string) => {
  deleteRedisData(`project:${project_id}`);
  deleteRedisData(`projectUsers:${project_id}`);

  return prismaClient.project.delete({ where: { id: project_id } });
};

export const getProject = async (project_id: string) => {
  return getOrSetRedisData(
    { project: `project:${project_id}`, projectUsers: `projectUsers:${project_id}` },
    async () => {
      const projectData = await prismaClient.project.findFirst({
        where: { id: project_id },
        include: { users: true },
      });

      if (!projectData) {
        return projectData;
      }

      const { users, ...project } = projectData;

      return { project, projectUsers: users };
    },
  );
};

export const listProjects = async (
  user_id: string,
  user_role: UserRole,
  organisation_id: string,
  cursor?: string,
) => {
  const areAllVisible = canSeeAllEntities(user_role);

  return prismaClient.project.findMany({
    where: {
      organisation_id: organisation_id,
      ...(areAllVisible ? {} : { users: { some: { id: user_id } } }),
    },
    orderBy: { created_at: 'desc' },
    take: 10,
    skip: cursor ? 1 : undefined,
    cursor: cursor ? { id: cursor } : undefined,
  });
};

export const addProjectUser = async (project_id: string, user: User) => {
  addRedisArrayData(`projectUsers:${project_id}`, user);

  return updateProject(project_id, { users: { connect: { id: user.id } } });
};

export const removeProjectUser = async (project_id: string, user_id: string) => {
  deleteRedisArrayData(`projectUsers:${project_id}`, { id: [user_id] });
  deleteRedisData(`timesheets:${project_id}:${user_id}`);

  return updateProject(project_id, {
    users: { disconnect: { id: user_id } },
    timesheet: { deleteMany: { user_id: user_id } },
  });
};
