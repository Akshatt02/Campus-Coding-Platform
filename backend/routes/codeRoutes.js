import express from 'express';
import { runCode, getCodeResult } from '../controllers/codeController.js';

const router = express.Router();

router.post('/run', runCode);
router.get('/result/:token', getCodeResult);

export default router;