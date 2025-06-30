import { Link } from 'react-router-dom';
import Footer from '../components/Footer';

const QRReportsHowItWorks: React.FC = () => {
  const steps = [
    {
      title: 'Purchase a Product',
      desc: 'Buy a Hedamo-verified organic product from our marketplace or a partnered retailer.',
      icon: '🛒',
    },
    {
      title: 'Scan the QR Code',
      desc: 'Use your smartphone to scan the QR code printed on the product packaging.',
      icon: '📱',
    },
    {
      title: 'Access the Report',
      desc: 'View the verified purity report, including lab results and product details, instantly.',
      icon: '📄',
    },
    {
      title: 'Verify Authenticity',
      desc: 'Confirm the product’s authenticity and quality with certified lab data.',
      icon: '✅',
    },
  ];

  return (
    <><div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section
        className="relative h-[400px] sm:h-[500px] flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: 'url(/services/qr-report/qr-how-it-works-hero.jpg)' }} // Replace with actual image
      >
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            How QR-Based Purity Reports Work
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-200 mb-6">
            Learn how to access verified purity reports with a simple QR scan.
          </p>
          <Link
            to="/qr-reports"
            className="inline-block px-6 sm:px-8 py-2 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-300 text-sm sm:text-base"
          >
            Back to QR Reports
          </Link>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-800 mb-4">
              Step-by-Step Process
            </h2>
            <div className="w-24 h-1 bg-green-600 mx-auto"></div>
          </div>

          <div className="relative">
            {/* Timeline for desktop */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-green-200 z-0">
              <div className="absolute inset-0 bg-green-500 animate-pulse"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 sm:gap-8 relative z-10">
              {steps.map((step, index) => (
                <div key={index} className="group">
                  <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-green-100 hover:border-green-300 text-center h-full">
                    <div className="relative -mt-12 sm:-mt-14 mb-4 sm:mb-6 mx-auto w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center bg-green-600 text-white text-lg sm:text-xl font-bold rounded-full border-4 border-white shadow-lg">
                      {index + 1}
                    </div>
                    <div className="text-3xl sm:text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                      {step.icon}
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-green-800 mb-4">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 text-sm sm:text-base">
                      {step.desc}
                    </p>
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

      {/* Call to Action */}
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-green-800 mb-4">
            Ready to Explore?
          </h2>
          <p className="text-gray-600 mb-6 text-sm sm:text-base">
            Discover the power of verified purity reports with Hedamo.
          </p>
          <Link
            to="/products"
            className="inline-block px-6 sm:px-8 py-2 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-300 text-sm sm:text-base"
          >
            Browse Products
          </Link>
        </div>
      </section>
    </div><Footer></Footer></>
  );
};

export default QRReportsHowItWorks;