import { ErrorMessage } from 'constants/api-messages';
import { ErrorCode, StatusCode } from 'constants/api-rest-codes';
import { HttpException } from 'exceptions/http-exception';
import { Request, Response } from 'express';
import { prismaClient } from 'index';
import {
  DeleteTimesheetsSchema,
  GetTimesheetsSchema,
  UpdateTimesheetsSchema,
} from 'schema/timesheets';
import { canSeeAllEntities } from 'utils/permissions';

export const modifyTimesheets = async (req: Request, res: Response) => {
  const {
    project_id,
    activity_id,
    user_id: userId,
    timesheets,
  } = UpdateTimesheetsSchema.parse(req.body);
  const user_id = userId || req.user!.id;

  if (user_id !== req.user!.id && !canSeeAllEntities(req.orgUser!.user_role)) {
    throw new HttpException(
      ErrorMessage.UNAUTHORIZED,
      ErrorCode.UNAUTHORIZED,
      StatusCode.UNAUTHORIZED,
      null,
    );
  }

  const transaction = await prismaClient.$transaction(async (tx) => {
    const promises = timesheets.map(async (timesheet) => {
      if (!project_id && timesheet.project_category_id) {
        throw new HttpException(
          ErrorMessage.UNPROCESSABLE_ENTITY,
          ErrorCode.UNPROCESSABLE_ENTITY,
          StatusCode.UNPROCESSABLE_CONTENT,
          null,
        );
      }

      if (!timesheet.id) {
        return tx.timesheet.create({
          data: { ...timesheet, project_id, activity_id, user_id },
        });
      }

      const timesheetData = await tx.timesheet.findFirstOrThrow({
        where: { project_id: project_id, user_id },
      });

      if (timesheetData) {
        return tx.timesheet.update({
          where: { id: timesheet.id },
          data: { ...timesheet, project_id, activity_id, user_id },
        });
      }

      return Promise.resolve();
    });

    return Promise.all(promises);
  });

  res.json(transaction);
};

export const deleteTimesheets = async (req: Request, res: Response) => {
  const validatedData = DeleteTimesheetsSchema.parse(req.body);
  const canDeleteAnyTimesheet = canSeeAllEntities(req.orgUser!.user_role);

  await prismaClient.timesheet.deleteMany({
    where: {
      ...(canDeleteAnyTimesheet ? {} : { user_id: req.user!.id }),
      id: { in: validatedData.timesheets },
    },
  });

  res.json();
};

export const getTimesheets = async (req: Request, res: Response) => {
  const validatedData = GetTimesheetsSchema.parse(req.params);
  const userId = validatedData.user_id || req.user!.id;

  if (userId !== req.user!.id && !canSeeAllEntities(req.orgUser!.user_role)) {
    throw new HttpException(
      ErrorMessage.UNAUTHORIZED,
      ErrorCode.UNAUTHORIZED,
      StatusCode.UNAUTHORIZED,
      null,
    );
  }

  const timesheets = await prismaClient.timesheet.findMany({
    where: { user_id: userId, project_id: validatedData.project_id },
    orderBy: { created_at: 'asc' },
  });

  res.json(timesheets);
};
