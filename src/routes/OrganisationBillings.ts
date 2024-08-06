import { errorHandler as cb } from 'error-handler';
import { Router } from 'express';
import { checkout, onError, onSuccess } from 'controllers/OrganisationBillings';
import { authMidd } from 'middlewares/auth';
import { isOrgOwner } from 'middlewares/organisations';

const orgBillingRoutes: Router = Router();

orgBillingRoutes.post('/checkout', [authMidd, isOrgOwner], cb(checkout));
orgBillingRoutes.get('/success', cb(onSuccess));
orgBillingRoutes.get('/error', cb(onError));

export default orgBillingRoutes;
