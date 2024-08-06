import { z } from 'zod';

export const CheckoutSchema = z.object({
  organisation_id: z.string().uuid(),
  currency: z.string().default('sek'),
  price_id: z.string(),
  quantity: z.number().default(1),
});

export const onEventSchema = z.object({
  session_id: z.string(),
});
