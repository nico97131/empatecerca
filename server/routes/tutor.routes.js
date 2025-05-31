import express from 'express';
import {
  createTutor,
  getAllTutors,
  getVolunteersByTutor,
  updateTutor,
  deleteTutor
} from '../controllers/tutor.controller.js';

const router = express.Router();

// 📥 Crear tutor
router.post('/', createTutor);

// 📤 Obtener todos los tutores
router.get('/', getAllTutors);

// 👀 Ver voluntarios asignados a un tutor
router.get('/:id/volunteers', getVolunteersByTutor);

// ✏️ Actualizar tutor
router.put('/:id', updateTutor);

// 🗑️ Eliminar tutor
router.delete('/:id', deleteTutor);


export default router;
