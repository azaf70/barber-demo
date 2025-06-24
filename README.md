# 🏪 Barber Marketplace - Multi-Vendor Platform

A comprehensive multi-vendor marketplace platform for barber shops, allowing shop owners to create their digital storefronts, manage services, employees, and appointments. Built with the MERN stack (MongoDB, Express.js, React, Node.js).

## 🚀 Features

### **Multi-Vendor Architecture**
- **Shop Owners**: Create and manage their barber shops
- **Barbers/Employees**: Work for specific shops with individual profiles
- **Customers**: Book appointments across different shops
- **Super Admin**: Complete control over the platform

### **Shop Management**
- Create and customize shop profiles
- Manage business hours and availability
- Upload shop images and gallery
- Set specialties and amenities
- Track ratings and reviews
- Manage subscription plans

### **Service Management**
- Shop-specific services with pricing
- Service categories and options
- Availability scheduling
- Commission tracking
- Service statistics and analytics

### **Employee Management**
- Add and manage barbers/employees
- Individual working hours and availability
- Performance tracking and ratings
- Commission and earnings management
- Leave management system

### **Appointment System**
- Real-time availability checking
- Multi-shop booking
- Payment processing
- Review and rating system
- Automated reminders

### **Admin Dashboard**
- Platform-wide analytics
- Shop approval and management
- User management
- Revenue tracking
- Commission calculations

## 🏗️ Architecture

### **User Roles**
1. **Super Admin** - Platform owner with full control
2. **Shop Owner** - Manages their barber shop(s)
3. **Barber** - Employee working at a specific shop
4. **Customer** - Books appointments across shops

### **Database Models**
- **User** - Authentication and role management
- **Shop** - Shop profiles and business information
- **Service** - Shop-specific services
- **Barber** - Employee profiles and availability
- **Appointment** - Booking and payment tracking

## 🛠️ Tech Stack

### **Backend**
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **express-validator** - Input validation
- **helmet** - Security headers
- **cors** - Cross-origin resource sharing

### **Frontend**
- **React** - UI library
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **shadcn/ui** - Component library
- **framer-motion** - Animations
- **Axios** - HTTP client
- **React Router** - Navigation

## 📦 Installation

### **Prerequisites**
- Node.js (v18 or higher)
- MongoDB (local or cloud)
- npm or yarn

### **Backend Setup**
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev

# Seed database with sample data
node data/seed.js
```

### **Frontend Setup**
```bash
cd client

# Install dependencies
npm install

# Start development server
npm run dev
```

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/barber-marketplace

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=30d

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Optional: Email service (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## 📊 API Endpoints

### **Authentication**
```
POST /api/auth/register    # Register new user
POST /api/auth/login       # User login
GET  /api/auth/me          # Get current user
PUT  /api/auth/profile     # Update profile
```

### **Shops**
```
GET    /api/shops              # Get all shops
GET    /api/shops/featured     # Get featured shops
GET    /api/shops/:slug        # Get shop by slug
POST   /api/shops              # Create shop (shop owner)
PUT    /api/shops/:id          # Update shop
PATCH  /api/shops/:id/status   # Update status (super admin)
GET    /api/shops/:id/analytics # Shop analytics
DELETE /api/shops/:id          # Delete shop
```

### **Services**
```
GET    /api/services           # Get all services
GET    /api/services/:id       # Get service by ID
POST   /api/services           # Create service (shop owner)
PUT    /api/services/:id       # Update service
DELETE /api/services/:id       # Delete service
```

### **Barbers**
```
GET    /api/barbers            # Get all barbers
GET    /api/barbers/:id        # Get barber by ID
POST   /api/barbers            # Create barber profile
PUT    /api/barbers/:id        # Update barber
PUT    /api/barbers/:id/hours  # Update working hours
DELETE /api/barbers/:id        # Delete barber
```

### **Appointments**
```
GET    /api/appointments       # Get appointments
POST   /api/appointments       # Create appointment
PUT    /api/appointments/:id   # Update appointment
PUT    /api/appointments/:id/status # Update status
DELETE /api/appointments/:id   # Cancel appointment
```

### **Admin Dashboard**
```
GET /api/admin/dashboard       # Platform statistics
```

## 🎯 Sample Data

After running the seed script, you'll have these test accounts:

### **Super Admin**
- Email: admin@barbermarketplace.com
- Password: admin123

### **Shop Owners**
- Email: shopowner1@example.com
- Password: owner123
- Email: shopowner2@example.com
- Password: owner123

### **Barbers**
- Email: barber1@example.com
- Password: barber123
- Email: barber2@example.com
- Password: barber123

### **Customers**
- Email: customer1@example.com
- Password: customer123
- Email: customer2@example.com
- Password: customer123

## 🏪 Sample Shops

1. **Classic Cuts Barbershop** - Traditional men's grooming
2. **Modern Fade Studio** - Contemporary styling and fades
3. **Luxury Grooming Lounge** - Premium services and experience

## 💰 Pricing Structure

### **Platform Commission**
- **Platform Fee**: 10% of service price
- **Barber Earnings**: 70% of service price
- **Shop Earnings**: 20% of service price

### **Subscription Plans**
- **Basic**: £29/month - Up to 3 barbers, basic features
- **Premium**: £59/month - Up to 10 barbers, advanced features
- **Enterprise**: £99/month - Unlimited barbers, all features

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- CORS protection
- Rate limiting
- Helmet security headers
- Role-based authorization
- SQL injection prevention

## 📈 Analytics & Reporting

### **Shop Analytics**
- Total appointments and revenue
- Customer ratings and reviews
- Popular services and peak hours
- Employee performance metrics

### **Platform Analytics**
- Total users, shops, and transactions
- Revenue and commission tracking
- Geographic distribution
- Growth metrics

## 🚀 Deployment

### **Backend Deployment**
```bash
# Build for production
npm run build

# Start production server
npm start
```

### **Frontend Deployment**
```bash
cd client

# Build for production
npm run build

# Preview build
npm run preview
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact: support@barbermarketplace.com

## 🔮 Future Features

- **Mobile App**: React Native mobile application
- **Payment Gateway**: Stripe/PayPal integration
- **SMS/Email Notifications**: Automated reminders
- **Advanced Analytics**: Business intelligence dashboard
- **Multi-language Support**: Internationalization
- **API Documentation**: Swagger/OpenAPI
- **Real-time Chat**: Customer support system
- **Inventory Management**: Product and supply tracking 