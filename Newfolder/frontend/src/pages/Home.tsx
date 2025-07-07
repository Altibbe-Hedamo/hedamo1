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
    <div className="bg-white">
      {/* Hero Section - Michelin Guide inspired */}
      <section className="relative h-screen bg-gray-900 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroBackground}
            alt="Organic farming"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/20 via-gray-900/40 to-gray-900/80"></div>
        </div>
        
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="text-center px-6 max-w-5xl mx-auto">
            <div className="mb-6">
              <span className="inline-block bg-green-600 text-white px-6 py-2 rounded-full text-sm font-medium tracking-wide uppercase">
                Verified Organic Excellence
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-light text-white mb-8 leading-tight tracking-tight">
              Discover and book
              <br />
              <span className="font-normal">organic products</span>
              <br />
              selected by <span className="font-semibold text-green-400">Hedamo</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-12 max-w-3xl mx-auto font-light leading-relaxed">
              The world's most trusted platform for verified organic products and sustainable farming connections
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/products"
                className="bg-green-600 text-white px-10 py-4 rounded-sm hover:bg-green-700 transition-all duration-300 font-medium text-lg tracking-wide uppercase"
              >
                Explore Products
              </Link>
              <Link
                to="/signup"
                className="border-2 border-white text-white px-10 py-4 rounded-sm hover:bg-white hover:text-gray-900 transition-all duration-300 font-medium text-lg tracking-wide uppercase"
              >
                Join Platform
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Stats - Michelin style */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { number: '1,000+', label: 'Verified Products', sublabel: 'Organic certified' },
              { number: '500+', label: 'Organic Farmers', sublabel: 'Trusted partners' },
              { number: '50+', label: 'Countries', sublabel: 'Global reach' },
              { number: '99.9%', label: 'Trust Score', sublabel: 'Customer satisfaction' }
            ].map((stat, index) => (
              <div key={index} className="group">
                <div className="text-4xl md:text-5xl font-light text-gray-900 mb-2 group-hover:text-green-600 transition-colors duration-300">
                  {stat.number}
                </div>
                <div className="text-gray-700 font-medium mb-1">{stat.label}</div>
                <div className="text-sm text-gray-500">{stat.sublabel}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Categories - Clean grid layout */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-light text-gray-900 mb-4">
              Product Categories
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto font-light">
              Explore our carefully curated selection of organic products across different categories
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                name: 'Food & Beverages', 
                image: '/product/food.webp', 
                cat: 'food', 
                description: 'Fresh organic produce, grains, and beverages',
                count: '450+ Products'
              },
              { 
                name: 'Sustainable Clothing', 
                image: '/product/clothing.webp', 
                cat: 'cloth', 
                description: 'Eco-friendly fashion and organic textiles',
                count: '280+ Products'
              },
              { 
                name: 'Natural Cosmetics', 
                image: '/product/cosmetics.webp', 
                cat: 'cosmetics', 
                description: 'Pure beauty products and skincare',
                count: '150+ Products'
              },
            ].map(({ name, image, cat, description, count }) => (
              <Link
                key={name}
                to={`/products?cat=${cat}`}
                className="group bg-white border border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-lg"
              >
                <div className="aspect-w-16 aspect-h-10 overflow-hidden">
                  <img
                    src={image}
                    alt={name}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
                <div className="p-8">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-medium text-gray-900 group-hover:text-green-600 transition-colors">
                      {name}
                    </h3>
                    <span className="text-sm text-gray-500 font-medium">{count}</span>
                  </div>
                  <p className="text-gray-600 leading-relaxed">{description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recently Added Products - Michelin card style */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-light text-gray-900 mb-4">
              Recently Added
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto font-light">
              Discover the latest organic products from our verified farmers and producers
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-green-600 border-t-transparent"></div>
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product, index) => (
                <Link
                  to={`/${product.category_name.toLowerCase().replace(' ', '-')}/${product.company_name
                    .toLowerCase()
                    .replace(' ', '-')}/${product.name.toLowerCase().replace(' ', '-')}-p-${product.id}`}
                  key={product.id}
                  className="group bg-white border border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-lg"
                >
                  <div className="aspect-w-16 aspect-h-10 overflow-hidden">
                    <img
                      src={`${API_URL}/uploads/products/${product.image}`}
                      alt={product.name}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-8">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-green-600 font-medium uppercase tracking-wide">
                        {product.category_name}
                      </span>
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                        New
                      </span>
                    </div>
                    <h3 className="text-xl font-medium text-gray-900 mb-3 group-hover:text-green-600 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-gray-600 line-clamp-2 mb-4 leading-relaxed">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        By {product.company_name}
                      </span>
                      <span className="text-green-600 font-medium group-hover:underline">
                        View Details
                      </span>
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

      {/* About Section - Michelin inspired layout */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="mb-6">
                <span className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
                  About Hedamo
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-light text-gray-900 mb-6 leading-tight">
                The future of organic commerce
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed font-light">
                Hedamo is the world's most trusted platform for verified organic products. We connect conscious consumers with authentic organic farmers through our rigorous verification process and QR-based authenticity reports.
              </p>
              <div className="space-y-4 mb-8">
                {[
                  'QR-verified authenticity reports',
                  'Direct farmer-to-consumer connections',
                  'Global marketplace for organic products',
                  'Sustainable farming support'
                ].map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-2 h-2 bg-green-600 rounded-full mr-4"></div>
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/about"
                  className="bg-green-600 text-white px-8 py-3 rounded-sm hover:bg-green-700 transition-all duration-300 font-medium text-center"
                >
                  Learn More
                </Link>
                <Link
                  to="/contact"
                  className="border border-gray-300 text-gray-700 px-8 py-3 rounded-sm hover:border-gray-400 transition-all duration-300 font-medium text-center"
                >
                  Contact Us
                </Link>
              </div>
            </div>
            <div className="relative">
              <img
                src="/h2.jpg"
                alt="Organic farming"
                className="w-full h-[500px] object-cover rounded-sm"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-sm"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Services - Clean card layout */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-light text-gray-900 mb-4">
              Our Services
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto font-light">
              Comprehensive solutions for organic farming and sustainable commerce
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'QR Verification Reports',
                desc: 'Every product comes with a comprehensive QR-based authenticity report, ensuring complete transparency about origin, farming practices, and quality standards.',
                icon: '📊',
                link: '/services#qr-reports'
              },
              {
                title: 'Global B2B Marketplace',
                desc: 'Connect with verified organic farmers and suppliers worldwide. Our platform facilitates secure transactions and reliable supply chain management.',
                icon: '🌐',
                link: '/services#marketplace'
              },
              {
                title: 'Local Producer Network',
                desc: 'Discover authentic organic producers in your region. Build direct relationships with local farmers and support sustainable agriculture.',
                icon: '🗺️',
                link: '/services#local-producers'
              }
            ].map((service, index) => (
              <div key={index} className="bg-white border border-gray-200 p-8 hover:border-gray-300 hover:shadow-lg transition-all duration-300 group">
                <div className="text-4xl mb-6">{service.icon}</div>
                <h3 className="text-xl font-medium text-gray-900 mb-4 group-hover:text-green-600 transition-colors">
                  {service.title}
                </h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  {service.desc}
                </p>
                <Link
                  to={service.link}
                  className="inline-flex items-center text-green-600 font-medium hover:text-green-700 transition-colors"
                >
                  Learn More
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - Minimal timeline */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-light text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto font-light">
              Simple steps to connect with verified organic products and farmers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: '01',
                title: 'Create Account',
                desc: 'Sign up as a buyer or farmer to access our verified organic marketplace and connect with like-minded partners.'
              },
              {
                step: '02',
                title: 'Verification Process',
                desc: 'Our experts examine and verify all products, ensuring they meet strict organic standards and quality requirements.'
              },
              {
                step: '03',
                title: 'QR Authentication',
                desc: 'Each product receives a unique QR code linking to detailed reports about origin, farming practices, and certifications.'
              },
              {
                step: '04',
                title: 'Secure Trading',
                desc: 'Connect with verified partners worldwide and engage in secure, transparent transactions with full traceability.'
              }
            ].map((step, index) => (
              <div key={index} className="text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 text-green-600 rounded-full text-xl font-medium mb-6 group-hover:bg-green-600 group-hover:text-white transition-all duration-300">
                  {step.step}
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-4 group-hover:text-green-600 transition-colors">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Michelin style */}
      <section className="py-24 bg-gray-900">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-light text-white mb-6">
            Ready to discover verified organic products?
          </h2>
          <p className="text-xl text-gray-300 mb-10 font-light">
            Join thousands of conscious consumers and farmers who trust Hedamo for authentic organic commerce
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="bg-green-600 text-white px-10 py-4 rounded-sm hover:bg-green-700 transition-all duration-300 font-medium text-lg"
            >
              Get Started Today
            </Link>
            <Link
              to="/products"
              className="border-2 border-white text-white px-10 py-4 rounded-sm hover:bg-white hover:text-gray-900 transition-all duration-300 font-medium text-lg"
            >
              Browse Products
            </Link>
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