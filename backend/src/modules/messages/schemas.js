import { z } from 'zod';

export const createMessageSchema = z.object({
  body: z.object({
    application_id: z.coerce.number().int().positive(),
    body: z.string().trim().min(1).max(2000),
  }),
});
