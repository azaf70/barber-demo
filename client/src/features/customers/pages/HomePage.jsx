import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Button } from '@ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ui/card'
import { Badge } from '@ui/badge'
import { BentoGrid, BentoGridItem } from '@ui/bento-grid'
import { AuroraBackgroundDemo } from '@components/aurora-background-demo'
import { MapPin, Star, Clock, Users, Scissors, Building2, CalendarDays, BarChart3, Search, Sparkles, Shield, Smile, Zap } from 'lucide-react'
import { cn } from '@utils/utils'
import { Input } from '@ui/input'
import { Label } from '@ui/label'
import { Checkbox } from '@ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ui/select'
import { sharedAPI } from '@services/api'

const words = [
  {
    text: 'BarberHub',
  },
  {
    text: 'Premium Barber Booking',
  },
  {
    text: 'Trusted by Thousands',
  },
  {
    text: 'Real Reviews, Transparent Pricing',
  },
  {
    text: 'Effortless Booking',
  },
  {
    text: 'Only the best, verified professionals.',
  },
];

// Hero glass animation variants
const heroVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: 'easeOut' } }
}
// Feature card animation
const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: 0.2 + i * 0.15, duration: 0.7, ease: 'easeOut' } })
}
// Stats animation
const statVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: 0.5 + i * 0.1, duration: 0.6, ease: 'easeOut' } })
}

const features = [
  {
    icon: <Zap className="w-6 h-6" />,
    title: 'Lightning Fast',
    desc: 'Book in seconds, not minutes'
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: 'Secure & Safe',
    desc: 'Your data is protected'
  },
  {
    icon: <Clock className="w-6 h-6" />,
    title: '24/7 Available',
    desc: 'Book anytime, anywhere'
  }
]

const stats = [
  { value: '500+', label: 'Expert Barbers', color: 'from-cyan-400 to-blue-500' },
  { value: '4.9★', label: 'Average Rating', color: 'from-yellow-400 to-orange-500' },
  { value: '10K+', label: 'Happy Clients', color: 'from-purple-400 to-pink-500' }
]

