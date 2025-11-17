import { Package, Clock, CheckCircle, MessageCircle } from 'lucide-react';

interface StatCard {
  label: string;
  value: number;
  icon: any;
  color: string;
}

export default function BuyerDashboard() {
  const stats: StatCard[] = [
    { label: 'Active Orders', value: 3, icon: Package, color: 'blue' },
    { label: 'Pending', value: 1, icon: Clock, color: 'yellow' },
    { label: 'Completed', value: 12, icon: CheckCircle, color: 'green' },
    { label: 'Messages', value: 5, icon: MessageCircle, color: 'purple' },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">My Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow-lg">
            <div className={`w-12 h-12 bg-${stat.color}-100 rounded-full flex items-center justify-center mb-3`}>
              <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-gray-600">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
        {/* List orders */}
      </div>
    </div>
  );
}