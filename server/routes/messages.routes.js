import express from 'express';
import {
  getMessagesForUser,
  createMessage,
  markMessagesAsRead,
} from '../controllers/messages.controller.js';

const router = express.Router();

// 📥 Obtener mensajes para el usuario autenticado
router.get('/', getMessagesForUser);

// ✉️ Crear un nuevo mensaje
router.post('/', createMessage);

// ✅ Marcar mensajes como leídos
router.put('/mark-as-read', markMessagesAsRead);


export default router;
