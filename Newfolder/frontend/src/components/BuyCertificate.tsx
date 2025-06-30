import { useState, type FormEvent } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiX, FiArrowRight } from 'react-icons/fi';
import Footer from './Footer';

const BuyCertificate: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [plan, setPlan] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openModal = (planValue: string) => {
    setPlan(planValue);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setName('');
    setPhone('');
    setEmail('');
    setPlan('');
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      const response = await axios.post('/api/checkout', { name, phone, email, plan });
      if (response.data.success) {
        setSuccess(response.data.message || 'Checkout successful! We will contact you shortly.');
        setTimeout(closeModal, 3000);
      } else {
        setError(response.data.error || 'Checkout failed. Please try again.');
      }
    } catch (err) {
      setError('An error occurred during checkout. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { type: 'spring', damping: 20 } }
  };

  return (
    <><section className="py-16 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                  className="text-center mb-12"
              >
                  <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                      Get Your Organic Certification
                  </h2>
                  <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                      Choose the perfect plan for your needs and boost your market credibility with our trusted certification.
                  </p>
              </motion.div>

              <div className="flex flex-wrap gap-8 justify-center">
                  {/* Organic Essential */}
                  <motion.div
                      variants={cardVariants}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                      className="w-80 min-h-[420px] border-2 border-gray-200 rounded-xl p-6 text-center bg-white hover:shadow-lg transition-all duration-300 relative overflow-hidden group"
                  >
                      <div className="absolute inset-0 bg-gradient-to-br from-teal-50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-3 relative z-10">Organic Essential</h3>
                      <div className="text-3xl font-bold text-black relative z-10">
                          ₹499 <del className="text-sm text-gray-400 ml-2">₹1999</del>
                      </div>
                      <span className="inline-block px-4 py-1 text-xs font-semibold text-teal-600 bg-teal-100 rounded-full mt-3 relative z-10">
                          Includes 1 Product
                      </span>
                      <hr className="my-6 border-gray-200 relative z-10" />
                      <ul className="text-left space-y-3 relative z-10">
                          {[
                              "On-site inspection of your organisation",
                              "Evaluation of product organics and standards",
                              "Full-fledged compliance report issued",
                              "Ideal for small-scale producers entering the organic market"
                          ].map((item, index) => (
                              <li key={index} className="flex items-start">
                                  <FiCheck className="text-teal-500 mt-1 mr-2 flex-shrink-0" />
                                  <span>{item}</span>
                              </li>
                          ))}
                      </ul>
                      <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => openModal('499')}
                          className="mt-6 bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors relative z-10 flex items-center justify-center gap-2 w-full"
                      >
                          Get Certificate <FiArrowRight />
                      </motion.button>
                  </motion.div>

                  {/* Organic Max - Featured */}
                  <motion.div
                      variants={cardVariants}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="w-80 min-h-[420px] border-2 border-teal-500 rounded-xl p-6 text-center bg-white hover:shadow-lg transition-all duration-300 relative overflow-hidden group transform hover:-translate-y-2"
                  >
                      <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-teal-500 opacity-10 group-hover:opacity-20 transition-opacity duration-300"></div>
                      <div className="absolute top-0 left-0 bg-teal-500 text-white text-xs font-bold px-3 py-1 rounded-br-lg">
                          POPULAR
                      </div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-3">Organic Max</h3>
                      <div className="text-3xl font-bold text-black">
                          ₹999 <del className="text-sm text-gray-400 ml-2">₹4999</del>
                      </div>
                      <span className="inline-block px-4 py-1 text-xs font-semibold text-teal-600 bg-teal-100 rounded-full mt-3">
                          Covers Up to 10 Products
                      </span>
                      <hr className="my-6 border-gray-200" />
                      <ul className="text-left space-y-3">
                          {[
                              "Everything included in Organic Essential",
                              "Detailed lab testing for authenticity and safety",
                              "Extended compliance review and certification",
                              "Tailored guidance for scaling your organic business"
                          ].map((item, index) => (
                              <li key={index} className="flex items-start">
                                  <FiCheck className="text-teal-500 mt-1 mr-2 flex-shrink-0" />
                                  <span>{item}</span>
                              </li>
                          ))}
                      </ul>
                      <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => openModal('999')}
                          className="mt-6 bg-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-teal-700 transition-colors flex items-center justify-center gap-2 w-full"
                      >
                          Get Certificate <FiArrowRight />
                      </motion.button>
                  </motion.div>

                  {/* Organic Organisation */}
                  <motion.div
                      variants={cardVariants}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      className="w-80 min-h-[420px] border-2 border-gray-200 rounded-xl p-6 text-center bg-white hover:shadow-lg transition-all duration-300 relative overflow-hidden group"
                  >
                      <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-3 relative z-10">Organic Organisation</h3>
                      <div className="text-3xl font-bold text-black relative z-10">Custom Pricing</div>
                      <span className="inline-block px-4 py-1 text-xs font-semibold text-amber-600 bg-amber-100 rounded-full mt-3 relative z-10">
                          Customised for Large Setups
                      </span>
                      <hr className="my-6 border-gray-200 relative z-10" />
                      <ul className="text-left space-y-3 relative z-10">
                          {[
                              "Bespoke certification designed around your goals",
                              "In-depth product portfolio evaluation",
                              "Collaborative strategy and sustainability consulting",
                              "Suitable for enterprises with diverse organic products"
                          ].map((item, index) => (
                              <li key={index} className="flex items-start">
                                  <FiCheck className="text-amber-500 mt-1 mr-2 flex-shrink-0" />
                                  <span>{item}</span>
                              </li>
                          ))}
                      </ul>
                      <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => openModal('1')}
                          className="mt-6 bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors relative z-10 flex items-center justify-center gap-2 w-full"
                      >
                          Contact Us <FiArrowRight />
                      </motion.button>
                  </motion.div>
              </div>
          </div>

          {/* Modal */}
          <AnimatePresence>
              {isModalOpen && (
                  <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                      onClick={closeModal}
                  >
                      <motion.div
                          variants={modalVariants}
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                          className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md relative"
                          onClick={(e) => e.stopPropagation()}
                      >
                          <button
                              onClick={closeModal}
                              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
                          >
                              <FiX size={24} />
                          </button>

                          <div className="text-center mb-6">
                              <h3 className="text-2xl font-bold text-gray-800">
                                  {plan === '1' ? 'Contact Us' : 'Complete Your Purchase'}
                              </h3>
                              <p className="text-gray-600 mt-2">
                                  {plan === '1'
                                      ? 'Our team will reach out to discuss your custom requirements'
                                      : `You're purchasing the ${plan === '499' ? 'Organic Essential' : 'Organic Max'} plan for ₹${plan}`}
                              </p>
                          </div>

                          <form onSubmit={handleSubmit} className="space-y-4">
                              {error && (
                                  <motion.div
                                      initial={{ opacity: 0, y: -10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      className="p-3 bg-red-50 text-red-600 rounded-lg text-sm"
                                  >
                                      {error}
                                  </motion.div>
                              )}
                              {success && (
                                  <motion.div
                                      initial={{ opacity: 0, y: -10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      className="p-3 bg-green-50 text-green-600 rounded-lg text-sm"
                                  >
                                      {success}
                                  </motion.div>
                              )}

                              <div className="space-y-3">
                                  <input
                                      type="text"
                                      placeholder="Your Name"
                                      value={name}
                                      onChange={(e) => setName(e.target.value)}
                                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                                      required />
                                  <input
                                      type="tel"
                                      placeholder="Phone Number"
                                      value={phone}
                                      onChange={(e) => setPhone(e.target.value)}
                                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                                      required />
                                  <input
                                      type="email"
                                      placeholder="Email Address"
                                      value={email}
                                      onChange={(e) => setEmail(e.target.value)}
                                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                                      required />
                              </div>

                              <input type="hidden" name="plan" value={plan} />

                              <motion.button
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  type="submit"
                                  disabled={isSubmitting}
                                  className="w-full py-3 px-6 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                              >
                                  {isSubmitting ? (
                                      <>
                                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                          </svg>
                                          Processing...
                                      </>
                                  ) : (
                                      <>
                                          {plan === '1' ? 'Submit Request' : 'Proceed to Payment'}
                                          <FiArrowRight />
                                      </>
                                  )}
                              </motion.button>
                          </form>
                      </motion.div>
                  </motion.div>
              )}
          </AnimatePresence>
      </section><Footer /></>

  );
};

export default BuyCertificate;