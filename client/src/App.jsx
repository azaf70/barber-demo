import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate, useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { authAPI, servicesAPI, barbersAPI, shopsAPI, appointmentsAPI, adminAPI, healthCheck } from './services/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, Clock, MapPin, Star, Phone, Mail, Globe, Users, Scissors, Building2, CalendarDays, BarChart3, Settings, LogOut, User, Shield, Crown, CreditCard, Bell, Home as HomeIcon } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

// Animation variants
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
}

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

// Modern Header Component
const Header = ({ user, onLogout }) => (
  <motion.header 
    initial={{ y: -100 }}
    animate={{ y: 0 }}
    className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
  >
    <div className="container mx-auto px-4 h-16 flex items-center justify-between">
      <motion.div 
        whileHover={{ scale: 1.05 }}
        className="flex items-center space-x-2"
      >
        <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
          <Scissors className="w-4 h-4 text-white" />
        </div>
        <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          BarberHub
        </span>
      </motion.div>

      <nav className="hidden md:flex items-center space-x-6">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/shops">Shops</NavLink>
        <NavLink to="/services">Services</NavLink>
        <NavLink to="/barbers">Barbers</NavLink>
        {user && (
          <>
            <NavLink to="/appointments">Appointments</NavLink>
            {user.role === 'shop_owner' && <NavLink to="/dashboard">Dashboard</NavLink>}
            {user.role === 'super_admin' && <NavLink to="/admin">Admin</NavLink>}
          </>
        )}
      </nav>

      <div className="flex items-center space-x-4">
        {user ? (
          <div className="flex items-center space-x-4">
            <UserMenu user={user} onLogout={onLogout} />
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <Button variant="ghost" asChild>
              <Link to="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link to="/register">Get Started</Link>
            </Button>
          </div>
        )}

        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>
          </SheetTrigger>
          <SheetContent className="p-0 w-72 rounded-l-xl shadow-lg">
            <div className="flex flex-col h-full">
              {/* Header/Branding */}
              <div className="flex items-center space-x-2 px-6 py-4 border-b">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                  <Scissors className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  BarberHub
                </span>
              </div>

              {/* Profile (if logged in) */}
              {user && (
                <div className="flex items-center space-x-3 px-6 py-4 border-b">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar} alt={user.firstName} />
                    <AvatarFallback>{user.firstName[0]}{user.lastName[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <nav className="flex-1 flex flex-col gap-2 px-6 py-4">
                <MobileNavLink to="/" icon={<HomeIcon className="mr-2 w-5 h-5" />}>Home</MobileNavLink>
                <MobileNavLink to="/shops" icon={<Building2 className="mr-2 w-5 h-5" />}>Shops</MobileNavLink>
                <MobileNavLink to="/services" icon={<Scissors className="mr-2 w-5 h-5" />}>Services</MobileNavLink>
                <MobileNavLink to="/barbers" icon={<User className="mr-2 w-5 h-5" />}>Barbers</MobileNavLink>
                {user && (
                  <>
                    <MobileNavLink to="/appointments" icon={<CalendarDays className="mr-2 w-5 h-5" />}>Appointments</MobileNavLink>
                    {user.role === 'shop_owner' && <MobileNavLink to="/dashboard" icon={<Building2 className="mr-2 w-5 h-5" />}>Dashboard</MobileNavLink>}
                    {user.role === 'super_admin' && <MobileNavLink to="/admin" icon={<Crown className="mr-2 w-5 h-5" />}>Admin</MobileNavLink>}
                  </>
                )}
              </nav>

              {/* Logout */}
              {user && (
                <div className="px-6 pb-6">
                  <Button
                    variant="destructive"
                    className="w-full flex items-center justify-center"
                    onClick={onLogout}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  </motion.header>
)

const UserMenu = ({ user, onLogout }) => (
  <Dialog>
    <DialogTrigger asChild>
      <Button variant="ghost" className="relative h-8 w-8 rounded-full">
        <Avatar className="h-8 w-8">
          <AvatarImage src={user.avatar} alt={user.firstName} />
          <AvatarFallback>{user.firstName[0]}{user.lastName[0]}</AvatarFallback>
        </Avatar>
      </Button>
    </DialogTrigger>
    <DialogContent className="w-80">
      <DialogHeader>
        <DialogTitle>Profile</DialogTitle>
        <DialogDescription>
          Manage your account and preferences
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.avatar} alt={user.firstName} />
            <AvatarFallback>{user.firstName[0]}{user.lastName[0]}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{user.firstName} {user.lastName}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <Badge variant="secondary" className="mt-1">
              {user.role === 'customer' && <User className="w-3 h-3 mr-1" />}
              {user.role === 'barber' && <Scissors className="w-3 h-3 mr-1" />}
              {user.role === 'shop_owner' && <Building2 className="w-3 h-3 mr-1" />}
              {user.role === 'super_admin' && <Crown className="w-3 h-3 mr-1" />}
              {user.role}
            </Badge>
          </div>
        </div>
        <Separator />
        <div className="space-y-2">
          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link to="/profile">Profile Settings</Link>
          </Button>
          {user.role === 'shop_owner' && (
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link to="/dashboard">My Shops</Link>
            </Button>
          )}
          <Button variant="ghost" className="w-full justify-start text-destructive" onClick={onLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
)

const NavLink = ({ to, children }) => {
  const location = useLocation()
  const isActive = location.pathname === to
  
  return (
    <motion.div whileHover={{ scale: 1.05 }}>
      <Link 
        to={to}
        className={`relative px-3 py-2 text-sm font-medium transition-colors hover:text-primary ${
          isActive ? 'text-primary' : 'text-muted-foreground'
        }`}
      >
        {children}
        {isActive && (
          <motion.div
            layoutId="activeTab"
            className="absolute inset-0 bg-primary/10 rounded-md"
            initial={false}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        )}
      </Link>
    </motion.div>
  )
}

const MobileNavLink = ({ to, icon, children }) => (
  <Link 
    to={to}
    className="flex items-center text-lg font-medium text-muted-foreground hover:text-primary transition-colors rounded-md px-2 py-2 focus:bg-muted/50 focus:outline-none"
  >
    {icon}
    {children}
  </Link>
)

// Hero Section
const Home = () => (
  <motion.div 
    variants={pageVariants}
    initial="initial"
    animate="animate"
    exit="exit"
    className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4"
  >
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="max-w-4xl mx-auto"
    >
      <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
        Premium Cuts,
        <br />
        <span className="text-foreground">Professional Service</span>
      </h1>
      <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
        Discover the best barber shops in your area. Book appointments, explore services, and experience professional grooming.
      </p>
      
      <motion.div 
        className="flex flex-col sm:flex-row gap-4 justify-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Button size="lg" asChild className="text-lg px-8 py-6">
          <Link to="/shops">Find Shops</Link>
        </Button>
        <Button size="lg" variant="outline" asChild className="text-lg px-8 py-6">
          <Link to="/services">View Services</Link>
        </Button>
      </motion.div>
    </motion.div>

    {/* Features Grid */}
    <motion.div 
      className="grid md:grid-cols-3 gap-8 mt-20 max-w-6xl mx-auto w-full"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      {[
        {
          icon: <Scissors className="w-8 h-8" />,
          title: "Expert Cuts",
          description: "Professional barbers with years of experience"
        },
        {
          icon: <CalendarDays className="w-8 h-8" />,
          title: "Easy Booking",
          description: "Book appointments online in seconds"
        },
        {
          icon: <Star className="w-8 h-8" />,
          title: "Top Rated",
          description: "Verified reviews and ratings"
        }
      ].map((feature, index) => (
        <motion.div
          key={index}
          variants={cardVariants}
          whileHover="hover"
          className="text-center"
        >
          <Card className="p-6">
            <CardContent className="p-0">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  </motion.div>
)

// Shops Page
const Shops = () => {
  const [shops, setShops] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')

  useEffect(() => {
    fetchShops()
  }, [])

  const fetchShops = async () => {
    try {
      setLoading(true)
      const response = await shopsAPI.getAll()
      setShops(response.data.data || [])
    } catch (error) {
      console.error('Error fetching shops:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredShops = shops.filter(shop => {
    if (!shop || !shop.name || !shop.description) return false;
    
    const matchesSearch = shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shop.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSpecialty = selectedSpecialty === 'all' || !selectedSpecialty || (shop.specialties && shop.specialties.includes(selectedSpecialty))
    const matchesStatus = selectedStatus === 'all' || !selectedStatus || shop.status === selectedStatus
    return matchesSearch && matchesSpecialty && matchesStatus
  })

  return (
    <motion.div 
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="container mx-auto px-4 py-8"
    >
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Barber Shops</h1>
        <p className="text-muted-foreground">Discover the best barber shops in your area</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <Input
          placeholder="Search shops..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="md:w-64"
        />
        <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
          <SelectTrigger className="md:w-48">
            <SelectValue placeholder="Specialty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Specialties</SelectItem>
            <SelectItem value="haircut">Haircut</SelectItem>
            <SelectItem value="beard-trim">Beard Trim</SelectItem>
            <SelectItem value="shave">Shave</SelectItem>
            <SelectItem value="hair-coloring">Hair Coloring</SelectItem>
            <SelectItem value="styling">Styling</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="md:w-48">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-48 bg-muted rounded-lg mb-4"></div>
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted rounded mb-4"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <motion.div 
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {filteredShops.map((shop, index) => (
            <motion.div
              key={shop._id}
              variants={cardVariants}
              whileHover="hover"
            >
              <Card className="overflow-hidden">
                <div className="aspect-video bg-muted relative">
                  {shop.images && shop.images.length > 0 ? (
                    <img 
                      src={shop.images.find(img => img.isPrimary)?.url || shop.images[0].url} 
                      alt={shop.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                      <Building2 className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}
                  <Badge 
                    variant={shop.status === 'active' ? 'default' : 'secondary'}
                    className="absolute top-2 right-2"
                  >
                    {shop.status}
                  </Badge>
                </div>
                <CardContent className="p-6">
                  <CardTitle className="mb-2">{shop.name}</CardTitle>
                  <p className="text-muted-foreground mb-4 line-clamp-2">{shop.description}</p>
                  
                  <div className="flex items-center space-x-2 mb-4">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {shop.address?.city}, {shop.address?.state}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{shop.rating?.average?.toFixed(1) || 'N/A'}</span>
                      <span className="text-sm text-muted-foreground">({shop.rating?.totalReviews || 0})</span>
                    </div>
                    <Badge variant="outline">
                      {shop.specialties && shop.specialties.slice(0, 2).join(', ')}
                    </Badge>
                  </div>

                  <Button asChild className="w-full">
                    <Link to={`/shops/${shop.slug}`}>View Details</Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {!loading && filteredShops.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No shops found</h3>
          <p className="text-muted-foreground">Try adjusting your search criteria</p>
        </div>
      )}
    </motion.div>
  )
}

// Services Page
const Services = () => {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      setLoading(true)
      const response = await servicesAPI.getAll()
      setServices(response.data.data || [])
    } catch (error) {
      console.error('Error fetching services:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredServices = services.filter(service => {
    if (!service || !service.name || !service.description) return false;
    
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || !selectedCategory || service.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <motion.div 
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="container mx-auto px-4 py-8"
    >
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Services</h1>
        <p className="text-muted-foreground">Explore our professional grooming services</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <Input
          placeholder="Search services..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="md:w-64"
        />
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="md:w-48">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="haircut">Haircut</SelectItem>
            <SelectItem value="beard">Beard</SelectItem>
            <SelectItem value="shave">Shave</SelectItem>
            <SelectItem value="styling">Styling</SelectItem>
            <SelectItem value="coloring">Coloring</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted rounded mb-4"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <motion.div 
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {filteredServices.map((service, index) => (
            <motion.div
              key={service._id}
              variants={cardVariants}
              whileHover="hover"
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <CardTitle className="mb-2">{service.name}</CardTitle>
                      <p className="text-muted-foreground mb-4">{service.description}</p>
                    </div>
                    <Badge variant="outline">{service.category}</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{service.duration} min</span>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-primary">${service.price}</span>
                    </div>
                  </div>

                  <Button asChild className="w-full">
                    <Link to={`/services/${service._id}`}>Book Now</Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {!loading && filteredServices.length === 0 && (
        <div className="text-center py-12">
          <Scissors className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No services found</h3>
          <p className="text-muted-foreground">Try adjusting your search criteria</p>
        </div>
      )}
    </motion.div>
  )
}

// Barbers Page
const Barbers = () => {
  const [barbers, setBarbers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState('')

  useEffect(() => {
    fetchBarbers()
  }, [])

  const fetchBarbers = async () => {
    try {
      setLoading(true)
      const response = await barbersAPI.getAll()
      setBarbers(response.data.data || [])
    } catch (error) {
      console.error('Error fetching barbers:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredBarbers = barbers.filter(barber => {
    if (!barber || !barber.firstName || !barber.lastName) return false;
    
    const matchesSearch = barber.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         barber.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (barber.bio && barber.bio.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesSpecialty = selectedSpecialty === 'all' || !selectedSpecialty || (barber.specialties && barber.specialties.includes(selectedSpecialty))
    return matchesSearch && matchesSpecialty
  })

  return (
    <motion.div 
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="container mx-auto px-4 py-8"
    >
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Our Barbers</h1>
        <p className="text-muted-foreground">Meet our skilled and experienced barbers</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <Input
          placeholder="Search barbers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="md:w-64"
        />
        <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
          <SelectTrigger className="md:w-48">
            <SelectValue placeholder="Specialty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Specialties</SelectItem>
            <SelectItem value="haircut">Haircut</SelectItem>
            <SelectItem value="beard-trim">Beard Trim</SelectItem>
            <SelectItem value="shave">Shave</SelectItem>
            <SelectItem value="hair-coloring">Hair Coloring</SelectItem>
            <SelectItem value="styling">Styling</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-muted rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded mb-2"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <motion.div 
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {filteredBarbers.map((barber, index) => (
            <motion.div
              key={barber._id}
              variants={cardVariants}
              whileHover="hover"
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={barber.avatar} alt={barber.firstName || 'Barber'} />
                      <AvatarFallback>{(barber.firstName && barber.firstName[0]) || 'B'}{(barber.lastName && barber.lastName[0]) || ''}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="mb-1">{barber.firstName || 'Unknown'} {barber.lastName || ''}</CardTitle>
                      <p className="text-sm text-muted-foreground">{barber.experience || 0} years experience</p>
                    </div>
                  </div>
                  
                  {barber.bio && (
                    <p className="text-muted-foreground mb-4 line-clamp-2">{barber.bio}</p>
                  )}

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{barber.rating?.average?.toFixed(1) || 'N/A'}</span>
                      <span className="text-sm text-muted-foreground">({barber.rating?.totalReviews || 0})</span>
                    </div>
                    <Badge variant="outline">
                      {barber.specialties?.slice(0, 2).join(', ')}
                    </Badge>
                  </div>

                  <Button asChild className="w-full">
                    <Link to={`/barbers/${barber._id}`}>View Profile</Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {!loading && filteredBarbers.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No barbers found</h3>
          <p className="text-muted-foreground">Try adjusting your search criteria</p>
        </div>
      )}
    </motion.div>
  )
}

// Auth Components
const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await authAPI.login(formData)
      console.log('Login response:', response) // Debug log
      
      if (response.data.success) {
        const { user, token } = response.data.data
        
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
        onLogin(user)
      } else {
        setError(response.data.message || 'Login failed')
      }
    } catch (error) {
      console.error('Login error:', error) // Debug log
      setError(error.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div 
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-[80vh] flex items-center justify-center px-4"
    >
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

const Register = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    role: 'customer'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await authAPI.register(formData)
      console.log('Register response:', response) // Debug log
      
      if (response.data.success) {
        const { user, token } = response.data.data
        
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
        onLogin(user)
      } else {
        setError(response.data.message || 'Registration failed')
      }
    } catch (error) {
      console.error('Register error:', error) // Debug log
      setError(error.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div 
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-[80vh] flex items-center justify-center px-4"
    >
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create Account</CardTitle>
          <CardDescription>Join our barber community</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer">Customer</SelectItem>
                  <SelectItem value="barber">Barber</SelectItem>
                  <SelectItem value="shop_owner">Shop Owner</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Appointments Component
const Appointments = ({ user }) => {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchAppointments()
    }
  }, [user])

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      const response = await appointmentsAPI.getMyAppointments()
      setAppointments(response.data.data || [])
    } catch (error) {
      console.error('Error fetching appointments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelAppointment = async (appointmentId) => {
    try {
      await appointmentsAPI.cancel(appointmentId)
      fetchAppointments()
    } catch (error) {
      console.error('Error canceling appointment:', error)
    }
  }

  if (!user) {
    return (
      <motion.div 
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="min-h-[80vh] flex items-center justify-center"
      >
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <CalendarDays className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Sign in required</h3>
            <p className="text-muted-foreground mb-4">Please sign in to view your appointments</p>
            <Button asChild>
              <Link to="/login">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div 
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="container mx-auto px-4 py-8"
    >
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">My Appointments</h1>
        <p className="text-muted-foreground">Manage your upcoming appointments</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <CalendarDays className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No appointments</h3>
                <p className="text-muted-foreground mb-4">You don't have any appointments yet</p>
                <Button asChild>
                  <Link to="/shops">Book Appointment</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            appointments.map((appointment) => (
              <motion.div
                key={appointment._id}
                variants={cardVariants}
                initial="initial"
                animate="animate"
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-1">
                          {appointment.service?.name || 'Service'}
                        </h3>
                        <p className="text-muted-foreground">
                          {appointment.shop?.name || 'Shop'} • {appointment.barber?.firstName} {appointment.barber?.lastName}
                        </p>
                      </div>
                      <Badge 
                        variant={
                          appointment.status === 'confirmed' ? 'default' :
                          appointment.status === 'pending' ? 'secondary' :
                          appointment.status === 'cancelled' ? 'destructive' : 'outline'
                        }
                      >
                        {appointment.status}
                      </Badge>
                    </div>

                    <div className="flex items-center space-x-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <CalendarDays className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">
                          {new Date(appointment.appointmentDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">
                          {new Date(appointment.appointmentDate).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-primary">
                        ${appointment.service?.price || 0}
                      </span>
                      {appointment.status === 'confirmed' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleCancelAppointment(appointment._id)}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      )}
    </motion.div>
  )
}

// Shop Detail Page
const ShopDetail = () => {
  const { slug } = useParams()
  const [shop, setShop] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchShop()
  }, [slug])

  const fetchShop = async () => {
    try {
      setLoading(true)
      const response = await shopsAPI.getBySlug(slug)
      setShop(response.data.data)
    } catch (error) {
      console.error('Error fetching shop:', error)
      setError('Shop not found')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <motion.div 
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="container mx-auto px-4 py-8"
      >
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded mb-4 w-1/3"></div>
          <div className="h-4 bg-muted rounded mb-8 w-1/2"></div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="h-64 bg-muted rounded"></div>
            <div className="space-y-4">
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  if (error || !shop) {
    return (
      <motion.div 
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="container mx-auto px-4 py-8"
      >
        <div className="text-center py-12">
          <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Shop not found</h3>
          <p className="text-muted-foreground mb-4">The shop you're looking for doesn't exist</p>
          <Button asChild>
            <Link to="/shops">Back to Shops</Link>
          </Button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div 
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="container mx-auto px-4 py-8"
    >
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link to="/shops">← Back to Shops</Link>
        </Button>
        <h1 className="text-4xl font-bold mb-4">{shop.name}</h1>
        <p className="text-muted-foreground">{shop.description}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <div className="aspect-video bg-muted rounded-lg overflow-hidden">
          {shop.images && shop.images.length > 0 ? (
            <img 
              src={shop.images.find(img => img.isPrimary)?.url || shop.images[0].url} 
              alt={shop.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
              <Building2 className="w-16 h-16 text-muted-foreground" />
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Contact Information</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">
                  {shop.address?.street}, {shop.address?.city}, {shop.address?.state} {shop.address?.zipCode}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{shop.contact?.phone}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{shop.contact?.email}</span>
              </div>
              {shop.contact?.website && (
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <a href={shop.contact.website} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                    {shop.contact.website}
                  </a>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Rating & Reviews</h3>
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{shop.rating?.average?.toFixed(1) || 'N/A'}</span>
              <span className="text-sm text-muted-foreground">({shop.rating?.totalReviews || 0} reviews)</span>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Specialties</h3>
            <div className="flex flex-wrap gap-2">
              {shop.specialties && shop.specialties.map((specialty, index) => (
                <Badge key={index} variant="outline">
                  {specialty}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Amenities</h3>
            <div className="flex flex-wrap gap-2">
              {shop.amenities && shop.amenities.map((amenity, index) => (
                <Badge key={index} variant="secondary">
                  {amenity}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="text-center">
        <Button size="lg" asChild>
          <Link to={`/shops/${shop.slug}/book`}>Book Appointment</Link>
        </Button>
      </div>
    </motion.div>
  )
}

// Booking Page Component
const BookingPage = () => {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [shop, setShop] = useState(null)
  const [services, setServices] = useState([])
  const [barbers, setBarbers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedService, setSelectedService] = useState('')
  const [selectedBarber, setSelectedBarber] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')

  useEffect(() => {
    const fetchShopData = async () => {
      try {
        setLoading(true)
        const shopData = await shopsAPI.getBySlug(slug)
        setShop(shopData)
        
        // Fetch services for this shop
        const servicesData = await servicesAPI.getAll(`?shop=${shopData._id}`)
        setServices(servicesData.data || [])
        
        // Fetch barbers for this shop
        const barbersData = await barbersAPI.getAll(`?shop=${shopData._id}`)
        setBarbers(barbersData.data || [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchShopData()
  }, [slug])

  const handleSubmit = async (e) => {
    e.preventDefault()
    // TODO: Implement booking logic
    console.log('Booking:', {
      shop: shop._id,
      service: selectedService,
      barber: selectedBarber,
      date: selectedDate,
      time: selectedTime
    })
  }

  if (loading) {
    return (
      <motion.div 
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="container mx-auto px-4 py-8"
      >
        <div className="space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="h-64 bg-muted rounded"></div>
            <div className="space-y-4">
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  if (error || !shop) {
    return (
      <motion.div 
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="container mx-auto px-4 py-8"
      >
        <div className="text-center py-12">
          <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Shop not found</h3>
          <p className="text-muted-foreground mb-4">The shop you're looking for doesn't exist</p>
          <Button asChild>
            <Link to="/shops">Back to Shops</Link>
          </Button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div 
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="container mx-auto px-4 py-8"
    >
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link to={`/shops/${slug}`}>← Back to Shop</Link>
        </Button>
        <h1 className="text-4xl font-bold mb-4">Book Appointment</h1>
        <p className="text-muted-foreground">Book your appointment at {shop.name}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Appointment Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="service">Select Service</Label>
                  <Select value={selectedService} onValueChange={setSelectedService}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a service" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem key={service._id} value={service._id}>
                          {service.name} - £{service.price}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="barber">Select Barber</Label>
                  <Select value={selectedBarber} onValueChange={setSelectedBarber}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a barber" />
                    </SelectTrigger>
                    <SelectContent>
                      {barbers.map((barber) => (
                        <SelectItem key={barber._id} value={barber._id}>
                          {barber.user?.firstName} {barber.user?.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Select Date</Label>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">Select Time</Label>
                  <Select value={selectedTime} onValueChange={setSelectedTime}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="09:00">9:00 AM</SelectItem>
                      <SelectItem value="09:30">9:30 AM</SelectItem>
                      <SelectItem value="10:00">10:00 AM</SelectItem>
                      <SelectItem value="10:30">10:30 AM</SelectItem>
                      <SelectItem value="11:00">11:00 AM</SelectItem>
                      <SelectItem value="11:30">11:30 AM</SelectItem>
                      <SelectItem value="12:00">12:00 PM</SelectItem>
                      <SelectItem value="12:30">12:30 PM</SelectItem>
                      <SelectItem value="13:00">1:00 PM</SelectItem>
                      <SelectItem value="13:30">1:30 PM</SelectItem>
                      <SelectItem value="14:00">2:00 PM</SelectItem>
                      <SelectItem value="14:30">2:30 PM</SelectItem>
                      <SelectItem value="15:00">3:00 PM</SelectItem>
                      <SelectItem value="15:30">3:30 PM</SelectItem>
                      <SelectItem value="16:00">4:00 PM</SelectItem>
                      <SelectItem value="16:30">4:30 PM</SelectItem>
                      <SelectItem value="17:00">5:00 PM</SelectItem>
                      <SelectItem value="17:30">5:30 PM</SelectItem>
                      <SelectItem value="18:00">6:00 PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" className="w-full" disabled={!selectedService || !selectedBarber || !selectedDate || !selectedTime}>
                  Book Appointment
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Shop Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">{shop.name}</h4>
                <p className="text-sm text-muted-foreground">{shop.description}</p>
              </div>
              
              <div>
                <h5 className="font-medium mb-1">Address</h5>
                <p className="text-sm text-muted-foreground">
                  {shop.address?.street}, {shop.address?.city}, {shop.address?.state} {shop.address?.zipCode}
                </p>
              </div>

              <div>
                <h5 className="font-medium mb-1">Contact</h5>
                <p className="text-sm text-muted-foreground">{shop.contact?.phone}</p>
                <p className="text-sm text-muted-foreground">{shop.contact?.email}</p>
              </div>

              <div>
                <h5 className="font-medium mb-1">Rating</h5>
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{shop.rating?.average?.toFixed(1) || 'N/A'}</span>
                  <span className="text-sm text-muted-foreground">({shop.rating?.totalReviews || 0} reviews)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  )
}

// Admin Dashboard Component
const AdminDashboard = () => (
  <motion.div
    variants={pageVariants}
    initial="initial"
    animate="animate"
    exit="exit"
    className="container mx-auto px-4 py-8"
  >
    <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
    <p className="text-muted-foreground">Welcome, super admin! Here you can manage the platform.</p>
    {/* Add admin features here */}
  </motion.div>
)

// Profile Component
const Profile = ({ user }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      // TODO: Implement profile update API call
      console.log('Profile update:', formData)
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating profile:', error)
    }
  }

  if (!user) {
    return (
      <motion.div 
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="min-h-[80vh] flex items-center justify-center"
      >
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Sign in required</h3>
            <p className="text-muted-foreground mb-4">Please sign in to view your profile</p>
            <Button asChild>
              <Link to="/login">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div 
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="container mx-auto px-4 py-8"
    >
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Profile Settings</h1>
          <p className="text-muted-foreground">Manage your account information and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Personal Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!isEditing ? (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={user.avatar} alt={user.firstName} />
                        <AvatarFallback className="text-lg">{user.firstName[0]}{user.lastName[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-xl font-semibold">{user.firstName} {user.lastName}</h3>
                        <p className="text-muted-foreground">{user.email}</p>
                        <Badge variant="secondary" className="mt-2">
                          {user.role === 'customer' && <User className="w-3 h-3 mr-1" />}
                          {user.role === 'barber' && <Scissors className="w-3 h-3 mr-1" />}
                          {user.role === 'shop_owner' && <Building2 className="w-3 h-3 mr-1" />}
                          {user.role === 'super_admin' && <Crown className="w-3 h-3 mr-1" />}
                          {user.role}
                        </Badge>
                      </div>
                    </div>
                    <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button type="submit">Save Changes</Button>
                      <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>

            {user.role === 'shop_owner' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Building2 className="w-5 h-5" />
                    <span>My Shops</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">Manage your barber shops and appointments</p>
                  <Button asChild>
                    <Link to="/dashboard">View Dashboard</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <span>Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="ghost" className="w-full justify-start">
                  <Bell className="w-4 h-4 mr-2" />
                  Notifications
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Payment Methods
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Settings className="w-4 h-4 mr-2" />
                  Privacy Settings
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Account Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Member since</span>
                  <span className="font-medium">
                    {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total appointments</span>
                  <span className="font-medium">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reviews given</span>
                  <span className="font-medium">0</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Main App Component
function App() {
  const [user, setUser] = useState(null)
  const [apiStatus, setApiStatus] = useState('checking')

  useEffect(() => {
    // Check API health
    healthCheck()
      .then(() => setApiStatus('connected'))
      .catch(() => setApiStatus('disconnected'))

    // Check if user is logged in
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
  }, [])

  const handleLogin = (userData) => {
    setUser(userData)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
        <Header user={user} onLogout={handleLogout} />
        
        {apiStatus === 'disconnected' && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-700 px-4 py-3 text-center"
          >
            ⚠️ Backend API is not connected. Please start the backend server.
          </motion.div>
        )}
        
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/barbers" element={<Barbers />} />
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/register" element={<Register onLogin={handleLogin} />} />
            <Route path="/appointments" element={<Appointments user={user} />} />
            <Route path="/profile" element={<Profile user={user} />} />
            <Route path="/shops" element={<Shops />} />
            <Route path="/shops/:slug" element={<ShopDetail />} />
            <Route path="/shops/:slug/book" element={<BookingPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </AnimatePresence>
      </div>
    </Router>
  )
}

export default App


