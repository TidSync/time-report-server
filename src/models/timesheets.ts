import { TimesheetStatus } from '@prisma/client';
import { ErrorMessage } from 'constants/api-messages';
import { ErrorCode, StatusCode } from 'constants/api-rest-codes';
import { HttpException } from 'exceptions/http-exception';
import { prismaClient } from 'index';
import {
  addBulkRedisArrayData,
  deleteRedisArrayData,
  deleteRedisData,
  getOrSetRedisData,
  setRedisData,
  updateBulkRedisArrayData,
} from 'utils/redis';

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
  return prismaClient.$transaction(async (tx) => {
    const promisesToUpdate = [];
    const promisesToAdd = [];

    for (const timesheet of timesheets) {
      if (!timesheet.id) {
        const data = await setRedisData(['timesheet', '$id'], async () =>
          tx.timesheet.create({
            data: { ...timesheet, project_id, user_id },
          }),
        );

        promisesToAdd.push(data);
      } else {
        const item = await getOrSetRedisData(`timesheet:${timesheet.id}`, () =>
          tx.timesheet.findFirstOrThrow({ where: { id: timesheet.id } }),
        );

        if (item.status === TimesheetStatus.APPROVED) {
          throw new HttpException(
            ErrorMessage.TIMESHEET_ALREADY_APPROVED,
            ErrorCode.TIMESHEET_ALREADY_APPROVED,
            StatusCode.UNPROCESSABLE_CONTENT,
            null,
          );
        }

        const data = await setRedisData([`timesheet:${timesheet.id}`], async () =>
          tx.timesheet.update({
            where: { id: timesheet.id, project_id: project_id, user_id },
            data: { ...timesheet },
          }),
        );

        if (!data) {
          throw new HttpException(
            ErrorMessage.UNPROCESSABLE_ENTITY,
            ErrorCode.UNPROCESSABLE_ENTITY,
            StatusCode.UNPROCESSABLE_CONTENT,
            null,
          );
        }

        promisesToUpdate.push(data);
      }
    }

    const [timesheetsToAdd, timesheetsToUpdate] = await Promise.all([
      Promise.all(promisesToAdd),
      Promise.all(promisesToUpdate),
    ]);

    addBulkRedisArrayData(`timesheets:${project_id}:${user_id}`, timesheetsToAdd).then(() => {
      updateBulkRedisArrayData(`timesheets:${project_id}:${user_id}`, 'id', timesheetsToUpdate);
    });

    return [...timesheetsToAdd, ...timesheetsToUpdate];
  });
};

export const deleteTimesheets = async (
  user_id: string,
  project_id: string,
  timesheetIds: string[],
) => {
  deleteRedisArrayData(`timesheets:${project_id}:${user_id}`, { id: timesheetIds });
  timesheetIds.forEach((timesheetId) => {
    deleteRedisData(`timesheet:${timesheetId}`);
  });

  return prismaClient.timesheet.deleteMany({ where: { user_id, id: { in: timesheetIds } } });
};

export const getTimesheets = async (user_id: string, project_id: string) => {
  return getOrSetRedisData(`timesheets:${project_id}:${user_id}`, () =>
    prismaClient.timesheet.findMany({ where: { user_id, project_id } }),
  );
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
        setRedisData([`timesheet:${statusData.id}`], () =>
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
        ),
      );
    }

    const timesheets = await Promise.all(promises);

    updateBulkRedisArrayData(`timesheets:${project_id}:${timesheets[0].user_id}`, 'id', timesheets);

    return timesheets;
  });
};
