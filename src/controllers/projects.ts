import { ErrorMessage } from 'constants/api-messages';
import { ErrorCode, StatusCode } from 'constants/api-rest-codes';
import { HttpException } from 'exceptions/http-exception';
import { Request, Response } from 'express';
import { projectModel } from 'models';
import { sendResponse } from 'response-hook';
import { SkipSchema } from 'schema/generic';
import {
  CreateProjectSchema,
  DeleteProjectSchema,
  ListProjectsSchema,
  UpdateProjectSchema,
  UploadProjectPhotoSchema,
} from 'schema/projects';
import fs from 'fs';
import { APP_URL } from 'secrets';
import sharp from 'sharp';

export const createProject = async (req: Request, res: Response) => {
  const validatedBody = CreateProjectSchema.parse(req.body);

  const project = await projectModel.createProject({
    ...validatedBody,
    users: { connect: { id: req.user!.id } },
  });

  sendResponse(res, project);
};

export const getProject = async (req: Request, res: Response) => {
  sendResponse(res, { project: req.project, users: req.projectUsers });
};

export const removeProject = async (req: Request, res: Response) => {
  const validatedBody = DeleteProjectSchema.parse(req.body);

  await projectModel.deleteProject(validatedBody.project_id);

  sendResponse(res);
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

  const project = await projectModel.updateProject(project_id, updateData);

  sendResponse(res, project);
};

export const uploadProjectPhoto = async (req: Request, res: Response) => {
  const { project_id } = UploadProjectPhotoSchema.parse(req.body);

  try {
    if (!fs.existsSync('files/project')) {
      fs.mkdirSync('files/project', { recursive: true });
    }

    const [user] = await Promise.all([
      projectModel.updateProject(project_id, {
        photo: `${APP_URL}/files/project/${project_id}.jpeg`,
      }),
      sharp(req.file!.buffer).resize(200, 200).jpeg().toFile(`files/project/${project_id}.jpeg`),
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

export const listProjects = async (req: Request, res: Response) => {
  const { cursor } = SkipSchema.parse(req.query);
  const validatedParams = ListProjectsSchema.parse(req.params);

  const projects = await projectModel.listProjects(
    req.user!.id,
    req.orgUser!.user_role,
    validatedParams.organisation_id,
    cursor,
  );

  sendResponse(res, projects);
};
