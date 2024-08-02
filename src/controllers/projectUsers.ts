import { ErrorMessage } from 'constants/api-messages';
import { ErrorCode, StatusCode } from 'constants/api-rest-codes';
import { HttpException } from 'exceptions/http-exception';
import { Request, Response } from 'express';
import { prismaClient } from 'index';
import { AddUserToProjectSchema, RemoveProjectUserSchema } from 'schema/projects';

export const addUserToProject = async (req: Request, res: Response) => {
  const { user_id, project_id } = AddUserToProjectSchema.parse(req.body);

  try {
    await prismaClient.user.findFirstOrThrow({
      where: {
        id: user_id,
        organisation_user: { some: { organisation_id: req.project?.organisation_id } },
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

  await prismaClient.project.update({
    where: { id: project_id },
    data: { users: { connect: { id: user_id } } },
  });

  res.json();
};

export const getProjectUsers = async (req: Request, res: Response) => {
  const users = await prismaClient.user.findMany({
    where: { projects: { some: { id: req.params.project_id } } },
  });

  res.json(users);
};

export const removeProjectUser = async (req: Request, res: Response) => {
  const validatedBody = RemoveProjectUserSchema.parse(req.body);

  await prismaClient.project.update({
    where: { id: validatedBody.project_id },
    data: {
      users: { disconnect: { id: validatedBody.user_id } },
      timesheet: { deleteMany: { user_id: validatedBody.user_id } },
    },
  });

  res.json();
};
