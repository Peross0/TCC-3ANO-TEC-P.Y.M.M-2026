import { z } from 'zod';

export const uploadAvatarSchema = z.object({
  // Multer handles file validation, this is just for body params if any
  body: z.object({}).optional(),
});

export const updatePreferencesSchema = z.object({
  body: z.object({
    theme: z.enum(['system', 'light', 'dark']).optional(),
    large_text: z.boolean().optional(),
    high_contrast: z.boolean().optional(),
    reduce_motion: z.boolean().optional(),
    preferred_sector: z.string().trim().max(100).nullable().optional(),
    preferred_location: z.string().trim().max(255).nullable().optional(),
    preferred_work_model: z.enum(['REMOTE', 'HYBRID', 'ONSITE']).nullable().optional(),
    preferred_contract_type: z.enum(['CLT', 'PJ', 'INTERNSHIP', 'FREELANCE']).nullable().optional(),
  }).refine((preferences) => Object.keys(preferences).length > 0, {
    message: 'Informe ao menos uma preferência para atualizar.',
  }),
});