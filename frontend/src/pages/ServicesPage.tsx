import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Star, Search as SearchIcon, MessageCircle, MapPin, Clock, DollarSign, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface Service {
  id: number;
  title: string;
  category: string;
  description: string;
  price: number;
  rating: number;
  reviews: number;
  location: string;
  freelancer: {
    name: string;
    avatar: string;
    skills: string[];
  };
}

export default function ServicesPage() {
  const { notify, user, setShowLogin } = useApp();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    axios.get('/api/services/')  // Fetch from backend
      .then(res => {
        setServices(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch services:', err);
        setError('Failed to load services. Please try again.');
        notify('Failed to load services', 'error');
        setLoading(false);
      });
  }, []);

  const categories = ['all', 'Technology', 'Design', 'Marketing', 'Writing', 'Video', 'Music', 'Business'];

  const filteredServices = services.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-600'}`} />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500 mx-auto mb-4"></div>
          <div className="text-xl text-slate-300">Loading services...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 bg-slate-900">
      <h1 className="text-4xl font-bold text-white mb-8">All Services</h1>
      
      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative max-w-md">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search services or freelancers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-violet-500"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full whitespace-nowrap ${selectedCategory === category ? 'bg-violet-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-500/20 border border-rose-500 text-rose-300 rounded-lg">
          {error} <button onClick={() => window.location.reload()} className="underline ml-2">Retry</button>
        </div>
      )}

      {filteredServices.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-slate-400 mb-4">
            {searchTerm ? 'No services match your search.' : 'No services available yet.'}
          </p>
          <button 
            onClick={() => notify('Services coming soon!', 'success')}
            className="bg-violet-600 text-white px-6 py-3 rounded-lg hover:bg-violet-700"
          >
            Refresh
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map(service => (
            <div key={service.id} className="bg-slate-800 rounded-xl p-6 hover:shadow-xl transition-shadow cursor-pointer" onClick={() => window.location.href = `/service/${service.id}`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-violet-600 rounded-full flex items-center justify-center text-white font-bold">
                    {service.freelancer.avatar}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{service.freelancer.name}</h3>
                    <p className="text-sm text-slate-400">{service.category}</p>
                  </div>
                </div>
                <span className="text-xs bg-emerald-600 text-white px-2 py-1 rounded-full">Available</span>
              </div>
              <h4 className="text-lg font-medium text-white mb-2">{service.title}</h4>
              <p className="text-slate-400 text-sm mb-4 line-clamp-2">{service.description}</p>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1">
                  {renderStars(service.rating)}
                  <span className="text-sm text-slate-300 ml-1">({service.reviews})</span>
                </div>
                <div className="flex items-center text-slate-500 text-sm">
                  <MapPin className="w-4 h-4 mr-1" />
                  {service.location}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center text-white">
                  <DollarSign className="w-4 h-4 mr-1" />
                  <span className="text-lg font-bold">Rs. {service.price}</span>
                  <span className="text-sm text-slate-400 ml-1">/project</span>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); if (user) notify('Chat initiated!', 'success'); else setShowLogin(true); }}
                  className="bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 flex items-center gap-1"
                >
                  <MessageCircle className="w-4 h-4" />
                  Contact
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}