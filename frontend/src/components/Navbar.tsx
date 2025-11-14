import React from 'react'
import { Link } from 'react-router-dom'
import { Home, Briefcase, LogOut } from 'lucide-react'  // ALL CORRECT
import { useApp } from '../context/AppContext'

export default function Navbar() {
  const { user, logout, setShowLogin } = useApp()

  return (
    <nav className="fixed top-0 left-0 right-0 bg-slate-800 border-b border-slate-700 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-white">ServiceFinder</Link>
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 text-slate-300 hover:text-white">
            <Home className="w-5 h-5" /> Home
          </Link>
          <Link to="/services" className="flex items-center gap-2 text-slate-300 hover:text-white">
            <Briefcase className="w-5 h-5" /> Services
          </Link>
          {user ? (
            <>
              <span className="text-slate-300">Hi, {user.name}</span>
              <button onClick={logout} className="flex items-center gap-2 text-slate-300 hover:text-white">
                <LogOut className="w-5 h-5" /> Logout
              </button>
            </>
          ) : (
            <button onClick={() => setShowLogin(true)} className="text-slate-300 hover:text-white">
              Login
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}