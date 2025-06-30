import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';

const Services: React.FC = () => {
  const location = useLocation();
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // Scroll to the section specified in the URL fragment and track active section
  useEffect(() => {
    const hash = location.hash;
    if (hash) {
      const sectionId = hash.replace('#', '');
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        setActiveSection(sectionId);
      }
    } else {
      setActiveSection(null);
    }

    // Intersection Observer for section tracking
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        threshold: 0.5,
        rootMargin: '0px 0px -50% 0px',
      }
    );

    const sections = document.querySelectorAll('section[id]');
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [location]);

  // Smooth scroll for anchor links
  const handleAnchorClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      window.history.pushState({}, '', `#${id}`);
    }
  };

  const services = [
    {
      id: 'qr-reports',
      title: 'QR-Based Purity Reports',
      description: 'At Hedamo, transparency is paramount. Every product listed on our platform comes with a QR-based purity report, providing detailed insights into the product\'s purity, chemical composition, and technical specifications. These reports are verified by certified labs, ensuring trust and authenticity for buyers and businesses worldwide. Scan the QR code to access real-time data about your organic products.',
      image: '/services/qrcode.jpg',
      link: '/qr-reports',
      features: [
        'Instant product verification',
        'Lab-certified purity data',
        'Detailed chemical composition',
        'Tamper-proof reports'
      ]
    },
    {
      id: 'marketplace',
      title: 'Global B2B Marketplace',
      description: 'Hedamo\'s Global B2B Marketplace connects organic farmers, exporters, and businesses across the globe. Our platform facilitates seamless trade opportunities, backed by verified purity reports to ensure product authenticity. Whether you\'re sourcing bulk organic goods or expanding your market reach, Hedamo provides a secure and reliable environment for international commerce.',
      image: '/services/b2b.jpg',
      link: '/marketplace',
      features: [
        'Verified international suppliers',
        'Secure transaction platform',
        'Bulk order management',
        'Multi-language support'
      ]
    },
    {
      id: 'local-producers',
      title: 'Find Producers Locally',
      description: 'Discover authentic organic producers in your region with Hedamo\'s local sourcing feature. Our platform enables direct collaboration between buyers and nearby farmers, fostering sustainable partnerships and reducing supply chain complexities. Access verified producer profiles and connect for direct sourcing, ensuring freshness and quality.',
      image: '/services/local.jpg',
      link: '/producers',
      features: [
        'Geo-located producers',
        'Direct messaging system',
        'Farm visit scheduling',
        'Seasonal availability tracking'
      ]
    }
  ];

  return (
    <><div className="min-h-screen bg-white">
      {/* Sticky navigation */}
      <div className="sticky top-0 z-10 bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex overflow-x-auto space-x-4 hide-scrollbar">
            {services.map((service) => (
              <a
                key={service.id}
                href={`#${service.id}`}
                onClick={(e) => handleAnchorClick(e, service.id)}
                className={`whitespace-nowrap px-4 py-2 rounded-full transition-colors ${activeSection === service.id ? 'bg-green-600 text-white' : 'bg-green-50 text-green-800 hover:bg-green-100'}`}
              >
                {service.title}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 sm:py-16">
        <div className="text-center max-w-4xl mx-auto mb-12 sm:mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-green-800 mb-4">
            Our Services
          </h1>
          <p className="text-lg text-gray-600">
            Empowering organic trade with transparency and technology. Explore how Hedamo connects producers and buyers with verified quality assurance.
          </p>
        </div>

        {services.map((service, index) => (
          <section
            key={service.id}
            id={service.id}
            className={`mb-12 sm:mb-16 bg-white border border-green-100 rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl ${activeSection === service.id ? 'ring-2 ring-green-500' : ''}`}
          >
            <div className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-6 sm:gap-8`}>
              <div className="md:w-1/2 p-6 sm:p-8">
                <div className="flex items-center mb-3">
                  <div className="bg-green-100 text-green-800 rounded-full w-8 h-8 flex items-center justify-center mr-3 font-bold">
                    {index + 1}
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-green-800">
                    {service.title}
                  </h2>
                </div>
                <p className="text-gray-600 mb-6 text-sm sm:text-base leading-relaxed">
                  {service.description}
                </p>

                <div className="mb-6">
                  <h3 className="font-semibold text-green-700 mb-2">Key Features:</h3>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {service.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <svg className="w-4 h-4 text-green-500 mt-1 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-600 text-sm sm:text-base">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    to={service.link}
                    className="inline-flex items-center px-4 sm:px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-300 text-sm sm:text-base"
                  >
                    Learn More
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                  <button className="inline-flex items-center px-4 sm:px-6 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition duration-300 text-sm sm:text-base">
                    Watch Demo
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="md:w-1/2 h-64 sm:h-80 md:h-96 relative">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover"
                  loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent flex items-end p-6">
                  <span className="text-white font-medium text-lg">{service.title}</span>
                </div>
              </div>
            </div>
          </section>
        ))}

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-green-700 to-green-900 rounded-2xl p-8 sm:p-12 text-center text-white">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Ready to experience Hedamo?</h2>
          <p className="max-w-2xl mx-auto mb-6 opacity-90">
            Join our platform today and discover how we're transforming organic trade with transparency and technology.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-green-800 font-medium rounded-lg hover:bg-gray-100 transition duration-300"
            >
              Sign Up Now
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center px-6 py-3 border border-white text-white font-medium rounded-lg hover:bg-white/10 transition duration-300"
            >
              Contact Sales
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </Link>
          </div>
        </section>
      </div>

      {/* <style jsx>{`
      .hide-scrollbar {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
      .hide-scrollbar::-webkit-scrollbar {
        display: none;
      }
    `}</style> */}
    </div><Footer></Footer></>
  );
};

export default Services;