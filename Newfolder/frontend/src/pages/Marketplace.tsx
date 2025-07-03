import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Skeleton } from '@mui/material';
import Footer from '../components/Footer';

interface Product {
  id: string;
  name: string;
  description: string;
  image: string;
  company_name: string;
  category_name: string;
  price?: string;
  purity?: string;
  min_order?: string;
  origin?: string;
}

interface ApiResponse<T> {
  success: boolean;
  products?: T[];
  error?: string;
}

const Marketplace: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL = import.meta.env.VITE_API_URL?.replace(/\/+$/, '') || '';

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/products?sort=recent`);
        const data: ApiResponse<Product> = await response.json();
        
        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to fetch products');
        }
        
        if (data.products) {
          setProducts(data.products.slice(0, 6));
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <><div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section
        className="relative h-[400px] sm:h-[500px] flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: 'url(/services/marketplace/marketplace-hero.jpg)' }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            Global B2B Marketplace
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-200 mb-6">
            Connect with organic farmers and businesses worldwide for seamless trade.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/products"
              className="inline-block px-6 sm:px-8 py-2 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-300 text-sm sm:text-base"
            >
              Browse Marketplace
            </Link>
            <Link
              to="/marketplace/how-it-works"
              className="inline-block px-6 sm:px-8 py-2 sm:py-3 bg-white text-green-700 rounded-lg hover:bg-gray-100 transition duration-300 text-sm sm:text-base"
            >
              How It Works
            </Link>
          </div>
        </div>
      </section>

      {/* Details Section */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-8 sm:gap-12 mb-12 sm:mb-16">
            <div className="md:w-1/2">
              <h2 className="text-2xl sm:text-3xl font-bold text-green-800 mb-4">
                Seamless Global Trade
              </h2>
              <p className="text-gray-600 mb-6 text-sm sm:text-base leading-relaxed">
                Hedamo's Global B2B Marketplace is your gateway to international organic trade. Connect with verified farmers, exporters, and businesses across the globe.
              </p>
              <ul className="mb-6 space-y-2">
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600 text-sm sm:text-base">Verified suppliers and buyers</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600 text-sm sm:text-base">Secure transaction process</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600 text-sm sm:text-base">Access to purity reports</span>
                </li>
              </ul>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/signup"
                  className="inline-block px-4 sm:px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-300 text-sm sm:text-base text-center"
                >
                  Join the Marketplace
                </Link>
                <Link
                  to="/trade-solutions"
                  className="inline-block px-4 sm:px-6 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition duration-300 text-sm sm:text-base text-center"
                >
                  Trade Solutions
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 h-48 sm:h-64 md:h-80 flex items-center justify-center">
              <div className="relative w-full h-full">
                <img
                  src="/services/marketplace/mhero.jpg"
                  alt="Global Trade"
                  className="w-full h-full object-cover rounded-2xl shadow-lg"
                  loading="lazy" />
                <div className="absolute -bottom-4 -right-4 bg-white p-2 rounded-lg shadow-md">
                  <div className="w-16 h-16 bg-white p-1 flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-green-800 mb-2">
              Featured Marketplace Products
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">
              Discover high-quality organic products from verified suppliers
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-lg p-6 border border-green-100">
                  <Skeleton variant="rectangular" width="100%" height={192} className="rounded-lg mb-4" />
                  <Skeleton variant="text" width="60%" height={30} className="mb-2" />
                  <Skeleton variant="text" width="80%" height={60} className="mb-2" />
                  <Skeleton variant="text" width="40%" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center bg-red-100 rounded-full p-4 mb-4">
                <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-red-500 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-300 text-sm sm:text-base"
              >
                Try Again
              </button>
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {products.map((product) => (
                  <Link
                    to={`/${product.category_name.toLowerCase().replace(' ', '-')}/${product.company_name
                      .toLowerCase()
                      .replace(' ', '-')}/${product.name.toLowerCase().replace(' ', '-')}-p-${product.id}`}
                    key={product.id}
                    className="group bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-green-100 flex flex-col"
                  >
                    <div className="relative h-48 w-full mb-4 overflow-hidden rounded-lg">
                      <img
                        src={`${API_URL}/uploads/products/${product.image}`}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy" />
                    </div>

                    <h3 className="text-lg sm:text-xl font-semibold text-green-700 mb-2 group-hover:text-green-800">
                      {product.name}
                    </h3>

                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {product.price && (
                        <div>
                          <p className="text-xs text-gray-500">Price</p>
                          <p className="text-gray-600 text-sm sm:text-base font-medium">
                            {product.price}
                          </p>
                        </div>
                      )}
                      {product.purity && (
                        <div>
                          <p className="text-xs text-gray-500">Purity</p>
                          <p className="text-gray-600 text-sm sm:text-base font-medium">
                            {product.purity}
                          </p>
                        </div>
                      )}
                      {product.min_order && (
                        <div>
                          <p className="text-xs text-gray-500">Min. Order</p>
                          <p className="text-gray-600 text-sm sm:text-base font-medium">
                            {product.min_order}
                          </p>
                        </div>
                      )}
                      {product.origin && (
                        <div>
                          <p className="text-xs text-gray-500">Origin</p>
                          <p className="text-gray-600 text-sm sm:text-base font-medium">
                            {product.origin}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="mb-4">
                      <p className="text-gray-600 text-sm sm:text-base line-clamp-2">
                        {product.description}
                      </p>
                    </div>

                    <div className="mt-auto pt-3 border-t border-gray-100 flex justify-between items-center">
                      <p className="text-gray-500 text-sm">
                        By {product.company_name}
                      </p>
                      <div className="text-green-600 group-hover:text-green-800 flex items-center">
                        <span className="text-sm font-medium">View</span>
                        <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="text-center mt-8">
                <Link
                  to="/products"
                  className="inline-block px-6 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition duration-300 text-sm sm:text-base"
                >
                  Browse All Products
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center bg-gray-100 rounded-full p-4 mb-4">
                <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-500 mb-4">No products available at this time</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 bg-green-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Ready to grow your organic business?
          </h2>
          <p className="text-green-100 max-w-2xl mx-auto mb-6 text-sm sm:text-base">
            Join our global marketplace to connect with buyers and suppliers worldwide.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="inline-block px-6 sm:px-8 py-2 sm:py-3 bg-white text-green-700 rounded-lg hover:bg-gray-100 transition duration-300 text-sm sm:text-base"
            >
              Sign Up Free
            </Link>
            <Link
              to="/contact"
              className="inline-block px-6 sm:px-8 py-2 sm:py-3 border border-white text-white rounded-lg hover:bg-green-600 transition duration-300 text-sm sm:text-base"
            >
              Request Demo
            </Link>
          </div>
        </div>
      </section>
    </div><Footer></Footer></>
  );
};

export default Marketplace;