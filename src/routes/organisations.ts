import {
  createOrganisation,
  getOrganisation,
  updateOrganisation,
  removeOrganisation,
} from 'controllers/organisations';
import { errorHandler } from 'error-handler';
import { Router } from 'express';
import { isOrgOwner, isOrgUser } from 'middlewares/organisations';
import orgUsersRoutes from './organisationUsers';
import { authMidd } from 'middlewares/auth';

const organisationRoutes: Router = Router();
const cb = errorHandler;

organisationRoutes.post('/', [authMidd], cb(createOrganisation));
organisationRoutes.get('/:organisation_id', [authMidd, isOrgUser], cb(getOrganisation));
organisationRoutes.put('/', [authMidd, isOrgOwner], cb(updateOrganisation));
organisationRoutes.delete('/', [authMidd, isOrgOwner], cb(removeOrganisation));

organisationRoutes.use('/users', cb(orgUsersRoutes));

export default organisationRoutes;
