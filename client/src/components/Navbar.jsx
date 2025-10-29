import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';

export default function Navbar() {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <nav className="bg-gradient-to-r from-gray-900 to-gray-700 p-5 shadow-2xl z-50 relative"> {/* Increased padding, stronger shadow */}
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo/Brand Name */}
        <Link to="/" className="text-white text-5xl font-extrabold tracking-tight hover:text-indigo-400 transition-colors duration-300 ease-in-out flex items-center group">
          <span role="img" aria-label="blog" className="mr-4 text-4xl transform group-hover:rotate-6 transition-transform duration-300">📝</span>
          <span className="drop-shadow-lg">BlogApp</span>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center space-x-8 bg-gray-800 bg-opacity-50 px-6 py-3 rounded-full shadow-inner"> {/* Added distinct background for nav group */}
          {user ? (
            <> {/* Authenticated user links */}
              <Link
                to="/create"
                className="text-indigo-200 hover:text-white transition-colors duration-300 ease-in-out text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded px-2 py-1"
              >
                Create Post
              </Link>
              <span className="text-indigo-300 text-lg font-bold hidden md:block">Welcome, {user.username}!</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-5 rounded-full shadow-md hover:shadow-lg transition-all duration-300 ease-in-out text-lg focus:outline-none focus:ring-2 focus:ring-red-400"
              >
                Logout
              </button>
            </>
          ) : (
            <> {/* Guest user links */}
              <Link
                to="/login"
                className="text-indigo-200 hover:text-white transition-colors duration-300 ease-in-out text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded px-2 py-1"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="text-indigo-200 hover:text-white transition-colors duration-300 ease-in-out text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded px-2 py-1"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
