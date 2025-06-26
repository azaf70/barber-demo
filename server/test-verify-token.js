const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testVerifyToken() {
  try {
    // First, login to get a token
    console.log('🔐 Logging in to get token...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'customer1@example.com',
      password: 'customer123'
    });

    if (loginResponse.data.success) {
      const token = loginResponse.data.data.token;
      console.log('✅ Login successful, got token');
      console.log('Token:', token.substring(0, 50) + '...');

      // Now test the verify-token endpoint
      console.log('\n🔍 Testing verify-token endpoint...');
      const verifyResponse = await axios.get(`${BASE_URL}/auth/verify-token`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('✅ Verify token response:');
      console.log('Status:', verifyResponse.status);
      console.log('Success:', verifyResponse.data.success);
      console.log('Message:', verifyResponse.data.message);
      
      if (verifyResponse.data.data && verifyResponse.data.data.user) {
        console.log('User data received:', {
          id: verifyResponse.data.data.user._id,
          email: verifyResponse.data.data.user.email,
          role: verifyResponse.data.data.user.role
        });
      }
    } else {
      console.log('❌ Login failed:', loginResponse.data);
    }
  } catch (error) {
    console.log('❌ Error:', error.response ? {
      status: error.response.status,
      data: error.response.data
    } : error.message);
  }
}

testVerifyToken(); 