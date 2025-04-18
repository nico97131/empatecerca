// routes/student.routes.js
import express from 'express';
import {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  updateMedicalRecord,
  deleteStudent
} from '../controllers/student.controller.js';

const router = express.Router();

// Obtener todos los estudiantes
router.get('/', getStudents);

// Obtener un estudiante por ID
router.get('/:id', getStudentById);

// Crear un nuevo estudiante
router.post('/', createStudent);

// Actualizar un estudiante
router.put('/:id', updateStudent);

router.put('/:id/medical-record', updateMedicalRecord); // 📌 nueva ruta

// Eliminar un estudiante
router.delete('/:id', deleteStudent);

export default router;
