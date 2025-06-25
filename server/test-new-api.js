const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

// Test the new feature-based API structure
async function testNewAPI() {
  console.log('🧪 Testing new feature-based API structure...\n');

  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Health check passed:', healthResponse.data.message);

    // Test shared shop endpoints
    console.log('\n2. Testing shared shop endpoints...');
    const shopsResponse = await axios.get(`${API_BASE_URL}/shops`);
    console.log('✅ Shops endpoint working:', shopsResponse.data.data.length, 'shops found');

    // Test shared services endpoints
    console.log('\n3. Testing shared services endpoints...');
    const servicesResponse = await axios.get(`${API_BASE_URL}/services`);
    console.log('✅ Services endpoint working:', servicesResponse.data.data.length, 'services found');

    // Test service categories
    const categoriesResponse = await axios.get(`${API_BASE_URL}/services/categories`);
    console.log('✅ Service categories endpoint working:', categoriesResponse.data.data.length, 'categories found');

    // Test shop search
    console.log('\n4. Testing shop search...');
    const searchResponse = await axios.get(`${API_BASE_URL}/shops/search?q=barber`);
    console.log('✅ Shop search endpoint working:', searchResponse.data.data.length, 'results found');

    // Test shop details (if shops exist)
    if (shopsResponse.data.data.length > 0) {
      const firstShop = shopsResponse.data.data[0];
      console.log('\n5. Testing shop details...');
      const shopDetailsResponse = await axios.get(`${API_BASE_URL}/shops/${firstShop._id}`);
      console.log('✅ Shop details endpoint working for:', shopDetailsResponse.data.data.name);

      // Test shop services
      const shopServicesResponse = await axios.get(`${API_BASE_URL}/shops/${firstShop._id}/services`);
      console.log('✅ Shop services endpoint working:', shopServicesResponse.data.data.length, 'services found');

      // Test shop employees
      const shopEmployeesResponse = await axios.get(`${API_BASE_URL}/shops/${firstShop._id}/employees`);
      console.log('✅ Shop employees endpoint working:', shopEmployeesResponse.data.data.length, 'employees found');

      // Test shop availability
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const availabilityResponse = await axios.get(`${API_BASE_URL}/shops/${firstShop._id}/availability?date=${tomorrow.toISOString()}`);
      console.log('✅ Shop availability endpoint working:', availabilityResponse.data.data.available ? 'Available' : 'Not available');

      // Test shop reviews
      const reviewsResponse = await axios.get(`${API_BASE_URL}/shops/${firstShop._id}/reviews`);
      console.log('✅ Shop reviews endpoint working:', reviewsResponse.data.data.length, 'reviews found');
    }

    console.log('\n🎉 All shared API endpoints are working correctly!');
    console.log('\n📋 API Structure Summary:');
    console.log('├── /api/health - Health check');
    console.log('├── /api/shops - Shop discovery and search');
    console.log('├── /api/services - Service catalog');
    console.log('├── /api/customers - Customer-specific endpoints (requires auth)');
    console.log('├── /api/barbers - Barber-specific endpoints (requires auth)');
    console.log('└── /api/admin - Admin-specific endpoints (requires auth)');

  } catch (error) {
    console.error('❌ API test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testNewAPI(); 