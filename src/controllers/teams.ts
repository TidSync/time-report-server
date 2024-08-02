import { Team } from '@prisma/client';
import { ErrorMessage } from 'constants/api-messages';
import { ErrorCode, StatusCode } from 'constants/api-rest-codes';
import { HttpException } from 'exceptions/http-exception';
import { Request, Response } from 'express';
import { prismaClient } from 'index';
import { SkipSchema } from 'schema/generic';
import {
  CreateTeamSchema,
  DeleteTeamSchema,
  GetTeamSchema,
  ListTeamsSchema,
  UpdateTeamSchema,
} from 'schema/teams';
import { canSeeAllEntities } from 'utils/permissions';

export const createTeam = async (req: Request, res: Response) => {
  const { name, color, organisation_id } = CreateTeamSchema.parse(req.body);

  const team = await prismaClient.team.create({
    data: { name, color, organisation_id, users: { connect: { id: req.user!.id } } },
  });

  res.json(team);
};

export const getTeam = async (req: Request, res: Response) => {
  const validatedParams = GetTeamSchema.parse(req.params);
  let team = req.team as Team;

  if (!team) {
    team = await prismaClient.team.findFirstOrThrow({ where: { id: validatedParams.team_id } });
  }

  res.json(req.team);
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

  const project = await prismaClient.team.update({
    where: { id: team_id },
    data: updateData,
  });

  res.json(project);
};

export const removeTeam = async (req: Request, res: Response) => {
  const validatedBody = DeleteTeamSchema.parse(req.body);

  await prismaClient.team.delete({ where: { id: validatedBody.team_id } });

  res.json();
};

export const listTeams = async (req: Request, res: Response) => {
  const { cursor } = SkipSchema.parse(req.query);
  const validatedParams = ListTeamsSchema.parse(req.params);
  const areAllVisible = canSeeAllEntities(req.orgUser!.user_role);

  const teams = await prismaClient.team.findMany({
    where: {
      organisation_id: validatedParams.organisation_id,
      ...(areAllVisible ? {} : { users: { some: { id: req.user!.id } } }),
    },
    orderBy: { created_at: 'desc' },
    take: 10,
    skip: cursor ? 1 : undefined,
    cursor: cursor ? { id: cursor } : undefined,
  });

  res.json(teams);
};
