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

interface AcceptedProduct {
  id: number;
  category: string;
  sub_categories: string[];
  product_name: string;
  company_name: string;
  location: string;
  email: string;
  certifications: string[];
  decision: string;
  reason: string;
  created_at: string;
}

const CompanyPaymentsPage: React.FC = () => {
  const location = useLocation();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filter, setFilter] = useState('all');
  const [totalIncoming, setTotalIncoming] = useState(0);
  const [totalOutgoing, setTotalOutgoing] = useState(0);
  const [showProductPayment, setShowProductPayment] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<AcceptedProduct | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('credit_card');

  useEffect(() => {
    // Check if we have product information from navigation
    if (location.state?.selectedProduct && location.state?.paymentType === 'product_payment') {
      setSelectedProduct(location.state.selectedProduct);
      setShowProductPayment(true);
      // Set default payment amount based on product (you can customize this logic)
      setPaymentAmount('500'); // Default amount, you can make this dynamic
    }
  }, [location.state]);

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

  const handleProductPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !paymentAmount) return;

    // Here you would typically make an API call to process the payment
    console.log('Processing payment for product:', selectedProduct.product_name);
    console.log('Amount:', paymentAmount);
    console.log('Method:', paymentMethod);

    // For now, we'll just show a success message and hide the form
    alert(`Payment of $${paymentAmount} for ${selectedProduct.product_name} has been processed successfully!`);
    setShowProductPayment(false);
    setSelectedProduct(null);
    setPaymentAmount('');
  };

  const handleCancelPayment = () => {
    setShowProductPayment(false);
    setSelectedProduct(null);
    setPaymentAmount('');
  };

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

  // Show product payment form if a product is selected
  if (showProductPayment && selectedProduct) {
    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Product Payment</h1>
            <button
              onClick={handleCancelPayment}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Product Details */}
          <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
            <h2 className="text-lg font-semibold mb-4">Product Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Product Name</p>
                <p className="font-medium">{selectedProduct.product_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Company</p>
                <p className="font-medium">{selectedProduct.company_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Category</p>
                <p className="font-medium">{selectedProduct.category}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Location</p>
                <p className="font-medium">{selectedProduct.location}</p>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Payment Information</h2>
            <form onSubmit={handleProductPaymentSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Amount ($)
                </label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter amount"
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="credit_card">Credit Card</option>
                  <option value="debit_card">Debit Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="upi">UPI</option>
                  <option value="net_banking">Net Banking</option>
                </select>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Process Payment
                </button>
                <button
                  type="button"
                  onClick={handleCancelPayment}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Payment Management</h1>
      
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