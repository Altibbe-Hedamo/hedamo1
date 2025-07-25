import { useState, useEffect, useContext } from 'react';
import api from '../../config/axios';
import type { Product } from '../../types';
import { FiTrash2, FiEdit, FiRefreshCw, FiPlus } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '../common/StatusBadge';
import LoadingSpinner from '../common/LoadingSpinner';
import ConfirmationModal from '../common/ConfirmationModal';
import { toast } from 'react-toastify';
import { AuthContext } from '../../context/AuthContext';

const ManageProduct: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);
  const navigate = useNavigate();
  const { profileStatus } = useContext(AuthContext);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/api/agent/products');
      if (response.data.success) {
        setProducts(response.data.products);
      } else {
        setError(response.data.error || 'Failed to load products');
        toast.error(response.data.error || 'Failed to load products');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'An error occurred while fetching products';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async () => {
    if (!productToDelete) return;

    try {
      setIsDeleting(true);
      const response = await api.delete(`/api/agent/products/${productToDelete}`);
      if (response.data.success) {
        toast.success('Product deleted successfully');
        await fetchProducts();
      } else {
        setError(response.data.error || 'Failed to delete product');
        toast.error(response.data.error || 'Failed to delete product');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'An error occurred while deleting the product';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
      setProductToDelete(null);
    }
  };

  const handleEdit = (productId: number) => {
    navigate(`/agent-dashboard/edit-product/${productId}`);
  };

  const handleCreate = () => {
    navigate('/agent-dashboard/create-product');
  };

  const canEdit = profileStatus === 'active';

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Manage Products</h1>
          <div className="flex space-x-3">
            <button
              onClick={fetchProducts}
              disabled={loading}
              className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              <FiRefreshCw className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={handleCreate}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              disabled={!canEdit}
            >
              <FiPlus className="mr-2" />
              Add Product
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="bg-white shadow rounded-lg overflow-hidden">
          {loading && products.length === 0 ? (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner size="large" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-4">No products found.</p>
              <button
                onClick={handleCreate}
                className="px-4 py-2 bg-green-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                disabled={!canEdit}
              >
                Create Your First Product
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Brands
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Company
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Report Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{product.brands}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{product.company_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{product.category_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={product.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={product.report_status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleEdit(product.id)}
                            className="text-green-600 hover:text-green-900"
                            title="Edit"
                            disabled={!canEdit}
                          >
                            <FiEdit size={18} />
                          </button>
                          {product.status === 'pending' && (
                            <button
                              onClick={() => setProductToDelete(product.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete"
                              disabled={isDeleting || !canEdit}
                            >
                              <FiTrash2 size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <ConfirmationModal
          isOpen={productToDelete !== null}
          onClose={() => setProductToDelete(null)}
          onConfirm={handleDelete}
          title="Confirm Deletion"
          message="Are you sure you want to delete this product? This action cannot be undone."
          confirmText={isDeleting ? 'Deleting...' : 'Delete'}
          confirmColor="red"
          isLoading={isDeleting}
        />
      </div>
    </div>
  );
};

export default ManageProduct;