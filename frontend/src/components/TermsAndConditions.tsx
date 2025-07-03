import { motion } from 'framer-motion';
import Footer from './Footer';

const TermsAndConditions: React.FC = () => {
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
                  <h2 className="text-2xl font-semibold text-teal-700">Terms & Conditions</h2>
                  <small className="text-gray-500">Effective Date: [Insert Date]</small>
                  <hr className="my-4 border-gray-200" />
              </motion.div>

              <motion.p variants={itemVariants} className="mb-6 text-gray-700">
                  By accessing or using <strong>Hedamo.com</strong>, you agree to be bound by the terms outlined below.
              </motion.p>

              <motion.div variants={itemVariants} className="mb-6">
                  <h5 className="text-xl font-semibold text-gray-800 mb-2">1. Our Services</h5>
                  <p className="text-gray-600">
                      We offer certification services for organic producers. Certified users receive QR-coded certificates to use on
                      packaging and promotion.
                  </p>
              </motion.div>

              <motion.div variants={itemVariants} className="mb-6">
                  <h5 className="text-xl font-semibold text-gray-800 mb-2">2. Eligibility</h5>
                  <p className="text-gray-600">
                      Only legal, verifiable producers may register. Falsification will lead to disqualification.
                  </p>
              </motion.div>

              <motion.div variants={itemVariants} className="mb-6">
                  <h5 className="text-xl font-semibold text-gray-800 mb-2">3. Certification Workflow</h5>
                  <ul className="list-disc pl-5 space-y-2 text-gray-600">
                      <li>Submit application with accurate business details</li>
                      <li>On-site inspection and organic compliance check</li>
                      <li>Issue of digital certificate and QR code</li>
                  </ul>
              </motion.div>

              <motion.div variants={itemVariants} className="mb-6">
                  <h5 className="text-xl font-semibold text-gray-800 mb-2">4. User Obligations</h5>
                  <ul className="list-disc pl-5 space-y-2 text-gray-600">
                      <li>Do not share, duplicate or misuse QR codes</li>
                      <li>Use certification only for verified products</li>
                      <li>Comply with updates or audits as needed</li>
                  </ul>
              </motion.div>

              <motion.div variants={itemVariants} className="mb-6">
                  <h5 className="text-xl font-semibold text-gray-800 mb-2">5. Intellectual Property</h5>
                  <p className="text-gray-600">
                      All content including certificates, designs, and code are property of Altibbe Inc. Unauthorized use is
                      prohibited.
                  </p>
              </motion.div>

              <motion.div variants={itemVariants} className="mb-6">
                  <h5 className="text-xl font-semibold text-gray-800 mb-2">6. Termination</h5>
                  <p className="text-gray-600">
                      We may suspend or revoke access in case of misuse or policy violation.
                  </p>
              </motion.div>

              <motion.div variants={itemVariants}>
                  <h5 className="text-xl font-semibold text-gray-800 mb-2">7. Limitation of Liability</h5>
                  <p className="text-gray-600">
                      Altibbe Inc. is not responsible for indirect damages or losses resulting from misuse of our services.
                  </p>
              </motion.div>
          </motion.div>
      </div><Footer /></>

  );
};

export default TermsAndConditions;