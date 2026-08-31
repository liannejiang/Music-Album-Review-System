import { useState, useEffect } from 'react';

import { Link, useParams } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const emptyTrack = { title: '', durationMinutes: '', durationSeconds: '' };
const emptyFormData = { title: '', artistName: '', releaseYear: '', coverImageUrl: '' };

const toTrackFields = (tracks) =>
  tracks.map((track) => {
    const totalSeconds = track.durationSec;
    const hasDuration = totalSeconds !== undefined && totalSeconds !== null;
    return {
      title: track.title ?? '',
      durationMinutes: hasDuration ? String(Math.floor(totalSeconds / 60)) : '',
      durationSeconds: hasDuration ? String(totalSeconds % 60) : '',
    };
  });

const AlbumForm = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({ ...emptyFormData });
  const [tracks, setTracks] = useState([{ ...emptyTrack }]);
  const [status, setStatus] = useState('idle'); // idle | error | success
  const [message, setMessage] = useState('');
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [fetchError, setFetchError] = useState('');
  const [createdAlbumId, setCreatedAlbumId] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!isEditMode) return;

    const loadAlbum = async () => {
      try {
        const response = await axiosInstance.get(`/api/admin/albums/${id}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const album = response.data;
        setFormData({
          title: album.title || '',
          artistName: album.artistName || '',
          releaseYear: album.releaseYear !== undefined && album.releaseYear !== null ? String(album.releaseYear) : '',
          coverImageUrl: album.coverImageUrl || '',
        });
        setTracks(album.tracks && album.tracks.length ? toTrackFields(album.tracks) : [{ ...emptyTrack }]);
      } catch (error) {
        setFetchError(error.response?.data?.message || 'Failed to load album.');
      } finally {
        setInitialLoading(false);
      }
    };

    loadAlbum();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const validate = () => {
    if (!formData.title.trim()) return 'Album title is required.';
    if (!formData.artistName.trim()) return 'Artist name is required.';
    if (tracks.length < 1) return 'At least one track is required.';
    for (const track of tracks) {
      if (!track.title.trim()) {
        return 'Each track requires a title.';
      }
      if (track.durationMinutes !== '' && (Number.isNaN(Number(track.durationMinutes)) || Number(track.durationMinutes) < 0)) {
        return 'Duration minutes must be zero or greater.';
      }
      if (
        track.durationSeconds !== '' &&
        (Number.isNaN(Number(track.durationSeconds)) || Number(track.durationSeconds) < 0 || Number(track.durationSeconds) > 59)
      ) {
        return 'Duration seconds must be between 0 and 59.';
      }
    }
    return null;
  };

  const updateTrack = (index, field, value) => {
    setTracks((prev) =>
      prev.map((track, i) => (i === index ? { ...track, [field]: value } : track))
    );
  };

  const addTrack = () => {
    setTracks((prev) => [...prev, { ...emptyTrack }]);
  };

  const removeTrack = (index) => {
    setTracks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      setStatus('error');
      setMessage(validationError);
      return;
    }

    const payload = {
      title: formData.title,
      artistName: formData.artistName,
      releaseYear: formData.releaseYear ? Number(formData.releaseYear) : undefined,
      coverImageUrl: formData.coverImageUrl || undefined,
      tracks: tracks.map((track, index) => {
        const hasDuration = track.durationMinutes !== '' || track.durationSeconds !== '';
        const minutes = track.durationMinutes ? Number(track.durationMinutes) : 0;
        const seconds = track.durationSeconds ? Number(track.durationSeconds) : 0;
        return {
          trackNumber: index + 1,
          title: track.title,
          durationSec: hasDuration ? minutes * 60 + seconds : undefined,
        };
      }),
    };
    const authHeader = { headers: { Authorization: `Bearer ${user.token}` } };

    console.log('Album payload:', JSON.stringify(payload, null, 2));

    try {
      if (isEditMode) {
        await axiosInstance.put(`/api/admin/albums/${id}`, payload, authHeader);
        setStatus('success');
        setMessage('Album updated successfully.');
      } else {
        const response = await axiosInstance.post('/api/admin/albums', payload, authHeader);
        setCreatedAlbumId(response.data._id);
        setStatus('success');
        setMessage('Album created successfully.');
      }
    } catch (error) {
      setStatus('error');
      setMessage(
        error.response?.data?.message ||
          (isEditMode ? 'Failed to update album. Please try again.' : 'Failed to create album. Please try again.')
      );
    }
  };

  const handleAddAnother = () => {
    setFormData({ ...emptyFormData });
    setTracks([{ ...emptyTrack }]);
    setStatus('idle');
    setMessage('');
    setCreatedAlbumId(null);
  };

  if (initialLoading) {
    return (
      <div className="max-w-2xl mx-auto mt-20 mb-20">
        <p className="text-center text-gray-500">Loading album...</p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="max-w-2xl mx-auto mt-20 mb-20">
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
          {fetchError}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-20 mb-20">
      <form onSubmit={handleSubmit} className="bg-white p-6 shadow-md rounded">
        <h1 className="text-2xl font-bold mb-4 text-center">
          {isEditMode ? 'Edit Album' : 'Create Album'}
        </h1>

        {status === 'error' && (
          <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
            {message}
          </p>
        )}
        {status === 'success' && (
          <p className="mb-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded p-2">
            {message}
          </p>
        )}
        {status === 'success' && !isEditMode && (
          <div className="flex gap-2 mb-4">
            <Link
              to={`/albums/${createdAlbumId}`}
              className="flex-1 text-center bg-blue-600 text-white p-2 rounded"
            >
              View album
            </Link>
            <button
              type="button"
              onClick={handleAddAnother}
              className="flex-1 bg-white text-gray-700 border border-gray-300 p-2 rounded"
            >
              Add another
            </button>
          </div>
        )}

        <input
          type="text"
          placeholder="Album title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          disabled={status === 'success'}
          className="w-full mb-4 p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Artist name"
          value={formData.artistName}
          onChange={(e) => setFormData({ ...formData, artistName: e.target.value })}
          disabled={status === 'success'}
          className="w-full mb-4 p-2 border rounded"
        />
        <input
          type="number"
          placeholder="Release year"
          value={formData.releaseYear}
          onChange={(e) => setFormData({ ...formData, releaseYear: e.target.value })}
          disabled={status === 'success'}
          className="w-full mb-4 p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Cover image URL"
          value={formData.coverImageUrl}
          onChange={(e) => setFormData({ ...formData, coverImageUrl: e.target.value })}
          disabled={status === 'success'}
          className="w-full mb-4 p-2 border rounded"
        />

        <h2 className="font-semibold mb-2">Tracks</h2>
        {tracks.map((track, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <span className="w-8 flex items-center justify-center text-gray-500">
              {index + 1}
            </span>
            <input
              type="text"
              placeholder="Track title"
              value={track.title}
              onChange={(e) => updateTrack(index, 'title', e.target.value)}
              disabled={status === 'success'}
              className="flex-1 p-2 border rounded"
            />
            <input
              type="number"
              placeholder="mm"
              min="0"
              value={track.durationMinutes}
              onChange={(e) => updateTrack(index, 'durationMinutes', e.target.value)}
              disabled={status === 'success'}
              className="w-14 p-2 border rounded"
            />
            <span className="flex items-center">:</span>
            <input
              type="number"
              placeholder="ss"
              min="0"
              max="59"
              value={track.durationSeconds}
              onChange={(e) => updateTrack(index, 'durationSeconds', e.target.value)}
              disabled={status === 'success'}
              className="w-14 p-2 border rounded"
            />
            <button
              type="button"
              onClick={() => removeTrack(index)}
              disabled={status === 'success' || tracks.length === 1}
              className="px-2 text-red-600 disabled:opacity-30"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addTrack}
          disabled={status === 'success'}
          className="mb-4 text-sm text-blue-600 disabled:opacity-50"
        >
          + Add track
        </button>

        <button
          type="submit"
          disabled={status === 'success'}
          className="w-full bg-green-600 text-white p-2 rounded disabled:opacity-50"
        >
          {isEditMode ? 'Save Changes' : 'Create Album'}
        </button>
      </form>
    </div>
  );
};

export default AlbumForm;
