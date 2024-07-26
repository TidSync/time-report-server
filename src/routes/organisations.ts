import {
  createOrganisation,
  getOrganisation,
  updateOrganisation,
  assignUserToRole,
  confirmOrganisationInvitation,
  inviteUserToOrganisation,
} from 'controllers/organisations';
import { errorHandler } from 'error-handler';
import { Router } from 'express';
import { authMiddleware } from 'middlewares/auth';
import { organisationAdminMiddleware, organisationUserMiddleware } from 'middlewares/organisations';

const organisationRoutes: Router = Router();

organisationRoutes.post('/', [authMiddleware], errorHandler(createOrganisation));
organisationRoutes.get(
  '/:organisation_id',
  [authMiddleware, organisationUserMiddleware],
  errorHandler(getOrganisation),
);
organisationRoutes.put(
  '/',
  [authMiddleware, organisationAdminMiddleware],
  errorHandler(updateOrganisation),
);

organisationRoutes.post(
  '/assign-role',
  [authMiddleware, organisationAdminMiddleware],
  errorHandler(assignUserToRole),
);
organisationRoutes.post(
  '/invite-user',
  [authMiddleware, organisationAdminMiddleware],
  errorHandler(inviteUserToOrganisation),
);
organisationRoutes.post('/confirm-user', errorHandler(confirmOrganisationInvitation));

export default organisationRoutes;
