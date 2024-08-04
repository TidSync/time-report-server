import {
  assignUserToRole,
  confirmOrganisationInvitation,
  inviteUserToOrganisation,
  getOrganisationUsers,
  removeOrganisationUser,
} from 'controllers/organisationUsers';
import { errorHandler } from 'error-handler';
import { Router } from 'express';
import { authMidd } from 'middlewares/auth';
import { isOrgAdmin, isOrgUser } from 'middlewares/organisations';

const orgUsersRoutes: Router = Router();
const cb = errorHandler;

orgUsersRoutes.put('/', [authMidd, isOrgAdmin], cb(assignUserToRole));
orgUsersRoutes.post('/', [authMidd, isOrgAdmin], cb(inviteUserToOrganisation));
orgUsersRoutes.delete('/', [authMidd, isOrgAdmin], cb(removeOrganisationUser));
orgUsersRoutes.post('/confirm', cb(confirmOrganisationInvitation));
orgUsersRoutes.get('/:organisation_id', [authMidd, isOrgUser], cb(getOrganisationUsers));

export default orgUsersRoutes;
