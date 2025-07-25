import { useState, useEffect, useContext } from 'react';
import api from '../../config/axios';
import type { Product } from '../../types';
import { FiCheckCircle, FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '../common/StatusBadge';
import LoadingSpinner from '../common/LoadingSpinner';
import { toast } from 'react-toastify';
import { AuthContext } from '../../context/AuthContext';

interface ProductProgress {
  product_id: number;
  intake_form_completed: boolean;
  ground_questionnaire_completed: boolean;
}

const ReportsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [progress, setProgress] = useState<ProductProgress[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<number | null>(null);
  const navigate = useNavigate();
  const { profileStatus } = useContext(AuthContext);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const productResponse = await api.get('/api/agent/products');
      if (productResponse.data.success) {
        setProducts(productResponse.data.products);
      } else {
        throw new Error(productResponse.data.error || 'Failed to load products');
      }

      const progressResponse = await api.get('/api/agent/product-progress');
      if (progressResponse.data.success) {
        setProgress(progressResponse.data.progress);
      } else {
        throw new Error(progressResponse.data.error || 'Failed to load product progress');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'An error occurred while fetching data';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmitIntake = (productId: number) => {
    navigate(`/agent-dashboard/report-page/intake/${productId}`);
  };

  const handleSubmitGround = async (productId: number) => {
    try {
      setSubmitting(productId);
      const response = await api.post('/api/submit-ground-questionnaire', { productId });
      if (response.data.success) {
        toast.success('Ground questionnaire submitted successfully');
        await fetchData();
      } else {
        throw new Error(response.data.error || 'Failed to submit ground questionnaire');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'An error occurred while submitting the ground questionnaire';
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setSubmitting(null);
    }
  };

  const canSubmit = profileStatus === 'active';

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Manage Reports</h1>
          <button
            onClick={() => navigate('/agent-dashboard/manage-products')}
            className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-md shadow-sm text-sm font-medium hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            <FiArrowLeft className="mr-2" />
            Back to Products
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="bg-white shadow rounded-lg overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner size="large" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-4">No products found.</p>
              <button
                onClick={() => navigate('/agent-dashboard/create-product')}
                className="px-4 py-2 bg-green-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                disabled={!canSubmit}
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
                      Product Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Company
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Report Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Intake Form
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ground Questionnaire
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => {
                    const productProgress = progress.find((p) => p.product_id === product.id) || {
                      intake_form_completed: false,
                      ground_questionnaire_completed: false,
                    };
                    return (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{product.company_name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={product.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={product.report_status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {productProgress.intake_form_completed ? (
                            <span className="text-green-600 flex items-center">
                              <FiCheckCircle className="mr-1" /> Completed
                            </span>
                          ) : product.status === 'active' ? (
                            <button
                              onClick={() => handleSubmitIntake(product.id)}
                              className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
                              disabled={submitting === product.id || !canSubmit}
                            >
                              {submitting === product.id ? 'Submitting...' : 'Submit Intake'}
                            </button>
                          ) : (
                            <span className="text-gray-500">Pending Approval</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {productProgress.ground_questionnaire_completed ? (
                            <span className="text-green-600 flex items-center">
                              <FiCheckCircle className="mr-1" /> Completed
                            </span>
                          ) : productProgress.intake_form_completed && product.status === 'active' ? (
                            <button
                              onClick={() => handleSubmitGround(product.id)}
                              className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
                              disabled={submitting === product.id || !canSubmit}
                            >
                              {submitting === product.id ? 'Submitting...' : 'Submit Ground'}
                            </button>
                          ) : (
                            <span className="text-gray-500">
                              {product.status !== 'active' ? 'Pending Approval' : 'Complete Intake First'}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;