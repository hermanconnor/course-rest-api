import { z } from 'zod';

export const userSchema = z.object({
  firstName: z.string().min(1, 'First name is required').trim(),

  lastName: z.string().min(1, 'Last name is required').trim(),

  emailAddress: z
    .string()
    .min(1, 'An email address is required')
    .email('Please enter a valid email address')
    .trim(),

  password: z.string().min(1, 'Password is required').trim(),
});

export type UserInput = z.infer<typeof userSchema>;

// For updates, a partial schema
export const userUpdateSchema = userSchema.partial();
