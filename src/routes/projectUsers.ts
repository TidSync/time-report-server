import { addUserToProject, getProjectUsers, removeProjectUser } from 'controllers/projects';
import { errorHandler } from 'error-handler';
import { Router } from 'express';
import { isOrgPM, isOrgUser } from 'middlewares/organisations';
import { isProjectUser } from 'middlewares/projects';

const projectUserRoute: Router = Router();
const cb = errorHandler;

projectUserRoute.post('/', [isOrgPM, isProjectUser], cb(addUserToProject));
projectUserRoute.delete('/', [isOrgPM, isProjectUser], cb(removeProjectUser));
projectUserRoute.get('/:project_id', [isOrgUser, isProjectUser], cb(getProjectUsers));

export default projectUserRoute;
