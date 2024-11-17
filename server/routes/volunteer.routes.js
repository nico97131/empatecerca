import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getVolunteers,
  getVolunteer,
  createVolunteer,
  updateVolunteer,
  deleteVolunteer,
  updateAvailability,
  getVolunteerGroups
} from '../controllers/volunteer.controller.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(authorize('admin'), getVolunteers)
  .post(authorize('admin'), createVolunteer);

router.route('/:id')
  .get(getVolunteer)
  .put(authorize('admin'), updateVolunteer)
  .delete(authorize('admin'), deleteVolunteer);

router.put('/:id/availability', authorize('admin', 'voluntario'), updateAvailability);
router.get('/:id/groups', authorize('admin', 'voluntario'), getVolunteerGroups);

export default router;