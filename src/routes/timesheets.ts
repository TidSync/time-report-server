import { deleteTimesheets, getTimesheets, modifyTimesheets } from 'controllers/timesheets';
import { errorHandler } from 'error-handler';
import { Router } from 'express';
import { authMiddleware } from 'middlewares/auth';
import { projectUserMiddleware } from 'middlewares/projects';

const timesheetRoutes: Router = Router();

timesheetRoutes.get(
  '/:project_id',
  [authMiddleware, projectUserMiddleware],
  errorHandler(getTimesheets),
);
timesheetRoutes.post('/', [authMiddleware, projectUserMiddleware], errorHandler(modifyTimesheets));
timesheetRoutes.delete(
  '/',
  [authMiddleware, projectUserMiddleware],
  errorHandler(deleteTimesheets),
);

export default timesheetRoutes;
