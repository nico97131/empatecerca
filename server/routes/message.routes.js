import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getMessages,
  getMessage,
  sendMessage,
  markAsRead,
  deleteMessage,
  getUnreadCount
} from '../controllers/message.controller.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getMessages)
  .post(sendMessage);

router.get('/unread', getUnreadCount);
router.get('/:id', getMessage);
router.put('/:id/read', markAsRead);
router.delete('/:id', deleteMessage);

export default router;