import React from 'react';
import { X } from 'lucide-react';

export const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export const Input: React.FC<{
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon?: React.ReactNode;
}> = ({ type = 'text', placeholder, value, onChange, icon }) => (
  <div className="relative">
    {icon && <div className="absolute left-3 top-3 text-slate-400">{icon}</div>}
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-violet-500 ${icon ? 'pl-10' : ''}`}
    />
  </div>
);

export const Button: React.FC<{
  type?: 'button' | 'submit';
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}> = ({ type = 'button', className = '', children, onClick }) => (
  <button
    type={type}
    onClick={onClick}
    className={`${className} bg-violet-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors w-full`}
  >
    {children}
  </button>
);