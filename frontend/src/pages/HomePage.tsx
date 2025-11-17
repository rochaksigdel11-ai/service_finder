// frontend/src/pages/HomePage.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { MapPin, Star } from 'lucide-react';
import { useApp } from '../context/AppContext';
import LoginModal from '../components/LoginModal';

// MOCK DATA (FALLBACK)
const MOCK_SERVICES = [
  { id: 1, titleOverview: "Home Cleaning", provider: "sita", overall_rating: 4.9, distance_km: 2.1, category: "Cleaning" },
  { id: 2, titleOverview: "Website Design", provider: "raju", overall_rating: 5.0, distance_km: 3.5, category: "Web" },
  { id: 3, titleOverview: "Plumbing Fix", provider: "hari", overall_rating: 4.7, distance_km: 1.8, category: "Plumbing" },
];

export default function HomePage() {
  const [services, setServices] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const { user, setShowLogin } = useApp();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const res = await axios.get('http://127.0.0.1:8000/api/nearby/?lat=27.7&lng=85.3&radius=10');
        setServices(res.data);
      } catch (err) {
        console.warn('API failed → using mock data');
        setServices(MOCK_SERVICES);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const filtered = services.filter(s =>
    s.titleOverview.toLowerCase().includes(search.toLowerCase()) ||
    (s.category && s.category.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <>
      {/* NOT LOGGED IN */}
      {!user ? (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 flex items-center justify-center p-6">
          <div className="text-center max-w-2xl">
            <h1 className="text-6xl font-bold text-white mb-4">ServiceFinder</h1>
            <p className="text-xl text-white mb-8">Find trusted freelancers in Nepal</p>
            <button
              onClick={() => setShowLogin(true)}
              className="px-8 py-4 bg-yellow-500 text-black text-lg font-bold rounded-full hover:bg-yellow-600 transition"
            >
              Login to Continue
            </button>
          </div>
        </div>
      ) : (
        /* LOGGED IN — FULL HOME */
        <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 text-white">
          {/* HEADER */}
          <header className="bg-gray-900 text-white py-4 px-6 shadow-lg">
            <div className="container mx-auto flex justify-between items-center">
              <h1 className="text-2xl font-bold">ServiceFinder</h1>
              <nav className="flex gap-6 items-center">
                <Link to="/" className="hover:text-yellow-400">Home</Link>
                <Link to="/services" className="hover:text-yellow-400">Services</Link>
                <span className="text-yellow-400 font-bold">Hi, {user.username}!</span>
              </nav>
            </div>
          </header>

          {/* HERO */}
          <div className="container mx-auto px-6 py-12 text-center">
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6">
              Find <span className="text-yellow-400">Trusted Freelancers</span> in Nepal
            </h1>
            <p className="text-xl mb-8">Book cleaning, web, plumbing — all in one place</p>
            <div className="max-w-xl mx-auto">
              <input
                type="text"
                placeholder="Search services..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full p-4 rounded-full text-black text-lg"
              />
            </div>
          </div>

          {/* SERVICES */}
          <div className="container mx-auto px-6 pb-20">
            <h2 className="text-3xl font-bold mb-8 text-center">
              {loading ? 'Loading services...' : `Popular Services (${filtered.length})`}
            </h2>
            {loading ? (
              <p className="text-center text-xl">Loading...</p>
            ) : (
              <div className="grid md:grid-cols-3 gap-8">
                {filtered.map(s => (
                  <div key={s.id} className="bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden shadow-xl border border-white/20">
                    <div className="h-48 bg-gradient-to-br from-purple-600 to-indigo-600" />
                    <div className="p-6">
                      <h3 className="text-2xl font-bold mb-2">{s.titleOverview}</h3>
                      <p className="text-sm opacity-80 mb-4">by {s.provider}</p>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center gap-1">
                          <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                          <span>{s.overall_rating}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-5 h-5" />
                          <span>{s.distance_km} km</span>
                        </div>
                      </div>
                      <Link
                        to={`/service/${s.id}`}
                        className="block text-center bg-yellow-500 text-black py-3 rounded-full font-bold hover:bg-yellow-600"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      <LoginModal />
    </>
  );
}