import {
  assignUserToRole,
  confirmOrganisationInvitation,
  inviteUserToOrganisation,
  getOrganisationUsers,
  removeOrganisationUser,
} from 'controllers/organisationUsers';
import { errorHandler } from 'error-handler';
import { Router } from 'express';
import { isOrgAdmin, isOrgUser } from 'middlewares/organisations';

const orgUsersRoutes: Router = Router();
const cb = errorHandler;

orgUsersRoutes.put('/', [isOrgAdmin], cb(assignUserToRole));
orgUsersRoutes.post('/', [isOrgAdmin], cb(inviteUserToOrganisation));
orgUsersRoutes.delete('/', [isOrgAdmin], cb(removeOrganisationUser));
orgUsersRoutes.post('/confirm', cb(confirmOrganisationInvitation));
orgUsersRoutes.get('/:organisation_id', [isOrgUser], cb(getOrganisationUsers));

export default orgUsersRoutes;
