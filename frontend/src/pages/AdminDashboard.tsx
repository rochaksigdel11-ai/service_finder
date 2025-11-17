import { Users, Package, DollarSign, AlertCircle } from 'lucide-react';

export default function AdminDashboard() {
  return (
    <div className="p-6 bg-red-50 min-h-screen">
      <h1 className="text-3xl font-bold text-red-800 mb-8">Admin Panel</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow border-l-4 border-red-500">
          <Users className="w-10 h-10 text-red-600 mb-3" />
          <p className="text-2xl font-bold">1,234</p>
          <p className="text-gray-600">Total Users</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow border-l-4 border-blue-500">
          <Package className="w-10 h-10 text-blue-600 mb-3" />
          <p className="text-2xl font-bold">456</p>
          <p className="text-gray-600">Active Services</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow border-l-4 border-green-500">
          <DollarSign className="w-10 h-10 text-green-600 mb-3" />
          <p className="text-2xl font-bold">Rs. 2.1M</p>
          <p className="text-gray-600">Platform Revenue</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow border-l-4 border-yellow-500">
          <AlertCircle className="w-10 h-10 text-yellow-600 mb-3" />
          <p className="text-2xl font-bold">8</p>
          <p className="text-gray-600">Pending Reports</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Platform Overview</h2>
        {/* Charts + Tables */}
      </div>
    </div>
  );
}