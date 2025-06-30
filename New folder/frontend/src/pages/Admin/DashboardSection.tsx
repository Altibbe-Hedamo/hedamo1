import React, { useState, useEffect } from 'react';
import { Activity, UserCheck, PackageCheck, FileCheck, DollarSign } from 'lucide-react';
import axios, { AxiosError } from 'axios';
import api from '../../config/axios';

interface Stat {
  name: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative';
}

interface ActivityItem {
  id: number;
  action: string;
  time: string;
  user: string;
}

const DashboardSection: React.FC = () => {
  const [stats, setStats] = useState<Stat[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get('/api/dashboard');
        setStats(response.data.stats);
        setActivities(response.data.activities.map((item: any, index: number) => ({
          id: index + 1,
          action: item.action,
          time: new Date(item.time).toLocaleString(),
          user: item.user,
        })));
        setLoading(false);
      } catch (error) {
        const axiosError = error as AxiosError;
        console.error('Failed to fetch dashboard data:', axiosError.message);
        if (axiosError.response?.status === 401) {
          alert('Please log in to access this section.');
        }
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const statIcons = {
    'Total Agents': UserCheck,
    'Active Products': PackageCheck,
    'Pending Reports': FileCheck,
    'Revenue': DollarSign,
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
      
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => {
              const Icon = statIcons[stat.name as keyof typeof statIcons];
              return (
                <div key={stat.name} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                      <p className="text-2xl font-bold mt-1">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-full ${
                      stat.changeType === 'positive' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>
                  <p className={`mt-2 text-sm ${
                    stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change} from last month
                  </p>
                </div>
              );
            })}
          </div>

          {/* Recent Activity */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Activity className="h-5 w-5 mr-2 text-blue-500" />
              Recent Activity
            </h3>
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-start pb-4 border-b border-gray-100 last:border-0">
                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                    <Activity className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{activity.action}</p>
                    <p className="text-sm text-gray-500">By {activity.user} • {activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center">
              View all activity
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardSection;