// frontend/src/components/Navbar.tsx — FINAL CLEAN VERSION
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ArrowLeft, LogOut, User, Package, Home, MessageCircle } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, loading } = useApp();

  const isLoginPage = location.pathname === '/login';
  const isHomePage = location.pathname === '/';
  const canGoBack = !isHomePage && !isLoginPage;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleChatClick = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate('/chat');
  };

  // Show loading state while checking authentication
  if (loading) {
    return (
      <nav className="bg-gray-900/95 backdrop-blur-lg text-white py-5 px-6 shadow-2xl border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg">
              SF
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              ServiceFinder Application
            </span>
          </div>
          <div className="text-yellow-400 font-bold animate-pulse">Loading...</div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-gray-900/95 backdrop-blur-lg text-white py-5 px-6 shadow-2xl border-b border-white/10 sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        {/* Left: Back + Logo */}
        <div className="flex items-center gap-6">
          {canGoBack && (
            <button
              onClick={handleBack}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition-all backdrop-blur"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Back</span>
            </button>
          )}
          
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg">
              SF
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent group-hover:from-yellow-400 group-hover:to-pink-400 transition-all">
              ServiceFinder Application

            </span>
          </Link>
        </div>
        
        {/* Center: Main Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 hover:text-cyan-400 transition-all font-medium">
            <Home className="w-5 h-5" /> Home
          </Link>
          <Link to="/services" className="hover:text-cyan-400 transition-all font-medium">
            All Services
          </Link>


          {/* Customer: My Bookings */}
          {user && user.role === 'customer' && (
            <Link 
              to="/my-bookings" 
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 px-6 py-3 rounded-full font-bold shadow-lg transform hover:scale-105 transition-all flex items-center gap-2"
            >
              <Package className="w-5 h-5" />
              My Bookings
            </Link>
          )}

          {/* Freelancer: Dashboard */}
          {user && ['freelancer', 'seller'].includes(user.role || '') && (
            <Link 
              to="/seller/dashboard" 
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 px-6 py-3 rounded-full font-bold shadow-lg transform hover:scale-105 transition-all flex items-center gap-2"
            >
              Freelancer Dashboard
            </Link>
          )}

          {/* Admin */}
          {user && user.role === 'admin' && (
            <Link 
              to="/admin/dashboard" 
              className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 px-6 py-3 rounded-full font-bold shadow-lg transform hover:scale-105 transition-all"
            >
              ADMIN PANEL
            </Link>
          )}
        </div>

        {/* Right: User Info + Chat */}
        <div className="flex items-center gap-4">
          {/* Chat Button - Visible to all logged-in users */}
          {user && (
            <button
              onClick={handleChatClick}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 px-5 py-3 rounded-full font-bold shadow-lg transform hover:scale-105 transition-all"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="hidden sm:inline">Chat</span>
            </button>
          )}

          {!user && !isLoginPage && (
            <Link 
              to="/login" 
              className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black px-8 py-3 rounded-full font-bold shadow-xl transform hover:scale-105 transition-all flex items-center gap-3"
            >
              <User className="w-6 h-6" />
              Login / Register
            </Link>
          )}

          {user && (
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-bold text-yellow-400 text-lg">Hi, {user.username}!</p>
                <p className="text-sm text-gray-300 capitalize">{user.role} Account</p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-500/20 hover:bg-red-500/40 border border-red-500/50 px-5 py-3 rounded-xl transition-all flex items-center gap-2 backdrop-blur"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden flex items-center justify-center gap-6 mt-4 pb-2">
        <Link to="/" className="flex flex-col items-center text-sm hover:text-cyan-400 transition-all">
          <Home className="w-5 h-5" />
          <span>Home</span>
        </Link>
        <Link to="/services" className="flex flex-col items-center text-sm hover:text-cyan-400 transition-all">
          <Package className="w-5 h-5" />
          <span>Services</span>
        </Link>
        
        {/* Mobile Chat Button */}
        {user && (
          <button
            onClick={handleChatClick}
            className="flex flex-col items-center text-sm hover:text-purple-400 transition-all"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Chat</span>
          </button>
        )}

        {/* Mobile User Info */}
        {user && (
          <div className="flex flex-col items-center text-sm">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-full flex items-center justify-center text-xs font-bold">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <span className="text-xs mt-1 capitalize">{user.role}</span>
          </div>
        )}
      </div>
    </nav>
  );
}