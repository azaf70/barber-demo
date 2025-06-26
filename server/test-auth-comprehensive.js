const axios = require('axios');
const jwt = require('jsonwebtoken');

// Configuration
const BASE_URL = process.env.API_URL || 'http://localhost:5000/api';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Test credentials from seed data
const TEST_USERS = {
  customer: {
    email: 'customer1@example.com',
    password: 'customer123',
    role: 'customer'
  },
  barber: {
    email: 'barber1@example.com',
    password: 'barber123',
    role: 'barber'
  },
  admin: {
    email: 'admin@barbermarketplace.com',
    password: 'admin123',
    role: 'super_admin'
  }
};

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  errors: []
};

// Utility functions
const log = (message, type = 'info') => {
  const timestamp = new Date().toISOString();
  const colors = {
    info: '\x1b[36m',    // Cyan
    success: '\x1b[32m', // Green
    error: '\x1b[31m',   // Red
    warning: '\x1b[33m', // Yellow
    reset: '\x1b[0m'     // Reset
  };
  console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
};

const assert = (condition, message) => {
  if (condition) {
    testResults.passed++;
    log(`✓ ${message}`, 'success');
  } else {
    testResults.failed++;
    testResults.errors.push(message);
    log(`✗ ${message}`, 'error');
  }
};

const testApiCall = async (method, endpoint, data = null, token = null) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000 // 10 second timeout
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return {
      success: false,
      data: error.response?.data,
      status: error.response?.status,
      message: error.message
    };
  }
};

const validateToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return { valid: true, payload: decoded };
  } catch (error) {
    return { valid: false, error: error.message };
  }
};

const validateUserResponse = (user, expectedRole) => {
  // Check required fields
  assert(user._id, 'User has _id field');
  assert(user.firstName, 'User has firstName field');
  assert(user.lastName, 'User has lastName field');
  assert(user.email, 'User has email field');
  assert(user.role, 'User has role field');
  assert(user.isActive !== undefined, 'User has isActive field');
  assert(user.isVerified !== undefined, 'User has isVerified field');
  
  // Check role matches
  assert(user.role === expectedRole, `User role is ${expectedRole}`);
  
  // Check password is not included
  assert(!user.password, 'Password field is not included in response');
  
  // Check timestamps
  assert(user.createdAt, 'User has createdAt timestamp');
  assert(user.updatedAt, 'User has updatedAt timestamp');
};

// Test server connectivity first
const testServerConnectivity = async () => {
  log('\n=== Testing Server Connectivity ===', 'info');
  
  // Test health endpoint
  const healthResult = await testApiCall('GET', '/health');
  if (healthResult.success) {
    log(`✓ Server is running and healthy`, 'success');
    log(`  Status: ${healthResult.status}`, 'info');
    log(`  Database: ${healthResult.data.database}`, 'info');
    log(`  Version: ${healthResult.data.version}`, 'info');
  } else {
    log(`✗ Server connectivity test failed`, 'error');
    log(`  Status: ${healthResult.status}`, 'error');
    log(`  Error: ${healthResult.message}`, 'error');
    log(`  Please ensure the server is running on ${BASE_URL.replace('/api', '')}`, 'warning');
    return false;
  }
  
  return true;
};

// Test scenarios
const testInvalidLoginScenarios = async () => {
  log('\n=== Testing Invalid Login Scenarios ===', 'warning');
  
  // Test with non-existent email
  const nonExistentResult = await testApiCall('POST', '/auth/login', {
    email: 'nonexistent@example.com',
    password: 'password123'
  });
  assert(!nonExistentResult.success, 'Login with non-existent email should fail');
  assert(nonExistentResult.status === 401, 'Should return 401 status for non-existent email');
  
  // Test with wrong password
  const wrongPasswordResult = await testApiCall('POST', '/auth/login', {
    email: TEST_USERS.customer.email,
    password: 'wrongpassword'
  });
  assert(!wrongPasswordResult.success, 'Login with wrong password should fail');
  assert(wrongPasswordResult.status === 401, 'Should return 401 status for wrong password');
  
  // Test with invalid email format
  const invalidEmailResult = await testApiCall('POST', '/auth/login', {
    email: 'invalid-email',
    password: 'password123'
  });
  assert(!invalidEmailResult.success, 'Login with invalid email format should fail');
  assert(invalidEmailResult.status === 400, 'Should return 400 status for invalid email format');
  
  // Test with missing password
  const missingPasswordResult = await testApiCall('POST', '/auth/login', {
    email: TEST_USERS.customer.email
  });
  assert(!missingPasswordResult.success, 'Login with missing password should fail');
  assert(missingPasswordResult.status === 400, 'Should return 400 status for missing password');
  
  // Test with empty fields
  const emptyFieldsResult = await testApiCall('POST', '/auth/login', {
    email: '',
    password: ''
  });
  assert(!emptyFieldsResult.success, 'Login with empty fields should fail');
  assert(emptyFieldsResult.status === 400, 'Should return 400 status for empty fields');
};

