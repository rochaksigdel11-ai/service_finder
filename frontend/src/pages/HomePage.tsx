// frontend/src/pages/HomePage.tsx — FINAL 100% WORKING VERSION
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Briefcase, Shield, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';


export default function HomePage() {
    const { user, setShowLogin } = useApp();   // ← ADD THIS LINE
    const navigate = useNavigate();


  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-pink-900 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-pink-600 rounded-full mix-blend-multiply blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-40 w-96 h-96 bg-yellow-500 rounded-full mix-blend-multiply blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* Hero */}
      <div className="relative z-10 text-center pt-24 pb-16 px-6">
        <h1 className="text-7xl md:text-9xl font-extrabold text-white mb-6">
          ServiceFinder <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-pink-500">Nepal</span>
        </h1>
        <p className="text-2xl md:text-4xl text-white font-light mb-12">
          Click below to login and continue
        </p>
      </div>

      {/* Role Cards */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pb-32">
        <div className="grid md:grid-cols-3 gap-12">

          {/* Customer */}
          <button
  onClick={() => {
    if (user) {
      navigate('/services');
    } else {
      navigate('/login?role=customer');
    }
  }}
  className="group relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600 to-pink-600 p-8 shadow-2xl hover:shadow-purple-500/50 transition-all duration-500 transform hover:scale-105"
>
  <User className="w-16 h-16 mx-auto mb-4 text-white" />
  <h3 className="text-2xl font-bold text-white mb-2">I am a Customer</h3>
  <p className="text-purple-100">Find trusted local services</p>
  <ArrowRight className="absolute right-6 top-1/2 -translate-y-1/2 w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition" />
</button>

<button
  onClick={() => {
    if (user) {
      if (user.role === 'seller' || user.role === 'freelancer') {
        navigate('/seller/dashboard');
      } else {
        navigate('/login?role=freelancer');
      }
    } else {
      navigate('/login?role=freelancer');
    }
  }}
  className="group relative overflow-hidden rounded-3xl bg-gradient-to-r from-cyan-500 to-blue-600 p-8 shadow-2xl hover:shadow-cyan-500/50 transition-all duration-500 transform hover:scale-105"
>
  <Briefcase className="w-16 h-16 mx-auto mb-4 text-white" />
  <h3 className="text-2xl font-bold text-white mb-2">I am a Freelancer</h3>
  <p className="text-cyan-100">Create gigs • Get bookings • Earn money</p>
  <ArrowRight className="absolute right-6 top-1/2 -translate-y-1/2 w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition" />
</button>

{/* Admin */}
   <div 
            className="group cursor-pointer" 
            onClick={() => navigate('/login?role=admin')}
          >
            <div className="bg-white/10 backdrop-blur-2xl rounded-3xl p-12 border-2 border-transparent hover:border-red-500 transition-all hover:scale-105 shadow-2xl">
              <div className="w-28 h-28 mx-auto mb-8 bg-gradient-to-br from-red-600 to-orange-600 rounded-3xl flex items-center justify-center">
                <Shield className="w-16 h-16 text-white" />
              </div>
              <h2 className="text-5xl font-extrabold text-white text-center mb-6">I'm Admin</h2>
              <p className="text-gray-200 text-center text-lg mb-8">
                Full platform control • Users • Revenue • Analytics
              </p>
              <div className="text-red-400 text-center font-bold text-2xl flex items-center justify-center gap-4 group-hover:gap-8 transition-all">
                Admin Panel <ArrowRight className="w-8 h-8" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 bg-black/60 backdrop-blur py-12 text-center">
        <p className="text-3xl text-white font-bold">ServiceFinder Nepal</p>
        <p className="text-gray-300 mt-4 text-lg">By @Rochak531337 — Nepal's #1 Full-Stack Developer</p>
      </footer>
    </div>
  );
}