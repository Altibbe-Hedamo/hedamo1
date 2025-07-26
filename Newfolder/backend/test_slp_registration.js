const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:3000'; // Adjust if your backend runs on a different port
const TEST_EMAIL = 'test-slp@example.com';

async function testSLPRegistration() {
  console.log('Testing SLP Registration with OTP...\n');

  try {
    // Step 1: Send OTP
    console.log('1. Sending OTP...');
    const otpResponse = await axios.post(`${BASE_URL}/api/send-otp`, {
      email: TEST_EMAIL,
      csrf_token: 'test-csrf-token'
    });

    if (otpResponse.data.success) {
      console.log('✅ OTP sent successfully');
    } else {
      console.log('❌ Failed to send OTP:', otpResponse.data.error);
      return;
    }

    // Step 2: Register SLP user (this would normally be done with the actual OTP)
    console.log('\n2. Testing SLP registration...');
    const signupData = {
      name: 'Test SLP User',
      email: TEST_EMAIL,
      phone: '+919876543210',
      signup_type: 'slp',
      password: 'TestPassword123!',
      confirmPassword: 'TestPassword123!',
      otp: '123456', // This would be the actual OTP from email
      linkedinUrl: 'https://linkedin.com/in/test-slp',
      pincode: '123456',
      city: 'Mumbai',
      state: 'Maharashtra',
      referralId: 'REF123',
      experienceYears: '5',
      companyName: 'Test Service Company',
      website: 'https://testservice.com',
      address: '123 Test Street, Mumbai, Maharashtra',
      captchaInput: '15', // Assuming captcha sum is 15
      acceptTerms: true,
      csrf_token: 'test-csrf-token'
    };

    const signupResponse = await axios.post(`${BASE_URL}/api/signup`, signupData);
    
    if (signupResponse.data.success) {
      console.log('✅ SLP registration successful');
      console.log('User ID:', signupResponse.data.user.id);
      console.log('Signup Type:', signupResponse.data.user.signupType);
      console.log('Status:', signupResponse.data.user.status);
    } else {
      console.log('❌ SLP registration failed:', signupResponse.data.error);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testSLPRegistration()
  .then(() => {
    console.log('\nTest completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Test failed:', error);
    process.exit(1);
  }); 