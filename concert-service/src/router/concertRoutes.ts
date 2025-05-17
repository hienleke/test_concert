import express from 'express';
import concertController from '../controllers/concertController';

const router = express.Router();

// GET all concerts
router.get('/', concertController.getAllConcerts);

router.get('/available', concertController.getAllConcertsAvailable);

// GET concert details by ID
router.get('/:id', concertController.getConcertById);

// POST create a new concert
router.post('/', concertController.createConcert);

// PUT update a concert
router.put('/:id', concertController.updateConcert);

// DELETE a concert
router.delete('/:id', concertController.deleteConcert);

export default router;