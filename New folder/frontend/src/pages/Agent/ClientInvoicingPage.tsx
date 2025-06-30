import React, { useState, useEffect } from 'react';
import { FaSearch, FaFilter, FaDownload, FaEye, FaPrint, FaCalendarAlt, FaBuilding, FaExclamationTriangle } from 'react-icons/fa';
import api from '../../config/axios';

interface Client {
  name: string;
  email: string;
}

interface Invoice {
  id: number;
  amount: number;
  status: string;
  date: string;
  client: Client;
}

interface Company {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  status: string;
  company: Company;
  invoices: Invoice[];
}

interface StatusCheck {
  agentStatus: string | null;
  companyStatus: string | null;
  hasCompany: boolean;
}

const ClientInvoicingPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedStatus, setSelectedStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusCheck, setStatusCheck] = useState<StatusCheck>({
    agentStatus: null,
    companyStatus: null,
    hasCompany: false
  });

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await api.get('/api/profiles/user');
        if (response.data.success) {
          setStatusCheck({
            agentStatus: response.data.status,
            companyStatus: response.data.companies?.[0]?.status || null,
            hasCompany: response.data.companies?.length > 0
          });
        }
      } catch (err) {
        console.error('Error checking status:', err);
      }
    };

    checkStatus();
  }, []);

  useEffect(() => {
    const fetchProductsAndInvoices = async () => {
      try {
        console.log('Fetching products and invoices...');
        const response = await api.get('/api/agent/products-invoices');

        console.log('Response received:', response.data);
        if (response.data.success) {
          setProducts(response.data.products);
        } else {
          setError(response.data.error || 'Failed to fetch products and invoices');
        }
      } catch (err: any) {
        console.error('Error details:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status
        });
        
        let errorMessage = 'Error loading products and invoices';
        if (err.response) {
          errorMessage = err.response.data.error || err.response.data.details || errorMessage;
        } else if (err.request) {
          errorMessage = 'Unable to connect to the server. Please check your internet connection and try again.';
        }
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchProductsAndInvoices();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusMessage = () => {
    if (!statusCheck.agentStatus) {
      return {
        title: "Profile Not Found",
        message: "Please complete your agent profile first.",
        action: "Go to Profile",
        link: "/agent-dashboard/profile"
      };
    }

    if (statusCheck.agentStatus === 'pending') {
      return {
        title: "Agent Verification Pending",
        message: "Your agent account is pending verification. Please wait for admin approval.",
        action: "Check Status",
        link: "/agent-dashboard/waiting-approval"
      };
    }

    if (statusCheck.agentStatus === 'rejected') {
      return {
        title: "Agent Verification Rejected",
        message: "Your agent account has been rejected. Please contact support for more information.",
        action: "Contact Support",
        link: "/agent-dashboard/help-line"
      };
    }

    if (!statusCheck.hasCompany) {
      return {
        title: "No Company Found",
        message: "You need to create a company before you can access invoices.",
        action: "Create Company",
        link: "/agent-dashboard/create-company"
      };
    }

    if (statusCheck.companyStatus === 'pending') {
      return {
        title: "Company Approval Pending",
        message: "Your company is pending approval. Please wait for admin verification.",
        action: "Check Status",
        link: "/agent-dashboard/manage-company"
      };
    }

    if (statusCheck.companyStatus === 'rejected') {
      return {
        title: "Company Rejected",
        message: "Your company has been rejected. Please contact support for more information.",
        action: "Contact Support",
        link: "/agent-dashboard/help-line"
      };
    }

    return null;
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.company.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !selectedStatus || product.status === selectedStatus;
    const matchesDateRange = (!dateRange.start || !dateRange.end) || 
      product.invoices.some(invoice => {
        const invoiceDate = new Date(invoice.date);
        const start = new Date(dateRange.start);
        const end = new Date(dateRange.end);
        return invoiceDate >= start && invoiceDate <= end;
      });
    
    return matchesSearch && matchesStatus && matchesDateRange;
  });

  const statusMessage = getStatusMessage();

  if (statusMessage) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="mb-6">
              <FaExclamationTriangle className="mx-auto h-16 w-16 text-yellow-400" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">{statusMessage.title}</h2>
            <p className="text-gray-600 mb-6">{statusMessage.message}</p>
            <a
              href={statusMessage.link}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {statusMessage.action}
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products and invoices...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow-sm">
          <div className="text-red-600 mb-4">
            <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Data</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-y-3">
            <button 
              onClick={() => window.location.reload()} 
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
            <button 
              onClick={() => {
                localStorage.removeItem('token');
                window.location.href = '/login';
              }}
              className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Log Out and Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Client Invoicing</h1>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center">
            <FaDownload className="mr-2" />
            Export Invoices
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search products or companies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>

            {/* Date Range */}
            <div className="flex items-center space-x-2">
              <FaCalendarAlt className="text-gray-400" />
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="text-gray-500">to</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
              </select>
              <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {/* Amount Range */}
            <div className="relative">
              <select className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white">
                <option value="">Amount Range</option>
                <option value="0-10000">₹0 - ₹10,000</option>
                <option value="10000-25000">₹10,000 - ₹25,000</option>
                <option value="25000-50000">₹25,000 - ₹50,000</option>
                <option value="50000+">₹50,000+</option>
              </select>
              <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Products and Invoices */}
        <div className="space-y-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              {/* Product Header */}
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                    <div className="flex items-center mt-1 text-sm text-gray-500">
                      <FaBuilding className="mr-1" />
                      <span>{product.company.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-gray-900">
                      Price: ₹{product.price?.toLocaleString() || 'N/A'}
                    </span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(product.status)}`}>
                      {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Invoices Table */}
              {product.invoices.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Invoice ID
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Client
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {product.invoices.map((invoice) => (
                        <tr key={invoice.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            INV-{invoice.id.toString().padStart(4, '0')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div>
                              <p className="font-medium">{invoice.client.name}</p>
                              <p className="text-xs text-gray-400">{invoice.client.email}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ₹{invoice.amount.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(invoice.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex space-x-3">
                              <button className="text-blue-600 hover:text-blue-900">
                                <FaEye className="h-5 w-5" />
                              </button>
                              <button className="text-gray-600 hover:text-gray-900">
                                <FaPrint className="h-5 w-5" />
                              </button>
                              <button className="text-green-600 hover:text-green-900">
                                <FaDownload className="h-5 w-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  No invoices found for this product
                </div>
              )}
            </div>
          ))}

          {filteredProducts.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <p className="text-gray-500">No products or invoices found matching your criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientInvoicingPage; 