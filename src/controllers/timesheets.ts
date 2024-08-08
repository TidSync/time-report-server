import { ErrorMessage } from 'constants/api-messages';
import { ErrorCode, StatusCode } from 'constants/api-rest-codes';
import { HttpException } from 'exceptions/http-exception';
import { Request, Response } from 'express';
import { timesheetModel } from 'models';
import { sendResponse } from 'response-hook';
import {
  DeleteTimesheetsSchema,
  GetTimesheetsSchema,
  UpdateTimesheetsSchema,
  UpdateTimesheetStatusSchema,
} from 'schema/timesheets';
import { canSeeAllUnderProjectEntities } from 'utils/permissions';

export const modifyTimesheets = async (req: Request, res: Response) => {
  const { project_id, timesheets } = UpdateTimesheetsSchema.parse(req.body);

  console.log('here');
  const transaction = await timesheetModel.modifyTimesheets(req.user!.id, project_id, timesheets);

  sendResponse(res, transaction);
};

export const deleteTimesheets = async (req: Request, res: Response) => {
  const validatedData = DeleteTimesheetsSchema.parse(req.body);

  await timesheetModel.deleteTimesheets(req.user!.id, validatedData.timesheets);

  sendResponse(res);
};

export const getTimesheets = async (req: Request, res: Response) => {
  const validatedData = GetTimesheetsSchema.parse(req.params);
  const userId = validatedData.user_id || req.user!.id;

  if (userId !== req.user!.id && !canSeeAllUnderProjectEntities(req.orgUser!.user_role)) {
    throw new HttpException(
      ErrorMessage.UNAUTHORIZED,
      ErrorCode.UNAUTHORIZED,
      StatusCode.UNAUTHORIZED,
      null,
    );
  }

  const timesheets = await timesheetModel.getTimesheets(userId, validatedData.project_id);

  sendResponse(res, timesheets);
};

export const updateTimesheetStatus = async (req: Request, res: Response) => {
  const { project_id, timesheets } = UpdateTimesheetStatusSchema.parse(req.body);

  const transaction = await timesheetModel.updateTimesheetStatus(project_id, timesheets);

  sendResponse(res, transaction);
};
