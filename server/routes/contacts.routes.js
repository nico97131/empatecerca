import express from 'express';
import {
  getContactsForVolunteer,
  getContactsForVolunteerByDni,
  getContactsForTutor
} from '../controllers/contacts.controller.js';

const router = express.Router();

router.get('/voluntario/:volunteerId', getContactsForVolunteer);
router.get('/voluntario-dni/:dni', getContactsForVolunteerByDni);
router.get('/tutor/:tutorId', getContactsForTutor); // 🆕

export default router;
