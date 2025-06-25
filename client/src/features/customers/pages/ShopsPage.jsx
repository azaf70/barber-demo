import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Button } from '@ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ui/card'
import { Input } from '@ui/input'
import { Badge } from '@ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@ui/avatar'
import { MapPin, Star, Clock, Phone, Mail, Globe, Users } from 'lucide-react'
import { cn } from '@utils/utils'

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

export const ShopsPage = () => {
  const [shops, setShops] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedService, setSelectedService] = useState('')
  const [selectedRating, setSelectedRating] = useState('')

  const fetchShops = async () => {
    try {
      // Simulate API call - replace with actual API
      const mockShops = [
        {
          id: 1,
          name: "Elite Cuts",
          description: "Premium barber shop offering modern cuts and traditional services",
          rating: 4.8,
          reviewCount: 127,
          location: "Downtown",
          address: "123 Main St, Downtown",
          phone: "+1 (555) 123-4567",
          email: "info@elitecuts.com",
          website: "https://elitecuts.com",
          image: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400&h=300&fit=crop",
          services: ["Haircut", "Beard Trim", "Styling", "Color"],
          hours: "Mon-Sat: 9AM-7PM",
          isOpen: true,
          distance: "0.5 miles"
        },
        {
          id: 2,
          name: "Classic Barbers",
          description: "Traditional barber shop with a modern twist",
          rating: 4.6,
          reviewCount: 89,
          location: "Midtown",
          address: "456 Oak Ave, Midtown",
          phone: "+1 (555) 234-5678",
          email: "hello@classicbarbers.com",
          website: "https://classicbarbers.com",
          image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&h=300&fit=crop",
          services: ["Haircut", "Shave", "Facial", "Beard Trim"],
          hours: "Mon-Fri: 8AM-6PM, Sat: 9AM-5PM",
          isOpen: true,
          distance: "1.2 miles"
        },
        {
          id: 3,
          name: "Modern Grooming",
          description: "Contemporary grooming services for the modern man",
          rating: 4.9,
          reviewCount: 203,
          location: "Uptown",
          address: "789 Pine St, Uptown",
          phone: "+1 (555) 345-6789",
          email: "contact@moderngrooming.com",
          website: "https://moderngrooming.com",
          image: "https://images.unsplash.com/photo-1622287162716-f311baa1a2b8?w=400&h=300&fit=crop",
          services: ["Haircut", "Color", "Treatment", "Styling"],
          hours: "Mon-Sat: 10AM-8PM",
          isOpen: false,
          distance: "2.1 miles"
        }
      ]
      setShops(mockShops)
    } catch (error) {
      console.error('Error fetching shops:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchShops()
  }, [])

  const filteredShops = shops.filter(shop => {
    const matchesSearch = shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shop.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shop.location.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesService = !selectedService || shop.services.includes(selectedService)
    const matchesRating = !selectedRating || shop.rating >= parseFloat(selectedRating)
    
    return matchesSearch && matchesService && matchesRating
  })

  const allServices = [...new Set(shops.flatMap(shop => shop.services))]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b">
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold mb-4">Find Barber Shops</h1>
            <p className="text-xl text-muted-foreground">
              Discover the best barber shops in your area
            </p>
          </motion.div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Input
                placeholder="Search shops..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">All Services</option>
                {allServices.map(service => (
                  <option key={service} value={service}>{service}</option>
                ))}
              </select>
            </div>
            <div>
              <select
                value={selectedRating}
                onChange={(e) => setSelectedRating(e.target.value)}
                className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">All Ratings</option>
                <option value="4.5">4.5+ Stars</option>
                <option value="4.0">4.0+ Stars</option>
                <option value="3.5">3.5+ Stars</option>
              </select>
            </div>
            <div>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('')
                  setSelectedService('')
                  setSelectedRating('')
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Shops Grid */}
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="bg-white dark:bg-slate-900 rounded-xl shadow-lg overflow-hidden"
              >
                <div className="h-48 bg-slate-200 dark:bg-slate-700 animate-pulse" />
                <div className="p-6">
                  <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-2" />
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-4" />
                  <div className="flex gap-2">
                    <div className="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                    <div className="h-6 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-muted-foreground">
                Found {filteredShops.length} shop{filteredShops.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredShops.map((shop) => (
                <motion.div
                  key={shop.id}
                  variants={cardVariants}
                  className="group"
                >
                  <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl">
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={shop.image}
                        alt={shop.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <div className="absolute top-4 right-4">
                        <Badge variant={shop.isOpen ? "default" : "secondary"}>
                          {shop.isOpen ? "Open" : "Closed"}
                        </Badge>
                      </div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-white font-semibold text-lg">{shop.name}</h3>
                        <div className="flex items-center gap-2 text-white/90 text-sm">
                          <MapPin className="w-4 h-4" />
                          {shop.location}
                        </div>
                      </div>
                    </div>
                    
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="font-semibold">{shop.rating}</span>
                          <span className="text-muted-foreground">({shop.reviewCount} reviews)</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{shop.distance}</span>
                      </div>
                      
                      <p className="text-muted-foreground mb-4 line-clamp-2">
                        {shop.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-1 mb-4">
                        {shop.services.slice(0, 3).map((service, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {service}
                          </Badge>
                        ))}
                        {shop.services.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{shop.services.length - 3} more
                          </Badge>
                        )}
                      </div>
                      
                      <div className="space-y-2 mb-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {shop.hours}
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          {shop.phone}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button className="flex-1" asChild>
                          <Link to={`/shops/${shop.id}`}>View Details</Link>
                        </Button>
                        <Button variant="outline" size="icon">
                          <Mail className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
            
            {filteredShops.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <div className="max-w-md mx-auto">
                  <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No shops found</h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your search criteria or filters
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchTerm('')
                      setSelectedService('')
                      setSelectedRating('')
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  )
} 