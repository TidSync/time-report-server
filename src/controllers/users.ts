import { ErrorMessage } from 'constants/api-messages';
import { ErrorCode, StatusCode } from 'constants/api-rest-codes';
import { HttpException } from 'exceptions/http-exception';
import { Request, Response } from 'express';
import fs from 'fs';
import { userModel } from 'models';
import { sendResponse } from 'response-hook';
import { UpdateUserSchema } from 'schema/users';
import { APP_URL } from 'secrets';
import sharp from 'sharp';

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

export const uploadUserPhoto = async (req: Request, res: Response) => {
  try {
    if (!fs.existsSync('files/user')) {
      fs.mkdirSync('files/user', { recursive: true });
    }

    const [user] = await Promise.all([
      userModel.updateUser(req.user!.id, {
        photo: `${APP_URL}/files/user/${req.user!.id}.jpeg`,
      }),
      sharp(req.file!.buffer).resize(200, 200).jpeg().toFile(`files/user/${req.user!.id}.jpeg`),
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
