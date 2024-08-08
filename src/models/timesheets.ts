import { TimesheetStatus } from '@prisma/client';
import { ErrorMessage } from 'constants/api-messages';
import { ErrorCode, StatusCode } from 'constants/api-rest-codes';
import { HttpException } from 'exceptions/http-exception';
import { prismaClient } from 'index';

type Timesheet = {
  target_date: string;
  id?: string | undefined;
  hours?: number | undefined;
  minutes?: number | undefined;
  description?: string | undefined;
  project_category_id?: string | undefined;
  link?: string | undefined;
};

export const modifyTimesheets = async (
  user_id: string,
  project_id: string,
  timesheets: Timesheet[],
) => {
  console.log('timesheets', timesheets);

  return prismaClient.$transaction(async (tx) => {
    const promises = [];

    for (const timesheet of timesheets) {
      if (!timesheet.id) {
        const data = await tx.timesheet.create({
          data: { ...timesheet, project_id, user_id },
        });

        promises.push(data);
      } else {
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

        promises.push(data);
      }
    }

    console.log('promises', promises);

    return Promise.all(promises);
  });
};

export const deleteTimesheets = async (user_id: string, timesheetIds: string[]) => {
  return prismaClient.timesheet.deleteMany({ where: { user_id, id: { in: timesheetIds } } });
};

export const getTimesheets = async (user_id: string, project_id: string) => {
  return prismaClient.timesheet.findMany({ where: { user_id, project_id } });
};

type TimesheetStatusProp = {
  id: string;
  status: TimesheetStatus;
  comment?: string | undefined;
};

export const updateTimesheetStatus = async (project_id: string, list: TimesheetStatusProp[]) => {
  return prismaClient.$transaction(async (tx) => {
    const promises = [];

    for (const statusData of list) {
      promises.push(
        tx.timesheet.update({
          where: { project_id, id: statusData.id },
          data: {
            status: statusData.status,
            status_comment:
              statusData.status !== TimesheetStatus.CHANGE_REQUESTED
                ? undefined
                : statusData.comment,
          },
        }),
      );
    }

    return Promise.all(promises);
  });
};
