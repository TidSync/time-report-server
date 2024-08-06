import {
  deleteTimesheets,
  getTimesheets,
  modifyTimesheets,
  updateTimesheetStatus,
} from 'controllers/timesheets';
import { errorHandler as cb } from 'error-handler';
import { Router } from 'express';
import { isOrgPM, isOrgUser } from 'middlewares/organisations';
import { isProjectUser } from 'middlewares/projects';

const timesheetRoutes: Router = Router();

timesheetRoutes.get('/:project_id', [isOrgUser, isProjectUser], cb(getTimesheets));
timesheetRoutes.get('/:project_id/:user_id', [isOrgUser, isProjectUser], cb(getTimesheets));
timesheetRoutes.post('/', [isOrgUser, isProjectUser], cb(modifyTimesheets));
timesheetRoutes.delete('/', [isOrgUser, isProjectUser], cb(deleteTimesheets));
timesheetRoutes.post('/status', [isOrgPM, isProjectUser], cb(updateTimesheetStatus));

export default timesheetRoutes;
