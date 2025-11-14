import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Toast from './components/Toast';
import HomePage from './pages/HomePage';
import ServicesPage from './pages/ServicesPage';
import ServiceDetailPage from './pages/ServiceDetailPage';  // New
import ChatPage from './pages/ChatPage';  // New
import ReviewsPage from './pages/ReviewPage';  // New
import LoginModal from './components/LoginModal';
import RegisterModal from './components/RegisterModal';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-900 text-slate-300">
        <Navbar />
        <main className="pt-16" role="main">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/service/:id" element={<ServiceDetailPage />} />  {/* New */}
            <Route path="/chat" element={<ChatPage />} />  {/* New */}
            <Route path="/reviews/:serviceId" element={<ReviewsPage />} />  {/* New */}
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