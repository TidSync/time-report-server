import { ErrorMessage } from 'constants/api-messages';
import { ErrorCode, StatusCode } from 'constants/api-rest-codes';
import { HttpException } from 'exceptions/http-exception';
import { Request, Response } from 'express';
import { teamModel, userModel } from 'models';
import { sendResponse } from 'response-hook';
import { AddTeamUserSchema, GetTeamSchema, RemoveTeamUserSchema } from 'schema/teams';

export const addTeamUser = async (req: Request, res: Response) => {
  const { user_id, team_id } = AddTeamUserSchema.parse(req.body);

  const user = await userModel.getUserInOrganisation(user_id, req.orgUser!.organisation_id);

  if (!user) {
    throw new HttpException(
      ErrorMessage.USER_NOT_ORGANISATION,
      ErrorCode.USER_NOT_ORGANISATION,
      StatusCode.NOT_FOUND,
      null,
    );
  }

  await teamModel.addTeamUser(team_id, user);

  sendResponse(res);
};

export const removeTeamUser = async (req: Request, res: Response) => {
  const validatedBody = RemoveTeamUserSchema.parse(req.body);

  await teamModel.removeTeamUser(validatedBody.team_id, validatedBody.user_id);

  sendResponse(res);
};

export const getTeamUsers = async (req: Request, res: Response) => {
  const validatedParams = GetTeamSchema.parse(req.params);

  const users = await userModel.getTeamUsers(validatedParams.team_id);

  sendResponse(res, users);
};