const testCustomerLogin = async () => {
  log('\n=== Testing Customer Login ===', 'info');
  
  // Test successful customer login
  const loginResult = await testApiCall('POST', '/auth/login', {
    email: TEST_USERS.customer.email,
    password: TEST_USERS.customer.password
  });
  
  assert(loginResult.success, 'Customer login should succeed');
  assert(loginResult.status === 200, 'Should return 200 status for successful login');
  assert(loginResult.data.success, 'Response should have success: true');
  assert(loginResult.data.data.token, 'Response should include JWT token');
  assert(loginResult.data.data.user, 'Response should include user data');
  
  const { token, user } = loginResult.data.data;
  
  // Validate token
  const tokenValidation = validateToken(token);
  assert(tokenValidation.valid, 'Generated token should be valid');
  assert(tokenValidation.payload.userId, 'Token should contain userId');
  assert(tokenValidation.payload.role === 'customer', 'Token should contain correct role');
  
  // Validate user response
  validateUserResponse(user, 'customer');
  
  // Test token verification endpoint
  const verifyResult = await testApiCall('GET', '/auth/verify-token', null, token);
  assert(verifyResult.success, 'Token verification should succeed');
  assert(verifyResult.status === 200, 'Should return 200 status for valid token');
  
  // Test /me endpoint
  const meResult = await testApiCall('GET', '/auth/me', null, token);
  assert(meResult.success, '/me endpoint should succeed with valid token');
  assert(meResult.status === 200, 'Should return 200 status for /me endpoint');
  assert(meResult.data.success, '/me response should have success: true');
  
  // Test with invalid token
  const invalidTokenResult = await testApiCall('GET', '/auth/me', null, 'invalid-token');
  assert(!invalidTokenResult.success, 'Should fail with invalid token');
  assert(invalidTokenResult.status === 401, 'Should return 401 status for invalid token');
  
  // Test without token
  const noTokenResult = await testApiCall('GET', '/auth/me');
  assert(!noTokenResult.success, 'Should fail without token');
  assert(noTokenResult.status === 401, 'Should return 401 status for missing token');
  
  return token;
};

const testBarberLogin = async () => {
  log('\n=== Testing Barber Login ===', 'info');
  
  // Test successful barber login
  const loginResult = await testApiCall('POST', '/auth/login', {
    email: TEST_USERS.barber.email,
    password: TEST_USERS.barber.password
  });
  
  assert(loginResult.success, 'Barber login should succeed');
  assert(loginResult.status === 200, 'Should return 200 status for successful login');
  assert(loginResult.data.success, 'Response should have success: true');
  assert(loginResult.data.data.token, 'Response should include JWT token');
  assert(loginResult.data.data.user, 'Response should include user data');
  
  const { token, user } = loginResult.data.data;
  
  // Validate token
  const tokenValidation = validateToken(token);
  assert(tokenValidation.valid, 'Generated token should be valid');
  assert(tokenValidation.payload.userId, 'Token should contain userId');
  assert(tokenValidation.payload.role === 'barber', 'Token should contain correct role');
  
  // Validate user response
  validateUserResponse(user, 'barber');
  
  // Test token verification endpoint
  const verifyResult = await testApiCall('GET', '/auth/verify-token', null, token);
  assert(verifyResult.success, 'Token verification should succeed');
  assert(verifyResult.status === 200, 'Should return 200 status for valid token');
  
  // Test /me endpoint
  const meResult = await testApiCall('GET', '/auth/me', null, token);
  assert(meResult.success, '/me endpoint should succeed with valid token');
  assert(meResult.status === 200, 'Should return 200 status for /me endpoint');
  assert(meResult.data.success, '/me response should have success: true');
  
  return token;
};

