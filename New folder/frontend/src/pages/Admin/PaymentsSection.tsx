import React, { useState, useEffect, type JSX } from 'react';
import { CreditCard, CheckCircle, Clock, AlertCircle, Download } from 'lucide-react';
import { AxiosError } from 'axios';
import api from '../../config/axios';

interface Payment {
  id: string;
  product_id: number;
  product_name: string;
  amount: number;
  status: string;
  date: string;
  method: string;
  reason?: string;
}

const statusIcons: Record<string, JSX.Element> = {
  Pending: <Clock className="h-4 w-4 text-yellow-500" />,
  Completed: <CheckCircle className="h-4 w-4 text-green-500" />,
  Failed: <AlertCircle className="h-4 w-4 text-red-500" />,
};

const PaymentsSection: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const statuses = ['Pending', 'Completed', 'Failed'];

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await api.get('/api/payments');
        setPayments(response.data);
        setLoading(false);
      } catch (error) {
        const axiosError = error as AxiosError;
        console.error('Failed to fetch payments:', axiosError.message);
        if (axiosError.response?.status === 401) {
          alert('Please log in to access this section.');
        }
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  const handleProcessPayment = async (id: number) => {
    try {
      await api.post(`/api/payments/${id}/process`, {});
      setPayments(payments.map(payment =>
        parseInt(payment.id, 10) === id ? { ...payment, status: 'processed' } : payment
      ));
    } catch (error) {
      console.error('Failed to process payment:', (error as AxiosError).message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Payment Management</h2>
        <button 
          onClick={() => alert('Process payment feature under development')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Process Payment
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-800">Total Revenue</p>
                  <p className="text-2xl font-bold">
                    ${payments.reduce((sum, p) => sum + (p.status === 'verified' ? p.amount : 0), 0).toFixed(2)}
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <CreditCard className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-800">Completed Payments</p>
                  <p className="text-2xl font-bold">
                    ${payments.reduce((sum, p) => sum + (p.status === 'verified' ? p.amount : 0), 0).toFixed(2)}
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-800">Pending Payments</p>
                  <p className="text-2xl font-bold">
                    ${payments.reduce((sum, p) => sum + (p.status === 'pending' ? p.amount : 0), 0).toFixed(2)}
                  </p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-full">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {statuses.map(status => {
              const paymentsInStatus = payments.filter(payment => payment.status === status.toLowerCase());
              if (paymentsInStatus.length === 0) return null;
              
              return (
                <div key={status}>
                  <div className="flex items-center mb-4">
                    <CreditCard className="h-5 w-5 mr-2 text-blue-500" />
                    {statusIcons[status]}
                    <h3 className="text-lg font-semibold ml-2">{status} Payments ({paymentsInStatus.length})</h3>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                          {status === 'Failed' && (
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                          )}
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {paymentsInStatus.map(payment => (
                          <tr key={payment.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {payment.id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {payment.product_name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              ${payment.amount.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {payment.date}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {payment.method}
                            </td>
                            {status === 'Failed' && (
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {payment.reason}
                              </td>
                            )}
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button className="text-blue-600 hover:text-blue-900 flex items-center">
                                  <Download className="h-4 w-4 mr-1" /> Receipt
                                </button>
                                {status === 'Pending' && (
                                  <>
                                    <button 
                                      onClick={() => handleProcessPayment(parseInt(payment.id))}
                                      className="text-green-600 hover:text-green-900"
                                    >
                                      Complete
                                    </button>
                                    <button className="text-red-600 hover:text-red-900">Cancel</button>
                                  </>
                                )}
                                {status === 'Failed' && (
                                  <button className="text-gray-600 hover:text-gray-900">Retry</button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsSection;