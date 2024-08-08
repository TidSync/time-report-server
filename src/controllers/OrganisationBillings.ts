import { ErrorMessage } from 'constants/api-messages';
import { ErrorCode, StatusCode } from 'constants/api-rest-codes';
import { HttpException } from 'exceptions/http-exception';
import { Request, Response } from 'express';
import { stripe } from 'index';
import { organisationModel, paymentModel } from 'models';
import { sendResponse } from 'response-hook';
import { CheckoutSchema } from 'schema/OrganisationBillings';
import { STRIPE_WEBHOOK_SECRET } from 'secrets';
import Stripe from 'stripe';

export const checkout = async (req: Request, res: Response) => {
  const validatedBody = CheckoutSchema.parse(req.body);
  const organisation = await organisationModel.getOrganisation(validatedBody.organisation_id);

  if (!organisation) {
    throw new HttpException(
      ErrorMessage.ORGANISATION_NOT_FOUND,
      ErrorCode.ORGANISATION_NOT_FOUND,
      StatusCode.NOT_FOUND,
      null,
    );
  }

  if (organisation.addresses.length === 0) {
    throw new HttpException(
      ErrorMessage.ORGANISATION_MUST_HAVE_ADDRESS,
      ErrorCode.ORGANISATION_MUST_HAVE_ADDRESS,
      StatusCode.UNPROCESSABLE_CONTENT,
      null,
    );
  }

  let customer: Stripe.Customer;
  const address = organisation.addresses[0];
  const createCustomerData = {
    name: req.user!.name,
    email: address.email,
    line1: address.line1,
    line2: address.line2 || '',
    postal_code: address.postal_code,
    city: address.city,
    country: address.country,
    organisation_id: organisation.id,
  };

  if (!organisation.customer_billing_id) {
    customer = await paymentModel.createCustomer(createCustomerData);
  } else {
    const stripeCustomer = await paymentModel.getCustomer(organisation.customer_billing_id);

    if (stripeCustomer.deleted) {
      customer = await paymentModel.createCustomer(createCustomerData);
    } else {
      customer = stripeCustomer;
    }
  }

  if (organisation.customer_billing_id !== customer.id) {
    await organisationModel.updateOrganisation(validatedBody.organisation_id, {
      customer_billing_id: customer.id,
    });
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    locale: 'auto',
    customer: customer.id,
    subscription_data: {
      metadata: { organisation_id: organisation.id },
      trial_settings: {
        end_behavior: {
          missing_payment_method: 'pause',
        },
      },
      trial_period_days: 30,
    },
    line_items: [{ price: validatedBody.price_id, quantity: 1 }],
    success_url: `${req.protocol}://${req.get('host')}/api/organisations/billing/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${req.protocol}://${req.get('host')}/api/organisations/billing/error?session_id={CHECKOUT_SESSION_ID}`,
  });

  sendResponse(res, session);
};

export const listenPaymentEvents = async (req: Request, res: Response) => {
  const signature = req.headers['stripe-signature'] as string;
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, signature, STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    throw new HttpException(
      ErrorMessage.PAYMENT_ERROR,
      ErrorCode.PAYMENT_ERROR,
      StatusCode.FAILED_DEPENDENCY,
      error,
    );
  }

  // Handle the event
  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.deleted':
    case 'customer.subscription.updated':
      await paymentModel.handleSubscriptionEvents(event.data);
      break;
    case 'customer.deleted':
      await paymentModel.handleCustomerEvents(event.data);
      break;
  }

  res.send();
};

export const onSuccess = async (req: Request, res: Response) => {
  sendResponse(res, { body: req.body, params: req.params, query: req.query });
};

export const onError = async (req: Request, res: Response) => {
  sendResponse(res, { body: req.body, params: req.params, query: req.query });
};
