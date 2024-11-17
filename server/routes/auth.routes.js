import express from 'express';
import { body } from 'express-validator';
import { login, getMe, updatePassword } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Login route
router.post('/login', [
  body('email').isEmail().withMessage('Por favor ingrese un email válido'),
  body('password').exists().withMessage('La contraseña es requerida')
], login);

// Protected routes
router.use(protect);
router.get('/me', getMe);
router.put('/updatepassword', [
  body('currentPassword').exists().withMessage('La contraseña actual es requerida'),
  body('newPassword').isLength({ min: 6 }).withMessage('La nueva contraseña debe tener al menos 6 caracteres')
], updatePassword);

export default router;