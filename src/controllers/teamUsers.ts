import { ErrorMessage } from 'constants/api-messages';
import { ErrorCode, StatusCode } from 'constants/api-rest-codes';
import { HttpException } from 'exceptions/http-exception';
import { Request, Response } from 'express';
import { prismaClient } from 'index';
import { AddTeamUserSchema, GetTeamSchema, RemoveTeamUserSchema } from 'schema/teams';

export const addTeamUser = async (req: Request, res: Response) => {
  const { user_id, team_id } = AddTeamUserSchema.parse(req.body);

  try {
    await prismaClient.user.findFirstOrThrow({
      where: {
        id: user_id,
        organisation_user: { some: { organisation_id: req.orgUser?.organisation_id } },
      },
    });
  } catch (error) {
    throw new HttpException(
      ErrorMessage.USER_NOT_ORGANISATION,
      ErrorCode.USER_NOT_ORGANISATION,
      StatusCode.NOT_FOUND,
      null,
    );
  }

  await prismaClient.team.update({
    where: { id: team_id },
    data: { users: { connect: { id: user_id } } },
  });

  res.json();
};

export const removeTeamUser = async (req: Request, res: Response) => {
  const validatedBody = RemoveTeamUserSchema.parse(req.body);

  await prismaClient.team.update({
    where: { id: validatedBody.team_id },
    data: {
      users: { disconnect: { id: validatedBody.user_id } },
    },
  });

  res.json();
};

export const getTeamUsers = async (req: Request, res: Response) => {
  const validatedParams = GetTeamSchema.parse(req.params);

  const users = await prismaClient.user.findMany({
    where: { teams: { some: { id: validatedParams.team_id } } },
  });

  res.json(users);
};
