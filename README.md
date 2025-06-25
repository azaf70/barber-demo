# BarberHub - Complete Booking Platform

A comprehensive barber shop booking platform built with React, Node.js, and MongoDB. Features a modern monorepo architecture with strict separation of concerns for customers, barbers, and administrators.

## 🏗 Architecture Overview

```
barberhub/
├── client/                    # React frontend
│   ├── src/
│   │   ├── features/         # Feature-based organization
│   │   │   ├── customers/    # Customer-specific features
│   │   │   ├── barbers/      # Barber-specific features
│   │   │   └── admin/        # Admin-specific features
│   │   └── shared/           # Shared components & utilities
├── server/                    # Node.js backend
│   ├── src/
│   │   ├── modules/          # Feature-based modules
│   │   │   ├── customers/    # Customer API endpoints
│   │   │   ├── barbers/      # Barber API endpoints
│   │   │   └── admin/        # Admin API endpoints
│   │   ├── models/           # MongoDB schemas
│   │   └── routes/           # Shared API routes
├── shared/                    # Shared types & schemas
└── docs/                      # Documentation
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB 7+
- pnpm (recommended) or npm

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd barberhub
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd server
   npm install

   # Install frontend dependencies
   cd ../client
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # In server directory
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the development servers**
   ```bash
   # Terminal 1 - Start backend
   cd server
   npm run dev

   # Terminal 2 - Start frontend
   cd client
   npm run dev
   ```

5. **Seed the database**
   ```bash
   cd server
   npm run seed
   ```

## 📡 API Endpoints

### Authentication
```
POST   /api/auth/register     # User registration
POST   /api/auth/login        # User login
POST   /api/auth/logout       # User logout
POST   /api/auth/refresh      # Refresh token
```

### Shared Endpoints (Public)
```
GET    /api/shops             # Get all shops
GET    /api/shops/search      # Search shops
GET    /api/shops/:id         # Get shop details
GET    /api/shops/:id/services    # Get shop services
GET    /api/shops/:id/employees   # Get shop employees
GET    /api/shops/:id/availability # Get shop availability
GET    /api/shops/:id/reviews # Get shop reviews

GET    /api/services          # Get all services
GET    /api/services/categories # Get service categories
GET    /api/services/:id      # Get service details
```

### Customer Endpoints (Authenticated)
```
GET    /api/customers/profile     # Get customer profile
PUT    /api/customers/profile     # Update customer profile

GET    /api/customers/bookings    # Get customer bookings
POST   /api/customers/bookings    # Create booking
PUT    /api/customers/bookings/:id # Update booking
DELETE /api/customers/bookings/:id # Cancel booking

GET    /api/customers/favorites   # Get favorites
POST   /api/customers/favorites   # Add to favorites
DELETE /api/customers/favorites/:shopId # Remove from favorites
```

### Barber Endpoints (Authenticated)
```
GET    /api/barbers/profile       # Get barber profile
PUT    /api/barbers/profile       # Update barber profile

GET    /api/barbers/shops         # Get barber shops
POST   /api/barbers/shops         # Create shop
PUT    /api/barbers/shops/:id     # Update shop
DELETE /api/barbers/shops/:id     # Delete shop

GET    /api/barbers/bookings      # Get barber bookings
PUT    /api/barbers/bookings/:id  # Update booking status

GET    /api/barbers/earnings      # Get earnings data

POST   /api/barbers/services      # Create service
PUT    /api/barbers/services/:id  # Update service
DELETE /api/barbers/services/:id  # Delete service
```

### Admin Endpoints (Super Admin Only)
```
GET    /api/admin/users           # Get all users
POST   /api/admin/users           # Create user
PUT    /api/admin/users/:id       # Update user
DELETE /api/admin/users/:id       # Delete user

GET    /api/admin/shops           # Get all shops
PUT    /api/admin/shops/:id       # Update shop status
DELETE /api/admin/shops/:id       # Delete shop

