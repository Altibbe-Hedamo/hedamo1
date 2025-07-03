import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import api from '../config/axios';
import { FiLock, FiCheck, FiX } from 'react-icons/fi';

const SetPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [passwordMatch, setPasswordMatch] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const query = new URLSearchParams(location.search);
  const hashedEmail = query.get('c') || '';
  const email = query.get('email') || '';

  useEffect(() => {
    if (!hashedEmail || !email) {
      setError('Invalid or missing verification link');
    }
  }, [hashedEmail, email]);

  const validatePasswords = () => {
    if (password && confirmPassword) {
      setPasswordMatch(password === confirmPassword);
    } else {
      setPasswordMatch(null);
    }
  };

  useEffect(() => {
    validatePasswords();
  }, [password, confirmPassword]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    if (!hashedEmail || !email) {
      setError('Invalid verification link');
      setIsSubmitting(false);
      return;
    }

    if (!passwordMatch) {
      setError('Passwords do not match');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await api.post('/api/set-password', {
        hashedEmail,
        email,
        password,
      });
      console.log('Set Password Response:', response);
      if (response.data.success) {
        setSuccess(response.data.message || 'Password set successfully');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        console.log('Set Password Error Response:', response.data);
        setError(response.data.error || 'Failed to set password');
      }
    } catch (err: any) {
      console.error('Set Password Error:', err.response?.data, err.message, err.response?.status);
      setError(err.response?.data?.error || 'Failed to set password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white p-8 rounded-2xl w-full max-w-md shadow-xl border border-gray-100"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Set New Password</h2>
          <p className="text-gray-600">Create a secure password for your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
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

          <div className="space-y-1">
            <label htmlFor="password" className="text-gray-700 font-medium">
              New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiLock className="text-gray-400" />
              </div>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="confirmPassword" className="text-gray-700 font-medium">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiLock className="text-gray-400" />
              </div>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>
            {passwordMatch !== null && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-center text-sm mt-1 ${passwordMatch ? 'text-green-600' : 'text-red-600'
                  }`}
              >
                {passwordMatch ? (
                  <>
                    <FiCheck className="mr-1" /> Passwords match
                  </>
                ) : (
                  <>
                    <FiX className="mr-1" /> Passwords don't match
                  </>
                )}
              </motion.div>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={!passwordMatch || isSubmitting}
            className={`w-full py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${passwordMatch && !isSubmitting
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
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
                Processing...
              </>
            ) : (
              'Set Password'
            )}
          </motion.button>
        </form>

        <div className="flex justify-between mt-6 pt-4 border-t border-gray-200">
          <Link
            to="/signup"
            className="text-blue-600 hover:underline text-sm font-medium"
          >
            Register Now
          </Link>
          <Link
            to="/forgot-password"
            className="text-blue-600 hover:underline text-sm font-medium"
          >
            Get Reset Link?
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default SetPassword;