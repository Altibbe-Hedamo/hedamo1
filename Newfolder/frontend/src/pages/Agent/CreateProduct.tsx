import { useState, useEffect, type FormEvent } from 'react';
import api from '../../config/axios';
import { useNavigate } from 'react-router-dom';
import { FiUpload, FiX } from 'react-icons/fi';

interface Product {
  id: string;
  companyId: string;
  category: string;
  name: string;
  location: string;
  images: File[];
  status: string;
  description: string;
  sku: string;
  price: string;
}

interface Company {
  id: string;
  name: string;
  status: string;
}

interface Category {
  id: string;
  name: string;
}

const CreateProduct: React.FC = () => {
  const [newProduct, setNewProduct] = useState<Product>({
    id: '',
    companyId: '',
    category: '',
    name: '',
    location: '',
    images: [],
    status: 'pending',
    description: '',
    sku: '',
    price: '',
  });
  const [companies, setCompanies] = useState<Company[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [companiesResponse, categoriesResponse] = await Promise.all([
          api.get('/api/agent/companies'),
          api.get('/api/categories'),
        ]);

        if (companiesResponse.data.success) {
          setCompanies(companiesResponse.data.companies);
        }
        if (categoriesResponse.data.success) {
          setCategories(categoriesResponse.data.categories);
        }
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load companies or categories');
      }
    };

    fetchData();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files).slice(0, 3 - newProduct.images.length);
      const newPreviews = newImages.map((file) => URL.createObjectURL(file));
      setNewProduct({
        ...newProduct,
        images: [...newProduct.images, ...newImages].slice(0, 3),
      });
      setImagePreviews([...imagePreviews, ...newPreviews].slice(0, 3));
    }
  };

  const removeImage = (index: number) => {
    const updatedImages = [...newProduct.images];
    const updatedPreviews = [...imagePreviews];
    updatedImages.splice(index, 1);
    updatedPreviews.splice(index, 1);
    setNewProduct({ ...newProduct, images: updatedImages });
    setImagePreviews(updatedPreviews);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('name', newProduct.name);
      formData.append('brands', newProduct.name); // Assuming product name as brand for simplicity
      formData.append('companyId', newProduct.companyId);
      formData.append('categoryId', newProduct.category);
      formData.append('location', newProduct.location);
      formData.append('sku', newProduct.sku);
      formData.append('price', newProduct.price);
      formData.append('description', newProduct.description);
      newProduct.images.forEach((image) => {
        formData.append('images', image);
      });

      const response = await api.post('/api/add-product', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success) {
        setSuccessMessage('Product created successfully. Awaiting admin approval.');
        setTimeout(() => {
          navigate('/agent-dashboard/manage-product');
        }, 2000);
      } else {
        setError(response.data.error || 'Failed to create product');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (error === 'You need an approved company to create a product.') {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Create Product</h1>
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => navigate('/agent-dashboard/create-company')}
          className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Create a Company
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-[#F5F7FA] min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Create New Product</h2>
            <p className="text-gray-600">Fill in the details to add a new product</p>
          </div>
        </div>

        <section className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b">
            <h3 className="text-xl font-semibold text-gray-800">Product Information</h3>
            <p className="text-sm text-gray-600">Enter all required details for the new product</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company <span className="text-red-500">*</span>
                </label>
                <select
                  value={newProduct.companyId}
                  onChange={(e) => setNewProduct({ ...newProduct, companyId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Company</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter product name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SKU/Product Code
                </label>
                <input
                  type="text"
                  value={newProduct.sku}
                  onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter SKU or product code"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newProduct.location}
                  onChange={(e) => setNewProduct({ ...newProduct, location: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter product location"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">$</span>
                  </div>
                  <input
                    type="text"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    className="pl-8 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  rows={3}
                  placeholder="Enter product description"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Images (max 3)
              </label>
              <div className="flex flex-wrap gap-4">
                {imagePreviews.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Product preview ${index + 1}`}
                      className="h-32 w-32 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <FiX size={16} />
                    </button>
                  </div>
                ))}
                {imagePreviews.length < 3 && (
                  <label className="flex flex-col items-center justify-center h-32 w-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-500 transition-colors">
                    <div className="flex flex-col items-center justify-center">
                      <FiUpload className="text-gray-400 mb-1" size={20} />
                      <span className="text-sm text-gray-500">Upload</span>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/jpeg,image/png"
                      multiple
                      onChange={handleImageUpload}
                    />
                  </label>
                )}
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Upload high-quality images of the product (JPG, PNG, max 3 images)
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-500"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {successMessage && (
              <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-green-500"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-700">{successMessage}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => {
                  setNewProduct({
                    id: '',
                    companyId: '',
                    category: '',
                    name: '',
                    location: '',
                    images: [],
                    status: 'pending',
                    description: '',
                    sku: '',
                    price: '',
                  });
                  setImagePreviews([]);
                  setSuccessMessage('');
                  setError(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Reset Form
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-6 py-2 rounded-lg text-white transition-colors ${
                  isSubmitting
                    ? 'bg-indigo-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {isSubmitting ? 'Creating...' : 'Create Product'}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
};

export default CreateProduct;