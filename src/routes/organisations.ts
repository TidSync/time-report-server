import {
  createOrganisation,
  getOrganisation,
  updateOrganisation,
  removeOrganisation,
  uploadOrganisationPhoto,
} from 'controllers/organisations';
import { errorHandler as cb } from 'error-handler';
import { Router } from 'express';
import { isOrgOwner, isOrgUser } from 'middlewares/organisations';
import orgUserRoutes from './organisationUsers';
import { authMidd } from 'middlewares/auth';
import orgAddressRoutes from './organisationAddresses';
import orgBillingRoutes from './OrganisationBillings';
import { uploadFile } from 'middlewares/uploadFile';

const organisationRoutes: Router = Router();

organisationRoutes.post('/', [authMidd], cb(createOrganisation));
organisationRoutes.get('/:organisation_id', [authMidd, isOrgUser], cb(getOrganisation));
organisationRoutes.put('/', [authMidd, isOrgOwner], cb(updateOrganisation));
organisationRoutes.put('/upload', [uploadFile, authMidd, isOrgOwner], cb(uploadOrganisationPhoto));
organisationRoutes.delete('/', [authMidd, isOrgOwner], cb(removeOrganisation));

organisationRoutes.use('/users', cb(orgUserRoutes));
organisationRoutes.use('/billing', cb(orgBillingRoutes));
organisationRoutes.use('/addresses', [authMidd], cb(orgAddressRoutes));

export default organisationRoutes;
