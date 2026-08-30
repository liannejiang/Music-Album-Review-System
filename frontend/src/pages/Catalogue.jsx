import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import AlbumCard from '../components/AlbumCard';
import EmptyState from '../components/EmptyState';

const Catalogue = () => {
  const [status, setStatus] = useState('loading'); // loading | error | loaded
  const [message, setMessage] = useState('');
  const [albums, setAlbums] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { user } = useAuth();

  useEffect(() => {
    const loadAlbums = async () => {
      setStatus('loading');
      try {
        const response = await axiosInstance.get('/api/albums', {
          params: { page },
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setAlbums(response.data.albums);
        setTotalPages(response.data.totalPages || 1);
        setStatus('loaded');
      } catch (error) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Failed to load albums.');
      }
    };

    loadAlbums();
  }, [page, user.token]);

  return (
    <div className="max-w-6xl mx-auto mt-10 mb-20 px-4">
      <h1 className="text-2xl font-bold mb-6">Catalogue</h1>

      {status === 'loading' && <p className="text-center text-gray-500">Loading albums...</p>}

      {status === 'error' && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
          {message}
        </p>
      )}

      {status === 'loaded' && albums.length === 0 && (
        <EmptyState message="No albums yet. Check back soon." />
      )}

      {status === 'loaded' && albums.length > 0 && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {albums.map((album) => (
              <AlbumCard key={album._id} album={album} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-6">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Catalogue;
