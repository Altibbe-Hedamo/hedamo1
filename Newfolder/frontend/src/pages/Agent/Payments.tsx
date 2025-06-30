import { useState, useEffect } from 'react';
import api from '../../config/axios';
import type { Payment } from '../../types';

const Payments: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await api.get('/api/agent/payments');
        if (response.data.success) {
          setPayments(response.data.payments);
        } else {
          setError('Failed to load payments');
        }
      } catch (err) {
        setError('An error occurred while fetching payments');
      }
    };

    fetchPayments();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Payment History</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="bg-white p-4 rounded-lg shadow">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="p-2 text-left">Date</th>
              <th className="p-2 text-left">Amount</th>
              <th className="p-2 text-left">Commission</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Product</th>
              <th className="p-2 text-left">Company</th>
            </tr>
          </thead>
          <tbody>
            {payments.map(payment => (
              <tr key={payment.id} className="border-b">
                <td className="p-2">{new Date(payment.created_at).toLocaleDateString()}</td>
                <td className="p-2">${payment.amount.toFixed(2)}</td>
                <td className="p-2">${payment.agent_commission.toFixed(2)}</td>
                <td className="p-2">{payment.status}</td>
                <td className="p-2">{payment.product_name || '-'}</td>
                <td className="p-2">{payment.company_name || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Payments;