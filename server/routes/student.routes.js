// routes/student.routes.js
import express from 'express';
import {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
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

// Eliminar un estudiante
router.delete('/:id', deleteStudent);

export default router;
