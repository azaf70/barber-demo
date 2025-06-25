import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { authAPI } from '@services/api'
import { Header } from '@components/Header'

// Customer Pages
import { HomePage } from '@features/customers/pages/HomePage'
import { ShopsPage } from '@features/customers/pages/ShopsPage'
import { ShopDetailPage } from '@features/customers/pages/ShopDetailPage'

// Barber Pages
import DashboardPage from '@features/barbers/pages/DashboardPage'

// Admin Pages
import AdminDashboardPage from '@features/admin/pages/AdminDashboardPage'

// Shared Components
import { Login } from '@components/Login'
import { Register } from '@components/Register'
import { Appointments } from '@components/Appointments'
import { Profile } from '@components/Profile'
import { Services } from '@components/Services'
import { Barbers } from '@components/Barbers'
import { BookingPage } from '@components/BookingPage'

// Animation variants
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
}

function App() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <AppContent />
    </Router>
  )
}

function AppContent() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      // Verify token and get user data
      authAPI.verifyToken()
        .then(userData => setUser(userData))
        .catch(() => {
          localStorage.removeItem('token')
          setUser(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const handleLogin = (userData) => {
    setUser(userData)
    localStorage.setItem('token', userData.token)
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('token')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} onLogout={handleLogout} />
      
      <AnimatePresence mode="wait">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={
            <motion.div
              key="home"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
            >
              <HomePage />
            </motion.div>
          } />
          
          <Route path="/shops" element={
            <motion.div
              key="shops"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
            >
              <ShopsPage />
            </motion.div>
          } />
          
          <Route path="/shops/:id" element={
            <motion.div
              key="shop-detail"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
            >
              <ShopDetailPage />
            </motion.div>
          } />
          
          <Route path="/services" element={
            <motion.div
              key="services"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
            >
              <Services />
            </motion.div>
          } />
          
          <Route path="/barbers" element={
            <motion.div
              key="barbers"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
            >
              <Barbers />
            </motion.div>
          } />
          
          <Route path="/login" element={
            user ? <Navigate to="/" replace /> : (
              <motion.div
                key="login"
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
              >
                <Login onLogin={handleLogin} />
              </motion.div>
            )
          } />
          
          <Route path="/register" element={
            user ? <Navigate to="/" replace /> : (
              <motion.div
                key="register"
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
              >
                <Register onLogin={handleLogin} />
              </motion.div>
            )
          } />

          {/* Protected Routes */}
          <Route path="/appointments" element={
            user ? (
              <motion.div
                key="appointments"
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
              >
                <Appointments user={user} />
              </motion.div>
            ) : <Navigate to="/login" replace />
          } />
          
          <Route path="/booking/:shopId" element={
            user ? (
              <motion.div
                key="booking"
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
              >
                <BookingPage />
              </motion.div>
            ) : <Navigate to="/login" replace />
          } />
          
          <Route path="/profile" element={
            user ? (
              <motion.div
                key="profile"
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
              >
                <Profile user={user} />
              </motion.div>
            ) : <Navigate to="/login" replace />
          } />

          {/* Barber Routes */}
          <Route path="/dashboard" element={
            user && user.role === 'barber' ? (
              <motion.div
                key="dashboard"
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
              >
                <DashboardPage />
              </motion.div>
            ) : <Navigate to="/" replace />
          } />

          {/* Admin Routes */}
          <Route path="/admin" element={
            user && user.role === 'admin' ? (
              <motion.div
                key="admin"
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
              >
                <AdminDashboardPage />
              </motion.div>
            ) : <Navigate to="/" replace />
          } />

          {/* 404 Route */}
          <Route path="*" element={
            <motion.div
              key="404"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
              className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center"
            >
              <div className="text-center">
                <h1 className="text-6xl font-bold text-muted-foreground mb-4">404</h1>
                <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
                <p className="text-muted-foreground mb-8">
                  The page you're looking for doesn't exist.
                </p>
                <a
                  href="/"
                  className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  Go Home
                </a>
              </div>
            </motion.div>
          } />
        </Routes>
      </AnimatePresence>
    </div>
  )
}

export default App


