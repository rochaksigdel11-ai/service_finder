// frontend/src/components/Navbar.tsx — ADD THIS
// import React from 'react';
import {Link, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function Navbar() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';  // ← THIS LINE
  const { user } = useApp();

  return (
    <nav className="bg-gray-900 text-white py-4 px-6 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">ServiceFinder Nepal</h1>
        
        <div className="flex gap-6 items-center">
          <Link to="/">Home</Link>
          <Link to="/services">Services</Link>

          {/* HIDE LOGIN BUTTON ON LOGIN PAGE */}
          {!user && !isLoginPage && (
            <Link 
              to="/login" 
              className="bg-yellow-500 text-black px-6 py-2 rounded-full font-bold hover:bg-yellow-600"
            >
              Login
            </Link>
          )}

          {/* SHOW USERNAME WHEN LOGGED IN */}
          {user && (
            <span className="text-yellow-400 font-bold">Hi, {user.username}!</span>
          )}
        </div>
      </div>
    </nav>
  );
}