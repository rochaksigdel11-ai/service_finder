// frontend/src/context/AppContext.tsx — COMPLETE FIXED VERSION
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface User {
  id: number;
  username: string;
  email: string;
  role: 'customer' | 'seller' | 'admin';
  fullName?: string;
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
  refreshToken: () => Promise<boolean>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [toast, setToast] = useState<ToastState>({ message: '', type: 'success', visible: false });
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [loading, setLoading] = useState(true);

  // Axios configuration
  axios.defaults.baseURL = 'http://127.0.0.1:8000';

  // Token refresh function
  const refreshToken = async (): Promise<boolean> => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) return false;

      const response = await axios.post('/api/auth/jwt/refresh/', {
        refresh: refreshToken
      });

      const newAccessToken = response.data.access;
      localStorage.setItem('access_token', newAccessToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
      
      console.log('Token refreshed successfully');
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      return false;
    }
  };

  // Fetch user profile with token refresh
  const fetchUserProfile = async () => {
    try {
      let token = localStorage.getItem('access_token');
      
      if (!token) {
        setLoading(false);
        return;
      }

      // Set authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      try {
        const res = await axios.get('/api/auth/profile/');
        console.log('User profile fetched successfully:', res.data);
        setUser(res.data);
      } catch (error: any) {
        if (error.response?.status === 401) {
          // Token expired, try to refresh
          const refreshed = await refreshToken();
          if (refreshed) {
            // Retry with new token
            const retryRes = await axios.get('/api/auth/profile/');
            setUser(retryRes.data);
          } else {
            throw new Error('Token refresh failed');
          }
        } else {
          throw error;
        }
      }
    } catch (err: any) {
      console.error('Failed to fetch user profile:', err);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user on app startup
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
      const res = await axios.post('/api/auth/jwt/create/', { 
        username, 
        password 
      });
      
      const { access, refresh } = res.data;
      
      // Store both tokens
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      
      console.log('Login successful, tokens stored');
      
      // Fetch user profile after login
      await fetchUserProfile();
      notify('Login successful!', 'success');
    } catch (err: any) {
      console.error('Login failed:', err);
      const errorMsg = err.response?.data?.detail || 'Wrong username or password';
      notify(errorMsg, 'error');
      throw err;
    }
  };

  const logout = () => {
    console.log('Logging out...');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    delete axios.defaults.headers.common['Authorization'];
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
      loading,
      refreshToken
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