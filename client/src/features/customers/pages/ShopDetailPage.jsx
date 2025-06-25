import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useParams, Link } from 'react-router-dom'
import { Button } from '@ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ui/card'
import { Badge } from '@ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@ui/avatar'
import { Separator } from '@ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@ui/tabs'
import { MapPin, Star, Clock, Phone, Mail, Globe, Users, Calendar, Scissors } from 'lucide-react'
import { cn } from '@utils/utils'

export const ShopDetailPage = () => {
  const { id } = useParams()
  const [shop, setShop] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedService, setSelectedService] = useState(null)

  const fetchShop = async () => {
    try {
      // Simulate API call - replace with actual API
      const mockShop = {
        id: parseInt(id),
        name: "Elite Cuts",
        description: "Premium barber shop offering modern cuts and traditional services. We specialize in contemporary styles while maintaining the classic barber shop atmosphere.",
        rating: 4.8,
        reviewCount: 127,
        location: "Downtown",
        address: "123 Main St, Downtown, City, State 12345",
        phone: "+1 (555) 123-4567",
        email: "info@elitecuts.com",
        website: "https://elitecuts.com",
        images: [
          "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1622287162716-f311baa1a2b8?w=800&h=600&fit=crop"
        ],
        services: [
          {
            id: 1,
            name: "Classic Haircut",
            description: "Traditional haircut with wash and style",
            duration: 30,
            price: 25,
            category: "Haircut"
          },
          {
            id: 2,
            name: "Premium Haircut",
            description: "Premium haircut with wash, style, and consultation",
            duration: 45,
            price: 35,
            category: "Haircut"
          },
          {
            id: 3,
            name: "Beard Trim",
            description: "Professional beard trimming and shaping",
            duration: 20,
            price: 15,
            category: "Beard"
          },
          {
            id: 4,
            name: "Full Shave",
            description: "Traditional straight razor shave",
            duration: 30,
            price: 25,
            category: "Shave"
          }
        ],
        employees: [
          {
            id: 1,
            name: "John Smith",
            role: "Master Barber",
            experience: "15 years",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
            rating: 4.9,
            reviewCount: 89
          },
          {
            id: 2,
            name: "Mike Johnson",
            role: "Senior Barber",
            experience: "8 years",
            avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
            rating: 4.7,
            reviewCount: 67
          }
        ],
        hours: {
          monday: { open: "09:00", close: "19:00", isOpen: true },
          tuesday: { open: "09:00", close: "19:00", isOpen: true },
          wednesday: { open: "09:00", close: "19:00", isOpen: true },
          thursday: { open: "09:00", close: "19:00", isOpen: true },
          friday: { open: "09:00", close: "19:00", isOpen: true },
          saturday: { open: "10:00", close: "18:00", isOpen: true },
          sunday: { open: "10:00", close: "16:00", isOpen: false }
        },
        reviews: [
          {
            id: 1,
            customerName: "Alex Johnson",
            rating: 5,
            comment: "Amazing service! John did an excellent job with my haircut. Very professional and friendly.",
            date: "2024-01-15",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face"
          },
          {
            id: 2,
            customerName: "David Wilson",
            rating: 4,
            comment: "Great atmosphere and skilled barbers. Will definitely come back!",
            date: "2024-01-10",
            avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face"
          }
        ],
        isOpen: true,
        distance: "0.5 miles"
      }
      setShop(mockShop)
    } catch (error) {
      console.error('Error fetching shop:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchShop()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-4" />
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded mb-6" />
                <div className="space-y-4">
                  <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                </div>
              </div>
              <div>
                <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
                <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!shop) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Shop not found</h2>
          <Button asChild>
            <Link to="/shops">Back to Shops</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b">
        <div className="container mx-auto px-4 py-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-4"
          >
            <Button variant="ghost" size="sm" asChild>
              <Link to="/shops">← Back to Shops</Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{shop.name}</h1>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                {shop.location}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-8"
            >
              <div className="relative h-64 md:h-80 rounded-xl overflow-hidden">
                <img
                  src={shop.images[0]}
                  alt={shop.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <Badge variant={shop.isOpen ? "default" : "secondary"} className="mb-2">
                    {shop.isOpen ? "Open Now" : "Closed"}
                  </Badge>
                  <div className="flex items-center gap-2 text-white">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="font-semibold">{shop.rating}</span>
                    <span className="text-white/80">({shop.reviewCount} reviews)</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Tabs */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="services">Services</TabsTrigger>
                <TabsTrigger value="team">Team</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>About {shop.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <p className="text-muted-foreground">{shop.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-3">Contact Information</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            <a href={`tel:${shop.phone}`} className="hover:underline">{shop.phone}</a>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            <a href={`mailto:${shop.email}`} className="hover:underline">{shop.email}</a>
                          </div>
                          <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-muted-foreground" />
                            <a href={shop.website} target="_blank" rel="noopener noreferrer" className="hover:underline">{shop.website}</a>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            {shop.address}
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-3">Hours</h4>
                        <div className="space-y-1 text-sm">
                          {Object.entries(shop.hours).map(([day, hours]) => (
                            <div key={day} className="flex justify-between">
                              <span className="capitalize">{day}</span>
                              <span className={cn(
                                "text-muted-foreground",
                                !hours.isOpen && "text-red-500"
                              )}>
                                {hours.isOpen ? `${hours.open} - ${hours.close}` : "Closed"}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="services" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Services & Pricing</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      {shop.services.map((service) => (
                        <div
                          key={service.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          <div>
                            <h4 className="font-semibold">{service.name}</h4>
                            <p className="text-sm text-muted-foreground">{service.description}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {service.duration} min
                              </span>
                              <Badge variant="outline">{service.category}</Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold">${service.price}</div>
                            <Button 
                              size="sm" 
                              onClick={() => setSelectedService(service)}
                              className="mt-2"
                            >
                              Book Now
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="team" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Our Team</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6">
                      {shop.employees.map((employee) => (
                        <div key={employee.id} className="flex items-start gap-4 p-4 border rounded-lg">
                          <Avatar className="h-16 w-16">
                            <AvatarImage src={employee.avatar} alt={employee.name} />
                            <AvatarFallback>{employee.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h4 className="font-semibold">{employee.name}</h4>
                            <p className="text-sm text-muted-foreground">{employee.role}</p>
                            <p className="text-sm text-muted-foreground">{employee.experience} experience</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                              <span className="text-sm font-medium">{employee.rating}</span>
                              <span className="text-sm text-muted-foreground">({employee.reviewCount} reviews)</span>
                            </div>
                          </div>
                          <Button size="sm" variant="outline">
                            Book with {employee.name.split(' ')[0]}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Customer Reviews</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {shop.reviews.map((review) => (
                        <div key={review.id} className="border-b pb-6 last:border-b-0">
                          <div className="flex items-start gap-4">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={review.avatar} alt={review.customerName} />
                              <AvatarFallback>{review.customerName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold">{review.customerName}</h4>
                                <div className="flex items-center gap-1">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                      key={i}
                                      className={cn(
                                        "w-4 h-4",
                                        i < review.rating ? "text-yellow-500 fill-current" : "text-gray-300"
                                      )}
                                    />
                                  ))}
                                </div>
                              </div>
                              <p className="text-muted-foreground mb-2">{review.comment}</p>
                              <span className="text-sm text-muted-foreground">{review.date}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full" asChild>
                    <Link to={`/booking/${shop.id}`}>
                      <Calendar className="w-4 h-4 mr-2" />
                      Book Appointment
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Phone className="w-4 h-4 mr-2" />
                    Call Now
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Mail className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Popular Services */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Popular Services</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {shop.services.slice(0, 3).map((service) => (
                      <div key={service.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{service.name}</p>
                          <p className="text-sm text-muted-foreground">${service.price}</p>
                        </div>
                        <Button size="sm" variant="outline">
                          Book
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
} 