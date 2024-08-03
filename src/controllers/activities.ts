import { ErrorMessage } from 'constants/api-messages';
import { ErrorCode, StatusCode } from 'constants/api-rest-codes';
import { HttpException } from 'exceptions/http-exception';
import { Request, Response } from 'express';
import { prismaClient } from 'index';
import {
  CreateActivitySchema,
  GetActivitySchema,
  RemoveActivitySchema,
  UpdateActivitySchema,
} from 'schema/activities';

export const createActivity = async (req: Request, res: Response) => {
  const validatedBody = CreateActivitySchema.parse(req.body);

  const category = await prismaClient.activity.create({ data: validatedBody });

  res.json(category);
};

export const removeActivity = async (req: Request, res: Response) => {
  const validatedBody = RemoveActivitySchema.parse(req.body);

  await prismaClient.activity.delete({
    where: { id: validatedBody.activity_id, organisation_id: validatedBody.organisation_id },
  });

  res.json();
};

export const updateActivity = async (req: Request, res: Response) => {
  const { activity_id, organisation_id, ...updateData } = UpdateActivitySchema.parse(req.body);

  if (Object.keys(updateData).length === 0) {
    throw new HttpException(
      ErrorMessage.UPDATE_DATA_MISSING,
      ErrorCode.UPDATE_DATA_MISSING,
      StatusCode.UNPROCESSABLE_CONTENT,
      null,
    );
  }

  const category = await prismaClient.activity.update({
    where: { id: activity_id, organisation_id },
    data: updateData,
  });

  res.json(category);
};

export const getActivities = async (req: Request, res: Response) => {
  const validatedParams = GetActivitySchema.parse(req.params);

  const categories = await prismaClient.activity.findMany({
    where: { organisation_id: validatedParams.organisation_id },
  });

  res.json(categories);
};
