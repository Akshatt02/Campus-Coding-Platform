// src/routes/problems.js
import express from 'express';
import { getProblems, getTestcases } from '../controllers/problemsController.js';
import { authMiddleware } from '../middleware/auth.js';
const router = express.Router();

router.get('/', authMiddleware, getProblems);
router.get('/:id/testcases', authMiddleware, getTestcases);

export default router;
