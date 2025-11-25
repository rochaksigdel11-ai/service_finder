import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useApp } from '../context/AppContext';

interface Booking {
  id: number;
  customer: string;
  customer_avatar: string;
  service: string;
  package: string;
  price: number;
  date: string;
  time: string;
  status: string;
  message: string;
}

export default function SellerBookings() {
  const { user, notify } = useApp();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/seller/bookings/');
      setBookings(response.data);
    } catch (error: any) {
      console.error('Failed to fetch bookings:', error);
      notify('Failed to load bookings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: number, status: string) => {
    try {
      await axios.post(`http://127.0.0.1:8000/api/bookings/${bookingId}/update_status/`, { status });
      notify(`Booking ${status}`, 'success');
      fetchBookings(); // Refresh the list
    } catch (error) {
      notify('Failed to update booking', 'error');
    }
  };

  if (loading) {
    return <div className="container mx-auto p-6">Loading bookings...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">My Bookings</h1>
      
      {bookings.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg">No bookings yet</p>
          <p className="text-gray-400">When customers book your services, they'll appear here.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="bg-white rounded-lg shadow p-6 border">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{booking.service}</h3>
                  <div className="flex items-center mt-2">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                      {booking.customer_avatar}
                    </div>
                    <span className="ml-2 font-medium">{booking.customer}</span>
                  </div>
                  <p className="text-gray-600 mt-2">{booking.message}</p>
                  <div className="flex gap-4 mt-3 text-sm text-gray-500">
                    <span>Package: {booking.package}</span>
                    <span>Date: {booking.date} at {booking.time}</span>
                    <span>Amount: Rs. {booking.price}</span>
                  </div>
                </div>
                
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {booking.status}
                  </span>
                  
                  <div className="mt-3 space-x-2">
                    {booking.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => updateBookingStatus(booking.id, 'rejected')}
                          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {booking.status === 'confirmed' && (
                      <button
                        onClick={() => updateBookingStatus(booking.id, 'completed')}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                      >
                        Mark Complete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}