export const HomePage = () => {
  const [shops, setShops] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    services: '',
    rating: '',
    available: false
  })

  useEffect(() => {
    fetchShops()
  }, [filters])

  const fetchShops = useCallback(async () => {
    try {
      setLoading(true)
      const params = { limit: 20 }
      
      // Only add parameters that have valid values
      if (filters.services && filters.services.trim()) {
        params.services = filters.services
      }
      if (filters.rating && filters.rating.trim()) {
        params.rating = filters.rating
      }
      if (filters.available !== undefined && filters.available !== null) {
        params.available = filters.available
      }
      
      const response = await sharedAPI.getShops(params)
      setShops(response.data.data)
    } catch (error) {
      console.error('Error fetching shops:', error)
    } finally {
      setLoading(false)
    }
  }, [filters])

  const handleSearch = useCallback(async () => {
    if (searchQuery.trim()) {
      try {
        setLoading(true)
        const response = await sharedAPI.searchShops({ q: searchQuery })
        setShops(response.data.data)
      } catch (error) {
        console.error('Error searching shops:', error)
      } finally {
        setLoading(false)
      }
    } else {
      fetchShops()
    }
  }, [searchQuery, fetchShops])

  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }, [])

  const formatPrice = useCallback((price) => {
    return `$${(price / 100).toFixed(2)}`
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-secondary/20 to-primary/10 relative overflow-hidden">
      {/* Animated Background Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        {/* Gradient Fade at Bottom for Seamless Transition */}
        <div className="pointer-events-none absolute left-0 right-0 bottom-0 h-32 z-30 bg-gradient-to-b from-transparent to-[#f7f9fb]" />
        {/* Main Hero Content */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-center max-w-4xl mx-auto"
        >
          {/* Glowing Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30 backdrop-blur-sm mb-8"
          >
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-gray-700">Live & Ready</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-6xl md:text-8xl font-black tracking-tight mb-6"
          >
            <span className="bg-gradient-to-r from-gray-800 via-gray-700 to-gray-600 bg-clip-text text-transparent">
              BARBER
            </span>
            <br />
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              HUB
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-xl md:text-2xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            Where precision meets style. Book your next transformation with the city's elite barbers.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-6 justify-center mb-16"
          >
            <Button
              size="lg"
              className="group relative px-8 py-4 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-bold rounded-xl shadow-2xl shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 transform hover:scale-105"
              asChild
            >
              <Link to="/shops">
                <span className="relative z-10">Find Your Barber</span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-secondary/80 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="px-8 py-4 border-2 border-primary/30 hover:border-primary/50 text-gray-700 hover:text-gray-800 font-bold rounded-xl backdrop-blur-sm hover:bg-white/50 transition-all duration-300"
              asChild
            >
              <Link to="/register">Join as Barber</Link>
            </Button>
          </motion.div>
        </motion.div>

        {/* Floating Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 + i * 0.1, duration: 0.6 }}
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white to-secondary rounded-2xl blur-xl opacity-70 group-hover:opacity-90 transition-opacity duration-300" />
              <div className="relative bg-white/80 backdrop-blur-xl border border-primary/20 rounded-2xl p-6 text-center hover:border-primary/40 transition-all duration-300 transform hover:scale-105 shadow-lg">
                <div className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-2`}>
                  {stat.value}
                </div>
                <div className="text-gray-600 text-sm font-medium">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto"
        >
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.6 + i * 0.1, duration: 0.6 }}
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative bg-white/70 backdrop-blur-xl border border-primary/20 rounded-2xl p-8 text-center hover:border-primary/40 transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 shadow-lg">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-xl mb-4 text-white">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 0.8 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-4 px-6 py-3 bg-white/80 backdrop-blur-xl border border-primary/20 rounded-full shadow-lg">
            <div className="flex space-x-1">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-green-500 rounded-full animate-pulse"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
            <span className="text-gray-700 text-sm font-medium">Ready to transform your look?</span>
          </div>
        </motion.div>
      </section>

      {/* Top Shops Section */}
      <section className="py-20 bg-slate-50 dark:bg-slate-800">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Top Rated Barbers</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover the most popular and highly-rated barber shops in your area
            </p>
          </motion.div>

          {/* Search Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="mb-8"
          >
            <Card className="max-w-4xl mx-auto">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="Search for barber shops, services, or locations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Button onClick={handleSearch} className="md:w-auto">
                    Search
                  </Button>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-4 mt-4">
                  <Select
                    value={filters.services || "all"}
                    onValueChange={(value) => handleFilterChange('services', value === 'all' ? '' : value)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="All Services" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Services</SelectItem>
                      <SelectItem value="haircut">Haircut</SelectItem>
                      <SelectItem value="beard">Beard Trim</SelectItem>
                      <SelectItem value="styling">Styling</SelectItem>
                      <SelectItem value="shave">Shave</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={filters.rating || "all"}
                    onValueChange={(value) => handleFilterChange('rating', value === 'all' ? '' : value)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="All Ratings" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Ratings</SelectItem>
                      <SelectItem value="4">4+ Stars</SelectItem>
                      <SelectItem value="3">3+ Stars</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="available"
                      checked={filters.available}
                      onCheckedChange={(checked) => handleFilterChange('available', checked)}
                    />
                    <Label htmlFor="available" className="text-sm">Available Now</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Shops Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {loading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className="animate-pulse">
                    <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                    <CardContent className="p-4">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ) : shops.length > 0 ? (
              shops.map((shop, index) => (
                <motion.div
                  key={shop._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  whileHover={{ y: -2 }}
                >
                  <Card className="h-full hover:shadow-lg transition-all duration-300 ease-out cursor-pointer">
                    <div className="relative">
                      <img
                        src={shop.images?.[0] || '/assets/default-shop.jpg'}
                        alt={shop.name}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                      <Badge className="absolute top-2 right-2 bg-green-500">
                        {shop.status === 'active' ? 'Open' : 'Closed'}
                      </Badge>
                    </div>
                    
                    <CardContent className="p-4">
                      <CardTitle className="text-xl mb-2">{shop.name}</CardTitle>
                      
                      <div className="flex items-center gap-1 mb-2">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600">
                          {shop.rating?.average?.toFixed(1) || 'N/A'} ({shop.rating?.count || 0} reviews)
                        </span>
                      </div>

                      <div className="flex items-center gap-1 mb-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">
                          {shop.address ? (
                            typeof shop.address === 'string' 
                              ? shop.address 
                              : `${shop.address.street || ''}, ${shop.address.city || ''}, ${shop.address.state || ''}`
                          ) : 'Address not available'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 mb-3 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">
                          {shop.businessHours?.monday?.isOpen ? 'Open Today' : 'Closed Today'}
                        </span>
                      </div>

                      {shop.services && shop.services.length > 0 && (
                        <div className="mb-3">
                          <div className="flex flex-wrap gap-1">
                            {shop.services.slice(0, 3).map((service, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {service.name}
                              </Badge>
                            ))}
                            {shop.services.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{shop.services.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex justify-between items-center">
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                        <Button size="sm">
                          Book Now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="text-gray-500">
                  <Search className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-xl font-semibold mb-2">No shops found</h3>
                  <p>Try adjusting your search criteria or location.</p>
                </div>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center mt-12"
          >
            <Button size="lg" variant="default" asChild>
              <Link to="/shops">View All Shops</Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  )
} 