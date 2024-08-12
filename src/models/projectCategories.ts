import { Prisma } from '@prisma/client';
import { prismaClient } from 'index';
import {
  addRedisArrayData,
  deleteRedisArrayData,
  getOrSetRedisData,
  updateRedisArrayData,
} from 'utils/redis';

export const createProjectCategory = async (data: Prisma.ProjectCategoryUncheckedCreateInput) => {
  const projectCategory = await prismaClient.projectCategory.create({ data });

  addRedisArrayData(`projectCategories:${data.project_id}`, projectCategory);

  return projectCategory;
};

export const updateProjectCategory = async (
  project_category_id: string,
  project_id: string,
  updateData: Prisma.ProjectCategoryUncheckedUpdateInput,
) => {
  return updateRedisArrayData(`projectCategories:${project_id}`, { id: project_category_id }, () =>
    prismaClient.projectCategory.update({
      where: { id: project_category_id },
      data: updateData,
    }),
  );
};

export const deleteProjectCategory = async (project_category_id: string, project_id: string) => {
  deleteRedisArrayData(`projectCategories:${project_id}`, { id: [project_category_id] });

  return prismaClient.projectCategory.delete({ where: { id: project_category_id } });
};

export const getProjectCategory = async (project_category_id: string) => {
  return prismaClient.projectCategory.findFirst({
    where: { id: project_category_id },
    include: { project: true },
  });
};

export const getProjectCategories = async (project_id: string) => {
  return getOrSetRedisData(`projectCategories:${project_id}`, () =>
    prismaClient.projectCategory.findMany({ where: { project_id } }),
  );
};
