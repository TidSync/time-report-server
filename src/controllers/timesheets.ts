import { Request, Response } from 'express';
import { prismaClient } from 'index';
import {
  DeleteTimesheetsSchema,
  GetTimesheetsSchema,
  UpdateTimesheetsSchema,
} from 'schema/timesheets';

export const modifyTimesheets = async (req: Request, res: Response) => {
  const { project_id, timesheets } = UpdateTimesheetsSchema.parse(req.body);
  const user_id = req.user!.id;

  const transaction = await prismaClient.$transaction(async (tx) => {
    const promises = timesheets.map(async (timesheet) => {
      if (!timesheet.id) {
        return tx.timesheet.create({
          data: { ...timesheet, project_id, user_id },
        });
      }

      const timesheetData = await tx.timesheet.findFirstOrThrow({
        where: { project_id: project_id, user_id },
      });

      if (timesheetData) {
        return tx.timesheet.update({
          where: { id: timesheet.id },
          data: { ...timesheet, project_id, user_id },
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

  await prismaClient.timesheet.deleteMany({
    where: { user_id: req.user!.id, id: { in: validatedData.timesheets } },
  });

  res.json();
};

export const getTimesheets = async (req: Request, res: Response) => {
  const validatedData = GetTimesheetsSchema.parse(req.params);

  const timesheets = await prismaClient.timesheet.findMany({
    where: { user_id: req.user!.id, project_id: validatedData.project_id },
    orderBy: { created_at: 'asc' },
  });

  res.json(timesheets);
};
