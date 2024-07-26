import {
  addUserToProject,
  createProject,
  getProject,
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
  errorHandler(updateProject),
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

export default projectRoutes;
