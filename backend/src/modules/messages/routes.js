import { Router } from 'express';
import * as messageController from './controller.js';
import * as messageSchemas from './schemas.js';
import { authMiddleware } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';

const router = Router();

router.use(authMiddleware);
router.get('/', messageController.listMessages);
router.post('/', validate(messageSchemas.createMessageSchema), messageController.createMessage);

export default router;
