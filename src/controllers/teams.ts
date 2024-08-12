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
  UploadTeamPhotoSchema,
} from 'schema/teams';
import fs from 'fs';
import { APP_URL } from 'secrets';
import sharp from 'sharp';

export const createTeam = async (req: Request, res: Response) => {
  const validatedBody = CreateTeamSchema.parse(req.body);

  const team = await teamModel.createTeam(validatedBody);

  sendResponse(res, team);
};

export const getTeam = async (req: Request, res: Response) => {
  sendResponse(res, { team: req.team, users: req.teamUsers });
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

export const uploadTeamPhoto = async (req: Request, res: Response) => {
  const { team_id } = UploadTeamPhotoSchema.parse(req.body);

  try {
    if (!fs.existsSync('files/team')) {
      fs.mkdirSync('files/team', { recursive: true });
    }

    const [user] = await Promise.all([
      teamModel.updateTeam(team_id, {
        photo: `${APP_URL}/files/team/${team_id}.jpeg`,
      }),
      sharp(req.file!.buffer).resize(200, 200).jpeg().toFile(`files/team/${team_id}.jpeg`),
    ]);

    sendResponse(res, user);
  } catch (error) {
    throw new HttpException(
      ErrorMessage.ERROR_UPLOADING_IMAGE,
      ErrorCode.ERROR_UPLOADING_IMAGE,
      StatusCode.INTERNAL_SERVER_ERROR,
      error,
    );
  }
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
