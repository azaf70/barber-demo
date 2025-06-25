import { z } from 'zod';

export const UserSchema = z.object({
  _id: z.string(),
  email: z.string().email(),
  passwordHash: z.string().optional(),
  role: z.enum(['customer', 'barber', 'admin']),
  profile: z.object({
    firstName: z.string(),
    lastName: z.string(),
    phone: z.string().optional(),
    avatar: z.string().optional(),
  }),
  preferences: z.object({
    notifications: z.boolean().optional(),
    theme: z.enum(['light', 'dark', 'system']).optional(),
  }).optional(),
  isActive: z.boolean().optional(),
  isVerified: z.boolean().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
}); 