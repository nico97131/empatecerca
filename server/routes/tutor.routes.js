import express from 'express';
import {
  createTutor,
  getAllTutors,
  updateTutor,
  deleteTutor
} from '../controllers/tutor.controller.js';

const router = express.Router();

router.post('/', createTutor);
router.get('/', getAllTutors);
router.put('/:id', updateTutor);
router.delete('/:id', deleteTutor);

export default router;
