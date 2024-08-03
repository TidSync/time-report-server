import { errorHandler } from 'error-handler';
import { Router } from 'express';
import {
  createProjectCategory,
  getProjectCategories,
  removeProjectCategory,
  updateProjectCategory,
} from 'controllers/projectCategories';
import { isOrgPM } from 'middlewares/organisations';
import { isProjectUser } from 'middlewares/projects';

const projectCategoryRoutes: Router = Router();
const cb = errorHandler;

projectCategoryRoutes.post('/', [isOrgPM, isProjectUser], cb(createProjectCategory));
projectCategoryRoutes.get('/:project_id', [isOrgPM, isProjectUser], cb(getProjectCategories));
projectCategoryRoutes.delete('/', [isOrgPM, isProjectUser], cb(removeProjectCategory));
projectCategoryRoutes.put('/', [isOrgPM, isProjectUser], cb(updateProjectCategory));

export default projectCategoryRoutes;
