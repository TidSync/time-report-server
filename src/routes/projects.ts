import {
  addUserToProject,
  createProject,
  removeProject,
  getProject,
  getProjectUsers,
  listProjects,
  updateProject,
} from 'controllers/projects';
import { errorHandler } from 'error-handler';
import { Router } from 'express';
import { authMiddleware } from 'middlewares/auth';
import {
  organisationAdminMiddleware,
  organisationProjectManagerMiddleware,
  organisationUserMiddleware,
} from 'middlewares/organisations';
import { projectManagerMiddleware, projectUserMiddleware } from 'middlewares/projects';

const projectRoutes: Router = Router();

projectRoutes.post(
  '/',
  [authMiddleware, organisationProjectManagerMiddleware],
  errorHandler(createProject),
);
projectRoutes.get(
  '/:project_id',
  [authMiddleware, projectUserMiddleware],
  errorHandler(getProject),
);
projectRoutes.delete(
  '/',
  [authMiddleware, organisationAdminMiddleware],
  errorHandler(removeProject),
);
projectRoutes.put('/', [authMiddleware, projectManagerMiddleware], errorHandler(updateProject));
projectRoutes.get(
  '/list/:organisation_id',
  [authMiddleware, organisationUserMiddleware],
  errorHandler(listProjects),
);
projectRoutes.post(
  '/add-user',
  [authMiddleware, projectManagerMiddleware],
  errorHandler(addUserToProject),
);
projectRoutes.get(
  '/users/:project_id',
  [authMiddleware, projectManagerMiddleware],
  errorHandler(getProjectUsers),
);

export default projectRoutes;
