export interface Booking {
  _id: string;
  customerId: string;
  shopId: string;
  employeeId: string;
  serviceId: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  cancellationReason?: string;
  cancelledBy?: 'customer' | 'barber' | 'system';
  payment: {
    totalAmount: number;
    depositAmount: number;
    stripePaymentIntentId?: string;
    status: 'pending' | 'paid' | 'refunded' | 'failed';
  };
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
} 