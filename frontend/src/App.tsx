// frontend/src/App.tsx — FINAL CLEAN VERSION
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import Toast from './components/Toast';
import LoginModal from './components/LoginModal';
import RegisterModal from './components/RegisterModal';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import NearbyServices from './components/NearbyServices';
import ServiceDetailPage from './pages/ServiceDetailPage';
import SellerDashboard from './pages/SellerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ChatPage from './pages/ChatPage';
import BookingConfirm from './pages/Bookingconfirm';
import ServicesPage from './pages/ServicesPage';
import SellerBookings from './pages/SellerBookings';
import FreelancerDashboard from './pages/SellerDashboard';



const ProtectedRoute = ({ 
  children, 
  allowedRoles 
}: { 
  children: JSX.Element; 
  allowedRoles?: string[] 
}) => {
  const { user } = useApp();

  // No user → login
  if (!user) return <Navigate to="/login" replace />;

  // If role is required but missing or not allowed → home
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
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />

            {/* CUSTOMER GOES HERE AFTER LOGIN */}
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/service/:id" element={<ServiceDetailPage />} />
                        <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />


            {/* FREELANCER DASHBOARD */}
            <Route
              path="/seller/dashboard"
              element={
                <ProtectedRoute allowedRoles={['seller', 'freelancer']}>
                  <SellerDashboard />
                </ProtectedRoute>
              }
            />

            {/* ADMIN DASHBOARD */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* OTHER PROTECTED PAGES */}
            <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
            <Route path="/chat/:id" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
            <Route path="/booking/confirm" element={<ProtectedRoute><BookingConfirm /></ProtectedRoute>} />

            {/* FALLBACK */}
            <Route path="*" element={<Navigate to="/" replace />} />
            <Route path="/seller-bookings" element={<SellerBookings />} />
            <Route path="/freelancer-dashboard" element={<FreelancerDashboard />} />
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