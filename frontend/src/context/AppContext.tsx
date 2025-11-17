// frontend/src/context/AppContext.tsx
import React, { createContext, useContext, useState } from 'react';
import axios from 'axios'; // ← ADDED

interface User {
  role?: string;
  username: string;
}

interface ToastState {
  message: string;
  type: 'success' | 'error';
  visible: boolean;
}

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  login: (username: string, password: string) => Promise<void>; // ← ASYNC
  logout: () => void;
  toast: ToastState;
  notify: (msg: string, type: 'success' | 'error') => void;
  showLogin: boolean;
  setShowLogin: (v: boolean) => void;
  showRegister: boolean;
  setShowRegister: (v: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [toast, setToast] = useState<ToastState>({ message: '', type: 'success', visible: false });
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  // JWT AUTO-HEADER
  axios.defaults.baseURL = 'http://127.0.0.1:8000';
  axios.interceptors.request.use(config => {
    const token = localStorage.getItem('access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  const notify = (message: string, type: 'success' | 'error') => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
  };

  const login = async (username: string, password: string) => {
  try {
    const res = await axios.post('http://127.0.0.1:8000/api/token/', {
      username,
      password
    });
    localStorage.setItem('access_token', res.data.access);
    axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.access}`;
    setUser({ username });
    notify('Login successful!', 'success');
  } catch (err: any) {
    notify('Wrong username or password', 'error');
  }
};

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    notify('Logged out successfully', 'success');
  };

  return (
    <AppContext.Provider value={{
      user,
      setUser,
      login,           // ← ADDED
      logout,
      toast,
      notify,
      showLogin,
      setShowLogin,
      showRegister,
      setShowRegister
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