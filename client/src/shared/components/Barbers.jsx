import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ui/card'
import { Badge } from '@ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@ui/avatar'
import { Input } from '@ui/input'
import { MapPin, Star, Clock, Phone, Mail, Users, Scissors } from 'lucide-react'
import { sharedAPI } from '@services/api'

export const Barbers = () => {
  const [barbers, setBarbers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedExperience, setSelectedExperience] = useState('')

  // Helper function to get barber name consistently
  const getBarberName = (barber) => {
    if (barber.user && barber.user.firstName && barber.user.lastName) {
      return `${barber.user.firstName} ${barber.user.lastName}`;
    }
    if (barber.user && barber.user.firstName) {
      return barber.user.firstName;
    }
    return barber.name || 'Unknown Barber';
  };

  // Helper function to get barber bio
  const getBarberBio = (barber) => {
    return barber.user?.bio || barber.bio || 'Professional barber with expertise in modern and classic cuts.';
  };

  // Helper function to get shop location
  const getShopLocation = (barber) => {
    if (barber.shop && barber.shop.address) {
      return barber.shop.address;
    }
    if (barber.shop && barber.shop.city) {
      return barber.shop.city;
    }
    return barber.shopLocation || barber.location || 'Location not available';
  };

  const fetchBarbers = async () => {
    try {
      const response = await sharedAPI.getBarbers()
      setBarbers(response.data.data || [])
    } catch (error) {
      console.error('Error fetching barbers:', error)
      // If the barbers endpoint doesn't exist, we can fall back to getting barbers from shops
      try {
        const shopsResponse = await sharedAPI.getShops()
        const allEmployees = []
        shopsResponse.data.data.forEach(shop => {
          if (shop.employees && shop.employees.length > 0) {
            shop.employees.forEach(employee => {
              allEmployees.push({
                ...employee,
                shopName: shop.name,
                shopLocation: shop.address
              })
            })
          }
        })
        setBarbers(allEmployees)
      } catch (fallbackError) {
        console.error('Error fetching barbers from shops:', fallbackError)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBarbers()
  }, [])

  const filteredBarbers = barbers.filter(barber => {
    // Get the full name from user object or fallback to name property
    const barberName = getBarberName(barber)
    
    const matchesSearch = barberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (barber.specialties && barber.specialties.some(specialty => 
                           specialty && specialty.toLowerCase().includes(searchTerm.toLowerCase())
                         )) ||
                         (barber.services && barber.services.some(serviceItem => {
                           const service = serviceItem.service || serviceItem;
                           return service && service.name && service.name.toLowerCase().includes(searchTerm.toLowerCase());
                         }))
    const matchesExperience = !selectedExperience || (barber.experience && barber.experience >= parseInt(selectedExperience))
    return matchesSearch && matchesExperience
  })

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
            <h1 className="text-4xl font-bold mb-4">Our Barbers</h1>
            <p className="text-xl text-muted-foreground">
              Meet our skilled and experienced barbers
            </p>
          </motion.div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Input
                placeholder="Search barbers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <select
                value={selectedExperience}
                onChange={(e) => setSelectedExperience(e.target.value)}
                className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">All Experience Levels</option>
                <option value="1">1+ years</option>
                <option value="3">3+ years</option>
                <option value="5">5+ years</option>
                <option value="10">10+ years</option>
              </select>
            </div>
            <div>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('')
                  setSelectedExperience('')
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </div>
      </div>

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
                Found {filteredBarbers.length} barber{filteredBarbers.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredBarbers.map((barber) => (
                <motion.div
                  key={barber._id}
                  variants={cardVariants}
                  className="group"
                >
                  <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl">
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={barber.avatar || '/assets/default-barber.jpg'}
                        alt={getBarberName(barber)}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <div className="absolute top-4 right-4">
                        <Badge variant="secondary">{barber.experience || 'New'} years</Badge>
                      </div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-white font-semibold text-lg">{getBarberName(barber)}</h3>
                        <div className="flex items-center gap-2 text-white/90 text-sm">
                          <MapPin className="w-4 h-4" />
                          {getShopLocation(barber)}
                        </div>
                      </div>
                    </div>
                    
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={barber.avatar} alt={getBarberName(barber)} />
                          <AvatarFallback className="text-lg">
                            {getBarberName(barber).split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h4 className="font-semibold">{getBarberName(barber)}</h4>
                          <p className="text-sm text-muted-foreground">{barber.title || 'Barber'}</p>
                          {barber.shop && barber.shop.name && (
                            <p className="text-sm text-muted-foreground">{barber.shop.name}</p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="text-sm font-medium">
                              {barber.rating?.average ? barber.rating.average.toFixed(1) : 'New'}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              ({barber.rating?.totalReviews || 0} reviews)
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-muted-foreground mb-4 line-clamp-2">
                        {getBarberBio(barber)}
                      </p>
                      
                      {barber.services && barber.services.length > 0 && (
                      <div className="mb-4">
                        <h5 className="font-medium text-sm mb-2">Specialties</h5>
                        <div className="flex flex-wrap gap-1">
                            {barber.services.slice(0, 3).map((serviceItem, index) => {
                              // Handle both nested structure (service.service) and direct structure
                              const service = serviceItem.service || serviceItem;
                              return (
                            <Badge key={index} variant="outline" className="text-xs">
                                  {service.name || service}
                                </Badge>
                              );
                            })}
                            {barber.services.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{barber.services.length - 3} more
                            </Badge>
                            )}
                      </div>
                        </div>
                      )}
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Phone className="w-3 h-3 mr-1" />
                          Contact
                        </Button>
                        <Button size="sm" className="flex-1">
                          Book Appointment
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </>
        )}
      </div>
    </div>
  )
} 