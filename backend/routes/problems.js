import express from 'express';
import { getProblems, getTestcases, getProblemById } from '../controllers/problemsController.js';
import { authMiddleware } from '../middleware/auth.js';
const router = express.Router();

router.get('/', authMiddleware, getProblems);
router.get('/:id', authMiddleware, getProblemById);
router.get('/:id/testcases', authMiddleware, getTestcases);

export default router;
