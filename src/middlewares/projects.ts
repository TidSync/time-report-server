import { ErrorMessage } from 'constants/api-messages';
import { ErrorCode, StatusCode } from 'constants/api-rest-codes';
import { HttpException } from 'exceptions/http-exception';
import { Request, Response, NextFunction } from 'express';
import { canSeeAllEntities } from 'utils/permissions';

// Precondition for this middleware is to run any of the org middlewares
export const isProjectUser = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    if (canSeeAllEntities(req.orgUser!.user_role)) {
      return next();
    }

    const projectUser = req.projectUsers!.find((user) => user.id === req.user!.id);

    if (!projectUser) {
      throw new Error();
    }

    next();
  } catch (error) {
    next(
      new HttpException(
        ErrorMessage.UNAUTHORIZED,
        ErrorCode.PROJECT_UNAUTHORIZED,
        StatusCode.UNAUTHORIZED,
        error,
      ),
    );
  }
};
