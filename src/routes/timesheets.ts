import { deleteTimesheets, getTimesheets, modifyTimesheets } from 'controllers/timesheets';
import { errorHandler } from 'error-handler';
import { Router } from 'express';

const timesheetRoutes: Router = Router();
const cb = errorHandler;

timesheetRoutes.get('/:project_id', cb(getTimesheets));
timesheetRoutes.get('/:project_id/:user_id', cb(getTimesheets));
timesheetRoutes.post('/', cb(modifyTimesheets));
timesheetRoutes.delete('/', cb(deleteTimesheets));

export default timesheetRoutes;
