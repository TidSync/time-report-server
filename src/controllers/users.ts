import { ErrorMessage } from 'constants/api-messages';
import { ErrorCode, StatusCode } from 'constants/api-rest-codes';
import { HttpException } from 'exceptions/http-exception';
import { Request, Response } from 'express';
import { userModel } from 'models';
import { sendResponse } from 'response-hook';
import { UpdateUserSchema } from 'schema/users';

export const updateUser = async (req: Request, res: Response) => {
  const validatedData = UpdateUserSchema.parse(req.body);

  if (Object.keys(validatedData).length === 0) {
    throw new HttpException(
      ErrorMessage.UPDATE_DATA_MISSING,
      ErrorCode.UPDATE_DATA_MISSING,
      StatusCode.UNPROCESSABLE_CONTENT,
      null,
    );
  }

  const updatedUser = await userModel.updateUser(req.user!.id, validatedData);

  sendResponse(res, updatedUser);
};
