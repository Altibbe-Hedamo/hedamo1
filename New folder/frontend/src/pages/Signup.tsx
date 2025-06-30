import { useState, type FormEvent, useEffect, useContext } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import api from '../config/axios';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import Footer from '../components/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';

interface FormData {
  name: string;
  email: string;
  phone: string;
  captchaInput: string;
  signupType: string;
  password?: string;
  confirmPassword?: string;
  otp?: string;
  linkedinUrl?: string;
  pincode?: string;
  city?: string;
  state?: string;
  referralId?: string;
  experienceYears?: string;
  acceptTerms: boolean;
  companyName?: string;
  website?: string;
  address?: string;
}

interface Captcha {
  num1: number;
  num2: number;
  sum: number;
}

const Signup: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    captchaInput: '',
    signupType: 'user',
    password: '',
    confirmPassword: '',
    otp: '',
    linkedinUrl: '',
    pincode: '',
    city: '',
    state: '',
    referralId: '',
    experienceYears: '',
    acceptTerms: false,
    companyName: '',
    website: '',
    address: '',
  });
  const [csrfToken, setCsrfToken] = useState<string>('');
  const [captcha, setCaptcha] = useState<Captcha>({ num1: 0, num2: 0, sum: 0 });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useContext(AuthContext);

  // Add state for referral code
  const [referralCode, setReferralCode] = useState<string | null>(null);

  const query = new URLSearchParams(location.search);
  const queryError = query.get('error');
  const querySuccess = query.get('success');

  const generateCsrfToken = (): string => {
    const token = Array(32)
      .fill(0)
      .map(() => Math.random().toString(36)[2])
      .join('');
    sessionStorage.setItem('csrf_token', token);
    return token;
  };

  const generateCaptcha = (): Captcha => {
    const sum = Math.floor(Math.random() * 11) + 10;
    const num1 = Math.floor(Math.random() * (sum - 1)) + 1;
    const num2 = sum - num1;
    return { num1, num2, sum };
  };

  useEffect(() => {
    setCsrfToken(generateCsrfToken());
    setCaptcha(generateCaptcha());

    const timer = setTimeout(() => {
      if (error) setError(null);
      if (success) setSuccess(null);
    }, 5000);

    // Get referral code from URL if present
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      setReferralCode(ref);
      console.log('Referral code found in URL:', ref);
    }

    return () => clearTimeout(timer);
  }, [error, success]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhoneChange = (phone: string) => {
    setFormData((prev) => ({
      ...prev,
      phone,
    }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validatePassword = (password: string): boolean => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return (
      password.length >= minLength &&
      hasUpperCase &&
      hasLowerCase &&
      hasNumbers &&
      hasSpecialChar
    );
  };

  const handleSendOtp = async () => {
    if (!formData.email) {
      setError('Please enter your email first');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      console.log('Sending OTP request for email:', formData.email);
      const response = await api.post(
        '/api/send-otp',
        {
          email: formData.email,
          csrf_token: csrfToken
        }
      );

      console.log('OTP response:', response.data);

      if (response.data.success) {
        setSuccess('OTP sent successfully to your email');
        setOtpSent(true);
      } else {
        const errorMessage = response.data.details || response.data.error || 'Failed to send OTP';
        setError(errorMessage);
        console.error('OTP sending failed:', errorMessage);
      }
    } catch (err: any) {
      console.error('OTP error:', err.response?.data || err);
      const errorMessage = err.response?.data?.details || 
                          err.response?.data?.error || 
                          'Failed to send OTP. Please try again later.';
      setError(errorMessage);
      
      // If it's an email configuration error, show a more helpful message
      if (err.response?.data?.code === 'EAUTH' || err.response?.data?.error === 'Email service not configured') {
        setError('Email service is not properly configured. Please contact support.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      // Check terms acceptance
      if (!formData.acceptTerms) {
        setError('Please accept the terms and conditions to continue');
        setIsSubmitting(false);
        return;
      }

      // Basic validation
      if (!formData.name || !formData.email || !formData.phone) {
        setError('Please fill in all required fields');
        setIsSubmitting(false);
        return;
      }

      // Channel Partner specific validation
      if (formData.signupType === 'channel_partner') {
        if (!formData.companyName || !formData.website || !formData.address || 
            !formData.pincode || !formData.city || !formData.state) {
          setError('Please fill in all required fields for Channel Partner registration');
          setIsSubmitting(false);
          return;
        }

        // Validate pincode format
        if (!/^[0-9]{6}$/.test(formData.pincode)) {
          setError('Please enter a valid 6-digit pincode');
          setIsSubmitting(false);
          return;
        }

        // Validate website URL format
        try {
          new URL(formData.website);
        } catch (e) {
          setError('Please enter a valid website URL (e.g., https://example.com)');
          setIsSubmitting(false);
          return;
        }

        // Validate password and OTP for channel partners
        if (!formData.password || !formData.confirmPassword) {
          setError('Please enter and confirm your password');
          setIsSubmitting(false);
          return;
        }

        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          setIsSubmitting(false);
          return;
        }

        if (!formData.otp) {
          setError('Please enter the OTP sent to your email');
          setIsSubmitting(false);
          return;
        }
      }

      if (parseInt(formData.captchaInput) !== captcha.sum) {
        setError('Invalid CAPTCHA. Please try again.');
        setCaptcha(generateCaptcha());
        setIsSubmitting(false);
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError('Please enter a valid email address');
        setIsSubmitting(false);
        return;
      }

      // Validate password for agents
      if (formData.signupType === 'agent' || formData.signupType === 'hap') {
        if (!formData.password || !formData.confirmPassword) {
          setError('Please enter and confirm your password');
          setIsSubmitting(false);
          return;
        }

        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          setIsSubmitting(false);
          return;
        }

        if (!validatePassword(formData.password)) {
          setError(
            'Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character'
          );
          setIsSubmitting(false);
          return;
        }

        if (!formData.otp) {
          setError('Please enter the OTP sent to your email');
          setIsSubmitting(false);
          return;
        }
      }

      // Additional validation for agents
      if (formData.signupType === 'agent') {
        if (!formData.pincode || !formData.city || !formData.state) {
          setError('Please fill in all location details');
          setIsSubmitting(false);
          return;
        }
        if (formData.pincode.length !== 6 || !/^\d+$/.test(formData.pincode)) {
          setError('Please enter a valid 6-digit pincode');
          setIsSubmitting(false);
          return;
        }
        if (formData.experienceYears && (parseInt(formData.experienceYears) < 0 || parseInt(formData.experienceYears) > 50)) {
          setError('Experience years must be between 0 and 50');
          setIsSubmitting(false);
          return;
        }
      }

      // Update the handleSubmit function to handle channel partner password
      if (formData.signupType === 'agent' || formData.signupType === 'channel_partner') {
        if (!formData.password || !formData.confirmPassword) {
          setError('Please enter and confirm your password');
          setIsSubmitting(false);
          return;
        }

        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          setIsSubmitting(false);
          return;
        }

        if (formData.password.length < 8) {
          setError('Password must be at least 8 characters long');
          setIsSubmitting(false);
          return;
        }
      }

      console.log('Submitting signup form:', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        signupType: formData.signupType,
        hasPassword: !!formData.password,
        hasOtp: !!formData.otp,
        companyName: formData.companyName,
        website: formData.website,
        address: formData.address,
        pincode: formData.pincode,
        city: formData.city,
        state: formData.state
      });

      // Add referral code to signup data if present
      const signupData = {
        ...formData,
        referred_by: referralCode,
        csrf_token: csrfToken,
        signup_type: formData.signupType,
        password: (formData.signupType === 'agent' || formData.signupType === 'hap' || formData.signupType === 'channel_partner' || formData.signupType === 'user') ? formData.password : undefined,
        otp: (formData.signupType === 'agent' || formData.signupType === 'hap' || formData.signupType === 'channel_partner' || formData.signupType === 'user') ? formData.otp : undefined,
        linkedin_url: formData.signupType === 'agent' ? formData.linkedinUrl : undefined,
        pincode: formData.signupType === 'agent' || formData.signupType === 'channel_partner' ? formData.pincode : undefined,
        city: formData.signupType === 'agent' || formData.signupType === 'channel_partner' ? formData.city : undefined,
        state: formData.signupType === 'agent' || formData.signupType === 'channel_partner' ? formData.state : undefined,
        referral_id: formData.signupType === 'agent' ? formData.referralId : undefined,
        experience_years: formData.signupType === 'agent' ? formData.experienceYears : undefined,
        company_name: formData.signupType === 'channel_partner' ? formData.companyName : undefined,
        website: formData.signupType === 'channel_partner' ? formData.website : undefined,
        address: formData.signupType === 'channel_partner' ? formData.address : undefined,
      };

      console.log('Sending signup request with data:', signupData);

      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      try {
        const response = await api.post('/api/signup', signupData, {
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        console.log('Signup response:', response.data);

        if (response.data.success) {
          setSuccess(response.data.message || 'Registration successful');
          setFormData({
            name: '',
            email: '',
            phone: '',
            captchaInput: '',
            signupType: 'user',
            password: '',
            confirmPassword: '',
            otp: '',
            linkedinUrl: '',
            pincode: '',
            city: '',
            state: '',
            referralId: '',
            experienceYears: '',
            acceptTerms: false,
            companyName: '',
            website: '',
            address: '',
          });
          setOtpSent(false);
          
          // Create user object for AuthContext
          const userData = {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            role: formData.signupType,
            type: formData.signupType,
            kycStatus: 'pending' as const,
            signup_type: formData.signupType,
            // Add other required fields from User type
            position: '',
            joinDate: new Date(),
            dob: '',
            photo: '',
            workLocation: '',
            govIdName: '',
            govIdNumber: '',
            department: '',
            address: formData.address || ''
          };

          // Store token and user data
          const token = response.data.token;
          if (token) {
            login(userData, token);
          }
          
          // Redirect based on signup type
          if (formData.signupType === 'agent') {
            navigate('/kyc-verification');
          } else if (formData.signupType === 'hap') {
            navigate('/login');
          } else if (formData.signupType === 'channel_partner') {
            navigate('/channel-partner-portal');
          } else {
            navigate('/login');
          }
        } else {
          const errorMessage = response.data.error || 'Failed to register user';
          console.error('Registration failed:', errorMessage);
          setError(errorMessage);
        }
      } catch (err: any) {
        console.error('Signup error:', {
          response: err.response?.data,
          status: err.response?.status,
          message: err.message
        });
        
        const errorMessage = err.response?.data?.error || 
                            err.response?.data?.message || 
                            'Failed to register user. Please try again later.';
        setError(errorMessage);
      }
    } catch (err: any) {
      console.error('Signup error:', {
        response: err.response?.data,
        status: err.response?.status,
        message: err.message
      });
      
      const errorMessage = err.response?.data?.error || 
                          err.response?.data?.message || 
                          'Failed to register user. Please try again later.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div
        className="min-h-[90vh] flex items-center justify-center bg-cover bg-center bg-gray-50 px-4 sm:px-6"
        style={{ backgroundImage: "url('/img/white-2.jpg')" }}
      >
        <div className="bg-white p-6 sm:p-8 rounded-2xl w-full max-w-md sm:max-w-lg md:max-w-2xl shadow-lg mx-4">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-center text-gray-800 mb-4 sm:mb-6">
              Create Your Account
            </h2>

            <AnimatePresence>
              {(error || queryError) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-3 bg-red-100 text-red-700 rounded-lg text-sm sm:text-base"
                >
                  {error || queryError}
                </motion.div>
              )}
              {(success || querySuccess) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-3 bg-green-100 text-green-700 rounded-lg text-sm sm:text-base"
                >
                  {success || querySuccess}
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label
                htmlFor="name"
                className="block text-sm sm:text-base font-medium text-gray-700 mb-1"
              >
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm sm:text-base font-medium text-gray-700 mb-1"
                >
                  Email *
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                  />
                  {(formData.signupType === 'user' || formData.signupType === 'agent' || formData.signupType === 'hap' || formData.signupType === 'channel_partner') && !otpSent && (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={isSubmitting}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm whitespace-nowrap"
                    >
                      Send OTP
                    </button>
                  )}
                </div>
              </div>
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm sm:text-base font-medium text-gray-700 mb-1"
                >
                  Phone Number *
                </label>
                <PhoneInput
                  country={'in'}
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  inputProps={{
                    id: 'phone',
                    name: 'phone',
                    required: true,
                    className:
                      'w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent pl-12 text-sm sm:text-base',
                  }}
                  containerClass="w-full"
                />
              </div>
            </div>

            <div>
              <label htmlFor="signupType" className="block text-sm font-medium text-gray-700">
                Account Type
              </label>
              <select
                id="signupType"
                name="signupType"
                value={formData.signupType}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                required
              >
                <option value="user">Individual User</option>
                <option value="company">Business/Company</option>
                <option value="agent">Agent/Representative</option>
                <option value="hap">HAP</option>
                <option value="hrb">HRB</option>
                <option value="channel_partner">Channel Partner</option>
              </select>
            </div>

            {(formData.signupType === 'user' || formData.signupType === 'agent' || formData.signupType === 'hap' || formData.signupType === 'channel_partner') && (
              <>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                    required
                    minLength={8}
                  />
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                    required
                    minLength={8}
                  />
                </div>
                {otpSent && (
                  <div>
                    <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                      OTP
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        id="otp"
                        name="otp"
                        value={formData.otp}
                        onChange={handleChange}
                        className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                        placeholder="Enter OTP from email"
                        required
                      />
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm whitespace-nowrap"
                      >
                        Resend OTP
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {formData.signupType === 'channel_partner' && (
              <>
                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                    Company Name
                  </label>
                  <input
                    type="text"
                    id="companyName"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                    Company Website
                  </label>
                  <input
                    type="url"
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                    required
                    placeholder="https://example.com"
                  />
                </div>
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                    Address
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                    required
                    rows={3}
                    placeholder="Enter complete address"
                  />
                </div>
                <div>
                  <label htmlFor="pincode" className="block text-sm font-medium text-gray-700">
                    Pincode
                  </label>
                  <input
                    type="text"
                    id="pincode"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                    required
                    pattern="[0-9]{6}"
                    title="Please enter a valid 6-digit pincode"
                  />
                </div>
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                    City
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                    State
                  </label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                    required
                  />
                </div>
              </>
            )}

            <div>
              <label
                htmlFor="captchaInput"
                className="block text-sm sm:text-base font-medium text-gray-700 mb-1"
              >
                CAPTCHA: What is {captcha.num1} + {captcha.num2}? *
              </label>
              <input
                type="number"
                id="captchaInput"
                name="captchaInput"
                placeholder="Enter the sum"
                value={formData.captchaInput}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
              />
            </div>

            {(formData.signupType === 'agent') && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="linkedinUrl" className="block text-sm font-medium text-gray-700">
                    LinkedIn Profile URL
                  </label>
                  <input
                    type="url"
                    id="linkedinUrl"
                    name="linkedinUrl"
                    value={formData.linkedinUrl}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="https://linkedin.com/in/your-profile"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="pincode" className="block text-sm font-medium text-gray-700">
                      Pincode
                    </label>
                    <input
                      type="text"
                      id="pincode"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Enter pincode"
                      maxLength={6}
                    />
                  </div>
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                      City
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Enter city"
                    />
                  </div>
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                      State
                    </label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Enter state"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="referralId" className="block text-sm font-medium text-gray-700">
                      Referral ID (Optional)
                    </label>
                    <input
                      type="text"
                      id="referralId"
                      name="referralId"
                      value={formData.referralId}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Enter referral ID if any"
                    />
                  </div>
                  <div>
                    <label htmlFor="experienceYears" className="block text-sm font-medium text-gray-700">
                      Years of Experience
                    </label>
                    <input
                      type="number"
                      id="experienceYears"
                      name="experienceYears"
                      value={formData.experienceYears}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Enter years of experience"
                      min="0"
                      max="50"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-start mt-4">
              <div className="flex items-center h-5">
                <input
                  id="acceptTerms"
                  name="acceptTerms"
                  type="checkbox"
                  checked={formData.acceptTerms}
                  onChange={(e) => setFormData(prev => ({ ...prev, acceptTerms: e.target.checked }))}
                  className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300"
                  required
                />
              </div>
              <label htmlFor="acceptTerms" className="ml-2 text-sm font-medium text-gray-900">
                I accept the{' '}
                <a href="/terms" target="_blank" className="text-blue-600 hover:underline">
                  Terms and Conditions
                </a>
                {' '}and{' '}
                <a href="/privacy" target="_blank" className="text-blue-600 hover:underline">
                  Privacy Policy
                </a>
              </label>
            </div>

            <input type="hidden" name="csrf_token" value={csrfToken} />

            <button
              type="submit"
              disabled={isSubmitting || !formData.acceptTerms}
              className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                ${isSubmitting || !formData.acceptTerms 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                }`}
            >
              {isSubmitting ? 'Registering...' : 'Register'}
            </button>
          </form>

          <div className="mt-4 sm:mt-6 text-center">
            <p className="text-sm sm:text-base text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-green-600 hover:underline font-medium">
                Log in here
              </Link>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Signup;