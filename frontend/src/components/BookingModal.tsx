// frontend/src/components/BookingModal.tsx
import React, { useState } from 'react';
import axios from 'axios';
import { useApp } from '../context/AppContext';
import { X } from 'lucide-react';

interface Package {
  id: number;
  package_type: string;
  price: number;
  title: string;
}

interface Service {
  id: number;
  titleOverview: string;
  packages: Package[];
}

interface BookingModalProps {
  service: Service;
  onClose: () => void;
}

export default function BookingModal({ service, onClose }: BookingModalProps) {
  const { user, notify } = useApp();
  const [date, setDate] = useState('');
  const [selectedPkg, setSelectedPkg] = useState<Package>(service.packages[0] || { id: 0, price: 0, package_type: '', title: '' });

  const handleBook = () => {
    if (!user) {
      notify('Please login first', 'error');
      return;
    }

    axios.post('http://127.0.0.1:8000/api/book/', {
      overview: service.id,
      package: selectedPkg.id,
      preferred_date: date
    }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
    })
    .then(() => {
      notify('Booking confirmed!', 'success');
      onClose();
    })
    .catch(() => notify('Booking failed', 'error'));
  };

  if (!service || !service.packages.length) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold mb-4">Book {service.titleOverview}</h2>

        {/* Date */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Preferred Date</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full p-3 border rounded-lg"
            required
          />
        </div>

        {/* Package */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">Select Package</label>
          <select
            className="w-full p-3 border rounded-lg"
            onChange={e => setSelectedPkg(service.packages[parseInt(e.target.value)])}
          >
            {service.packages.map((pkg, i) => (
              <option key={pkg.id} value={i}>
                {pkg.package_type} - Rs. {pkg.price} ({pkg.title})
              </option>
            ))}
          </select>
        </div>

        {/* Confirm Button */}
        <button
          onClick={handleBook}
          disabled={!date || !selectedPkg.id}
          className="w-full bg-violet-600 text-white py-3 rounded-lg font-semibold hover:bg-violet-700 disabled:opacity-50"
        >
          Confirm Booking - Rs. {selectedPkg.price}
        </button>
      </div>
    </div>
  );
}