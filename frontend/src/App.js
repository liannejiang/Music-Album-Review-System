import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import axiosInstance from './axiosConfig';

function Home() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axiosInstance.post(
        '/api/auth/logout',
        {},
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
    } catch (error) {
      // Token is discarded client-side regardless of whether the request succeeded.
    } finally {
      logout();
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        MARS — Music Album Review System
      </h1>
      <button
        onClick={handleLogout}
        className="bg-gray-800 text-white px-4 py-2 rounded"
      >
        Logout
      </button>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Home />} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
