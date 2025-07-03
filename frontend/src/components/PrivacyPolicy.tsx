import { motion } from 'framer-motion';
import Footer from './Footer';

const PrivacyPolicy: React.FC = () => {
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
          <h2 className="text-2xl font-semibold text-teal-700">Privacy Policy</h2>
          <small className="text-gray-500">Effective Date: [Insert Date]</small>
          <hr className="my-4 border-gray-200" />
        </motion.div>

        <motion.p variants={itemVariants} className="mb-6 text-gray-700">
          <strong>Hedamo.com</strong>, owned by <strong>Altibbe Inc.</strong>, is committed to safeguarding your personal
          and business information. This Privacy Policy describes how we collect, use, and protect your data.
        </motion.p>

        <motion.div variants={itemVariants} className="mb-6">
          <h5 className="text-xl font-semibold text-gray-800 mb-2">1. Information We Collect</h5>
          <ul className="list-disc pl-5 space-y-2 text-gray-600">
            <li><strong>Personal Info:</strong> Name, contact, and billing details.</li>
            <li><strong>Business Info:</strong> Organic practices, certifications, farm data.</li>
            <li><strong>Technical Info:</strong> IP address, browser, device data, site usage.</li>
          </ul>
        </motion.div>

        <motion.div variants={itemVariants} className="mb-6">
          <h5 className="text-xl font-semibold text-gray-800 mb-2">2. Usage of Your Data</h5>
          <ul className="list-disc pl-5 space-y-2 text-gray-600">
            <li>To evaluate and issue organic certifications</li>
            <li>Account creation, communication, support</li>
            <li>Regulatory compliance and service improvement</li>
          </ul>
        </motion.div>

        <motion.div variants={itemVariants} className="mb-6">
          <h5 className="text-xl font-semibold text-gray-800 mb-2">3. Sharing & Disclosure</h5>
          <p className="text-gray-600">
            We never sell your data. We may share with service providers or legal entities under compliance obligations.
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="mb-6">
          <h5 className="text-xl font-semibold text-gray-800 mb-2">4. Your Rights</h5>
          <p className="text-gray-600">
            You may request access, updates, or deletion of your data. You can also opt-out of marketing emails anytime.
          </p>
        </motion.div>

        <motion.div variants={itemVariants}>
          <h5 className="text-xl font-semibold text-gray-800 mb-2">5. Contact</h5>
          <p className="text-gray-600">
            Email: <a href="mailto:support@hedamo.com" className="text-blue-600 hover:underline font-medium">support@hedamo.com</a>
            <br />
            Phone: +91-xxxxxxxxxx
          </p>
        </motion.div>
      </motion.div>
    </div><Footer /></>

  );
};

export default PrivacyPolicy;