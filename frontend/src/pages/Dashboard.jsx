import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LineChart, Users, FileSpreadsheet, CheckCircle } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();

  const stats = [
    {
      title: 'Total Students',
      value: '120',
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      title: 'Projects',
      value: '30',
      icon: FileSpreadsheet,
      color: 'bg-green-500'
    },
    {
      title: 'Progress',
      value: '75%',
      icon: LineChart,
      color: 'bg-purple-500'
    },
    {
      title: 'Completed',
      value: '18',
      icon: CheckCircle,
      color: 'bg-yellow-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Welcome back, {user?.name}
        </h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-xl shadow-md"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold">{stat.value}</span>
              </div>
              <h3 className="text-gray-600 font-medium">{stat.title}</h3>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((_, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                    <Users className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-medium">Project Update</p>
                    <p className="text-sm text-gray-600">Batch A submitted their progress report</p>
                  </div>
                </div>
                <span className="text-sm text-gray-500">2 hours ago</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 bg-indigo-50 rounded-lg text-left hover:bg-indigo-100 transition-colors">
              <FileSpreadsheet className="h-6 w-6 text-indigo-600 mb-2" />
              <h3 className="font-medium">Upload Report</h3>
              <p className="text-sm text-gray-600">Submit your latest progress</p>
            </button>
            <button className="p-4 bg-indigo-50 rounded-lg text-left hover:bg-indigo-100 transition-colors">
              <Users className="h-6 w-6 text-indigo-600 mb-2" />
              <h3 className="font-medium">Team Chat</h3>
              <p className="text-sm text-gray-600">Communicate with your team</p>
            </button>
            <button className="p-4 bg-indigo-50 rounded-lg text-left hover:bg-indigo-100 transition-colors">
              <LineChart className="h-6 w-6 text-indigo-600 mb-2" />
              <h3 className="font-medium">View Analytics</h3>
              <p className="text-sm text-gray-600">Check your progress stats</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
