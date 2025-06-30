import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Skeleton } from '@mui/material';
import Footer from '../components/Footer';

interface Report {
  id: string;
  product_name: string;
  purity: string;
  composition: string;
  date: string;
  lab_certified?: boolean;
  batch_number?: string;
}

interface ApiResponse<T> {
  success: boolean;
  reports?: T[];
  error?: string;
}

const QRReports: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:3001/api/reports');
        const data: ApiResponse<Report> = await response.json();
        
        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to fetch reports');
        }
        
        if (data.reports) {
          setReports(data.reports.slice(0, 3));
        }
      } catch (err) {
        console.error('Error fetching reports:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  return (
    <><div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section
        className="relative h-[400px] sm:h-[500px] flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: 'url(/services/qr-report/qrhero.png)' }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            QR-Based Purity Reports
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-200 mb-6">
            Access verified purity reports for every Hedamo product with a simple QR scan.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/products"
              className="inline-block px-6 sm:px-8 py-2 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-300 text-sm sm:text-base"
            >
              Explore Products
            </Link>
            <Link
              to="/qr-reports/how-it-works"
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
                Unparalleled Transparency
              </h2>
              <p className="text-gray-600 mb-6 text-sm sm:text-base leading-relaxed">
                Hedamo's QR-Based Purity Reports provide detailed insights into each product's purity,
                chemical composition, and technical specifications. Verified by certified laboratories,
                these reports ensure trust and authenticity for buyers worldwide.
              </p>
              <ul className="mb-6 space-y-2">
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600 text-sm sm:text-base">Instant access via QR code scan</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600 text-sm sm:text-base">Laboratory-certified results</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600 text-sm sm:text-base">Batch-specific information</span>
                </li>
              </ul>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/signup"
                  className="inline-block px-4 sm:px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-300 text-sm sm:text-base text-center"
                >
                  Join as a Producer
                </Link>
                <Link
                  to="/verify-report"
                  className="inline-block px-4 sm:px-6 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition duration-300 text-sm sm:text-base text-center"
                >
                  Verify a Report
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 h-48 sm:h-64 md:h-80 flex items-center justify-center">
              <div className="relative w-full h-full">
                <img
                  src="/services/qr-report/qr-report-sample.png"
                  alt="Sample QR Report"
                  className="w-full h-full object-cover rounded-2xl shadow-lg"
                  loading="lazy" />
                <div className="absolute -bottom-4 -right-4 bg-white p-2 rounded-lg shadow-md">
                  <div className="w-16 h-16 bg-white p-1 flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sample Reports Section */}
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-green-800 mb-2">
              Sample Reports
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">
              Explore our latest laboratory-verified product reports
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-lg p-6 border border-green-100">
                  <Skeleton variant="text" width="60%" height={30} className="mb-4" />
                  <Skeleton variant="text" width="40%" className="mb-2" />
                  <Skeleton variant="text" width="80%" className="mb-2" />
                  <Skeleton variant="text" width="50%" />
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
          ) : reports.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-green-100 flex flex-col"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg sm:text-xl font-semibold text-green-700">
                        {report.product_name}
                      </h3>
                      {report.lab_certified && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Certified
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <div>
                        <p className="text-xs text-gray-500">Purity</p>
                        <p className="text-gray-600 text-sm sm:text-base font-medium">
                          {report.purity}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Batch</p>
                        <p className="text-gray-600 text-sm sm:text-base font-medium">
                          {report.batch_number || 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-xs text-gray-500">Composition</p>
                      <p className="text-gray-600 text-sm sm:text-base">
                        {report.composition}
                      </p>
                    </div>

                    <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
                      <p className="text-gray-500 text-xs">
                        {new Date(report.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                      <Link
                        to={`/reports/${report.id}`}
                        className="text-green-600 hover:text-green-800 text-sm font-medium flex items-center"
                      >
                        View Details
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
                  to="/reports"
                  className="inline-block px-6 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition duration-300 text-sm sm:text-base"
                >
                  View All Reports
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
              <p className="text-gray-500 mb-4">No reports available at this time</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 bg-green-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Ready to experience transparency?
          </h2>
          <p className="text-green-100 max-w-2xl mx-auto mb-6 text-sm sm:text-base">
            Scan any Hedamo product QR code to access complete purity reports and technical specifications.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/download-app"
              className="inline-block px-6 sm:px-8 py-2 sm:py-3 bg-white text-green-700 rounded-lg hover:bg-gray-100 transition duration-300 text-sm sm:text-base"
            >
              Download Our App
            </Link>
            <Link
              to="/contact"
              className="inline-block px-6 sm:px-8 py-2 sm:py-3 border border-white text-white rounded-lg hover:bg-green-600 transition duration-300 text-sm sm:text-base"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </section>
    </div><Footer></Footer></>
  );
};

export default QRReports;