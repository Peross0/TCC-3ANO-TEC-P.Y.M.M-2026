import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.js";
import { requireRole } from "../../middlewares/requireRole.js";
import { uploadCompanyLogo } from "../../middlewares/upload.js";
import { validate } from "../../middlewares/validate.js";
import * as recruiterController from "./controller.js";
import * as recruiterSchemas from "./schemas.js";

const router = Router();

// All routes require RECRUITER role
router.use(authMiddleware, requireRole("RECRUITER"));

router.get("/profile", recruiterController.getProfile);
router.get("/dashboard", recruiterController.getDashboard);
router.put(
  "/profile",
  validate(recruiterSchemas.updateProfileSchema),
  recruiterController.updateProfile,
);
router.put(
  "/company",
  validate(recruiterSchemas.updateCompanySchema),
  recruiterController.updateCompany,
);
router.post(
  "/company/logo",
  uploadCompanyLogo.single("company_logo"),
  recruiterController.uploadCompanyLogo,
);

router.post(
  "/vacancies",
  validate(recruiterSchemas.createVacancySchema),
  recruiterController.createVacancy,
);
router.get(
  "/public-vacancies",
  validate(recruiterSchemas.publicVacancyFiltersSchema),
  recruiterController.listOtherVacancies,
);
router.get(
  "/public-vacancies/:id",
  validate(recruiterSchemas.vacancyParamsSchema),
  recruiterController.getOtherVacancy,
);
router.get(
  "/vacancies",
  validate(recruiterSchemas.listCandidatesSchema),
  recruiterController.listMyVacancies,
);
router.get(
  "/vacancies/:id",
  validate(recruiterSchemas.vacancyParamsSchema),
  recruiterController.getMyVacancy,
);
router.put(
  "/vacancies/:id",
  validate(recruiterSchemas.updateVacancySchema),
  recruiterController.updateVacancy,
);
router.delete(
  "/vacancies/:id",
  validate(recruiterSchemas.vacancyParamsSchema),
  recruiterController.deleteVacancy,
);

router.get(
  "/vacancies/:id/candidates",
  validate(recruiterSchemas.listCandidatesSchema),
  recruiterController.listCandidatesForVacancy,
);
router.patch(
  "/vacancies/:id/candidates/:userId/status",
  validate(recruiterSchemas.updateCandidateStatusSchema),
  recruiterController.updateCandidateStatus,
);

router.get(
  "/candidates/:id",
  validate(recruiterSchemas.vacancyParamsSchema),
  recruiterController.getCandidateProfile,
);

export default router;
