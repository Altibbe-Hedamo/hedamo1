import React, { useState, useEffect } from 'react';

interface RenewalReminder {
  id: number;
  customerName: string;
  productName: string;
  currentPlan: string;
  renewalDate: string;
  amount: number;
  status: 'upcoming' | 'overdue' | 'renewed' | 'cancelled';
  email: string;
  phone: string;
}

const CompanyRenewalRemindersPage: React.FC = () => {
  const [reminders, setReminders] = useState<RenewalReminder[]>([]);
  const [filter, setFilter] = useState('all');
  const [upcomingRenewals, setUpcomingRenewals] = useState(0);
  const [overdueRenewals, setOverdueRenewals] = useState(0);

  useEffect(() => {
    // Dummy renewal reminder data
    const dummyReminders: RenewalReminder[] = [
      {
        id: 1,
        customerName: 'John Smith',
        productName: 'Premium Business Package',
        currentPlan: 'Annual',
        renewalDate: '2024-02-15',
        amount: 1200,
        status: 'upcoming',
        email: 'john.smith@company.com',
        phone: '+1-555-0123'
      },
      {
        id: 2,
        customerName: 'Sarah Johnson',
        productName: 'Standard Business Package',
        currentPlan: 'Monthly',
        renewalDate: '2024-01-25',
        amount: 150,
        status: 'overdue',
        email: 'sarah.j@business.com',
        phone: '+1-555-0456'
      },
      {
        id: 3,
        customerName: 'Mike Wilson',
        productName: 'Enterprise Solution',
        currentPlan: 'Annual',
        renewalDate: '2024-03-01',
        amount: 5000,
        status: 'upcoming',
        email: 'mike.wilson@enterprise.com',
        phone: '+1-555-0789'
      },
      {
        id: 4,
        customerName: 'Lisa Brown',
        productName: 'Basic Business Package',
        currentPlan: 'Monthly',
        renewalDate: '2024-01-20',
        amount: 100,
        status: 'renewed',
        email: 'lisa.brown@startup.com',
        phone: '+1-555-0321'
      },
      {
        id: 5,
        customerName: 'David Lee',
        productName: 'Premium Business Package',
        currentPlan: 'Annual',
        renewalDate: '2024-01-10',
        amount: 1200,
        status: 'cancelled',
        email: 'david.lee@company.com',
        phone: '+1-555-0654'
      },
      {
        id: 6,
        customerName: 'Emily Davis',
        productName: 'Standard Business Package',
        currentPlan: 'Monthly',
        renewalDate: '2024-02-05',
        amount: 150,
        status: 'upcoming',
        email: 'emily.davis@business.com',
        phone: '+1-555-0987'
      }
    ];

    setReminders(dummyReminders);
    setUpcomingRenewals(dummyReminders.filter(r => r.status === 'upcoming').length);
    setOverdueRenewals(dummyReminders.filter(r => r.status === 'overdue').length);
  }, []);

  const filteredReminders = filter === 'all' 
    ? reminders 
    : reminders.filter(reminder => reminder.status === filter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'renewed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDaysUntilRenewal = (date: string) => {
    const renewalDate = new Date(date);
    const today = new Date();
    const diffTime = renewalDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const sendReminder = (id: number) => {
    // Dummy function for sending reminder
    alert(`Reminder sent to customer ${id}`);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Renewal Reminders</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-2 text-gray-600">Total Renewals</h3>
          <p className="text-3xl font-bold text-blue-600">{reminders.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-2 text-gray-600">Upcoming</h3>
          <p className="text-3xl font-bold text-blue-600">{upcomingRenewals}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-2 text-gray-600">Overdue</h3>
          <p className="text-3xl font-bold text-red-600">{overdueRenewals}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-2 text-gray-600">Renewed</h3>
          <p className="text-3xl font-bold text-green-600">
            {reminders.filter(r => r.status === 'renewed').length}
          </p>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="mb-6">
        <div className="flex gap-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            All Renewals
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-4 py-2 rounded-lg ${filter === 'upcoming' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setFilter('overdue')}
            className={`px-4 py-2 rounded-lg ${filter === 'overdue' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Overdue
          </button>
          <button
            onClick={() => setFilter('renewed')}
            className={`px-4 py-2 rounded-lg ${filter === 'renewed' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Renewed
          </button>
        </div>
      </div>

      {/* Renewals Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Renewal Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReminders.map((reminder) => (
                <tr key={reminder.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{reminder.customerName}</div>
                      <div className="text-sm text-gray-500">{reminder.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {reminder.productName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {reminder.currentPlan}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm text-gray-900">{new Date(reminder.renewalDate).toLocaleDateString()}</div>
                      <div className="text-sm text-gray-500">
                        {reminder.status === 'upcoming' && getDaysUntilRenewal(reminder.renewalDate) > 0 && 
                          `${getDaysUntilRenewal(reminder.renewalDate)} days left`}
                        {reminder.status === 'overdue' && 
                          `${Math.abs(getDaysUntilRenewal(reminder.renewalDate))} days overdue`}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${reminder.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(reminder.status)}`}>
                      {reminder.status.charAt(0).toUpperCase() + reminder.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {reminder.status === 'upcoming' && (
                      <button
                        onClick={() => sendReminder(reminder.id)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Send Reminder
                      </button>
                    )}
                    <button className="text-green-600 hover:text-green-900">
                      Contact
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 flex gap-4">
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Send Bulk Reminders
        </button>
        <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
          Export Renewal Report
        </button>
        <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
          Renewal Analytics
        </button>
      </div>

      {/* Automated Reminder Settings */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Automated Reminder Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="font-semibold mb-2">First Reminder</h3>
            <p className="text-sm text-gray-600 mb-2">Send 30 days before renewal</p>
            <label className="flex items-center">
              <input type="checkbox" defaultChecked className="mr-2" />
              <span className="text-sm">Enable</span>
            </label>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="font-semibold mb-2">Second Reminder</h3>
            <p className="text-sm text-gray-600 mb-2">Send 7 days before renewal</p>
            <label className="flex items-center">
              <input type="checkbox" defaultChecked className="mr-2" />
              <span className="text-sm">Enable</span>
            </label>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="font-semibold mb-2">Final Reminder</h3>
            <p className="text-sm text-gray-600 mb-2">Send 1 day before renewal</p>
            <label className="flex items-center">
              <input type="checkbox" defaultChecked className="mr-2" />
              <span className="text-sm">Enable</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyRenewalRemindersPage; 