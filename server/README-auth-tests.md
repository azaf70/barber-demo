# Authentication Test Suite

This comprehensive test suite validates the authentication functionality for all user types (customer, barber, admin) in the BarberHub application.

## 🚀 Quick Start

### Prerequisites
- Node.js server running on port 3001 (or set `API_URL` environment variable)
- MongoDB database with seeded test data
- All dependencies installed (`npm install`)

### Running Tests

1. **Setup and run all tests:**
   ```bash
   npm run setup:test
   ```

2. **Run tests only (assumes database is already seeded):**
   ```bash
   npm run test:auth
   ```

3. **Seed database only:**
   ```bash
   npm run seed
   ```

## 📋 Test Coverage

### User Types Tested
- **Customer**: `customer1@example.com` / `customer123`
- **Barber**: `barber1@example.com` / `barber123`
- **Admin**: `admin@barbermarketplace.com` / `admin123`

### Test Scenarios

#### ✅ Valid Login Tests
- Successful login for each user type
- Token generation and validation
- User data retrieval via `/me` endpoint
- Token verification endpoint

#### ❌ Invalid Login Tests
- Non-existent email
- Wrong password
- Invalid email format
- Missing password
- Empty fields

#### 🔒 Security Tests
- Token tampering detection
- Expired token handling
- Wrong JWT secret rejection
- Malformed token rejection
- Missing token handling

#### 🔄 Cross-User Access Tests
- Token isolation between user types
- Role-based access validation
- User data integrity

#### ⚡ Rate Limiting Tests
- Multiple rapid login attempts
- API abuse prevention

## 🛠 Configuration

### Environment Variables
```bash
# API Configuration
API_URL=http://localhost:3001/api

# JWT Configuration
JWT_SECRET=your-secret-key
```

### Test Credentials
The test uses pre-seeded users from `src/data/seed.js`:

```javascript
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
```

## 📊 Test Results

The test suite provides detailed output with:
- ✅ Passed tests (green)
- ❌ Failed tests (red)
- ⚠️ Warnings (yellow)
- 📊 Summary statistics

### Example Output
```
[2024-01-15T10:30:00.000Z] 🚀 Starting Comprehensive Authentication Tests
[2024-01-15T10:30:00.000Z] Base URL: http://localhost:3001/api
[2024-01-15T10:30:00.000Z] JWT Secret: your-secre...

=== Testing Invalid Login Scenarios ===
✓ Login with non-existent email should fail
✓ Should return 401 status for non-existent email
✓ Login with wrong password should fail
✓ Should return 401 status for wrong password

=== Testing Customer Login ===
✓ Customer login should succeed
✓ Should return 200 status for successful login
✓ Response should have success: true
✓ Response should include JWT token
✓ Response should include user data
✓ Generated token should be valid
✓ Token should contain userId
✓ Token should contain correct role

=== Test Results Summary ===
Total Tests: 45
Passed: 45
Failed: 0

🎉 All authentication tests passed!
✅ Login functionality is working correctly for all user types
✅ Token generation and validation are secure
✅ Authorization middleware is functioning properly
```

## 🔧 Troubleshooting

### Common Issues

1. **Server not running**
   ```
   Error: connect ECONNREFUSED 127.0.0.1:3001
   ```
   **Solution**: Start the server with `npm run dev`

2. **Database not seeded**
   ```
   ✗ Customer login should succeed
   ✗ Should return 200 status for successful login
   ```
   **Solution**: Run `npm run seed` to populate test data

3. **JWT Secret mismatch**
   ```
   ✗ Generated token should be valid
   ```
   **Solution**: Ensure `JWT_SECRET` environment variable matches server configuration

4. **CORS issues**
   ```
   Error: Network Error
   ```
   **Solution**: Check CORS configuration in server

### Debug Mode
For verbose output, use:
```bash
npm run test:auth:verbose
```

## 🧪 Manual Testing

You can also test individual scenarios:

```javascript
const { testCustomerLogin, testBarberLogin, testAdminLogin } = require('./test-auth-comprehensive');

// Test specific user type
await testCustomerLogin();
await testBarberLogin();
await testAdminLogin();
```

## 📝 API Endpoints Tested

- `POST /api/auth/login` - User login
- `GET /api/auth/verify-token` - Token verification
- `GET /api/auth/me` - Current user data

## 🔐 Security Validations

- JWT token structure and payload
- Password hashing verification
- Role-based access control
- Token expiration handling
- Input validation and sanitization
- SQL injection prevention (MongoDB)
- XSS protection through proper response formatting

## 📈 Performance Notes

- Tests run sequentially to avoid race conditions
- Each test includes proper error handling
- Timeout handling for slow responses
- Memory-efficient token validation

## 🤝 Contributing

When adding new authentication features:
1. Update the test suite to cover new scenarios
2. Add new test credentials to seed data if needed
3. Update this README with new test coverage
4. Ensure all tests pass before merging

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Verify server logs for detailed error messages
3. Ensure database connection is stable
4. Validate environment variables are set correctly 