// frontend/src/components/Navbar.tsx — UPDATED WITH BACK & LOGIN/LOGOUT
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ArrowLeft, LogOut, User } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useApp();
  
  const isLoginPage = location.pathname === '/login';
  const isHomePage = location.pathname === '/';
  const canGoBack = !isHomePage;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleBack = () => {
    navigate(-1); // Go back to previous page
  };

  return (
    <nav className="bg-gray-900 text-white py-4 px-6 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        {/* Left Section - Back Button & Logo */}
        <div className="flex items-center gap-4">
          {canGoBack && (
            <button
              onClick={handleBack}
              className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          )}
          
          <Link to="/" className="text-2xl font-bold hover:text-yellow-400 transition-colors">
            ServiceFinder Nepal
          </Link>
        </div>
        
        {/* Center Section - Navigation Links */}
        <div className="flex gap-6 items-center">
          <Link 
            to="/" 
            className="hover:text-yellow-400 transition-colors font-medium"
          >
            Home
          </Link>
          <Link 
            to="/services" 
            className="hover:text-yellow-400 transition-colors font-medium"
          >
            Services
          </Link>

          {/* Show Dashboard link for logged-in users */}
          {user && user.role === 'freelancer' && (
            <Link 
              to="/freelancer-dashboard" 
              className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg transition-colors font-medium"
            >
              My Dashboard
            </Link>
          )}
          {user && user.role === 'customer' && (
            <Link 
              to="/my-bookings" 
              className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg transition-colors font-medium"
            >
              My Bookings
            </Link>
          )}
        </div>

        {/* Right Section - Login/User Info */}
        <div className="flex gap-4 items-center">
          {/* Show Login button only when not logged in AND not on login page */}
          {!user && !isLoginPage && (
            <Link 
              to="/login" 
              className="bg-yellow-500 text-black px-6 py-2 rounded-full font-bold hover:bg-yellow-600 transition-colors flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              Login
            </Link>
          )}

          {/* Show User info and Logout when logged in */}
          {user && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-black font-bold text-sm">
                  {user.username[0].toUpperCase()}
                </div>
                <span className="text-yellow-400 font-bold">
                  Hi, {user.username}!
                </span>
                <span className="text-gray-300 text-sm capitalize">
                  ({user.role})
                </span>
              </div>
              
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}