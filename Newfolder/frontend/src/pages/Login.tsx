import { useState, type FormEvent } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useContext } from 'react';
import api from '../config/axios';
import { BiShow, BiHide } from 'react-icons/bi';
import { AuthContext } from '../context/AuthContext';
import Footer from '../components/Footer';

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useContext(AuthContext);

  const query = new URLSearchParams(location.search);
  const queryError = query.get('error');
  const querySuccess = query.get('success');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const response = await api.post('/api/login', {
        email,
        password,
      });

      if (response.data.success) {
        login(response.data.user, response.data.token);
        if (response.data.user.type === 'agent' || response.data.user.signup_type === 'agent') {
          if (response.data.user.status !== 'active') {
            setError('Your account is pending approval. Please wait until admin approves your registration.');
          } else if (response.data.user.kyc_status === 'pending') {
            navigate('/kyc-verification');
          } else if (response.data.user.kyc_status === 'active') {
            navigate('/agent-dashboard');
          } else {
            setError('Unknown KYC status for agent');
          }
        } else if (response.data.user.type === 'channel_partner' || response.data.user.signup_type === 'channel_partner') {
          navigate('/channel-partner-portal');
        } else if (response.data.user.type === 'company' || response.data.user.signup_type === 'company') {
          navigate('/client-dashboard');
        } else if (response.data.user.type === 'user' || response.data.user.signup_type === 'user') {
          navigate('/user-profile');
        } else if (response.data.user.type === 'admin' || response.data.user.signup_type === 'admin') {
          navigate('/admin-dashboard');
        } else if (response.data.user.type === 'slp' || response.data.user.signup_type === 'slp') {
          if (response.data.user.status !== 'active') {
            setError('Your account is pending approval. Please wait until admin approves your registration.');
          } else {
            navigate('/slp-portal');
          }
        } else {
          setError('Unknown user type');
        }
      } else {
        setError(response.data.error || 'Login failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid email or password');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-6 sm:p-8 rounded-2xl w-full max-w-md shadow-lg z-10">
          <form onSubmit={handleSubmit}>
            <h4 className="mb-4 text-xl sm:text-2xl font-semibold text-center">Login</h4>
            {(error || queryError) && (
              <p className="text-red-500 mb-4 text-sm sm:text-base">{error || queryError}</p>
            )}
            {(success || querySuccess) && (
              <p className="text-green-500 mb-4 text-sm sm:text-base">{success || querySuccess}</p>
            )}
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 mb-4 border rounded text-sm sm:text-base"
            />
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full p-3 mb-4 border rounded text-sm sm:text-base"
              />
              <div
                className="absolute top-3 right-3 cursor-pointer"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? <BiHide size={20} /> : <BiShow size={20} />}
              </div>
            </div>
            <input
              type="submit"
              value="Login"
              className="w-full p-3 bg-green-600 text-white border-none rounded cursor-pointer hover:bg-green-500 text-sm sm:text-base"
            />
          </form>
          <div className="flex flex-col sm:flex-row justify-between mt-4 gap-2">
            <Link
              to="/signup"
              className="text-gray-500 uppercase text-sm font-medium hover:underline"
            >
              Register Now
            </Link>
            <Link
              to="/forgot-password"
              className="text-gray-500 uppercase text-sm font-medium hover:underline"
            >
              Forgot Password?
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Login;