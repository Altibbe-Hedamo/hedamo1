import { motion } from 'framer-motion';
import Footer from './Footer';

const RefundPolicy: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  };

  return (
    <><div className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
          >
              <h1 className="text-4xl font-bold text-teal-700 mb-2">Hedamo Legal Policies</h1>
              <div className="w-20 h-1 bg-teal-500 mx-auto"></div>
          </motion.div>

          <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="bg-white p-8 rounded-xl shadow-md border border-gray-100"
          >
              <motion.div variants={itemVariants}>
                  <h2 className="text-2xl font-semibold text-teal-700">Refund Policy</h2>
                  <small className="text-gray-500">Effective Date: [Insert Date]</small>
                  <hr className="my-4 border-gray-200" />
              </motion.div>

              <motion.p variants={itemVariants} className="mb-6 text-gray-700">
                  Due to the specialized nature of certification services, we follow a strict refund policy as outlined below.
              </motion.p>

              <motion.div variants={itemVariants} className="mb-6">
                  <h5 className="text-xl font-semibold text-gray-800 mb-2">1. Non-Refundable Services</h5>
                  <p className="text-gray-600">
                      Payments are non-refundable once certification work has started, including inspections or lab testing.
                  </p>
              </motion.div>

              <motion.div variants={itemVariants} className="mb-6">
                  <h5 className="text-xl font-semibold text-gray-800 mb-2">2. Refund Conditions</h5>
                  <ul className="list-disc pl-5 space-y-2 text-gray-600">
                      <li>Duplicate or incorrect payment</li>
                      <li>Cancellation before service initiation</li>
                      <li>Service failure due to Hedamo's fault</li>
                  </ul>
              </motion.div>

              <motion.div variants={itemVariants} className="mb-6">
                  <h5 className="text-xl font-semibold text-gray-800 mb-2">3. Refund Requests</h5>
                  <p className="text-gray-600 mb-3">
                      Email{' '}
                      <a href="mailto:support@hedamo.com" className="text-blue-600 hover:underline font-medium">
                          support@hedamo.com
                      </a>{' '}
                      with subject "Refund Request" including:
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-gray-600">
                      <li>Your Name</li>
                      <li>Transaction ID</li>
                      <li>Reason for refund</li>
                  </ul>
              </motion.div>

              <motion.div variants={itemVariants}>
                  <h5 className="text-xl font-semibold text-gray-800 mb-2">4. Processing Timeline</h5>
                  <p className="text-gray-600">
                      Refunds will be reviewed within 7 working days and processed within 10 working days to the original payment
                      method.
                  </p>
              </motion.div>
          </motion.div>
      </div><Footer /></>

  );
};

export default RefundPolicy;