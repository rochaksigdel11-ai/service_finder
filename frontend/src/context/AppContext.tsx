// frontend/src/context/AppContext.tsx — FIXED VERSION
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface User {
  id: number;
  username: string;
  email: string;
  role: 'customer' | 'freelancer' | 'seller' | 'admin';
}

interface ToastState {
  message: string;
  type: 'success' | 'error';
  visible: boolean;
}

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  toast: ToastState;
  notify: (msg: string, type: 'success' | 'error') => void;
  showLogin: boolean;
  setShowLogin: (v: boolean) => void;
  showRegister: boolean;
  setShowRegister: (v: boolean) => void;
  loading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [toast, setToast] = useState<ToastState>({ message: '', type: 'success', visible: false });
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [loading, setLoading] = useState(true);

  // Axios configuration - SAME AS BOOKINGS PAGE
  axios.defaults.baseURL = 'http://127.0.0.1:8000';

  // FETCH USER PROFILE - USING SAME LOGIC AS BOOKINGS PAGE
  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('access_token');
      console.log('Fetching user profile, token exists:', !!token);
      
      if (!token) {
        setLoading(false);
        return;
      }

      // Set authorization header explicitly
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };

      const res = await axios.get('/api/profile/', config);
      console.log('User profile fetched successfully:', res.data);
      setUser(res.data);
    } catch (err: any) {
      console.error('Failed to fetch user profile:', err);
      console.log('Error status:', err.response?.status);
      console.log('Error data:', err.response?.data);
      
      // Clear invalid token
      localStorage.removeItem('access_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user on app startup - SAME AS BOOKINGS PAGE LOGIC
  useEffect(() => {
    console.log('AppProvider initialized - checking authentication...');
    fetchUserProfile();
  }, []);

  const notify = (message: string, type: 'success' | 'error') => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
  };

  const login = async (username: string, password: string) => {
    try {
      console.log('Attempting login...');
      const res = await axios.post('/api/token/', { username, password });
      const token = res.data.access;
      
      // Store token - SAME AS BOOKINGS PAGE
      localStorage.setItem('access_token', token);
      console.log('Login successful, token stored');
      
      // Fetch user profile after login
      await fetchUserProfile();
      notify('Login successful!', 'success');
    } catch (err: any) {
      console.error('Login failed:', err);
      notify('Wrong username or password', 'error');
      throw err;
    }
  };

  const logout = () => {
    console.log('Logging out...');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    notify('Logged out successfully', 'success');
  };

  return (
    <AppContext.Provider value={{
      user,
      setUser,
      login,
      logout,
      toast,
      notify,
      showLogin,
      setShowLogin,
      showRegister,
      setShowRegister,
      loading
    }}>
      {children}
      {/* TOAST UI */}
      {toast.visible && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg text-white shadow-lg z-50 ${
          toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        }`}>
          {toast.message}
        </div>
      )}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};