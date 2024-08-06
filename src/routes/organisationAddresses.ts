import {
  createAddress,
  deleteAddress,
  getAddresses,
  updateAddress,
} from 'controllers/organisationAddresses';
import { errorHandler as cb } from 'error-handler';
import { Router } from 'express';

const orgAddressRoutes: Router = Router();

orgAddressRoutes.post('/', cb(createAddress));
orgAddressRoutes.put('/', cb(updateAddress));
orgAddressRoutes.delete('/', cb(deleteAddress));
orgAddressRoutes.get('/:organisation_id', cb(getAddresses));

export default orgAddressRoutes;
