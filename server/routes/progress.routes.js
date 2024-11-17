import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getProgress,
  getStudentProgress,
  createProgress,
  updateProgress,
  deleteProgress,
  getGroupProgress
} from '../controllers/progress.controller.js';

const router = express.Router();

router.use(protect);

// Rutas accesibles para todos los usuarios autenticados
router.get('/', getProgress);
router.get('/student/:studentId', getStudentProgress);
router.get('/group/:groupId', getGroupProgress);

// Rutas solo para voluntarios y admin
router.use(authorize('admin', 'voluntario'));
router.post('/', createProgress);
router.put('/:id', updateProgress);
router.delete('/:id', deleteProgress);

export default router;