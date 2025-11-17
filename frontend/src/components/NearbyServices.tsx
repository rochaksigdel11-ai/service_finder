// frontend/src/components/NearbyServices.tsx
import React, { useState, useEffect } from 'react';
import { getNearbyServices } from '../api/services';

interface Package {
  package_type: string;
  title: string;
  price: number;
  delivery_time: number;
  revisions: string;
}

interface Service {
  id: number;
  titleOverview: string;
  provider: string;
  category: string;
  overall_rating: string;
  distance_km: number;
  packages: Package[];
}

export default function NearbyServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await getNearbyServices(latitude, longitude, 5);
          setServices(res.data);
        } catch (err) {
          setError('Failed to load services');
          console.error(err);
        } finally {
          setLoading(false);
        }
      },
      () => {
        setError('Location access denied');
        setLoading(false);
      }
    );
  }, []);

  if (loading) return <p className="text-center text-white">Finding services near you...</p>;
  if (error) return <p className="text-red-500 text-center">{error}</p>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold text-white mb-4">Services Near You</h2>
      {services.length === 0 ? (
        <p className="text-gray-400">No services found within 5km</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map(s => (
            <div key={s.id} className="bg-slate-800 border border-slate-700 rounded-lg p-4 shadow-sm hover:shadow-md transition">
              <h3 className="font-bold text-lg text-white">{s.titleOverview}</h3>
              <p className="text-sm text-gray-300">By: {s.provider}</p>
              <p className="text-sm text-gray-300">Distance: {s.distance_km.toFixed(2)} km</p>
              <p className="text-sm text-yellow-400">Rating: {s.overall_rating} stars</p>
              {s.packages.length > 0 && (
                <p className="font-semibold text-green-400 mt-2">
                  From: Rs. {s.packages[0].price}
                </p>
              )}
              <button className="mt-3 bg-violet-600 text-white px-4 py-2 rounded w-full hover:bg-violet-700 transition">
                View Details
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}