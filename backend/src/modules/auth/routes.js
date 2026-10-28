import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import * as authController from './controller.js';
import * as authSchemas from './schemas.js';

const router = Router();

// Public routes
router.post('/register', validate(authSchemas.registerSchema), authController.register);
router.post('/login', validate(authSchemas.loginSchema), authController.login);
router.post('/forgot-password', validate(authSchemas.forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validate(authSchemas.resetPasswordSchema), authController.resetPassword);
router.post('/change-password', authMiddleware, validate(authSchemas.changePasswordSchema), authController.changePassword);

// Protected routes
router.get('/me', authMiddleware, authController.me);

export default router;