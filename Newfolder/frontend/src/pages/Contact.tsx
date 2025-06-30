import { useState, type FormEvent, useEffect } from 'react';
import axios from 'axios';
import { FaMapMarkerAlt, FaPhoneAlt, FaWhatsapp, FaEnvelopeOpen, FaPaperPlane } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import Footer from '../components/Footer';

const Contact: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [captcha, setCaptcha] = useState({ num1: 0, num2: 0, sum: 0 });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const generateCaptcha = () => {
    const sum = Math.floor(Math.random() * 11) + 10;
    const num1 = Math.floor(Math.random() * (sum - 1)) + 1;
    const num2 = sum - num1;
    return { num1, num2, sum };
  };

  useEffect(() => {
    setCaptcha(generateCaptcha());
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    if (parseInt(captchaInput) !== captcha.sum) {
      setError('Invalid CAPTCHA. Please try again.');
      setCaptcha(generateCaptcha());
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await axios.post('/api/contact', {
        name,
        email,
        subject,
        message,
        captcha_input: parseInt(captchaInput),
      });

      if (response.data.success) {
        setSuccess(response.data.message || 'Your message has been sent successfully!');
        setName('');
        setEmail('');
        setSubject('');
        setMessage('');
        setCaptchaInput('');
        setCaptcha(generateCaptcha());
      } else {
        setError(response.data.error || 'Failed to send message');
      }
    } catch (err) {
      setError('Failed to send message. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Contact Info Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 sm:mb-16"
        >
          {/* Address Card */}
          <motion.div
            whileHover={{ y: -5 }}
            className="bg-white p-4 sm:p-6 rounded-xl shadow-md flex items-start border border-gray-100"
          >
            <div className="p-3 bg-green-50 rounded-full mr-4">
              <FaMapMarkerAlt className="text-green-600 text-xl" />
            </div>
            <div>
              <h3 className="text-green-600 font-semibold mb-1 text-sm sm:text-base">Address</h3>
              <p className="text-gray-600 text-xs sm:text-sm">
                9100 Wilshire Blvd, Ste # 333, #189 Beverly Hills, California 90212 USA.
              </p>
            </div>
          </motion.div>

          {/* Phone Card */}
          <motion.div
            whileHover={{ y: -5 }}
            className="bg-white p-4 sm:p-6 rounded-xl shadow-md flex items-start border border-gray-100"
          >
            <div
              className="p-3 bg-green-50 rounded-full mr-4">
              <FaPhoneAlt className="text-green-600 text-xl" />
            </div>
            <div>
              <h3 className="text-green-600 font-semibold mb-1 text-sm sm:text-base">Call Now</h3>
              <p className="text-gray-600 text-xs sm:text-sm">+1 302 203 9295</p>
            </div>
          </motion.div>

          {/* WhatsApp Card */}
          <motion.div
            whileHover={{ y: -5 }}
            className="bg-white p-4 sm:p-6 rounded-xl shadow-md flex items-start border border-gray-100"
          >
            <div className="p-3 bg-green-50 rounded-full mr-4">
              <FaWhatsapp className="text-green-600 text-xl" />
            </div>
            <div>
              <h3 className="text-green-600 font-semibold mb-1 text-sm sm:text-base">WhatsApp Now</h3>
              <p className="text-gray-600 text-xs sm:text-sm">+91 9614079999</p>
            </div>
          </motion.div>

          {/* Email Card */}
          <motion.div
            whileHover={{ y: -5 }}
            className="bg-white p-4 sm:p-6 rounded-xl shadow-md flex items-start border border-gray-100"
          >
            <div className="p-3 bg-green-50 rounded-full mr-4">
              <FaEnvelopeOpen className="text-green-600 text-xl" />
            </div>
            <div>
              <h3 className="text-green-600 font-semibold mb-1 text-sm sm:text-base">Mail Now</h3>
              <p className="text-gray-600 text-xs sm:text-sm">ops@altibbe.com</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Contact Form and Map */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-white p-6 sm:p-8 rounded-xl shadow-md border border-gray-100"
          >
            <div className="mb-6 sm:mb-8">
              <span className="text-green-600 font-semibold text-sm sm:text-base">Contact Us</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mt-2 mb-4">Have Any Query?</h2>
              <p className="text-gray-600 text-sm sm:text-base">
                Fill out the form and we'll get back to you as soon as possible.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div className="space-y-1">
                  <label htmlFor="name" className="text-gray-700 font-medium text-sm sm:text-base">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-sm sm:text-base"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="email" className="text-gray-700 font-medium text-sm sm:text-base">
                    Your Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-sm sm:text-base"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="subject" className="text-gray-700 font-medium text-sm sm:text-base">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-sm sm:text-base"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="message" className="text-gray-700 font-medium text-sm sm:text-base">
                  Message
                </label>
                <textarea
                  id="message"
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-sm sm:text-base"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="captcha" className="text-gray-700 font-medium text-sm sm:text-base">
                  CAPTCHA: What is {captcha.num1} + {captcha.num2}?
                </label>
                <input
                  type="number"
                  id="captcha"
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  required
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-sm sm:text-base"
                />
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-3 bg-red-50 text-red-600 rounded-lg text-sm"
                  >
                    {error}
                  </motion.div>
                )}
  {success && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-3 bg-green-50 text-green-600 rounded-lg text-sm"
                  >
                    {success}
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-6 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-70 flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  <>
                    Send Message <FaPaperPlane className="ml-1" />
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>

          {/* Map */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="h-[300px] sm:h-[400px] rounded-xl overflow-hidden shadow-md border border-gray-200"
          >
            <iframe
              className="w-full h-full"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3093.7980142074884!2d-75.5241715!3d39.156575499999995!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c76500429a24f7%3A0xaf44571251d72299!2sITAXR%20INC!5e0!3m2!1sen!2sin!4v1734621299948!5m2!1sen!2sin"
              frameBorder="0"
              allowFullScreen
              aria-hidden="false"
              tabIndex={0}
              loading="lazy"
            />
          </motion.div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Contact;