import { z } from "zod";

export const updateProfileSchema = z.object({
  body: z.object({
    full_name: z.string().min(2).max(255).optional(),
    phone: z.string().max(20).nullable().optional(),
    course: z.string().trim().max(255).nullable().optional(),
    active_notification: z.boolean().optional(),
  }),
});

export const vacancyFiltersSchema = z.object({
  query: z.object({
    q: z.string().trim().optional(),
    job_title: z.string().optional(),
    company_sector: z.string().optional(),
    location: z.string().optional(),
    salary_min: z.coerce.number().optional(),
    salary_max: z.coerce.number().optional(),
    city: z.string().trim().max(120).optional(),
    state: z.string().trim().max(100).optional(),
    work_models: z.preprocess(
      (value) =>
        typeof value === "string" ? value.split(",").filter(Boolean) : value,
      z.array(z.enum(["REMOTE", "HYBRID", "ONSITE"])).optional(),
    ),
    contract_types: z.preprocess(
      (value) =>
        typeof value === "string" ? value.split(",").filter(Boolean) : value,
      z
        .array(
          z.enum([
            "CLT",
            "PJ",
            "INTERNSHIP",
            "APPRENTICE",
            "FREELANCE",
            "TEMPORARY",
          ]),
        )
        .optional(),
    ),
    experience_levels: z.preprocess(
      (value) =>
        typeof value === "string" ? value.split(",").filter(Boolean) : value,
      z.array(z.enum(["FIRST_JOB", "NO_EXPERIENCE", "EXPERIENCED"])).optional(),
    ),
    work_schedules: z.preprocess(
      (value) =>
        typeof value === "string" ? value.split(",").filter(Boolean) : value,
      z.array(z.enum(["PART_TIME", "FULL_TIME", "FLEXIBLE"])).optional(),
    ),
    work_model: z.enum(["REMOTE", "HYBRID", "ONSITE"]).optional(),
    contract_type: z
      .enum(["CLT", "PJ", "INTERNSHIP", "APPRENTICE", "FREELANCE", "TEMPORARY"])
      .optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(50).default(10),
  }),
});

export const applyVacancySchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
});

export const deleteApplicationSchema = z.object({
  params: z.object({
    vacancyId: z.coerce.number().int().positive(),
  }),
});

export const toggleNotificationSchema = z.object({
  body: z.object({
    active_notification: z.boolean(),
  }),
});

export const favoriteVacancySchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
});
