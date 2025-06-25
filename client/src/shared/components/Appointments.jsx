import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ui/card'
import { Badge } from '@ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@ui/avatar'
import { Calendar, Clock, MapPin, Star, Phone, Mail } from 'lucide-react'
import { customerAPI, barberAPI, sharedAPI } from '@services/api'
import { cn } from '@utils/utils'

export const Appointments = ({ user }) => {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchAppointments = async () => {
    try {
      let response
      if (user.role === 'customer') {
        response = await customerAPI.getBookings()
      } else if (user.role === 'barber') {
        response = await barberAPI.getBookings()
      } else {
        // For admin or other roles, use shared API
        response = await sharedAPI.getAppointments()
      }
      setAppointments(response.data.data || [])
    } catch (error) {
      console.error('Error fetching appointments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelAppointment = async (appointmentId) => {
    try {
      if (user.role === 'customer') {
        await customerAPI.cancelBooking(appointmentId, 'Cancelled by customer')
      } else if (user.role === 'barber') {
        await barberAPI.updateBooking(appointmentId, { status: 'cancelled' })
      }
      fetchAppointments() // Refresh the list
    } catch (error) {
      console.error('Error cancelling appointment:', error)
    }
  }

  useEffect(() => {
    fetchAppointments()
  }, [user])

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-48 bg-slate-200 dark:bg-slate-700 rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
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
            <h1 className="text-4xl font-bold mb-4">My Appointments</h1>
            <p className="text-xl text-muted-foreground">
              Manage your upcoming and past appointments
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {appointments.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="max-w-md mx-auto">
              <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No appointments yet</h3>
              <p className="text-muted-foreground mb-4">
                You haven't booked any appointments yet. Start by exploring our barber shops.
              </p>
              <Button asChild>
                <a href="/shops">Find Barber Shops</a>
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {appointments.map((appointment) => (
              <motion.div
                key={appointment._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="group"
              >
                <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={appointment.shop?.images?.[0] || '/assets/default-shop.jpg'}
                      alt={appointment.shop?.name || 'Shop'}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute top-4 right-4">
                      <Badge className={getStatusColor(appointment.status)}>
                        {appointment.status}
                      </Badge>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-white font-semibold text-lg">{appointment.shop?.name || 'Shop'}</h3>
                      <div className="flex items-center gap-2 text-white/90 text-sm">
                        <MapPin className="w-4 h-4" />
                        {appointment.shop?.address || 'Location not available'}
                      </div>
                    </div>
                  </div>
                  
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">{appointment.service?.name || 'Service'}</h4>
                        <p className="text-sm text-muted-foreground">{appointment.service?.description || 'No description available'}</p>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span>{new Date(appointment.appointmentDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span>{appointment.startTime} - {appointment.endTime}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">${(appointment.payment?.totalAmount || 0) / 100}</span>
                        </div>
                      </div>
                      
                      {appointment.employee && (
                        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={appointment.employee.avatar} alt={appointment.employee.name} />
                            <AvatarFallback>{appointment.employee.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{appointment.employee.name}</p>
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-yellow-500 fill-current" />
                              <span className="text-xs text-muted-foreground">{appointment.employee.rating || 'N/A'}</span>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex gap-2">
                        {appointment.status === 'pending' && (
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => handleCancelAppointment(appointment._id)}
                          >
                            Cancel
                          </Button>
                        )}
                        <Button variant="outline" size="sm" className="flex-1">
                          <Phone className="w-3 h-3 mr-1" />
                          Call
                        </Button>
                        <Button variant="outline" size="sm">
                          <Mail className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
} 