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

  useEffect(() => {
    fetch('http://localhost:3001/api/products?sort=recent')
      .then((res) => res.json())
      .then((data: ApiResponse<Product>) => {
        if (data.success && data.products) {
          setProducts(data.products.slice(0, 3));
        }
      })
      .catch((error) => console.error('Error fetching products:', error));
  }, []);

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section
        className="relative h-[500px] sm:h-[600px] md:h-[650px] flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: `url(${heroBackground})` }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6">
            Redefining Organic Trust with Verified <br />Purity & Global Reach
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-200 mb-6 sm:mb-8">
            Connecting organic farmers with the world through verified reports, <br />B2B connections, and direct consumer engagement.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/products"
              className="bg-white text-green-600 px-4 sm:px-6 py-2 sm:py-3 rounded-full hover:bg-gray-50 transition-all duration-300 hover:scale-105 font-medium text-sm sm:text-base"
            >
              Explore Products
            </Link>
            <Link
              to="/signup"
              className="bg-white text-green-600 px-4 sm:px-6 py-2 sm:py-3 rounded-full hover:bg-gray-50 transition-all duration-300 hover:scale-105 font-medium text-sm sm:text-base"
            >
              Join as a Producer
            </Link>
          </div>
        </div>
      </section>

      {/* Product Categories */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            Find Products By <span className="text-green-600">Category</span>
          </h2>
          <p className="text-gray-500 mb-8 sm:mb-12 text-sm sm:text-base">Organic products</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
            {[
              { name: 'Food', image: '/product/food.webp', cat: 'food' },
              { name: 'Clothing', image: '/product/clothing.webp', cat: 'cloth' },
              { name: 'Cosmetics', image: '/product/cosmetics.webp', cat: 'cosmetics' },
            ].map(({ name, image, cat }) => (
              <Link
                key={name}
                to={`/products?cat=${cat}`}
                className="group bg-white border border-gray-200 rounded-2xl overflow-hidden p-0 transition-all duration-300 hover:shadow-xl hover:-translate-y-2"
              >
                <div className="relative h-48 sm:h-60 overflow-hidden">
                  <img
                    src={image}
                    alt={name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                </div>
                <div className="p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-800 group-hover:text-green-600 transition-colors">
                    {name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recently Added Products */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-2">
              Recently Added Products
            </h2>
            <p className="text-base sm:text-lg text-gray-500">Handpicked And 100% Organically Grown</p>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {products.map((product) => (
                <Link
                  to={`/${product.category_name.toLowerCase().replace(' ', '-')}/${product.company_name
                    .toLowerCase()
                    .replace(' ', '-')}/${product.name.toLowerCase().replace(' ', '-')}-p-${product.id}`}
                  key={product.id}
                  className="group bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
                >
                  <div className="relative h-48 sm:h-64 overflow-hidden">
                    <img
                      src={`http://localhost:3001/uploads/products/${product.image}`}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-semibold text-green-700 mb-2">{product.name}</h3>
                    <p className="text-gray-600 line-clamp-2 text-sm sm:text-base">{product.description}</p>
                    <div className="mt-4 flex items-center">
                      <span className="text-sm text-gray-500">By {product.company_name}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8 sm:py-12 text-sm sm:text-base">No products available</p>
          )}
        </div>
      </section>

      {/* About Us */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-8 sm:gap-12">
            <div className="lg:w-1/2">
              <div className="space-y-4 sm:space-y-6">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-800">About Us</h2>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold text-green-600">
                  The Future of Organic Commerce
                </h3>
                <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                  Hedamo is an exclusive platform designed to empower organic farmers by ensuring transparency, authenticity, and global reach. Every product listed on our platform carries a Hedamo QR Report, providing unparalleled trust to buyers and businesses worldwide.
                </p>
                <Link
                  to="/about"
                  className="inline-block px-6 sm:px-8 py-2 sm:py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition duration-300 shadow-md hover:shadow-lg text-sm sm:text-base"
                >
                  Read More
                </Link>
              </div>
            </div>
            <div className="lg:w-1/2 h-80 sm:h-96 lg:h-[500px] overflow-hidden">
              <img
                src="/h2.jpg"
                alt="Organic farming"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Core Services */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-800 mb-4">
              Core Services
            </h2>
            <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-green-600">
              Helping & Growing Organic Farming
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
            {/* Service 1 */}
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-green-100 hover:border-green-300">
              <div className="text-green-600 mb-4 sm:mb-6 flex justify-center">
                <svg className="w-10 h-10 sm:w-12 sm:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-green-800 mb-4 text-center">
                QR-Based Purity Reports
              </h3>
              <p className="text-gray-600 mb-4 sm:mb-6 text-center text-sm sm:text-base">
                Every product on Hedamo comes with a verified report showcasing purity, chemical composition, and technical details.
              </p>
              <div className="text-center">
                <Link
                  to="/services#qr-reports"
                  className="inline-block px-4 sm:px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-300 text-sm sm:text-base"
                >
                  Learn More
                </Link>
              </div>
            </div>

            {/* Service 2 */}
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-green-100 hover:border-green-300">
              <div className="text-green-600 mb-4 sm:mb-6 flex justify-center">
                <svg className="w-10 h-10 sm:w-12 sm:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  ></path>
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-green-800 mb-4 text-center">
                Global B2B Marketplace
              </h3>
              <p className="text-gray-600 mb-4 sm:mb-6 text-center text-sm sm:text-base">
                Seamless trade opportunities for organic farmers, exporters, and businesses across the globe with reliable verified reports.
              </p>
              <div className="text-center">
                <Link
                  to="/services#marketplace"
                  className="inline-block px-4 sm:px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-300 text-sm sm:text-base"
                >
                  Learn More
                </Link>
              </div>
            </div>

            {/* Service 3 */}
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-green-100 hover:border-green-300">
              <div className="text-green-600 mb-4 sm:mb-6 flex justify-center">
                <svg className="w-10 h-10 sm:w-12 sm:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  ></path>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  ></path>
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-green-800 mb-4 text-center">
                Find Producers Locally
              </h3>
              <p className="text-gray-600 mb-4 sm:mb-6 text-center text-sm sm:text-base">
                Find authentic organic producers in your region for direct sourcing and collaboration.
              </p>
              <div className="text-center">
                <Link
                  to="/services#local-producers"
                  className="inline-block px-4 sm:px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-300 text-sm sm:text-base"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-800 mb-4">How It Works</h2>
            <div className="w-24 h-1 bg-green-600 mx-auto"></div>
          </div>

          <div className="relative">
            {/* Timeline for desktop */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-green-200 z-0">
              <div className="absolute inset-0 bg-green-500 animate-pulse"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 sm:gap-8 relative z-10">
              {[
                {
                  title: 'Sign Up',
                  desc: 'Farmers and buyers create an account to access the platform.',
                  icon: '👥',
                },
                {
                  title: 'Examine And Report',
                  desc: 'We examine the product and verify the facts and list the products.',
                  icon: '🔍',
                },
                {
                  title: 'Consumer Report',
                  desc: 'Consumers and Traders scan QR code to get reports of the product and producer.',
                  icon: '📱',
                },
                {
                  title: 'Global Traders',
                  desc: 'Global buyers connect with the desired product farmers and trade securely.',
                  icon: '🌎',
                },
              ].map((step, index) => (
                <div key={index} className="group">
                  <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-green-100 hover:border-green-300 text-center h-full">
                    <div className="relative -mt-12 sm:-mt-14 mb-4 sm:mb-6 mx-auto w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center bg-green-600 text-white text-lg sm:text-xl font-bold rounded-full border-4 border-white shadow-lg">
                      {index + 1}
                    </div>
                    <div className="text-3xl sm:text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                      {step.icon}
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-green-800 mb-4">{step.title}</h3>
                    <p className="text-gray-600 text-sm sm:text-base">{step.desc}</p>
                    <div className="md:hidden mt-4 sm:mt-6">
                      <div className="w-3 h-3 bg-green-500 rounded-full mx-auto animate-bounce"></div>
                    </div>
                  </div>
                </div>
              ))}
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