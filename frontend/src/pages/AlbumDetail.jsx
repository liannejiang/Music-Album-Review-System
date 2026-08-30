import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import ConfirmDialog from '../components/ConfirmDialog';

const formatDuration = (durationSec) => {
  if (durationSec === undefined || durationSec === null) return '--:--';
  const minutes = Math.floor(durationSec / 60);
  const seconds = durationSec % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
};

const AlbumDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [status, setStatus] = useState('loading'); // loading | error | loaded
  const [message, setMessage] = useState('');
  const [album, setAlbum] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    const loadAlbum = async () => {
      setStatus('loading');
      try {
        const response = await axiosInstance.get(`/api/albums/${id}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setAlbum(response.data);
        setStatus('loaded');
      } catch (error) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Failed to load album.');
      }
    };

    loadAlbum();
  }, [id, user.token]);

  const handleDeleteConfirm = async () => {
    setDeleteDialogOpen(false);
    try {
      await axiosInstance.delete(`/api/admin/albums/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      navigate('/');
    } catch (error) {
      setDeleteError(error.response?.data?.message || 'Failed to delete album. Please try again.');
    }
  };

  if (status === 'loading') {
    return (
      <div className="max-w-2xl mx-auto mt-20 mb-20">
        <p className="text-center text-gray-500">Loading album...</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="max-w-2xl mx-auto mt-20 mb-20">
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
          {message}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 mb-20 px-4">
      {deleteDialogOpen && (
        <ConfirmDialog
          message="Delete this album? This action cannot be undone."
          confirmLabel="Delete"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteDialogOpen(false)}
        />
      )}

      <div className="bg-white p-6 shadow-md rounded">
        {deleteError && (
          <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
            {deleteError}
          </p>
        )}

        <div className="flex gap-6">
          <div className="w-40 h-40 flex-shrink-0 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
            {album.coverImageUrl ? (
              <img src={album.coverImageUrl} alt={album.title} className="w-full h-full object-cover" />
            ) : (
              <span className="text-gray-400 text-sm">No cover</span>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{album.title}</h1>
            <p className="text-gray-600">{album.artistName}</p>
            {album.releaseYear && <p className="text-sm text-gray-400">{album.releaseYear}</p>}
            <p className="text-sm text-gray-400 mt-2">No ratings yet</p>
          </div>
        </div>

        {isAdmin && (
          <div className="flex gap-2 mt-4">
            <Link
              to={`/admin/albums/${id}/edit`}
              className="px-4 py-2 rounded border border-gray-300 text-gray-700 text-sm"
            >
              Edit
            </Link>
            <button
              type="button"
              onClick={() => setDeleteDialogOpen(true)}
              className="px-4 py-2 rounded border border-red-300 text-red-600 text-sm"
            >
              Delete Album
            </button>
          </div>
        )}

        <h2 className="font-semibold mt-6 mb-2">Tracks</h2>
        <ol className="divide-y">
          {album.tracks.map((track) => (
            <li key={track.trackNumber} className="flex items-center gap-3 py-2">
              <span className="w-8 text-gray-500">{track.trackNumber}</span>
              <span className="flex-1">{track.title}</span>
              <span className="text-gray-500 text-sm">{formatDuration(track.durationSec)}</span>
            </li>
          ))}
        </ol>

        {/*
          MAR-16: review list and review form go here, below the track list.
        */}
      </div>
    </div>
  );
};

export default AlbumDetail;
