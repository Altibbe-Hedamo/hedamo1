import React, { useState, useEffect } from 'react';
import { Package } from 'lucide-react';
import api from '../../config/axios';

interface Product {
  product_id: number;
  product_name: string;
  product_status: string;
  report_status: string;
  company: {
    company_id: number;
    company_name: string;
  };
  agent: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
  created_at: string;
}

const ProductsSection: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/admin/profiles');
      // Transform the data to match the products format
      const productsData = response.data.profiles.flatMap((profile: any) => 
        profile.companies.flatMap((company: any) => 
          company.products.map((product: any) => ({
            product_id: product.product_id,
            product_name: product.product_name,
            product_status: product.product_status,
            report_status: product.report_status,
            company: {
              company_id: company.company_id,
              company_name: company.company_name
            },
            agent: {
              id: profile.id,
              first_name: profile.first_name,
              last_name: profile.last_name,
              email: profile.email
            },
            created_at: product.created_at
          }))
        )
      );
      setProducts(productsData);
      setError(null);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleVerifyProduct = async (productId: number, agentId: number) => {
    try {
      await api.post(`/api/products/${productId}/verify`);
      await fetchProducts(); // Refresh the list
    } catch (err) {
      console.error('Error verifying product:', err);
      setError('Failed to verify product. Please try again.');
    }
  };

  const handleRequestProductInfo = async (productId: number, agentId: number) => {
    try {
      await api.post(`/api/products/${productId}/request-info`);
      await fetchProducts(); // Refresh the list
    } catch (err) {
      console.error('Error requesting product info:', err);
      setError('Failed to request product info. Please try again.');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      active: 'bg-green-100 text-green-800',
      info_requested: 'bg-orange-100 text-orange-800',
      pending: 'bg-yellow-100 text-yellow-800',
      rejected: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`px-2 py-1 text-xs rounded-full ${statusClasses[status as keyof typeof statusClasses] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Products</h1>
        <button
          onClick={fetchProducts}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Refresh
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center mb-4">
          <Package className="h-5 w-5 mr-2 text-blue-500" />
          <h3 className="text-lg font-semibold">Products</h3>
        </div>
        <div className="space-y-4">
          {products.map((product) => (
            <div
              key={product.product_id}
              className="p-3 border border-gray-100 rounded-lg hover:bg-gray-50"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{product.product_name}</p>
                  <p className="text-sm text-gray-500">
                    Company: {product.company.company_name}
                  </p>
                  <p className="text-xs text-gray-400">
                    Agent: {product.agent.first_name} {product.agent.last_name}
                  </p>
                  <p className="text-xs text-gray-400">
                    Created: {new Date(product.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  {getStatusBadge(product.product_status)}
                  {product.report_status && (
                    <span
                      className={`px-2 py-1 text-xs rounded-full mt-1 ${
                        product.report_status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {product.report_status}
                    </span>
                  )}
                </div>
              </div>
              {product.product_status === 'pending' && (
                <div className="flex space-x-2 mt-2">
                  <button
                    onClick={() => handleVerifyProduct(product.product_id, product.agent.id)}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                  >
                    Verify
                  </button>
                  <button
                    onClick={() => handleRequestProductInfo(product.product_id, product.agent.id)}
                    className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-300 transition-colors"
                  >
                    Request Info
                  </button>
                </div>
              )}
            </div>
          ))}
          {products.length === 0 && (
            <p className="text-gray-500">No products found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsSection;