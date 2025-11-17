import { useEffect, useState } from 'react';
import axios from 'axios';

export default function SellerDashboard() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    axios.get('/api/seller/bookings/').then(res => {
      setBookings(res.data);
    });
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">My Bookings</h1>
      {bookings.map(b => (
        <div key={b.id} className="bg-white/10 p-4 rounded mb-4">
          <p><strong>{b.buyer}</strong> booked <strong>{b.service}</strong></p>
          <p>Package: {b.package} | Date: {b.date} | Status: <span className="text-yellow-400">{b.status}</span></p>
        </div>
      ))}
    </div>
  );
}