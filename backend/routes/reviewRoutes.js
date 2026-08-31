
const express = require('express');
const { createReview, listReviewsForAlbum, updateReview } = require('../controllers/reviewController');
const { protect, requireRole, requireOwnership } = require('../middleware/authMiddleware');
const Review = require('../models/Review');
const router = express.Router();

router.post('/reviews', protect, requireRole('user'), createReview);
router.get('/albums/:id/reviews', protect, listReviewsForAlbum);
router.put('/reviews/:id', protect, requireOwnership(Review, 'userId'), updateReview);

module.exports = router;
