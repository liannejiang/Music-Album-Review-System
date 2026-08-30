
const Album = require('../models/Album');

const validateAlbumInput = ({ title, artistName, tracks }) => {
    if (!title || typeof title !== 'string' || !title.trim()) {
        return 'Album title is required';
    }
    if (!artistName || typeof artistName !== 'string' || !artistName.trim()) {
        return 'Artist name is required';
    }
    if (!Array.isArray(tracks) || tracks.length < 1) {
        return 'At least one track is required';
    }
    for (const track of tracks) {
        if (track.trackNumber === undefined || track.trackNumber === null || Number.isNaN(Number(track.trackNumber))) {
            return 'Each track requires a track number';
        }
        if (!track.title || typeof track.title !== 'string' || !track.title.trim()) {
            return 'Each track requires a title';
        }
    }
    return null;
};

const createAlbum = async (req, res) => {
    const { title, artistName, releaseYear, coverImageUrl, tracks } = req.body;

    const validationError = validateAlbumInput({ title, artistName, tracks });
    if (validationError) {
        return res.status(400).json({ message: validationError });
    }

    try {
        const album = await Album.create({ title, artistName, releaseYear, coverImageUrl, tracks });
        res.status(201).json(album);
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: error.message });
    }
};

const getAlbum = async (req, res) => {
    try {
        const album = await Album.findById(req.params.id);
        if (!album) {
            return res.status(404).json({ message: 'Album not found' });
        }
        res.status(200).json(album);
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(404).json({ message: 'Album not found' });
        }
        res.status(500).json({ message: error.message });
    }
};

const updateAlbum = async (req, res) => {
    const { title, artistName, releaseYear, coverImageUrl, tracks } = req.body;

    const validationError = validateAlbumInput({ title, artistName, tracks });
    if (validationError) {
        return res.status(400).json({ message: validationError });
    }

    try {
        const album = await Album.findById(req.params.id);
        if (!album) {
            return res.status(404).json({ message: 'Album not found' });
        }

        album.title = title;
        album.artistName = artistName;
        album.releaseYear = releaseYear;
        album.coverImageUrl = coverImageUrl;
        album.tracks = tracks;

        const updatedAlbum = await album.save();
        res.status(200).json(updatedAlbum);
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(404).json({ message: 'Album not found' });
        }
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createAlbum, getAlbum, updateAlbum };
