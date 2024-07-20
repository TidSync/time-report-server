import { createOrganisation } from 'controllers/organisations';
import { errorHandler } from 'error-handler';
import { Router } from 'express';
import { authMiddleware } from 'middlewares/auth';

const organisationRoutes: Router = Router();

organisationRoutes.post('/', [authMiddleware], errorHandler(createOrganisation));

export default organisationRoutes;