GET    /api/admin/analytics       # Get platform analytics
GET    /api/admin/revenue         # Get revenue data
PUT    /api/admin/commission/:shopId # Update commission rate
```

## 🎯 Features

### Customer Features
- **Shop Discovery**: Search and filter barber shops by location, services, and ratings
- **Booking Management**: Schedule, modify, and cancel appointments
- **Favorites**: Save preferred shops for quick access
- **Reviews**: Leave reviews for completed appointments
- **Profile Management**: Update personal information and preferences

### Barber Features
- **Shop Management**: Create and manage multiple shop locations
- **Service Catalog**: Define services, pricing, and duration
- **Booking Management**: View and manage appointments
- **Earnings Tracking**: Monitor revenue and performance
- **Employee Management**: Manage shop staff and schedules

### Admin Features
- **User Management**: Oversee all platform users
- **Shop Oversight**: Monitor and manage all shops
- **Analytics Dashboard**: Platform usage and performance metrics
- **Revenue Tracking**: Monitor platform revenue and commissions
- **Content Moderation**: Manage reviews and user content

## 🛠 Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **Framer Motion** for animations
- **React Router** for navigation
- **Axios** for API communication

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose
- **JWT** for authentication
- **bcryptjs** for password hashing
- **express-validator** for input validation
- **CORS** for cross-origin requests

### Development Tools
- **ESLint** for code linting
- **Prettier** for code formatting
- **Husky** for git hooks
- **Vitest** for testing

## 📁 Project Structure

### Frontend Structure
```
client/src/
├── features/
│   ├── customers/
│   │   ├── components/     # Customer-specific components
│   │   ├── pages/         # Customer pages
│   │   ├── hooks/         # Customer-specific hooks
│   │   ├── services/      # Customer API calls
│   │   └── types/         # Customer types
│   ├── barbers/
│   │   ├── components/    # Barber-specific components
│   │   ├── pages/         # Barber pages
│   │   ├── hooks/         # Barber-specific hooks
│   │   ├── services/      # Barber API calls
│   │   └── types/         # Barber types
│   └── admin/
│       ├── components/    # Admin-specific components
│       ├── pages/         # Admin pages
│       ├── hooks/         # Admin-specific hooks
│       ├── services/      # Admin API calls
│       └── types/         # Admin types
├── shared/
│   ├── components/        # Reusable UI components
│   ├── services/          # Shared API services
│   ├── utils/             # Utility functions
│   └── types/             # Shared types
└── routes/                # Route definitions
```

### Backend Structure
```
server/src/
├── modules/
│   ├── customers/
│   │   ├── controllers/   # Customer route handlers
│   │   ├── services/      # Customer business logic
│   │   ├── routes/        # Customer routes
│   │   ├── middleware/    # Customer middleware
│   │   └── validators/    # Customer validation
│   ├── barbers/
│   │   ├── controllers/   # Barber route handlers
│   │   ├── services/      # Barber business logic
│   │   ├── routes/        # Barber routes
│   │   ├── middleware/    # Barber middleware
│   │   └── validators/    # Barber validation
│   └── admin/
│       ├── controllers/   # Admin route handlers
│       ├── services/      # Admin business logic
│       ├── routes/        # Admin routes
│       ├── middleware/    # Admin middleware
│       └── validators/    # Admin validation
├── models/                # MongoDB schemas
├── routes/                # Shared routes
├── middleware/            # Global middleware
└── config/                # Configuration files
```

## 🔧 Development

### Available Scripts

#### Backend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run seed         # Seed database with sample data
npm run test         # Run tests
```

#### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run test         # Run tests
```

### Environment Variables

#### Backend (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/barberhub
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

## 🧪 Testing

### Backend Testing
```bash
cd server
npm run test
```

### Frontend Testing
```bash
cd client
npm run test
```

### API Testing
```bash
cd server
node test-new-api.js
```

## 🚀 Deployment

### Backend Deployment
1. Set production environment variables
2. Build the application: `npm run build`
3. Start the server: `npm start`

### Frontend Deployment
1. Set production API URL
2. Build the application: `npm run build`
3. Deploy the `dist` folder to your hosting service

## 📝 API Documentation

For detailed API documentation, see the individual route files in the `server/src/modules/` directory. Each module contains comprehensive JSDoc comments explaining the endpoints, parameters, and responses.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation in the `docs/` folder
- Review the API endpoints in the route files

---

**BarberHub** - Connecting customers with the best barber shops since 2024 ✂️ 