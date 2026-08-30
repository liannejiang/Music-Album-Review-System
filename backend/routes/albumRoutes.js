
const express = require('express');
const { createAlbum, getAlbum, updateAlbum } = require('../controllers/albumController');
const { protect, requireRole } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', protect, requireRole('admin'), createAlbum);
router.get('/:id', protect, requireRole('admin'), getAlbum);
router.put('/:id', protect, requireRole('admin'), updateAlbum);

module.exports = router;
