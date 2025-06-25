import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Button } from '@ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ui/card'
import { Badge } from '@ui/badge'
import { BentoGrid, BentoGridItem } from '@ui/bento-grid'
import { AuroraBackgroundDemo } from '@components/aurora-background-demo'
import { MapPin, Star, Clock, Users, Scissors, Building2, CalendarDays, BarChart3, Search } from 'lucide-react'
import { cn } from '@utils/utils'
import { Input } from '@ui/input'
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

const cardVariants = {
  initial: { opacity: 0, scale: 0.9, y: 20 },
  animate: { opacity: 1, scale: 1, y: 0 },
  hover: { scale: 1.02, y: -5 }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

export const HomePage = () => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [currentText, setCurrentText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [shops, setShops] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    services: '',
    rating: '',
    available: false
  })

  useEffect(() => {
    const typeSpeed = isDeleting ? 50 : 100
    const deleteSpeed = 50
    const pauseTime = 2000

    const typeText = () => {
      const currentWord = words[currentWordIndex].text
      
      if (isDeleting) {
        setCurrentText(prev => prev.slice(0, -1))
        if (currentText === '') {
          setIsDeleting(false)
          setCurrentWordIndex((prev) => (prev + 1) % words.length)
        }
      } else {
        if (currentText === currentWord) {
          setTimeout(() => setIsDeleting(true), pauseTime)
          return
        }
        setCurrentText(currentWord.slice(0, currentText.length + 1))
      }
    }

    const timer = setTimeout(typeText, typeSpeed)
    return () => clearTimeout(timer)
  }, [currentText, isDeleting, currentWordIndex])

  useEffect(() => {
    fetchShops()
  }, [filters])

  const fetchShops = async () => {
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
  }

  const handleSearch = async () => {
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
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const formatPrice = (price) => {
    return `$${(price / 100).toFixed(2)}`
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <AuroraBackgroundDemo>
          <div className="container mx-auto px-4 py-20 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-4xl mx-auto"
            >
              <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {currentText}
                <span className="animate-pulse">|</span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Book appointments with the best barbers in your area. 
                Real reviews, transparent pricing, effortless booking.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild>
                  <Link to="/shops">Find Barbers</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/register">Get Started</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </AuroraBackgroundDemo>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Why Choose BarberHub?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We connect you with verified professionals for the best grooming experience
            </p>
          </motion.div>

          <BentoGrid className="max-w-7xl mx-auto">
            <motion.div
              variants={cardVariants}
              initial="initial"
              whileInView="animate"
              whileHover="hover"
            >
              <BentoGridItem
                title="Verified Professionals"
                description="All barbers are background-checked and verified"
                header={<div className="w-full h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center"><Users className="w-8 h-8 text-white" /></div>}
                icon={<Users className="w-4 h-4" />}
              />
            </motion.div>

            <motion.div
              variants={cardVariants}
              initial="initial"
              whileInView="animate"
              whileHover="hover"
            >
              <BentoGridItem
                title="Real Reviews"
                description="Authentic reviews from verified customers"
                header={<div className="w-full h-32 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center"><Star className="w-8 h-8 text-white" /></div>}
                icon={<Star className="w-4 h-4" />}
              />
            </motion.div>

            <motion.div
              variants={cardVariants}
              initial="initial"
              whileInView="animate"
              whileHover="hover"
            >
              <BentoGridItem
                title="Instant Booking"
                description="Book appointments in seconds, not minutes"
                header={<div className="w-full h-32 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center"><CalendarDays className="w-8 h-8 text-white" /></div>}
                icon={<CalendarDays className="w-4 h-4" />}
              />
            </motion.div>

            <motion.div
              variants={cardVariants}
              initial="initial"
              whileInView="animate"
              whileHover="hover"
            >
              <BentoGridItem
                title="Transparent Pricing"
                description="No hidden fees, clear service costs"
                header={<div className="w-full h-32 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center"><BarChart3 className="w-8 h-8 text-white" /></div>}
                icon={<BarChart3 className="w-4 h-4" />}
              />
            </motion.div>
          </BentoGrid>
        </div>
      </section>

      {/* Top Shops Section */}
      <section className="py-20 bg-slate-50 dark:bg-slate-800">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Top Rated Barbers</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover the most popular and highly-rated barber shops in your area
            </p>
          </motion.div>

          {/* Search Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
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
                  <select
                    value={filters.services}
                    onChange={(e) => handleFilterChange('services', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Services</option>
                    <option value="haircut">Haircut</option>
                    <option value="beard">Beard Trim</option>
                    <option value="styling">Styling</option>
                    <option value="shave">Shave</option>
                  </select>

                  <select
                    value={filters.rating}
                    onChange={(e) => handleFilterChange('rating', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Ratings</option>
                    <option value="4">4+ Stars</option>
                    <option value="3">3+ Stars</option>
                  </select>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filters.available}
                      onChange={(e) => handleFilterChange('available', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">Available Now</span>
                  </label>
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
              // Loading skeleton
              Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                  <CardContent className="p-4">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))
            ) : shops.length > 0 ? (
              shops.map((shop) => (
                <motion.div key={shop._id} variants={itemVariants}>
                  <Card className="h-full hover:shadow-lg transition-shadow duration-300 cursor-pointer">
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
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center mt-12"
          >
            <Button size="lg" variant="outline" asChild>
              <Link to="/shops">View All Shops</Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  )
} 