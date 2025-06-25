import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Button } from '@ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@ui/avatar'
import { Sheet, SheetContent, SheetTrigger } from '@ui/sheet'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@ui/dialog'
import { 
  Scissors, 
  Building2, 
  CalendarDays, 
  Crown, 
  LogOut, 
  User, 
  Settings, 
  CreditCard, 
  Bell,
  Home as HomeIcon 
} from 'lucide-react'

const NavLink = ({ to, children }) => {
  const location = window.location.pathname
  const isActive = location === to
  
  return (
    <Link
      to={to}
      className={`
        relative px-3 py-2 text-sm font-medium transition-colors hover:text-primary
        ${isActive ? 'text-primary' : 'text-muted-foreground'}
      `}
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
  )
}

const MobileNavLink = ({ to, icon, children }) => {
  const location = window.location.pathname
  const isActive = location === to
  
  return (
    <Link
      to={to}
      className={`
        flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
        ${isActive 
          ? 'bg-primary/10 text-primary' 
          : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
        }
      `}
    >
      {icon}
      {children}
    </Link>
  )
}

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
        <DialogTitle>Account</DialogTitle>
        <DialogDescription>
          Manage your account settings and preferences
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.avatar} alt={user.firstName} />
            <AvatarFallback>{user.firstName[0]}{user.lastName[0]}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{user.firstName} {user.lastName}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <p className="text-xs text-muted-foreground capitalize">{user.role.replace('_', ' ')}</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link to="/profile">
              <User className="mr-2 h-4 w-4" />
              Profile
            </Link>
          </Button>
          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link to="/settings">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </Button>
          {user.role === 'customer' && (
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link to="/payments">
                <CreditCard className="mr-2 h-4 w-4" />
                Payment Methods
              </Link>
            </Button>
          )}
          <Button variant="ghost" className="w-full justify-start">
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </Button>
        </div>
        
        <div className="pt-4 border-t">
          <Button 
            variant="destructive" 
            className="w-full" 
            onClick={onLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
)

export const Header = ({ user, onLogout }) => (
  <motion.header 
    initial={{ y: -100 }}
    animate={{ y: 0 }}
    className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
  >
    <div className="container mx-auto px-4 h-16 flex items-center justify-between">
      <motion.div whileHover={{ scale: 1.05 }}>
        <Link to="/" className="flex items-center space-x-2 cursor-pointer">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
            <Scissors className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            BarberHub
          </span>
        </Link>
      </motion.div>

      <nav className="hidden md:flex items-center space-x-6">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/shops">Shops</NavLink>
        <NavLink to="/services">Services</NavLink>
        <NavLink to="/barbers">Barbers</NavLink>
        {user && (
          <>
            <NavLink to="/appointments">Appointments</NavLink>
            {user.role === 'barber' && <NavLink to="/dashboard">Dashboard</NavLink>}
            {user.role === 'admin' && <NavLink to="/admin">Admin</NavLink>}
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
              <div className="flex items-center space-x-2 px-6 py-4 border-b cursor-pointer" asChild>
                <Link to="/">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                    <Scissors className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    BarberHub
                  </span>
                </Link>
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
                    {user.role === 'barber' && <MobileNavLink to="/dashboard" icon={<Building2 className="mr-2 w-5 h-5" />}>Dashboard</MobileNavLink>}
                    {user.role === 'admin' && <MobileNavLink to="/admin" icon={<Crown className="mr-2 w-5 h-5" />}>Admin</MobileNavLink>}
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