import { errorHandler } from 'error-handler';
import { Router } from 'express';
import {
  createProjectCategory,
  getProjectCategories,
  removeProjectCategory,
  updateProjectCategory,
} from 'controllers/projectCategories';

const projectCategoryRoutes: Router = Router();
const cb = errorHandler;

projectCategoryRoutes.post('/', cb(createProjectCategory));
projectCategoryRoutes.get('/:project_id', cb(getProjectCategories));
projectCategoryRoutes.delete('/', cb(removeProjectCategory));
projectCategoryRoutes.put('/', cb(updateProjectCategory));

export default projectCategoryRoutes;
