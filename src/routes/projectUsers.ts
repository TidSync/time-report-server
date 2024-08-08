import { addUserToProject, getProjectUsers, removeProjectUser } from 'controllers/projectUsers';
import { errorHandler as cb } from 'error-handler';
import { Router } from 'express';
import { isOrgPM, isOrgUser } from 'middlewares/organisations';
import { isProjectUser } from 'middlewares/projects';

const projectUserRoute: Router = Router();

projectUserRoute.post('/', [isOrgPM, isProjectUser], cb(addUserToProject));
projectUserRoute.delete('/', [isOrgPM, isProjectUser], cb(removeProjectUser));
projectUserRoute.get('/:project_id', [isOrgUser, isProjectUser], cb(getProjectUsers));

export default projectUserRoute;
