import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface Payment {
  id: number;
  date: string;
  amount: number;
  type: 'incoming' | 'outgoing';
  status: 'completed' | 'pending' | 'failed';
  description: string;
  reference: string;
  method: string;
}

interface LocationState {
  productId?: number;
  productName?: string;
  companyName?: string;
}

const CompanyPaymentsPage: React.FC = () => {
  const location = useLocation();
  const state = location.state as LocationState;
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filter, setFilter] = useState('all');
  const [totalIncoming, setTotalIncoming] = useState(0);
  const [totalOutgoing, setTotalOutgoing] = useState(0);

  useEffect(() => {
    // Dummy payment data
    const dummyPayments: Payment[] = [
      {
        id: 1,
        date: '2024-01-15',
        amount: 25000,
        type: 'incoming',
        status: 'completed',
        description: 'Product Sales Revenue',
        reference: 'INV-2024-001',
        method: 'Bank Transfer'
      },
      {
        id: 2,
        date: '2024-01-16',
        amount: 2500,
        type: 'outgoing',
        status: 'completed',
        description: 'Agent Commission Payment',
        reference: 'PAY-2024-001',
        method: 'Bank Transfer'
      },
      {
        id: 3,
        date: '2024-01-17',
        amount: 1250,
        type: 'outgoing',
        status: 'completed',
        description: 'Platform Service Fee',
        reference: 'FEE-2024-001',
        method: 'Automatic Deduction'
      },
      {
        id: 4,
        date: '2024-01-18',
        amount: 45000,
        type: 'incoming',
        status: 'completed',
        description: 'Bulk Order Payment',
        reference: 'INV-2024-002',
        method: 'Bank Transfer'
      },
      {
        id: 5,
        date: '2024-01-19',
        amount: 5000,
        type: 'outgoing',
        status: 'pending',
        description: 'Marketing Campaign Payment',
        reference: 'PAY-2024-002',
        method: 'Credit Card'
      },
      {
        id: 6,
        date: '2024-01-20',
        amount: 15000,
        type: 'incoming',
        status: 'completed',
        description: 'Subscription Renewal',
        reference: 'INV-2024-003',
        method: 'Bank Transfer'
      }
    ];

    setPayments(dummyPayments);
    
    const incoming = dummyPayments
      .filter(p => p.type === 'incoming' && p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);
    const outgoing = dummyPayments
      .filter(p => p.type === 'outgoing' && p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);
    
    setTotalIncoming(incoming);
    setTotalOutgoing(outgoing);
  }, []);

  const filteredPayments = filter === 'all' 
    ? payments 
    : payments.filter(payment => payment.type === filter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    return type === 'incoming' ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Payment Management</h1>
      
      {/* Product Context Alert */}
      {state?.productName && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-blue-800 font-medium">
              Payment for: <span className="font-semibold">{state.productName}</span>
              {state.companyName && <span className="text-blue-600"> by {state.companyName}</span>}
            </span>
          </div>
        </div>
      )}
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-2 text-gray-600">Total Incoming</h3>
          <p className="text-3xl font-bold text-green-600">${totalIncoming.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-2 text-gray-600">Total Outgoing</h3>
          <p className="text-3xl font-bold text-red-600">${totalOutgoing.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-2 text-gray-600">Net Balance</h3>
          <p className="text-3xl font-bold text-blue-600">${(totalIncoming - totalOutgoing).toLocaleString()}</p>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="mb-6">
        <div className="flex gap-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            All Payments
          </button>
          <button
            onClick={() => setFilter('incoming')}
            className={`px-4 py-2 rounded-lg ${filter === 'incoming' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Incoming
          </button>
          <button
            onClick={() => setFilter('outgoing')}
            className={`px-4 py-2 rounded-lg ${filter === 'outgoing' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Outgoing
          </button>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(payment.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {payment.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {payment.reference}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <span className={getTypeColor(payment.type)}>
                      {payment.type === 'incoming' ? '+' : '-'}${payment.amount.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      payment.type === 'incoming' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {payment.type.charAt(0).toUpperCase() + payment.type.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {payment.method}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                      {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                    </span>
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
          Export Payment Report
        </button>
        <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
          Generate Invoice
        </button>
        <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
          Payment Analytics
        </button>
      </div>

      {/* Recent Activity */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Recent Payment Activity</h2>
        <div className="space-y-3">
          {payments.slice(0, 3).map((payment) => (
            <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{payment.description}</p>
                <p className="text-sm text-gray-500">{payment.reference} • {payment.method}</p>
              </div>
              <div className="text-right">
                <p className={`font-semibold ${getTypeColor(payment.type)}`}>
                  {payment.type === 'incoming' ? '+' : '-'}${payment.amount.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">{new Date(payment.date).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CompanyPaymentsPage; 