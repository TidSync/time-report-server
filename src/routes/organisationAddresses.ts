import {
  createAddress,
  deleteAddress,
  getAddresses,
  updateAddress,
} from 'controllers/organisationAddresses';
import { errorHandler as cb } from 'error-handler';
import { Router } from 'express';
import { isOrgOwner } from 'middlewares/organisations';

const orgAddressRoutes: Router = Router();

orgAddressRoutes.post('/', [isOrgOwner], cb(createAddress));
orgAddressRoutes.put('/', [isOrgOwner], cb(updateAddress));
orgAddressRoutes.delete('/', [isOrgOwner], cb(deleteAddress));
orgAddressRoutes.get('/:organisation_id', [isOrgOwner], cb(getAddresses));

export default orgAddressRoutes;
