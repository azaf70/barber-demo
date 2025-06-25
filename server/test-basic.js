const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

// Test basic server functionality
async function testBasicAPI() {
  console.log('🧪 Testing basic server functionality...\n');

  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Health check passed:', healthResponse.data.message);
    console.log('   Server version:', healthResponse.data.version);
    console.log('   Timestamp:', healthResponse.data.timestamp);

    console.log('\n🎉 Basic server test passed!');
    console.log('\n📋 Server is running and responding to requests.');
    console.log('   - Health endpoint: ✅ Working');
    console.log('   - Server is ready for API testing');

  } catch (error) {
    console.error('❌ Basic API test failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('   Server is not running. Please start the server with: npm run dev');
    } else if (error.response) {
      console.error('   Response status:', error.response.status);
      console.error('   Response data:', error.response.data);
    }
  }
}

// Run the test
testBasicAPI(); 