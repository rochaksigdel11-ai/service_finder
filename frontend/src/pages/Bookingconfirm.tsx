import { useLocation } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';

interface BookingData {
  service: string;
  package: string;
  price: number;
  date: string;
  seller: string;
}

export default function BookingConfirm() {
  const { state } = useLocation();
  const booking = state?.booking as BookingData | undefined;

  if (!booking) return <div className="text-white">Invalid booking</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 p-6">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl p-8 mt-20">
        <div className="text-center mb-8">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-800">Booking Confirmed!</h1>
        </div>

        <div className="space-y-4 text-gray-700">
          <div className="flex justify-between p-3 bg-gray-50 rounded">
            <span className="font-medium">Service:</span>
            <span>{booking.service}</span>
          </div>
          <div className="flex justify-between p-3 bg-gray-50 rounded">
            <span className="font-medium">Package:</span>
            <span className="text-purple-600 font-bold">{booking.package}</span>
          </div>
          <div className="flex justify-between p-3 bg-gray-50 rounded">
            <span className="font-medium">Price:</span>
            <span className="text-2xl font-bold text-green-600">Rs. {booking.price}</span>
          </div>
          <div className="flex justify-between p-3 bg-gray-50 rounded">
            <span className="font-medium">Date:</span>
            <span>{new Date(booking.date).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between p-3 bg-gray-50 rounded">
            <span className="font-medium">Seller:</span>
            <span className="font-medium">{booking.seller}</span>
          </div>
        </div>

        <div className="mt-8 text-center">
          <button 
            onClick={() => window.location.href = '/buyer/orders'}
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-full font-semibold flex items-center mx-auto gap-2 transition"
          >
            View My Orders <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}