import { TimesheetStatus } from '@prisma/client';
import { ErrorMessage } from 'constants/api-messages';
import { ErrorCode, StatusCode } from 'constants/api-rest-codes';
import { HttpException } from 'exceptions/http-exception';
import { Request, Response } from 'express';
import { prismaClient } from 'index';
import {
  DeleteTimesheetsSchema,
  GetTimesheetsSchema,
  UpdateTimesheetsSchema,
  UpdateTimesheetStatusSchema,
} from 'schema/timesheets';
import { canSeeAllEntities } from 'utils/permissions';

export const modifyTimesheets = async (req: Request, res: Response) => {
  const { project_id, user_id: userId, timesheets } = UpdateTimesheetsSchema.parse(req.body);
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
      if (!timesheet.id) {
        return tx.timesheet.create({
          data: { ...timesheet, project_id, user_id },
        });
      }

      const item = await tx.timesheet.findFirstOrThrow({
        where: { id: timesheet.id },
      });

      if (item.status === TimesheetStatus.APPROVED) {
        throw new HttpException(
          ErrorMessage.TIMESHEET_ALREADY_APPROVED,
          ErrorCode.TIMESHEET_ALREADY_APPROVED,
          StatusCode.UNPROCESSABLE_CONTENT,
          null,
        );
      }

      const data = await tx.timesheet.update({
        where: { id: timesheet.id, project_id: project_id, user_id },
        data: { ...timesheet },
      });

      if (!data) {
        throw new HttpException(
          ErrorMessage.UNPROCESSABLE_ENTITY,
          ErrorCode.UNPROCESSABLE_ENTITY,
          StatusCode.UNPROCESSABLE_CONTENT,
          null,
        );
      }

      return data;
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

export const updateTimesheetStatus = async (req: Request, res: Response) => {
  const { project_id, timesheets } = UpdateTimesheetStatusSchema.parse(req.body);

  const transaction = await prismaClient.$transaction(async (tx) => {
    const promises = timesheets.map(async (timesheet) =>
      tx.timesheet.update({
        where: { project_id, id: timesheet.id },
        data: {
          status: timesheet.status,
          status_comment:
            timesheet.status !== TimesheetStatus.CHANGE_REQUESTED ? undefined : timesheet.comment,
        },
      }),
    );

    return Promise.all(promises);
  });

  res.json(transaction);
};
