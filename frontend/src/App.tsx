import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Toast from './components/Toast';
import { UserContext } from './context/UserContext.tsx';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import ChatPage from './pages/ChatPage';
import PaymentPage from './pages/PaymentPage';
import LoginModal from './components/LoginModal';
import RegisterModal from './components/RegisterModal';
import ServiceDetailPage from './pages/ServiceDetailPage';
import { AppProvider } from './context/AppContext';
import BuyerDashboard from './pages/BuyerDashboard';
import SellerDashboard from './pages/SellerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import BookingConfirm from './pages/Bookingconfirm';
import { UserProvider } from './context/UserContext.tsx';

function AppContent() {
  const { user } = useContext(UserContext)!;

  const ProtectedRoute = ({ children, allowedRoles }: { children: JSX.Element; allowedRoles: string[] }) => {
    if (!user) return <Navigate to="/login" replace />;
    if (!allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
    return children;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<LoginPage />} /> 
          <Route path="/" element={<HomePage />} />

          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/service/:id" element={<ServiceDetailPage />} />
          <Route path="*" element={<HomePage />} />
          <Route path="/booking/confirm" element={<BookingConfirm />} />
          
     
          <Route path="/buyer/dashboard" element={<BuyerDashboard />} />
          <Route path="/seller/dashboard" element={<SellerDashboard />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        
        </Routes>
      </main>
      <LoginModal />
      <RegisterModal />
      <Toast />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppProvider>
        <UserProvider>
          <AppContent />
        </UserProvider>
      </AppProvider>
    </Router>
  );
}

export default App;







