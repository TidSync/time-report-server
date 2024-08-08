import { Prisma, UserRole } from '@prisma/client';
import { prismaClient } from 'index';
import { canSeeAllEntities } from 'utils/permissions';

export const createProject = async (data: Prisma.ProjectUncheckedCreateInput) => {
  return prismaClient.project.create({ data });
};

export const updateProject = async (
  project_id: string,
  updateData: Prisma.ProjectUncheckedUpdateInput,
) => {
  return prismaClient.project.update({ where: { id: project_id }, data: updateData });
};

export const deleteProject = async (project_id: string) => {
  return prismaClient.project.delete({ where: { id: project_id } });
};

export const getProject = async (project_id: string) => {
  return prismaClient.project.findFirst({
    where: { id: project_id },
    include: { users: { select: { id: true } } },
  });
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
