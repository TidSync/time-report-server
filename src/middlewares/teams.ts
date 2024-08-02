import { ErrorMessage } from 'constants/api-messages';
import { ErrorCode, StatusCode } from 'constants/api-rest-codes';
import { HttpException } from 'exceptions/http-exception';
import { NextFunction, Request, Response } from 'express';
import { canSeeAllEntities } from 'utils/permissions';

// Precondition for this middleware is to run any of the org middlewares
export const isTeamUser = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    if (canSeeAllEntities(req.orgUser!.user_role)) {
      return next();
    }

    const teamUser = req.team!.users.find((user) => user.id === req.user!.id);

    if (!teamUser) {
      throw new Error();
    }

    next();
  } catch (error) {
    next(
      new HttpException(
        ErrorMessage.USER_NOT_TEAM,
        ErrorCode.TEAM_UNAUTHORIZED,
        StatusCode.UNAUTHORIZED,
        error,
      ),
    );
  }
};
