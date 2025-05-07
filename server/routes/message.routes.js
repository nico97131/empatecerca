import express from 'express';
import {
  getMessages,
  createMessage,
  updateMessage,
  getExpiredMessages,
  deleteMessage  

} from '../controllers/message.controller.js';

const router = express.Router();

router.get('/', getMessages);
router.get('/expired', getExpiredMessages);
router.post('/', createMessage);
router.put('/:id', updateMessage);
router.delete('/:id', deleteMessage);

export default router;
