import {
  createActivity,
  getActivities,
  removeActivity,
  updateActivity,
} from 'controllers/activities';
import { errorHandler } from 'error-handler';
import { Router } from 'express';
import { isOrgAdmin } from 'middlewares/organisations';

const activityRoutes: Router = Router();
const cb = errorHandler;

activityRoutes.post('/', [isOrgAdmin], cb(createActivity));
activityRoutes.put('/', [isOrgAdmin], cb(updateActivity));
activityRoutes.get('/:organisation_id', [isOrgAdmin], cb(getActivities));
activityRoutes.delete('/', [isOrgAdmin], cb(removeActivity));

export default activityRoutes;
