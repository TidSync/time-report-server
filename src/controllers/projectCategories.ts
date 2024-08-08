import { ErrorMessage } from 'constants/api-messages';
import { ErrorCode, StatusCode } from 'constants/api-rest-codes';
import { HttpException } from 'exceptions/http-exception';
import { Request, Response } from 'express';
import { projectCategoryModel } from 'models';
import { sendResponse } from 'response-hook';
import {
  CreateProjectCategorySchema,
  GetProjectCategorySchema,
  RemoveProjectCategorySchema,
  UpdateProjectCategorySchema,
} from 'schema/projects';

export const createProjectCategory = async (req: Request, res: Response) => {
  const validatedBody = CreateProjectCategorySchema.parse(req.body);

  const category = await projectCategoryModel.createProjectCategory(validatedBody);

  sendResponse(res, category);
};

export const removeProjectCategory = async (req: Request, res: Response) => {
  const validatedBody = RemoveProjectCategorySchema.parse(req.body);

  await projectCategoryModel.deleteProjectCategory(validatedBody.project_category_id);

  sendResponse(res);
};

export const updateProjectCategory = async (req: Request, res: Response) => {
  const { project_category_id, ...updateData } = UpdateProjectCategorySchema.parse(req.body);

  if (Object.keys(updateData).length === 0) {
    throw new HttpException(
      ErrorMessage.UPDATE_DATA_MISSING,
      ErrorCode.UPDATE_DATA_MISSING,
      StatusCode.UNPROCESSABLE_CONTENT,
      null,
    );
  }

  const category = await projectCategoryModel.updateProjectCategory(
    project_category_id,
    updateData,
  );

  sendResponse(res, category);
};

export const getProjectCategories = async (req: Request, res: Response) => {
  const validatedParams = GetProjectCategorySchema.parse(req.params);

  const categories = await projectCategoryModel.getProjectCategories(validatedParams.project_id);

  sendResponse(res, categories);
};
