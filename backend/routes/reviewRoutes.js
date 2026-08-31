
const express = require('express');
const { createReview, listReviewsForAlbum } = require('../controllers/reviewController');
const { protect, requireRole } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/reviews', protect, requireRole('user'), createReview);
router.get('/albums/:id/reviews', protect, listReviewsForAlbum);

module.exports = router;
