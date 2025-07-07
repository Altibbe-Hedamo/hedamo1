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
    <div className="bg-gradient-to-b from-white to-green-50 min-h-screen">
      {/* Hero Section */}
      <section
        className="relative h-[90vh] flex items-center justify-center bg-cover bg-center bg-fixed"
        style={{ backgroundImage: `url(${heroBackground})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60"></div>
        <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
          <div className="animate-fade-in-up">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight">
              Redefining <span className="text-green-400">Organic Trust</span>
              <br />
              with Verified Purity
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-200 mb-8 max-w-4xl mx-auto leading-relaxed">
              Connecting organic farmers with the world through verified reports, 
              B2B connections, and direct consumer engagement.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
              <Link
                to="/products"
                className="group bg-green-600 text-white px-8 py-4 rounded-full hover:bg-green-700 transition-all duration-300 transform hover:scale-105 font-semibold text-lg shadow-lg hover:shadow-xl"
              >
                <span className="flex items-center justify-center gap-2">
                  Explore Products
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </span>
              </Link>
              <Link
                to="/signup"
                className="group bg-white text-green-600 px-8 py-4 rounded-full hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 font-semibold text-lg shadow-lg hover:shadow-xl border-2 border-white"
              >
                <span className="flex items-center justify-center gap-2">
                  Join as Producer
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                </span>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {[
              { number: '1000+', label: 'Verified Products' },
              { number: '500+', label: 'Organic Farmers' },
              { number: '50+', label: 'Countries Served' },
              { number: '99%', label: 'Trust Score' }
            ].map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2 group-hover:scale-110 transition-transform duration-300">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Categories */}
      <section className="py-20 bg-gradient-to-r from-green-50 to-blue-50">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Find Products By <span className="text-green-600">Category</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover our curated selection of 100% organic products across various categories
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              { name: 'Food', image: '/product/food.webp', cat: 'food', description: 'Fresh organic produce and ingredients' },
              { name: 'Clothing', image: '/product/clothing.webp', cat: 'cloth', description: 'Sustainable fashion and textiles' },
              { name: 'Cosmetics', image: '/product/cosmetics.webp', cat: 'cosmetics', description: 'Natural beauty and skincare' },
            ].map(({ name, image, cat, description }) => (
              <Link
                key={name}
                to={`/products?cat=${cat}`}
                className="group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={image}
                    alt={name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-800 group-hover:text-green-600 transition-colors mb-2">
                    {name}
                  </h3>
                  <p className="text-gray-600 group-hover:text-gray-800 transition-colors">
                    {description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recently Added Products */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Recently Added Products
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Handpicked and 100% organically grown products from verified farmers
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent"></div>
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {products.map((product, index) => (
                <Link
                  to={`/${product.category_name.toLowerCase().replace(' ', '-')}/${product.company_name
                    .toLowerCase()
                    .replace(' ', '-')}/${product.name.toLowerCase().replace(' ', '-')}-p-${product.id}`}
                  key={product.id}
                  className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={`${API_URL}/uploads/products/${product.image}`}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute top-4 right-4 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      New
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-green-700 mb-3 group-hover:text-green-600 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-gray-600 line-clamp-2 mb-4 leading-relaxed">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        By {product.company_name}
                      </span>
                      <div className="flex items-center text-green-600 font-medium group-hover:translate-x-2 transition-transform">
                        View Details
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🌱</div>
              <p className="text-xl text-gray-500">No products available at the moment</p>
            </div>
          )}
        </div>
      </section>

      {/* About Us */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-green-700">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12 max-w-6xl mx-auto">
            <div className="lg:w-1/2 text-white">
              <div className="space-y-6">
                <div className="inline-block bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium">
                  About Hedamo
                </div>
                <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                  The Future of Organic Commerce
                </h2>
                <p className="text-xl text-green-100 leading-relaxed">
                  Hedamo is an exclusive platform designed to empower organic farmers by ensuring transparency, authenticity, and global reach. Every product listed on our platform carries a Hedamo QR Report, providing unparalleled trust to buyers and businesses worldwide.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    to="/about"
                    className="group bg-white text-green-600 px-8 py-4 rounded-full hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 font-semibold text-center"
                  >
                    <span className="flex items-center justify-center gap-2">
                      Learn More
                      <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                      </svg>
                    </span>
                  </Link>
                  <Link
                    to="/contact"
                    className="group border-2 border-white text-white px-8 py-4 rounded-full hover:bg-white hover:text-green-600 transition-all duration-300 transform hover:scale-105 font-semibold text-center"
                  >
                    Contact Us
                  </Link>
                </div>
              </div>
            </div>
            <div className="lg:w-1/2">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-400 rounded-3xl transform rotate-3"></div>
                <img
                  src="/h2.jpg"
                  alt="Organic farming"
                  className="relative w-full h-96 lg:h-[500px] object-cover rounded-3xl shadow-2xl"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Services */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Core Services
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive solutions for organic farming and sustainable commerce
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                title: 'QR-Based Purity Reports',
                desc: 'Every product on Hedamo comes with a verified report showcasing purity, chemical composition, and technical details.',
                icon: '🔍',
                link: '/services#qr-reports',
                color: 'from-blue-500 to-blue-600'
              },
              {
                title: 'Global B2B Marketplace',
                desc: 'Seamless trade opportunities for organic farmers, exporters, and businesses across the globe with reliable verified reports.',
                icon: '🌐',
                link: '/services#marketplace',
                color: 'from-green-500 to-green-600'
              },
              {
                title: 'Find Producers Locally',
                desc: 'Find authentic organic producers in your region for direct sourcing and collaboration.',
                icon: '📍',
                link: '/services#local-producers',
                color: 'from-purple-500 to-purple-600'
              }
            ].map((service, index) => (
              <div
                key={index}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 overflow-hidden"
              >
                <div className={`h-2 bg-gradient-to-r ${service.color}`}></div>
                <div className="p-8">
                  <div className="text-6xl mb-6 transform group-hover:scale-110 transition-transform duration-300">
                    {service.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4 group-hover:text-green-600 transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {service.desc}
                  </p>
                  <Link
                    to={service.link}
                    className="inline-flex items-center gap-2 text-green-600 font-semibold hover:text-green-700 transition-colors group-hover:translate-x-2 transform duration-300"
                  >
                    Learn More
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Simple steps to connect organic farmers with global markets
            </p>
          </div>

          <div className="relative max-w-6xl mx-auto">
            {/* Connection line */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-green-400 via-blue-400 to-green-400 rounded-full transform -translate-y-1/2"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
              {[
                {
                  title: 'Sign Up',
                  desc: 'Farmers and buyers create an account to access our comprehensive platform.',
                  icon: '👥',
                  color: 'from-blue-500 to-blue-600'
                },
                {
                  title: 'Examine And Report',
                  desc: 'We examine products and verify facts before listing with detailed reports.',
                  icon: '🔍',
                  color: 'from-green-500 to-green-600'
                },
                {
                  title: 'Consumer Report',
                  desc: 'Consumers scan QR codes to access comprehensive product and producer reports.',
                  icon: '📱',
                  color: 'from-purple-500 to-purple-600'
                },
                {
                  title: 'Global Trading',
                  desc: 'Global buyers connect with verified farmers for secure international trade.',
                  icon: '🌎',
                  color: 'from-orange-500 to-orange-600'
                },
              ].map((step, index) => (
                <div key={index} className="group relative">
                  <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 p-8 text-center h-full">
                    <div className={`relative -mt-12 mb-6 mx-auto w-16 h-16 flex items-center justify-center bg-gradient-to-r ${step.color} text-white text-xl font-bold rounded-full shadow-lg`}>
                      {index + 1}
                    </div>
                    <div className="text-5xl mb-6 transform group-hover:scale-110 transition-transform duration-300">
                      {step.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-4 group-hover:text-green-600 transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-green-600 via-green-700 to-green-800">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Join the Organic Revolution?
            </h2>
            <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
              Connect with verified organic farmers and be part of the sustainable future
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/signup"
                className="group bg-white text-green-600 px-8 py-4 rounded-full hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 font-semibold text-lg shadow-lg"
              >
                <span className="flex items-center justify-center gap-2">
                  Get Started Today
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </span>
              </Link>
              <Link
                to="/contact"
                className="group border-2 border-white text-white px-8 py-4 rounded-full hover:bg-white hover:text-green-600 transition-all duration-300 transform hover:scale-105 font-semibold text-lg"
              >
                Contact Sales
              </Link>
            </div>
          </div>
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