import {
  assignUserToRole,
  confirmOrganisationInvitation,
  inviteUserToOrganisation,
  getOrganisationUsers,
  removeOrganisationUser,
} from 'controllers/organisationUsers';
import { errorHandler as cb } from 'error-handler';
import { Router } from 'express';
import { authMidd } from 'middlewares/auth';
import { isOrgAdmin, isOrgUser } from 'middlewares/organisations';

const orgUserRoutes: Router = Router();

orgUserRoutes.put('/', [authMidd, isOrgAdmin], cb(assignUserToRole));
orgUserRoutes.post('/', [authMidd, isOrgAdmin], cb(inviteUserToOrganisation));
orgUserRoutes.delete('/', [authMidd, isOrgAdmin], cb(removeOrganisationUser));
orgUserRoutes.post('/confirm', cb(confirmOrganisationInvitation));
orgUserRoutes.get('/:organisation_id', [authMidd, isOrgUser], cb(getOrganisationUsers));

export default orgUserRoutes;
