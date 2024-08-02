import { addUserToProject, getProjectUsers, removeProjectUser } from 'controllers/projects';
import { errorHandler } from 'error-handler';
import { Router } from 'express';
import { isOrgPM, isOrgUser } from 'middlewares/organisations';
import { isProjectUser } from 'middlewares/projects';

const projectUsersRoute: Router = Router();
const cb = errorHandler;

projectUsersRoute.post('/', [isOrgPM, isProjectUser], cb(addUserToProject));
projectUsersRoute.delete('/', [isOrgPM, isProjectUser], cb(removeProjectUser));
projectUsersRoute.get('/:project_id', [isOrgUser, isProjectUser], cb(getProjectUsers));

export default projectUsersRoute;
