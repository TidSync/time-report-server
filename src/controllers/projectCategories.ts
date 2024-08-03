import { ErrorMessage } from 'constants/api-messages';
import { ErrorCode, StatusCode } from 'constants/api-rest-codes';
import { HttpException } from 'exceptions/http-exception';
import { Request, Response } from 'express';
import { prismaClient } from 'index';
import {
  CreateProjectCategorySchema,
  GetProjectCategorySchema,
  RemoveProjectCategorySchema,
  UpdateProjectCategorySchema,
} from 'schema/projects';

export const createProjectCategory = async (req: Request, res: Response) => {
  const validatedBody = CreateProjectCategorySchema.parse(req.body);

  const category = await prismaClient.projectCategory.create({ data: validatedBody });

  res.json(category);
};

export const removeProjectCategory = async (req: Request, res: Response) => {
  const validatedBody = RemoveProjectCategorySchema.parse(req.body);

  await prismaClient.projectCategory.delete({
    where: { id: validatedBody.project_category_id, project_id: validatedBody.project_id },
  });

  res.json();
};

export const updateProjectCategory = async (req: Request, res: Response) => {
  const { project_id, project_category_id, ...updateData } = UpdateProjectCategorySchema.parse(
    req.body,
  );

  if (Object.keys(updateData).length === 0) {
    throw new HttpException(
      ErrorMessage.UPDATE_DATA_MISSING,
      ErrorCode.UPDATE_DATA_MISSING,
      StatusCode.UNPROCESSABLE_CONTENT,
      null,
    );
  }

  const category = await prismaClient.projectCategory.update({
    where: { id: project_category_id, project_id },
    data: updateData,
  });

  res.json(category);
};

export const getProjectCategories = async (req: Request, res: Response) => {
  const validatedParams = GetProjectCategorySchema.parse(req.params);

  const categories = await prismaClient.projectCategory.findMany({
    where: { project_id: validatedParams.project_id },
  });

  res.json(categories);
};
