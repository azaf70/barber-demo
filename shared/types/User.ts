export interface User {
  _id: string;
  email: string;
  passwordHash?: string;
  role: 'customer' | 'barber' | 'admin';
  profile: {
    firstName: string;
    lastName: string;
    phone?: string;
    avatar?: string;
  };
  preferences?: {
    notifications?: boolean;
    theme?: 'light' | 'dark' | 'system';
  };
  isActive?: boolean;
  isVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
} 