import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getDisciplines,
  getDiscipline,
  createDiscipline,
  updateDiscipline,
  deleteDiscipline
} from '../controllers/discipline.controller.js';

const router = express.Router();

router.use(protect);

// Rutas públicas (accesibles para todos los usuarios autenticados)
router.get('/', getDisciplines);
router.get('/:id', getDiscipline);

// Rutas protegidas (solo admin)
router.use(authorize('admin'));
router.post('/', createDiscipline);
router.put('/:id', updateDiscipline);
router.delete('/:id', deleteDiscipline);

export default router;