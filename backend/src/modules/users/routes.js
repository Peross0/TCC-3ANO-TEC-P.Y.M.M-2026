import { Router } from 'express';
import * as userController from './controller.js';
import * as userSchemas from './schemas.js';
import { authMiddleware } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import { upload, uploadDocument } from '../../middlewares/upload.js';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

router.get('/', userController.listUsers)
router.get('/me/preferences', userController.getPreferences);
router.put('/me/preferences', validate(userSchemas.updatePreferencesSchema), userController.updatePreferences);
router.post('/me/avatar', upload.single('avatar'), userController.uploadAvatar);
router.get('/me/documents', userController.listDocuments);
router.post('/me/documents', uploadDocument.single('document'), userController.uploadDocument);
router.get('/me/documents/:documentId', validate(userSchemas.documentIdSchema), userController.downloadDocument);
router.delete('/me/documents/:documentId', validate(userSchemas.documentIdSchema), userController.deleteDocument);

export default router;