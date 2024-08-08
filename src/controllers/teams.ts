import { ErrorMessage } from 'constants/api-messages';
import { ErrorCode, StatusCode } from 'constants/api-rest-codes';
import { HttpException } from 'exceptions/http-exception';
import { Request, Response } from 'express';
import { teamModel } from 'models';
import { sendResponse } from 'response-hook';
import { SkipSchema } from 'schema/generic';
import {
  CreateTeamSchema,
  DeleteTeamSchema,
  ListTeamsSchema,
  UpdateTeamSchema,
} from 'schema/teams';

export const createTeam = async (req: Request, res: Response) => {
  const validatedBody = CreateTeamSchema.parse(req.body);

  const team = await teamModel.createTeam(validatedBody);

  sendResponse(res, team);
};

export const getTeam = async (req: Request, res: Response) => {
  sendResponse(res, req.team);
};

export const updateTeam = async (req: Request, res: Response) => {
  const { team_id, ...updateData } = UpdateTeamSchema.parse(req.body);

  if (Object.keys(updateData).length === 0) {
    throw new HttpException(
      ErrorMessage.UPDATE_DATA_MISSING,
      ErrorCode.UPDATE_DATA_MISSING,
      StatusCode.UNPROCESSABLE_CONTENT,
      null,
    );
  }

  const team = await teamModel.updateTeam(team_id, updateData);

  sendResponse(res, team);
};

export const removeTeam = async (req: Request, res: Response) => {
  const validatedBody = DeleteTeamSchema.parse(req.body);

  await teamModel.deleteTeam(validatedBody.team_id);

  sendResponse(res);
};

export const listTeams = async (req: Request, res: Response) => {
  const { cursor } = SkipSchema.parse(req.query);
  const validatedParams = ListTeamsSchema.parse(req.params);

  const teams = await teamModel.listTeams(
    req.user!.id,
    req.orgUser!.user_role,
    validatedParams.organisation_id,
    cursor,
  );

  sendResponse(res, teams);
};
