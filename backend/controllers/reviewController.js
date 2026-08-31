
const Review = require('../models/Review');
const Album = require('../models/Album');

const serializeReview = (review, requesterId) => ({
    _id: review._id,
    albumId: review.albumId,
    stars: review.stars,
    comment: review.comment,
    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
    userName: review.userId.name,
    isOwn: review.userId._id.toString() === requesterId,
});

const createReview = async (req, res) => {
    const { albumId, stars, comment } = req.body;

    if (!albumId) {
        return res.status(400).json({ message: 'albumId is required' });
    }
    if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
        return res.status(400).json({ message: 'Rating must be an integer between 1 and 5' });
    }
    if (comment !== undefined && comment !== null && String(comment).length > 250) {
        return res.status(400).json({ message: 'Comment must be at most 250 characters' });
    }

    try {
        const album = await Album.findById(albumId);
        if (!album) {
            return res.status(404).json({ message: 'Album not found' });
        }

        const existing = await Review.findOne({ userId: req.user.id, albumId });
        if (existing) {
            return res.status(409).json({ message: 'You have already reviewed this album' });
        }

        const review = await Review.create({
            userId: req.user.id,
            albumId,
            stars,
            comment: comment || '',
        });
        await review.populate('userId', 'name');

        res.status(201).json(serializeReview(review, req.user.id));
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(404).json({ message: 'Album not found' });
        }
        if (error.code === 11000) {
            return res.status(409).json({ message: 'You have already reviewed this album' });
        }
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: error.message });
    }
};

const listReviewsForAlbum = async (req, res) => {
    try {
        const reviews = await Review.find({ albumId: req.params.id })
            .sort({ createdAt: -1 })
            .populate('userId', 'name');

        res.status(200).json(reviews.map((review) => serializeReview(review, req.user.id)));
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(404).json({ message: 'Album not found' });
        }
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createReview, listReviewsForAlbum };
