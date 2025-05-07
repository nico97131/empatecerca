import express from 'express';
import {
  getVolunteerRatingsSummary,
  getVolunteerFeedback,
  createVolunteerRating
} from '../controllers/ratings.controller.js';

const router = express.Router();

router.get('/', getVolunteerRatingsSummary);
router.get('/:volunteerId', getVolunteerFeedback);
router.post('/', createVolunteerRating);

export default router;
