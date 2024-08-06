import { Organisation, SubscriptionStatus } from '@prisma/client';
import { prismaClient, stripe } from 'index';
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

  const organisation = await prismaClient.organisation.findFirst({
    where: { id: organisation_id },
  });

  if (!organisation) {
    return;
  }

  const itemsToUpdate: Partial<Organisation> = {};

  if (organisation.subscription_billing_id !== subInfo.id) {
    itemsToUpdate.subscription_billing_id = subInfo.id;
  }

  if (
    organisation.subscription_ends_at?.toISOString() !==
    new Date(subInfo.current_period_end * 1000).toISOString()
  ) {
    itemsToUpdate.subscription_ends_at = new Date(subInfo.current_period_end * 1000);
  }

  if (!organisation.subscription_status) {
    itemsToUpdate.subscription_status =
      subInfo.status === 'active' ? SubscriptionStatus.ACTIVE : SubscriptionStatus.INACTIVE;
  } else if (
    subInfo.status !== 'active' &&
    organisation.subscription_status === SubscriptionStatus.ACTIVE
  ) {
    itemsToUpdate.subscription_status = SubscriptionStatus.INACTIVE;
  } else if (
    subInfo.status === 'active' &&
    organisation.subscription_status === SubscriptionStatus.INACTIVE
  ) {
    itemsToUpdate.subscription_status = SubscriptionStatus.ACTIVE;
  }

  if (Object.keys(itemsToUpdate).length > 0) {
    await prismaClient.organisation.update({ where: { id: organisation_id }, data: itemsToUpdate });
  }
};

export const handleCustomerEvents = async (stripeData: Stripe.CustomerDeletedEvent.Data) => {
  const { object: custInfo } = stripeData;

  await prismaClient.organisation.updateMany({
    where: { customer_billing_id: custInfo.id },
    data: { customer_billing_id: null },
  });
};
