import { UserRole } from '@prisma/client';
import { ErrorMessage } from 'constants/api-messages';
import { ErrorCode, StatusCode } from 'constants/api-rest-codes';
import { HttpException } from 'exceptions/http-exception';
import { Request, Response } from 'express';
import { prismaClient } from 'index';
import { SkipSchema } from 'schema/generic';
import {
  AddUserToProjectSchema,
  CreateProjectSchema,
  DeleteProjectSchema,
  ListProjectsSchema,
  UpdateProjectSchema,
} from 'schema/projects';

export const createProject = async (req: Request, res: Response) => {
  const validatedBody = CreateProjectSchema.parse(req.body);

  const project = await prismaClient.project.create({
    data: { ...validatedBody, users: { connect: { id: req.user!.id } } },
  });

  res.json(project);
};

export const getProject = async (req: Request, res: Response) => {
  res.json({ project: req.project, organisation: req.organisation });
};

export const removeProject = async (req: Request, res: Response) => {
  const validatedBody = DeleteProjectSchema.parse(req.body);

  await prismaClient.project.delete({ where: { id: validatedBody.project_id } });

  res.json();
};

export const updateProject = async (req: Request, res: Response) => {
  const { project_id, ...updateData } = UpdateProjectSchema.parse(req.body);

  if (Object.keys(updateData).length === 0) {
    throw new HttpException(
      ErrorMessage.UPDATE_DATA_MISSING,
      ErrorCode.UPDATE_DATA_MISSING,
      StatusCode.UNPROCESSABLE_CONTENT,
      null,
    );
  }

  const project = await prismaClient.project.update({
    where: { id: project_id },
    data: updateData,
  });

  res.json(project);
};

export const listProjects = async (req: Request, res: Response) => {
  const { cursor } = SkipSchema.parse(req.query);
  const validatedParams = ListProjectsSchema.parse(req.params);
  const areAllVisible = req.orgUser?.user_role === UserRole.ADMIN;

  const projects = await prismaClient.project.findMany({
    where: {
      organisation_id: validatedParams.organisation_id,
      ...(areAllVisible ? {} : { users: { some: { id: req.user!.id } } }),
    },
    orderBy: { created_at: 'desc' },
    take: 10,
    skip: cursor ? 1 : undefined,
    cursor: cursor ? { id: cursor } : undefined,
  });

  res.json(projects);
};

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
