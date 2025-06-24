# Barber Demo - MERN Stack Application

A full-stack barber shop management system built with the MERN stack (MongoDB, Express.js, React, Node.js).

## Features

- **User Authentication**: Register, login, and profile management
- **Role-based Access**: Customer, Barber, and Admin roles
- **Service Management**: Create, update, and manage barber services
- **Appointment Booking**: Book appointments with barbers
- **Barber Profiles**: Manage barber information and availability
- **Real-time Scheduling**: Check availability and book time slots
- **RESTful API**: Complete API for frontend integration

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation
- **cors** - Cross-origin resource sharing
- **helmet** - Security middleware
- **morgan** - HTTP request logger

### Frontend
- **React** - UI library
- **Vite** - Build tool
- **Axios** - HTTP client (to be added)

## Project Structure

```
barber-demo/
├── client/                 # React frontend
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── config/                 # Database configuration
├── data/                   # Seed data
├── middleware/             # Custom middleware
├── models/                 # Mongoose models
├── routes/                 # API routes
├── server.js              # Main server file
├── package.json           # Backend dependencies
└── README.md
```

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd barber-demo
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd client
   npm install
   cd ..
   ```

4. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/barber-demo
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRE=7d
   CLIENT_URL=http://localhost:5173
   ```

5. **Start MongoDB**
   Make sure MongoDB is running on your system or use MongoDB Atlas.

6. **Seed the database**
   ```bash
   node data/seed.js
   ```

7. **Start the backend server**
   ```bash
   npm run dev
   ```

8. **Start the frontend**
   ```bash
   cd client
   npm run dev
   ```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## API Documentation

### Authentication Endpoints

#### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+1234567890"
}
```

#### Login User
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Current User
```
GET /api/auth/me
Authorization: Bearer <token>
```

### Services Endpoints

#### Get All Services
```
GET /api/services
GET /api/services?category=haircut
GET /api/services?isActive=true
```

#### Get Single Service
```
GET /api/services/:id
```

#### Create Service (Admin/Barber)
```
POST /api/services
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Classic Haircut",
  "description": "Traditional men's haircut",
  "price": 25.00,
  "duration": 30,
  "category": "haircut"
}
```

### Appointments Endpoints

#### Get Appointments
```
GET /api/appointments
Authorization: Bearer <token>
GET /api/appointments?status=pending&date=2024-01-15
```

#### Create Appointment
```
POST /api/appointments
Authorization: Bearer <token>
Content-Type: application/json

{
  "barber": "barber_id",
  "service": "service_id",
  "date": "2024-01-15",
  "startTime": "14:00",
  "notes": "Special instructions"
}
```

#### Update Appointment Status
```
PUT /api/appointments/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "confirmed"
}
```

### Barbers Endpoints

#### Get All Barbers
```
GET /api/barbers
GET /api/barbers?isAvailable=true&specialty=haircut
```

#### Get Single Barber
```
GET /api/barbers/:id
```

#### Create Barber Profile (Admin)
```
POST /api/barbers
Authorization: Bearer <token>
Content-Type: application/json

{
  "user": "user_id",
  "specialties": ["haircut", "beard-trim"],
  "experience": 5,
  "bio": "Experienced barber..."
}
```

## Sample Data

After running the seed script, you'll have these test accounts:

### Admin
- Email: admin@barberdemo.com
- Password: admin123

### Barbers
- Email: john@barberdemo.com
- Password: barber123
- Email: mike@barberdemo.com
- Password: barber123

### Customers
- Email: david@example.com
- Password: customer123
- Email: sarah@example.com
- Password: customer123

## Available Services

1. **Classic Haircut** - £25 (30 min)
2. **Beard Trim** - £15 (20 min)
3. **Hot Shave** - £35 (45 min)
4. **Kids Haircut** - £18 (25 min)
5. **Hair Coloring** - £60 (90 min)
6. **Styling** - £20 (30 min)

## Development

### Scripts

```bash
# Backend
npm run dev          # Start development server with nodemon
npm start           # Start production server

# Frontend (in client directory)
npm run dev         # Start development server
npm run build       # Build for production
npm run preview     # Preview production build
```

### Database Seeding

```bash
node data/seed.js   # Seed database with sample data
```

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation with express-validator
- CORS protection
- Rate limiting
- Helmet security headers
- Role-based authorization

## Error Handling

The API uses consistent error responses:

```json
{
  "success": false,
  "message": "Error message",
  "errors": [] // Validation errors if any
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License. 