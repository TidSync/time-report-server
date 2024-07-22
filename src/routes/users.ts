import {
  assignUserToRole,
  confirmOrganisationInvitation,
  inviteUserToOrganisation,
  updateUser,
} from 'controllers/users';
import { errorHandler } from 'error-handler';
import { Router } from 'express';
import { authMiddleware } from 'middlewares/auth';
import { organisationAdminMiddleware } from 'middlewares/organisations';

const usersRoutes: Router = Router();

usersRoutes.put('/', [authMiddleware], errorHandler(updateUser));
usersRoutes.post(
  '/assign-organisation-role',
  [authMiddleware, organisationAdminMiddleware],
  errorHandler(assignUserToRole),
);
usersRoutes.post(
  '/invite-organisation-user',
  [authMiddleware, organisationAdminMiddleware],
  errorHandler(inviteUserToOrganisation),
);
usersRoutes.post('/confirm-organisation-user', errorHandler(confirmOrganisationInvitation));

export default usersRoutes;
