// src/App.tsx — FINAL & 100% WORKING
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import Toast from './components/Toast';
import LoginModal from './components/LoginModal';
import RegisterModal from './components/RegisterModal';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ServicesPage from './pages/ServicesPage';
import ServiceDetailPage from './pages/ServiceDetailPage';
import SellerDashboard from './pages/SellerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ChatPage from './pages/ChatPage';
import BookingConfirm from './pages/Bookingconfirm';
import SellerBookings from './pages/SellerBookings';
import BookingDetailPage from './pages/BookingDetailPage';
import CustomerBookingsPage from './pages/CustomerBookingsPage'; // ← THIS WAS MISSING

const ProtectedRoute = ({ 
  children, 
  allowedRoles 
}: { 
  children: JSX.Element; 
  allowedRoles?: string[] 
}) => {
  const { user } = useApp();

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && (!user.role || !allowedRoles.includes(user.role))) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-pink-900">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            {/* Public */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/service/:id" element={<ServiceDetailPage />} />
            <Route path="/cc" element={<ChatPage />} />

            {/* Customer */}
            <Route path="/my-bookings" element={<ProtectedRoute><CustomerBookingsPage /></ProtectedRoute>} />
            <Route path="/booking/:id" element={<ProtectedRoute><BookingDetailPage /></ProtectedRoute>} />
            <Route path="/booking/confirm" element={<ProtectedRoute><BookingConfirm /></ProtectedRoute>} />

            {/* Chat */}
            <Route path="/chat" element={<ChatPage />} />
            
            <Route path="/chat/:id" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />

            {/* Freelancer/Seller */}
            <Route
              path="/seller/dashboard"
              element={
                <ProtectedRoute allowedRoles={['freelancer', 'seller']}>
                  <SellerDashboard />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/seller-bookings" 
              element={<ProtectedRoute allowedRoles={['freelancer', 'seller']}><SellerBookings /></ProtectedRoute>} 
            />
            <Route path="/freelancer-dashboard" element={<Navigate to="/seller/dashboard" replace />} />

            {/* Admin */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <LoginModal />
        <RegisterModal />
        <Toast />
      </div>
    </Router>
  );
}

export default App;