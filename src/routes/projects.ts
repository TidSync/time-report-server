import {
  addUserToProject,
  createProject,
  removeProject,
  getProject,
  getProjectUsers,
  listProjects,
  updateProject,
  removeProjectUser,
} from 'controllers/projects';
import { errorHandler } from 'error-handler';
import { Router } from 'express';
import { orgAdminMidd, orgProjectManagerMidd } from 'middlewares/organisations';
import { projectManagerMidd, projectUserMidd } from 'middlewares/projects';

const projectRoutes: Router = Router();
const cb = errorHandler;

projectRoutes.post('/', [orgProjectManagerMidd], cb(createProject));
projectRoutes.get('/:project_id', [projectUserMidd], cb(getProject));
projectRoutes.delete('/', [orgAdminMidd], cb(removeProject));
projectRoutes.put('/', [projectManagerMidd], cb(updateProject));
projectRoutes.get('/list/:organisation_id', [projectUserMidd], cb(listProjects));
projectRoutes.post('/users', [projectManagerMidd], cb(addUserToProject));
projectRoutes.get('/users/:project_id', [projectUserMidd], cb(getProjectUsers));
projectRoutes.delete('/users', [projectManagerMidd], cb(removeProjectUser));

export default projectRoutes;
