import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { User, ShoppingCart, MessageCircle, Star, Clock, DollarSign } from 'lucide-react';
import { useApp } from '../context/AppContext';

type Order = {
  id: number;
  service: string;
  provider: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  date: Date;
  amount: number;
};

export default function DashboardPage() {
  const { user, notify } = useApp();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      axios.get('/api/orders/', {  // Fetch user's orders
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
        .then(res => setOrders(res.data))
        .catch(() => notify('Failed to load orders', 'error'));
      setLoading(false);
    }
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-500';
      case 'confirmed': return 'bg-blue-500';
      case 'pending': return 'bg-amber-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-300">Please log in to view dashboard.</div>;
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-300">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <div className="flex items-center space-x-4">
            <Link to="/chat" className="flex items-center gap-2 text-slate-300 hover:text-white">
              <MessageCircle className="w-5 h-5" />
              Messages
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-2 bg-slate-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Your Orders</h2>
            {orders.length === 0 ? (
              <p className="text-slate-400">You have no orders yet.</p>
            ) : (
              <div className="space-y-4">
                {orders.map(order => (
                  <div key={order.id} className="bg-slate-700 rounded-lg p-4 flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold text-white">{order.service}</h4>
                      <p className="text-slate-400 text-sm">Provider: {order.provider}</p>
                      <p className="text-slate-400 text-sm">Date: {order.date.toLocaleDateString()}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold text-white ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                      <span className="mt-2 font-semibold text-white">Rs. {order.amount}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-slate-800 rounded-lg p-6">
            <h3 className="font-semibold text-white mb-4">Quick Actions</h3>
            <Link to="/services" className="block w-full bg-violet-600 text-white py-3 rounded-lg text-center hover:bg-violet-700 mb-3">
              Find Services
            </Link>
            <Link to="/payment" className="block w-full bg-emerald-600 text-white py-3 rounded-lg text-center hover:bg-emerald-700">
              Make Payment
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}