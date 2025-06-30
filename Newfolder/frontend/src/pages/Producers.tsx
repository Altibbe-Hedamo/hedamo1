import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Skeleton } from '@mui/material';
import Footer from '../components/Footer';

interface Producer {
  id: string;
  name: string;
  region: string;
  description: string;
  image: string;
  certifications?: string[];
  years_active?: number;
}

interface ApiResponse<T> {
  success: boolean;
  producers?: T[];
  error?: string;
}

const Producers: React.FC = () => {
  const [producers, setProducers] = useState<Producer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducers = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:3001/api/producers');
        const data: ApiResponse<Producer> = await response.json();
        
        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to fetch producers');
        }
        
        if (data.producers) {
          setProducers(data.producers.slice(0, 6));
        }
      } catch (err) {
        console.error('Error fetching producers:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchProducers();
  }, []);

  return (
    <><div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section
        className="relative h-[400px] sm:h-[500px] flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: 'url(/services/producers/producers-hero.png)' }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            Find Local Producers
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-200 mb-6">
            Connect with authentic organic producers in your region for direct sourcing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="inline-block px-6 sm:px-8 py-2 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-300 text-sm sm:text-base"
            >
              Join as a Producer
            </Link>
            <Link
              to="/producers/how-it-works"
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
          <div className="flex flex-col md:flex-row-reverse items-center gap-8 sm:gap-12 mb-12 sm:mb-16">
            <div className="md:w-1/2">
              <h2 className="text-2xl sm:text-3xl font-bold text-green-800 mb-4">
                Direct Sourcing, Made Simple
              </h2>
              <p className="text-gray-600 mb-6 text-sm sm:text-base leading-relaxed">
                Hedamo empowers you to discover and collaborate with local organic producers. Our platform provides verified producer profiles, including details about their farming practices and certifications.
              </p>
              <ul className="mb-6 space-y-2">
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600 text-sm sm:text-base">Verified producer profiles</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600 text-sm sm:text-base">Detailed farming practices</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600 text-sm sm:text-base">Certification transparency</span>
                </li>
              </ul>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/products"
                  className="inline-block px-4 sm:px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-300 text-sm sm:text-base text-center"
                >
                  Explore Products
                </Link>
                <Link
                  to="/verification-process"
                  className="inline-block px-4 sm:px-6 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition duration-300 text-sm sm:text-base text-center"
                >
                  Our Verification Process
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 h-48 sm:h-64 md:h-80 flex items-center justify-center">
              <div className="relative w-full h-full">
                <img
                  src="/services/producers/local-farmer.png"
                  alt="Local Producer"
                  className="w-fit h-full object-cover rounded-2xl shadow-lg ml-64"
                  loading="lazy" />
                <div className="absolute -bottom-4 -right-4 bg-white p-2 rounded-lg shadow-md">
                  <div className="w-16 h-16 bg-white p-1 flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Producers List */}
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-green-800 mb-2">
              Meet Our Producers
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">
              Discover trusted organic producers in our network
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-lg p-6 border border-green-100">
                  <Skeleton variant="rectangular" width="100%" height={192} className="rounded-lg mb-4" />
                  <Skeleton variant="text" width="60%" height={30} className="mb-2" />
                  <Skeleton variant="text" width="40%" className="mb-2" />
                  <Skeleton variant="text" width="80%" height={60} />
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
          ) : producers.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {producers.map((producer) => (
                  <div
                    key={producer.id}
                    className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-green-100 flex flex-col"
                  >
                    <div className="relative h-48 w-full mb-4 overflow-hidden rounded-lg">
                      <img
                        src={`http://localhost:3001/uploads/producers/${producer.image}`}
                        alt={producer.name}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        loading="lazy" />
                    </div>

                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg sm:text-xl font-semibold text-green-700">
                        {producer.name}
                      </h3>
                      {producer.years_active && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {producer.years_active}+ years
                        </span>
                      )}
                    </div>

                    <div className="mb-3">
                      <p className="text-xs text-gray-500">Region</p>
                      <p className="text-gray-600 text-sm sm:text-base font-medium">
                        {producer.region}
                      </p>
                    </div>

                    <div className="mb-4">
                      <p className="text-xs text-gray-500">About</p>
                      <p className="text-gray-600 text-sm sm:text-base line-clamp-3">
                        {producer.description}
                      </p>
                    </div>

                    {producer.certifications && producer.certifications.length > 0 && (
                      <div className="mt-auto pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-500 mb-1">Certifications</p>
                        <div className="flex flex-wrap gap-1">
                          {producer.certifications.slice(0, 3).map((cert, index) => (
                            <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              {cert}
                            </span>
                          ))}
                          {producer.certifications.length > 3 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                              +{producer.certifications.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="mt-4 pt-3 border-t border-gray-100 text-center">
                      <Link
                        to={`/producers/${producer.id}`}
                        className="text-green-600 hover:text-green-800 text-sm font-medium flex items-center justify-center"
                      >
                        View Full Profile
                        <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center mt-8">
                <Link
                  to="/producers"
                  className="inline-block px-6 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition duration-300 text-sm sm:text-base"
                >
                  View All Producers
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
              <p className="text-gray-500 mb-4">No producers available at this time</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 bg-green-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Ready to connect with producers?
          </h2>
          <p className="text-green-100 max-w-2xl mx-auto mb-6 text-sm sm:text-base">
            Join thousands of businesses sourcing directly from organic producers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="inline-block px-6 sm:px-8 py-2 sm:py-3 bg-white text-green-700 rounded-lg hover:bg-gray-100 transition duration-300 text-sm sm:text-base"
            >
              Create Business Account
            </Link>
            <Link
              to="/contact"
              className="inline-block px-6 sm:px-8 py-2 sm:py-3 border border-white text-white rounded-lg hover:bg-green-600 transition duration-300 text-sm sm:text-base"
            >
              Contact Our Team
            </Link>
          </div>
        </div>
      </section>
    </div><Footer></Footer></>
  );
};

export default Producers;