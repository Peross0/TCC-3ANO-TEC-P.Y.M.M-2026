import { Router } from 'express';
import { env } from '../../config/env.js';
import { authMiddleware } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import * as authController from './controller.js';
import * as authSchemas from './schemas.js';

const router = Router();

// Public routes
router.post('/register', validate(authSchemas.registerSchema), authController.register);
router.post('/login', validate(authSchemas.loginSchema), authController.login);
if (env.NODE_ENV !== 'production') {
  router.post('/reset-password', validate(authSchemas.resetPasswordSchema), authController.resetPassword);
}
router.post('/change-password', authMiddleware, validate(authSchemas.changePasswordSchema), authController.changePassword);
router.post('/change-password-with-session', authMiddleware, validate(authSchemas.changePasswordWithSessionSchema), authController.changePasswordWithSession);

// Protected routes
router.get('/me', authMiddleware, authController.me);

export default router;