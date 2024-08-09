import { ErrorMessage } from 'constants/api-messages';
import { ErrorCode, StatusCode } from 'constants/api-rest-codes';
import { HttpException } from 'exceptions/http-exception';
import { NextFunction, Request, Response } from 'express';
import multer from 'multer';

export const POSSIBLE_MIMETYPE = [
  'image/bmp',
  'image/jpeg',
  'image/x-png',
  'image/png',
  'image/gif',
];

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 1024 * 1024 * 5 },
}).single('image');

export const uploadFile = async (req: Request, res: Response, next: NextFunction) => {
  upload(req, res, async (error) => {
    if (error) {
      return next(
        new HttpException(
          ErrorMessage.ERROR_RECEIVING_IMAGE,
          ErrorCode.ERROR_RECEIVING_IMAGE,
          StatusCode.INTERNAL_SERVER_ERROR,
          error,
        ),
      );
    }

    if (!req.file?.buffer) {
      next(
        new HttpException(
          ErrorMessage.BUFFER_MISSING,
          ErrorCode.UNPROCESSABLE_ENTITY,
          StatusCode.UNPROCESSABLE_CONTENT,
          { message: 'Buffer missing' },
        ),
      );

      return;
    }

    if (!POSSIBLE_MIMETYPE.includes(req.file.mimetype)) {
      next(
        new HttpException(
          ErrorMessage.WRONG_TYPE,
          ErrorCode.UNPROCESSABLE_ENTITY,
          StatusCode.BAD_REQUEST,
          { message: `Possible file types: ${POSSIBLE_MIMETYPE.join(',')}` },
        ),
      );

      return;
    }

    next();
  });
};