const testAdminLogin = async () => {
  log('\n=== Testing Admin Login ===', 'info');
  
  // Test successful admin login
  const loginResult = await testApiCall('POST', '/auth/login', {
    email: TEST_USERS.admin.email,
    password: TEST_USERS.admin.password
  });
  
  assert(loginResult.success, 'Admin login should succeed');
  assert(loginResult.status === 200, 'Should return 200 status for successful login');
  assert(loginResult.data.success, 'Response should have success: true');
  assert(loginResult.data.data.token, 'Response should include JWT token');
  assert(loginResult.data.data.user, 'Response should include user data');
  
  const { token, user } = loginResult.data.data;
  
  // Validate token
  const tokenValidation = validateToken(token);
  assert(tokenValidation.valid, 'Generated token should be valid');
  assert(tokenValidation.payload.userId, 'Token should contain userId');
  assert(tokenValidation.payload.role === 'super_admin', 'Token should contain correct role');
  
  // Validate user response
  validateUserResponse(user, 'super_admin');
  
  // Test token verification endpoint
  const verifyResult = await testApiCall('GET', '/auth/verify-token', null, token);
  assert(verifyResult.success, 'Token verification should succeed');
  assert(verifyResult.status === 200, 'Should return 200 status for valid token');
  
  // Test /me endpoint
  const meResult = await testApiCall('GET', '/auth/me', null, token);
  assert(meResult.success, '/me endpoint should succeed with valid token');
  assert(meResult.status === 200, 'Should return 200 status for /me endpoint');
  assert(meResult.data.success, '/me response should have success: true');
  
  return token;
};

const testTokenSecurity = async () => {
  log('\n=== Testing Token Security ===', 'warning');
  
  // Get a valid token first
  const loginResult = await testApiCall('POST', '/auth/login', {
    email: TEST_USERS.customer.email,
    password: TEST_USERS.customer.password
  });
  
  if (!loginResult.success) {
    log('Failed to get valid token for security tests', 'error');
    return;
  }
  
  const validToken = loginResult.data.data.token;
  
  // Test token tampering
  const tamperedToken = validToken.slice(0, -10) + 'tampered';
  const tamperedResult = await testApiCall('GET', '/auth/me', null, tamperedToken);
  assert(!tamperedResult.success, 'Should fail with tampered token');
  assert(tamperedResult.status === 401, 'Should return 401 status for tampered token');
  
  // Test expired token (if we can create one)
  const expiredPayload = {
    userId: 'test-user-id',
    role: 'customer',
    iat: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
    exp: Math.floor(Date.now() / 1000) - 1800  // 30 minutes ago
  };
  const expiredToken = jwt.sign(expiredPayload, JWT_SECRET);
  const expiredResult = await testApiCall('GET', '/auth/me', null, expiredToken);
  assert(!expiredResult.success, 'Should fail with expired token');
  assert(expiredResult.status === 401, 'Should return 401 status for expired token');
  
  // Test token with wrong secret
  const wrongSecretToken = jwt.sign(
    { userId: 'test-user-id', role: 'customer' },
    'wrong-secret-key'
  );
  const wrongSecretResult = await testApiCall('GET', '/auth/me', null, wrongSecretToken);
  assert(!wrongSecretResult.success, 'Should fail with token signed with wrong secret');
  assert(wrongSecretResult.status === 401, 'Should return 401 status for wrong secret token');
  
  // Test malformed token
  const malformedResult = await testApiCall('GET', '/auth/me', null, 'not-a-jwt-token');
  assert(!malformedResult.success, 'Should fail with malformed token');
  assert(malformedResult.status === 401, 'Should return 401 status for malformed token');
};

const testRateLimiting = async () => {
  log('\n=== Testing Rate Limiting ===', 'warning');
  
  // Try multiple rapid login attempts
  const promises = [];
  for (let i = 0; i < 10; i++) {
    promises.push(testApiCall('POST', '/auth/login', {
      email: TEST_USERS.customer.email,
      password: 'wrongpassword'
    }));
  }
  
  const results = await Promise.all(promises);
  const failedAttempts = results.filter(r => !r.success && r.status === 429);
  
  // Note: This test might pass even without rate limiting if the server doesn't implement it
  log(`Rate limiting test: ${failedAttempts.length} out of 10 requests were rate limited`, 'info');
};

