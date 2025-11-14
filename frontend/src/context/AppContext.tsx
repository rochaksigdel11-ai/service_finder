import React, { createContext, useContext, useState } from 'react';

interface User {
  name: string;
  username: string;
}

interface ToastState {  // Extracted for clarity
  message: string;
  type: 'success' | 'error';  // Removed 'as const' from initial to match union
  visible: boolean;
}

interface AppContextType {
  user: User | null;
  login: (user: User) => void;
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
  const [toast, setToast] = useState<ToastState>({ message: '', type: 'success', visible: false });  // Fixed: No 'as const'
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const notify = (message: string, type: 'success' | 'error') => {
    setToast({ message, type, visible: true });  // Line 29: Now TS-safe
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));  // Fixed: Functional update (latest state, no stale 'type')
    }, 3000);
  };

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    notify('Logged out', 'success');
  };

  return (
    <AppContext.Provider value={{ user, login, logout, toast, notify, showLogin, setShowLogin, showRegister, setShowRegister }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};