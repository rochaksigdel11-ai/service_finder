import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { MapPin, Star } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function CustomerDashboard() {
  const [services, setServices] = useState<any[]>([]);
  const { notify } = useApp();

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/services/api/nearby/?lat=27.7&lng=85.3&radius=10')
      .then(res => setServices(res.data))
      .catch(() => notify('Failed to load services', 'error'));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 text-white py-20">
      <div className="container mx-auto px-6">
        <h1 className="text-4xl font-bold mb-8">Available Services</h1>
        <div className="grid md:grid-cols-3 gap-6">
          {services.map(s => (
            <Link to={`/service/${s.id}`} key={s.id} className="block">
              <div className="bg-white/10 backdrop-blur rounded-xl p-6 hover:scale-105 transition">
                <h3 className="text-xl font-bold">{s.titleOverview}</h3>
                <p className="text-sm opacity-80">by {s.provider}</p>
                <div className="flex gap-4 mt-3 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{s.overall_rating}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{s.distance_km} km</span>
                  </div>
                </div>
                <button className="mt-4 w-full bg-yellow-500 text-black py-2 rounded-full font-bold">
                  View & Book
                </button>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}