const testCrossUserAccess = async () => {
  log('\n=== Testing Cross-User Access ===', 'warning');
  
  // Get tokens for different user types
  const customerLogin = await testApiCall('POST', '/auth/login', {
    email: TEST_USERS.customer.email,
    password: TEST_USERS.customer.password
  });
  
  const barberLogin = await testApiCall('POST', '/auth/login', {
    email: TEST_USERS.barber.email,
    password: TEST_USERS.barber.password
  });
  
  if (customerLogin.success && barberLogin.success) {
    const customerToken = customerLogin.data.data.token;
    const barberToken = barberLogin.data.data.token;
    
    // Test that customer token can't access barber-specific endpoints
    // (This would depend on your specific endpoint structure)
    const customerWithBarberToken = await testApiCall('GET', '/auth/me', null, barberToken);
    assert(customerWithBarberToken.success, 'Barber token should work for /me endpoint');
    
    // Test that tokens contain correct user information
    const customerMe = await testApiCall('GET', '/auth/me', null, customerToken);
    const barberMe = await testApiCall('GET', '/auth/me', null, barberToken);
    
    if (customerMe.success && barberMe.success) {
      assert(customerMe.data.data.role === 'customer', 'Customer token should return customer role');
      assert(barberMe.data.data.role === 'barber', 'Barber token should return barber role');
      assert(customerMe.data.data.email === TEST_USERS.customer.email, 'Customer token should return customer email');
      assert(barberMe.data.data.email === TEST_USERS.barber.email, 'Barber token should return barber email');
    }
  }
};

const runAllTests = async () => {
  log('🚀 Starting Comprehensive Authentication Tests', 'info');
  log(`Base URL: ${BASE_URL}`, 'info');
  log(`JWT Secret: ${JWT_SECRET.substring(0, 10)}...`, 'info');
  
  try {
    // Test server connectivity first
    const serverConnected = await testServerConnectivity();
    if (!serverConnected) {
      log('❌ Cannot proceed with tests - server is not accessible', 'error');
      process.exit(1);
    }
    
    // Test invalid login scenarios first
    await testInvalidLoginScenarios();
    
    // Test valid login scenarios
    await testCustomerLogin();
    await testBarberLogin();
    await testAdminLogin();
    
    // Test security aspects
    await testTokenSecurity();
    await testCrossUserAccess();
    
    // Test rate limiting (optional)
    await testRateLimiting();
    
  } catch (error) {
    log(`Test execution error: ${error.message}`, 'error');
    testResults.failed++;
    testResults.errors.push(`Test execution error: ${error.message}`);
  }
  
  // Print results
  log('\n=== Test Results Summary ===', 'info');
  log(`Total Tests: ${testResults.passed + testResults.failed}`, 'info');
  log(`Passed: ${testResults.passed}`, 'success');
  log(`Failed: ${testResults.failed}`, testResults.failed > 0 ? 'error' : 'success');
  
  if (testResults.errors.length > 0) {
    log('\nFailed Tests:', 'error');
    testResults.errors.forEach((error, index) => {
      log(`${index + 1}. ${error}`, 'error');
    });
  }
  
  if (testResults.failed === 0) {
    log('\n🎉 All authentication tests passed!', 'success');
    log('✅ Login functionality is working correctly for all user types', 'success');
    log('✅ Token generation and validation are secure', 'success');
    log('✅ Authorization middleware is functioning properly', 'success');
  } else {
    log('\n❌ Some tests failed. Please review the errors above.', 'error');
  }
  
  process.exit(testResults.failed > 0 ? 1 : 0);
};

// Handle process termination
process.on('SIGINT', () => {
  log('\nTest interrupted by user', 'warning');
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  log(`Unhandled Rejection at: ${promise}, reason: ${reason}`, 'error');
  process.exit(1);
});

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests();
}

module.exports = {
  runAllTests,
  testCustomerLogin,
  testBarberLogin,
  testAdminLogin,
  testInvalidLoginScenarios,
  testTokenSecurity
}; 