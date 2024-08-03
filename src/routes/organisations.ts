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

const organisationRoutes: Router = Router();
const cb = errorHandler;

organisationRoutes.post('/', cb(createOrganisation));
organisationRoutes.get('/:organisation_id', [isOrgUser], cb(getOrganisation));
organisationRoutes.put('/', [isOrgOwner], cb(updateOrganisation));
organisationRoutes.delete('/', [isOrgOwner], cb(removeOrganisation));

organisationRoutes.use('/users', cb(orgUsersRoutes));

export default organisationRoutes;
