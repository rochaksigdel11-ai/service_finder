import { DollarSign, Users, Star, TrendingUp } from 'lucide-react';

interface Earning {
  month: string;
  amount: number;
}

export default function SellerDashboard() {
  const earnings: Earning[] = [
    { month: 'Jan', amount: 45000 },
    { month: 'Feb', amount: 52000 },
    { month: 'Mar', amount: 68000 },
    { month: 'Apr', amount: 71000 },
  ];

  return (
    <div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Seller Dashboard</h1>
        <button className="bg-purple-600 text-white px-6 py-2 rounded-full hover:bg-purple-700">
          + Add Service
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow">
          <DollarSign className="w-10 h-10 text-green-500 mb-3" />
          <p className="text-3xl font-bold">Rs. 71,000</p>
          <p className="text-gray-600">This Month</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow">
          <Users className="w-10 h-10 text-blue-500 mb-3" />
          <p className="text-3xl font-bold">24</p>
          <p className="text-gray-600">Total Clients</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow">
          <Star className="w-10 h-10 text-yellow-500 mb-3" />
          <p className="text-3xl font-bold">4.9</p>
          <p className="text-gray-600">Rating</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-lg font-semibold mb-4">New Bookings</h3>
          {/* List bookings */}
        </div>
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-lg font-semibold mb-4">Earnings Trend</h3>
          <TrendingUp className="w-32 h-32 text-green-500 mx-auto" />
        </div>
      </div>
    </div>
  );
}