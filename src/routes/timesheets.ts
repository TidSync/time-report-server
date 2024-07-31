import { deleteTimesheets, getTimesheets, modifyTimesheets } from 'controllers/timesheets';
import { errorHandler } from 'error-handler';
import { Router } from 'express';
import { projectUserMidd, timesheetCreatorMidd } from 'middlewares/projects';

const timesheetRoutes: Router = Router();
const cb = errorHandler;

timesheetRoutes.get('/:project_id', [projectUserMidd], cb(getTimesheets));
timesheetRoutes.post('/', [timesheetCreatorMidd], cb(modifyTimesheets));
timesheetRoutes.delete('/', [projectUserMidd], cb(deleteTimesheets));

export default timesheetRoutes;
