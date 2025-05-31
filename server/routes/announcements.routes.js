import express from 'express';
import {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  getExpiredAnnouncements,
  deleteAnnouncement  
} from '../controllers/announcements.controller.js';

const router = express.Router();

router.get('/', getAnnouncements);
router.get('/expired', getExpiredAnnouncements);
router.post('/', createAnnouncement);
router.put('/:id', updateAnnouncement);
router.delete('/:id', deleteAnnouncement);

export default router;
