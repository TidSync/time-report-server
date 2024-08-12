import { ErrorMessage } from 'constants/api-messages';
import { ErrorCode, StatusCode } from 'constants/api-rest-codes';
import { HttpException } from 'exceptions/http-exception';
import { Request, Response } from 'express';
import { projectModel, userModel } from 'models';
import { sendResponse } from 'response-hook';
import {
  AddUserToProjectSchema,
  GetProjectUsersSchema,
  RemoveProjectUserSchema,
} from 'schema/projects';

export const addUserToProject = async (req: Request, res: Response) => {
  const { user_id, project_id } = AddUserToProjectSchema.parse(req.body);

  const user = await userModel.getUserInOrganisation(user_id, req.project!.organisation_id);

  if (!user) {
    throw new HttpException(
      ErrorMessage.USER_NOT_ORGANISATION,
      ErrorCode.USER_NOT_ORGANISATION,
      StatusCode.NOT_FOUND,
      null,
    );
  }

  await projectModel.addProjectUser(project_id, user);

  sendResponse(res);
};

export const getProjectUsers = async (req: Request, res: Response) => {
  const validatedParams = GetProjectUsersSchema.parse(req.params);
  const users = await userModel.getProjectUsers(validatedParams.project_id);

  sendResponse(res, users);
};

export const removeProjectUser = async (req: Request, res: Response) => {
  const validatedBody = RemoveProjectUserSchema.parse(req.body);

  await projectModel.removeProjectUser(validatedBody.project_id, validatedBody.user_id);

  sendResponse(res);
};
