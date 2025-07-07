import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import heroBackground from '/homepage.webp';
import { TestimonialCarousel } from '../components/testimonial';
import Footer from '../components/Footer';

interface Product {
  id: string;
  name: string;
  description: string;
  image: string;
  category_name: string;
  company_name: string;
  current_market: string;
  created_at: string;
}

interface ApiResponse<T> {
  success: boolean;
  products?: T[];
  error?: string;
}

function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL?.replace(/\/+$/, '') || '';

  useEffect(() => {
    fetch(`${API_URL}/api/products?sort=recent`)
      .then((res) => res.json())
      .then((data: ApiResponse<Product>) => {
        if (data.success && data.products) {
          setProducts(data.products.slice(0, 3));
        }
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching products:', error);
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      {/* Hero Section */}
      <section
        className="relative h-[600px] bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${heroBackground})`,
        }}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-8 tracking-wide drop-shadow-lg">FUEL YOUR BODY. FEED YOUR SOUL</h1>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/products"
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full text-lg font-semibold transition-all duration-300"
            >
              Explore Products
            </Link>
            <Link
              to="/about"
              className="border-2 border-white text-white hover:bg-white hover:text-green-700 px-8 py-3 rounded-full text-lg font-semibold bg-transparent transition-all duration-300"
            >
              Our Story
            </Link>
          </div>
        </div>

        {/* Full-width, shallow, smooth wave for seamless transition */}
        <svg viewBox="0 0 1920 180" className="absolute bottom-0 left-0 w-full h-[120px] md:h-[180px]" fill="none" xmlns="http://www.w3.org/2000/svg" style={{zIndex: 1}}>
          <path
            d="M0,80 Q480,160 960,120 Q1440,80 1920,140 L1920,180 L0,180 Z"
            fill="#e6f4ea"
          />
        </svg>
      </section>

      {/* Overlapping Happy Customers Section - perfectly in the valley */}
      <section className="relative z-10 -mt-16 md:-mt-24 flex flex-col items-center justify-center">
        <div className="bg-transparent w-full flex flex-col items-center justify-center">
          <div className="max-w-4xl mx-auto text-center px-4 py-12">
            <h2 className="text-4xl md:text-5xl font-bold text-green-900 mb-6 drop-shadow-md" style={{textShadow: '0 4px 16px #e6f4ea, 0 2px 8px #fff'}}>Over 100,000 Happy<br />Customers</h2>
            <p className="text-lg text-green-800 mb-4 font-medium">
              "Since 2020, We've Been Creating Feel-Good Nutrition Guided By Nature And Wisdom."
            </p>
            <p className="text-green-700">Thank You For Being Part Of Our Journey</p>
          </div>
        </div>
      </section>

      {/* Shop By Category */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <div className="w-12 h-1 bg-green-600 mb-4"></div>
              <h2 className="text-3xl font-bold text-gray-900">Shop By Category</h2>
            </div>
            <Link to="/products" className="text-gray-400 hover:text-green-600 transition-colors">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Link
              to="/products?cat=food"
              className="group overflow-hidden hover:shadow-lg transition-shadow rounded-lg border border-gray-200"
            >
              <div className="aspect-square relative">
                <img
                  src="/product/food.webp"
                  alt="Plant-Based Food"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6 text-center">
                <h3 className="text-xl font-semibold text-gray-900 group-hover:text-green-600 transition-colors">Plant-Based Food</h3>
              </div>
            </Link>

            <Link
              to="/products?cat=cloth"
              className="group overflow-hidden hover:shadow-lg transition-shadow rounded-lg border border-gray-200"
            >
              <div className="aspect-square relative">
                <img
                  src="/product/clothing.webp"
                  alt="Organic Clothing"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6 text-center">
                <h3 className="text-xl font-semibold text-gray-900 group-hover:text-green-600 transition-colors">Organic Clothing</h3>
              </div>
            </Link>

            <Link
              to="/products?cat=cosmetics"
              className="group overflow-hidden hover:shadow-lg transition-shadow rounded-lg border border-gray-200"
            >
              <div className="aspect-square relative">
                <img
                  src="/product/cosmetics.webp"
                  alt="Natural Cosmetics"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6 text-center">
                <h3 className="text-xl font-semibold text-gray-900 group-hover:text-green-600 transition-colors">Natural Cosmetics</h3>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* The Story Behind The Smile */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <div className="w-12 h-1 bg-green-600 mb-4"></div>
            <h2 className="text-3xl font-bold text-gray-900">The Story Behind The Smile</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Link
              to="/about"
              className="group overflow-hidden hover:shadow-lg transition-shadow rounded-lg border border-gray-200"
            >
              <div className="aspect-square relative">
                <img
                  src="/h2.jpg"
                  alt="Our Origins"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6 text-center">
                <h3 className="text-xl font-semibold text-gray-900 group-hover:text-green-600 transition-colors">Our Origins</h3>
              </div>
            </Link>

            <Link
              to="/services"
              className="group overflow-hidden hover:shadow-lg transition-shadow rounded-lg border border-gray-200"
            >
              <div className="aspect-square relative">
                <img
                  src="/h1.jpg"
                  alt="How We Create"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6 text-center">
                <h3 className="text-xl font-semibold text-gray-900 group-hover:text-green-600 transition-colors">How We Create</h3>
              </div>
            </Link>

            <Link
              to="/about"
              className="group overflow-hidden hover:shadow-lg transition-shadow rounded-lg border border-gray-200"
            >
              <div className="aspect-square relative">
                <img
                  src="/us2.jpg"
                  alt="Why It Matters"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6 text-center">
                <h3 className="text-xl font-semibold text-gray-900 group-hover:text-green-600 transition-colors">Why It Matters</h3>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Recently Added Products */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <div className="w-12 h-1 bg-green-600 mb-4"></div>
            <h2 className="text-3xl font-bold text-gray-900">Community Love</h2>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-green-600 border-t-transparent"></div>
            </div>
          ) : products.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-8">
              {products.map((product) => (
                <Link
                  key={product.id}
                  to={`/${product.category_name.toLowerCase().replace(' ', '-')}/${product.company_name
                    .toLowerCase()
                    .replace(' ', '-')}/${product.name.toLowerCase().replace(' ', '-')}-p-${product.id}`}
                  className="group overflow-hidden hover:shadow-lg transition-shadow rounded-lg border border-gray-200"
                >
                  <div className="aspect-[4/5] relative">
                    <img
                      src={`${API_URL}/uploads/products/${product.image}`}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">H</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{product.name}</p>
                        <p className="text-xs text-gray-500">By {product.company_name}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                </svg>
              </div>
              <p className="text-xl text-gray-500">No products available at the moment</p>
            </div>
          )}
        </div>
      </section>

      {/* Join Us Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        {/* Large green oval background as in screenshot */}
        <div className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1/3 w-[120vw] h-[60vw] max-w-[1600px] max-h-[600px] bg-green-100 rounded-full z-0" style={{filter: 'blur(0px)'}}></div>
        <div className="relative max-w-4xl mx-auto text-center z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-green-900 mb-6 italic">
            Become A Part Of The Hedamo Family
          </h2>
          <p className="text-lg text-green-800 mb-8 font-medium">
            At Hedamo, We Believe Small Choices Lead To Big Change — And It Starts With Us.
          </p>
          <Link
            to="/signup"
            className="inline-block bg-green-700 hover:bg-green-800 text-white px-12 py-4 rounded-full text-lg font-semibold transition-all duration-300"
          >
            Join Us
          </Link>
        </div>
      </section>

      {/* Testimonials */}
      <TestimonialCarousel />

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default Home;