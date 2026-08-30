
const express = require('express');
const { createAlbum } = require('../controllers/albumController');
const { protect, requireRole } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', protect, requireRole('admin'), createAlbum);

module.exports = router;
