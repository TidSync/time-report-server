import { Organisation, SubscriptionStatus } from '@prisma/client';
import { stripe } from 'index';
import { organisationModel } from 'models';
import Stripe from 'stripe';

export const getCustomer = async (customerId: string) => {
  return await stripe.customers.retrieve(customerId);
};

type CustomerData = {
  name: string;
  email: string;
  line1: string;
  line2: string;
  postal_code: string;
  city: string;
  country: string;
  organisation_id: string;
};

export const createCustomer = async (customerData: CustomerData) => {
  const { name, email, organisation_id, ...address } = customerData;

  return stripe.customers.create({ name, email, address, metadata: { organisation_id } });
};

export const handleSubscriptionEvents = async (
  stripeData:
    | Stripe.CustomerSubscriptionUpdatedEvent.Data
    | Stripe.CustomerSubscriptionDeletedEvent.Data
    | Stripe.CustomerSubscriptionCreatedEvent.Data,
) => {
  const { object: subInfo } = stripeData;
  const organisation_id = subInfo.metadata.organisation_id;

  if (!organisation_id) {
    return;
  }

  const orgData = await organisationModel.getOrganisation(organisation_id);

  if (!orgData) {
    return;
  }

  const itemsToUpdate: Partial<Organisation> = {};

  if (orgData.organisation.subscription_billing_id !== subInfo.id) {
    itemsToUpdate.subscription_billing_id = subInfo.id;
  }

  if (
    orgData.organisation.subscription_ends_at?.toISOString() !==
    new Date(subInfo.current_period_end * 1000).toISOString()
  ) {
    itemsToUpdate.subscription_ends_at = new Date(subInfo.current_period_end * 1000);
  }

  if (!orgData.organisation.subscription_status) {
    itemsToUpdate.subscription_status =
      subInfo.status === 'active' ? SubscriptionStatus.ACTIVE : SubscriptionStatus.INACTIVE;
  } else if (
    subInfo.status !== 'active' &&
    orgData.organisation.subscription_status === SubscriptionStatus.ACTIVE
  ) {
    itemsToUpdate.subscription_status = SubscriptionStatus.INACTIVE;
  } else if (
    subInfo.status === 'active' &&
    orgData.organisation.subscription_status === SubscriptionStatus.INACTIVE
  ) {
    itemsToUpdate.subscription_status = SubscriptionStatus.ACTIVE;
  }

  if (Object.keys(itemsToUpdate).length > 0) {
    await organisationModel.updateOrganisation(organisation_id, itemsToUpdate);
  }
};

export const handleCustomerEvents = async (stripeData: Stripe.CustomerDeletedEvent.Data) => {
  const { object: custInfo } = stripeData;

  await organisationModel.updateOrganisations(
    { customer_billing_id: custInfo.id },
    { customer_billing_id: null },
  );
};
