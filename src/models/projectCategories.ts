import { Prisma } from '@prisma/client';
import { prismaClient } from 'index';

export const createProjectCategory = async (data: Prisma.ProjectCategoryUncheckedCreateInput) => {
  return prismaClient.projectCategory.create({ data });
};

export const updateProjectCategory = async (
  project_category_id: string,
  updateData: Prisma.ProjectCategoryUncheckedUpdateInput,
) => {
  return prismaClient.projectCategory.update({
    where: { id: project_category_id },
    data: updateData,
  });
};

export const deleteProjectCategory = async (project_category_id: string) => {
  return prismaClient.projectCategory.delete({ where: { id: project_category_id } });
};

export const getProjectCategory = async (project_category_id: string) => {
  return prismaClient.projectCategory.findFirst({
    where: { id: project_category_id },
    include: { project: { select: { organisation_id: true } } },
  });
};

export const getProjectCategories = async (project_id: string) => {
  return prismaClient.projectCategory.findMany({ where: { project_id } });
};
