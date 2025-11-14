import React from 'react'
import { CheckCircle, X } from 'lucide-react'  // CheckCircle
import { useApp } from '../context/AppContext'

export default function Toast() {
  const { toast } = useApp()
  if (!toast.visible) return null

  const bg = toast.type === 'success' 
    ? 'bg-emerald-500' 
    : toast.type === 'error' 
    ? 'bg-rose-500' 
    : 'bg-indigo-500'

  return (
    <div className={`fixed top-4 right-4 z-50 ${bg} text-white px-6 py-4 rounded-lg shadow-xl flex items-center gap-3`}>
      {toast.type === 'success' && <CheckCircle className="w-5 h-5" />}
      {toast.type === 'error' && <X className="w-5 h-5" />}
      <span>{toast.message}</span>
    </div>
  )
}