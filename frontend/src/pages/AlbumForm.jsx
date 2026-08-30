import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const emptyTrack = { trackNumber: '', title: '', durationSec: '' };

const AlbumForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    artistName: '',
    releaseYear: '',
    coverImageUrl: '',
  });
  const [tracks, setTracks] = useState([{ ...emptyTrack }]);
  const [status, setStatus] = useState('idle'); // idle | error | success
  const [message, setMessage] = useState('');
  const { user } = useAuth();

  const validate = () => {
    if (!formData.title.trim()) return 'Album title is required.';
    if (!formData.artistName.trim()) return 'Artist name is required.';
    if (tracks.length < 1) return 'At least one track is required.';
    for (const track of tracks) {
      if (track.trackNumber === '' || Number.isNaN(Number(track.trackNumber))) {
        return 'Each track requires a track number.';
      }
      if (!track.title.trim()) {
        return 'Each track requires a title.';
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

    try {
      await axiosInstance.post(
        '/api/admin/albums',
        {
          title: formData.title,
          artistName: formData.artistName,
          releaseYear: formData.releaseYear ? Number(formData.releaseYear) : undefined,
          coverImageUrl: formData.coverImageUrl || undefined,
          tracks: tracks.map((track) => ({
            trackNumber: Number(track.trackNumber),
            title: track.title,
            durationSec: track.durationSec ? Number(track.durationSec) : undefined,
          })),
        },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setStatus('success');
      setMessage('Album created successfully.');
    } catch (error) {
      setStatus('error');
      setMessage(error.response?.data?.message || 'Failed to create album. Please try again.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-20 mb-20">
      <form onSubmit={handleSubmit} className="bg-white p-6 shadow-md rounded">
        <h1 className="text-2xl font-bold mb-4 text-center">Create Album</h1>

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
            <input
              type="number"
              placeholder="#"
              value={track.trackNumber}
              onChange={(e) => updateTrack(index, 'trackNumber', e.target.value)}
              disabled={status === 'success'}
              className="w-16 p-2 border rounded"
            />
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
              placeholder="Sec"
              value={track.durationSec}
              onChange={(e) => updateTrack(index, 'durationSec', e.target.value)}
              disabled={status === 'success'}
              className="w-20 p-2 border rounded"
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
          Create Album
        </button>
      </form>
    </div>
  );
};

export default AlbumForm;
