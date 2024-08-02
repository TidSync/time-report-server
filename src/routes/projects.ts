import {
  createProject,
  removeProject,
  getProject,
  listProjects,
  updateProject,
} from 'controllers/projects';
import { errorHandler } from 'error-handler';
import { Router } from 'express';
import { isOrgAdmin, isOrgPM, isOrgUser } from 'middlewares/organisations';
import { isProjectUser } from 'middlewares/projects';
import projectUsersRoute from './projectUsers';

const projectRoutes: Router = Router();
const cb = errorHandler;

projectRoutes.post('/', [isOrgPM], cb(createProject));
projectRoutes.get('/:project_id', [isOrgUser, isProjectUser], cb(getProject));
projectRoutes.delete('/', [isOrgAdmin], cb(removeProject));
projectRoutes.put('/', [isOrgPM, isProjectUser], cb(updateProject));
projectRoutes.get('/list/:organisation_id', [isOrgUser], cb(listProjects));

projectRoutes.use('/users', projectUsersRoute);

export default projectRoutes;
