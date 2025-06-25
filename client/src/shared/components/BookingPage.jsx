import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ui/card'
import { Input } from '@ui/input'
import { Label } from '@ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ui/select'
import { Textarea } from '@ui/textarea'
import { Badge } from '@ui/badge'
import { Calendar } from '@ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@ui/popover'
import { CalendarIcon, Clock, MapPin, Star, User, CreditCard, ArrowLeft } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@utils/utils'
import { sharedAPI } from '@services/api'

export const BookingPage = () => {
  const { shopId } = useParams()
  const navigate = useNavigate()
  
  const [shop, setShop] = useState(null)
  const [services, setServices] = useState([])
  const [employees, setEmployees] = useState([])
  const [selectedService, setSelectedService] = useState('')
  const [selectedEmployee, setSelectedEmployee] = useState('')
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTime, setSelectedTime] = useState('')
  const [availableSlots, setAvailableSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (shopId) {
      fetchShopDetails()
    }
  }, [shopId])

  useEffect(() => {
    if (selectedService && selectedEmployee && selectedDate) {
      fetchAvailableSlots()
    }
  }, [selectedService, selectedEmployee, selectedDate])

  const fetchShopDetails = async () => {
    try {
      setLoading(true)
      const [shopResponse, servicesResponse, employeesResponse] = await Promise.all([
        sharedAPI.getShop(shopId),
        sharedAPI.getShopServices(shopId),
        sharedAPI.getShopEmployees(shopId)
      ])
      
      setShop(shopResponse.data.data)
      setServices(servicesResponse.data.data)
      setEmployees(employeesResponse.data.data)
    } catch (error) {
      console.error('Error fetching shop details:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailableSlots = async () => {
    try {
      const response = await sharedAPI.getShopAvailability(shopId, {
        serviceId: selectedService,
        employeeId: selectedEmployee,
        date: format(selectedDate, 'yyyy-MM-dd')
      })
      setAvailableSlots(response.data.data)
    } catch (error) {
      console.error('Error fetching available slots:', error)
    }
  }

  const handleBooking = async () => {
    if (!selectedService || !selectedEmployee || !selectedDate || !selectedTime) {
      alert('Please fill in all required fields')
      return
    }

    try {
      setBookingLoading(true)
      const bookingData = {
        shopId,
        serviceId: selectedService,
        employeeId: selectedEmployee,
        appointmentDate: format(selectedDate, 'yyyy-MM-dd'),
        startTime: selectedTime,
        notes
      }

      const response = await sharedAPI.createBooking(bookingData)
      
      // Redirect to payment or confirmation page
      navigate(`/appointments/${response.data.data._id}`)
    } catch (error) {
      console.error('Error creating booking:', error)
      alert('Failed to create booking. Please try again.')
    } finally {
      setBookingLoading(false)
    }
  }

  const formatPrice = (price) => {
    return `$${(price / 100).toFixed(2)}`
  }

  const getSelectedServicePrice = () => {
    const service = services.find(s => s._id === selectedService)
    return service?.price || 0
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading shop details...</p>
        </div>
      </div>
    )
  }

  if (!shop) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Shop not found</h2>
          <Button onClick={() => navigate('/shops')}>
            Back to Shops
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => navigate(`/shops/${shopId}`)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Shop
          </Button>
          
          <div className="flex items-center gap-4">
            <img
              src={shop.images?.[0] || '/assets/default-shop.jpg'}
              alt={shop.name}
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div>
              <h1 className="text-3xl font-bold">{shop.name}</h1>
              <div className="flex items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{shop.address}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span>{shop.rating?.average?.toFixed(1) || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <Card>
              <CardHeader>
                <CardTitle>Book Your Appointment</CardTitle>
                <CardDescription>
                  Select your service, barber, and preferred time
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Service Selection */}
                <div className="space-y-2">
                  <Label htmlFor="service">Select Service *</Label>
                  <Select value={selectedService} onValueChange={setSelectedService}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a service" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem key={service._id} value={service._id}>
                          <div className="flex justify-between items-center w-full">
                            <span>{service.name}</span>
                            <span className="text-muted-foreground">
                              {formatPrice(service.price)}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Employee Selection */}
                <div className="space-y-2">
                  <Label htmlFor="employee">Select Barber *</Label>
                  <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a barber" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((employee) => (
                        <SelectItem key={employee._id} value={employee._id}>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span>{employee.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Selection */}
                <div className="space-y-2">
                  <Label>Select Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !selectedDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        initialFocus
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Time Selection */}
                {selectedDate && availableSlots.length > 0 && (
                  <div className="space-y-2">
                    <Label>Select Time *</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {availableSlots.map((slot) => (
                        <Button
                          key={slot}
                          variant={selectedTime === slot ? "default" : "outline"}
                          onClick={() => setSelectedTime(slot)}
                          className="h-10"
                        >
                          <Clock className="w-4 h-4 mr-1" />
                          {slot}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Special Requests (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any special requests or notes for your appointment..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Booking Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedService && (
                  <div className="flex justify-between items-center">
                    <span>Service:</span>
                    <span className="font-medium">
                      {services.find(s => s._id === selectedService)?.name}
                    </span>
                  </div>
                )}

                {selectedEmployee && (
                  <div className="flex justify-between items-center">
                    <span>Barber:</span>
                    <span className="font-medium">
                      {employees.find(e => e._id === selectedEmployee)?.name}
                    </span>
                  </div>
                )}

                {selectedDate && (
                  <div className="flex justify-between items-center">
                    <span>Date:</span>
                    <span className="font-medium">
                      {format(selectedDate, "MMM dd, yyyy")}
                    </span>
                  </div>
                )}

                {selectedTime && (
                  <div className="flex justify-between items-center">
                    <span>Time:</span>
                    <span className="font-medium">{selectedTime}</span>
                  </div>
                )}

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Total:</span>
                    <span>{formatPrice(getSelectedServicePrice())}</span>
                  </div>
                </div>

                <Button
                  onClick={handleBooking}
                  disabled={!selectedService || !selectedEmployee || !selectedDate || !selectedTime || bookingLoading}
                  className="w-full"
                  size="lg"
                >
                  {bookingLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating Booking...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Book Appointment
                    </>
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  A deposit may be required to confirm your booking
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
} 