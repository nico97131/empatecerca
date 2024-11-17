import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getGroups,
  getGroup,
  createGroup,
  updateGroup,
  deleteGroup,
  addStudentToGroup,
  removeStudentFromGroup
} from '../controllers/group.controller.js';

const router = express.Router();

router.use(protect);

// Rutas públicas (accesibles para todos los usuarios autenticados)
router.get('/', getGroups);
router.get('/:id', getGroup);

// Rutas protegidas (solo admin)
router.use(authorize('admin'));
router.post('/', createGroup);
router.put('/:id', updateGroup);
router.delete('/:id', deleteGroup);
router.post('/:id/students', addStudentToGroup);
router.delete('/:id/students/:studentId', removeStudentFromGroup);

export default router;