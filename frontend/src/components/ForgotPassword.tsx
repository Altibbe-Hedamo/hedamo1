import { useState, type FormEvent, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import api from '../config/axios'; // Use configured axios instance

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const navigate = useNavigate();
  const location = useLocation();

  const query = new URLSearchParams(location.search);
  const queryError = query.get('error');
  const querySuccess = query.get('success');

  // Clear error/success messages after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (error) setError(null);
      if (success) setSuccess(null);
    }, 5000);

    return () => clearTimeout(timer);
  }, [error, success]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await api.post('/api/forgot-password', { email });
      console.log('API Response:', response); // Log response for debugging
      if (response.data.success) {
        setSuccess(response.data.message || 'Please check your email to reset your password');
        setEmail(''); // Clear email input
        setTimeout(() => {
          navigate('/login'); // Redirect to login after 2 seconds
        }, 2000);
      } else {
        console.log('API Error Response:', response.data); // Log error response
        setError(response.data.error || 'Failed to send reset email');
      }
    } catch (err: any) {
      console.error('Axios Error:', err.response?.data, err.message, err.response?.status); // Log error details
      setError(err.response?.data?.error || 'Failed to send reset email. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-light">
      <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-lg">
        <form onSubmit={handleSubmit}>
          <h4 className="mb-4 text-xl font-semibold">Forgot Password</h4>
          {(error || queryError) && <p className="text-red-500 mb-4">{error || queryError}</p>}
          {(success || querySuccess) && <p className="text-green-500 mb-4">{success || querySuccess}</p>}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full p-3 text-white font-medium rounded-lg transition-colors mt-4 ${isSubmitting
                ? 'bg-green-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700'
              }`}
          >
            {isSubmitting ? 'Sending Reset Link...' : 'Get Reset Link'}
          </button>
        </form>
        <div className="flex justify-between mt-4">
          <Link
            to="/signup"
            className="text-gray-500 uppercase text-sm font-medium hover:underline"
          >
            Register Now
          </Link>
          <Link
            to="/login"
            className="text-gray-500 uppercase text-sm font-medium hover:underline"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;