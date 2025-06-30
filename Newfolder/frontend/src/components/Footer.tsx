import { FaMapMarkerAlt, FaEnvelope, FaTwitter, FaFacebookF, FaYoutube, FaLinkedinIn, FaWhatsapp } from 'react-icons/fa';
import { BsTelephone } from "react-icons/bs";
import { useLocation, Link } from 'react-router-dom';

const Footer = () => {
  const location = useLocation();

  const hideFooterPaths = [
    '/dashboard',
    '/agent-dashboard',
    '/client-dashboard',
    '/agent-profile',
    '/admin-dashboard',
    '/hr-dashboard'
  ];

  const shouldHideFooter = hideFooterPaths.some(path => location.pathname.startsWith(path));

  if (shouldHideFooter) {
    return null;
  }

  return (
    <div
      className="w-full text-light pt-20 relative bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('/footer.jpg')",
      }}
    >
      <div className="absolute inset-0 "></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="col-span-1">
            <img src="hedamo-logo.webp" className="w-full" alt="Hedamo Logo" />
          </div>

          <div className="col-span-1">
            <h5 className="text-white text-xl font-semibold mb-6">Quick Links</h5>
            <div className="flex flex-col space-y-2">
              <Link className="text-gray-300 hover:text-white transition" to="/about">About Us</Link>
              <Link className="text-gray-300 hover:text-white transition" to="/contact">Contact Us</Link>
              <Link className="text-gray-300 hover:text-white transition" to="/signup">Signup</Link>
              <Link className="text-gray-300 hover:text-white transition" to="/login">Login</Link>
            </div>
          </div>

          <div className="col-span-1">
            <h5 className="text-white text-xl font-semibold mb-6">Company</h5>
            <div className="flex flex-col space-y-2">
              <Link className="text-gray-300 hover:text-white transition" to="/privacy-policy">Privacy Policy</Link>
              <Link className="text-gray-300 hover:text-white transition" to="/terms-and-conditions">Terms & Condition</Link>
              <Link className="text-gray-300 hover:text-white transition" to="/refund-policy">Refund Policy</Link>
            </div>
          </div>

          <div className="col-span-1">
            <h5 className="text-white text-xl font-semibold mb-6">US Office</h5>
            <p className="mb-4 flex items-start text-gray-300">
              <FaMapMarkerAlt className="mt-1 mr-3 flex-shrink-0" />
              9100 Wilshire Blvd, Ste # 333, #189 Beverly Hills, California 90212 USA.
            </p>
            <h5 className="text-white text-xl font-semibold mb-6">India Office</h5>
            <p className="mb-4 flex items-start text-gray-300">
              <FaMapMarkerAlt className="mt-1 mr-3 flex-shrink-0" />
              8-2-611/1/2 Road No 11, Banjara Hills, Hyderabad Telangana 500034, INDIA
            </p>
            <p className="mb-4 flex items-center text-gray-300">
              <BsTelephone className="mr-3 flex-shrink-0" />
              +1 424 400 8899
            </p>
            <p className="mb-4 flex items-center text-gray-300">
              <FaWhatsapp className="mr-3 flex-shrink-0" />
              +91 9866133639
            </p>
            <p className="mb-4 flex items-center text-gray-300">
              <FaEnvelope className="mr-3 flex-shrink-0" />
              connect@hedamo.com
            </p>
            <div className="flex space-x-2 pt-4">
              <Link
                to="#"
                className="w-10 h-10 rounded-full border border-gray-400 flex items-center justify-center text-gray-300 hover:text-white hover:border-white transition"
              >
                <FaTwitter />
              </Link>
              <Link
                to="#"
                className="w-10 h-10 rounded-full border border-gray-400 flex items-center justify-center text-gray-300 hover:text-white hover:border-white transition"
              >
                <FaFacebookF />
              </Link>
              <Link
                to="#"
                className="w-10 h-10 rounded-full border border-gray-400 flex items-center justify-center text-gray-300 hover:text-white hover:border-white transition"
              >
                <FaYoutube />
              </Link>
              <Link
                to="#"
                className="w-10 h-10 rounded-full border border-gray-400 flex items-center justify-center text-gray-300 hover:text-white hover:border-white transition"
              >
                <FaLinkedinIn />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="py-6 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-center items-center">
            <div className="text-center mb-4 md:mb-0 text-gray-300">
              © Copyright 2025 hedamo All Rights Reserved.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
