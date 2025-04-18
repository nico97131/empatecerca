import express from 'express';
import { getTutors } from '../controllers/tutors.controller.js';

const router = express.Router();

router.get('/', getTutors); // GET /api/tutors

export default router;
