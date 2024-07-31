import {
  createOrganisation,
  getOrganisation,
  updateOrganisation,
  assignUserToRole,
  confirmOrganisationInvitation,
  inviteUserToOrganisation,
  getOrganisationUsers,
  removeOrganisationUser,
  removeOrganisation,
} from 'controllers/organisations';
import { errorHandler } from 'error-handler';
import { Router } from 'express';
import { orgAdminMidd, orgOwnerMidd, orgUserMidd } from 'middlewares/organisations';

const organisationRoutes: Router = Router();
const cb = errorHandler;

organisationRoutes.post('/', cb(createOrganisation));
organisationRoutes.get('/:organisation_id', [orgUserMidd], cb(getOrganisation));
organisationRoutes.put('/', [orgOwnerMidd], cb(updateOrganisation));
organisationRoutes.delete('/', [orgOwnerMidd], cb(removeOrganisation));

organisationRoutes.put('/users', [orgAdminMidd], cb(assignUserToRole));
organisationRoutes.post('/users', [orgAdminMidd], cb(inviteUserToOrganisation));
organisationRoutes.delete('/users', [orgAdminMidd], cb(removeOrganisationUser));
organisationRoutes.post('/users/confirm', cb(confirmOrganisationInvitation));
organisationRoutes.get('/users/:organisation_id', [orgAdminMidd], cb(getOrganisationUsers));

export default organisationRoutes;
