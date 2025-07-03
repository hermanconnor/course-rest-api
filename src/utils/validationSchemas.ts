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

export const courseSchema = z.object({
  userId: z.number().int().positive('User ID must be a positive integer'),
  title: z.string().min(1, 'Please enter a course title').trim(),
  description: z.string().min(1, 'A course description is required').trim(),
  estimatedTime: z.string().trim().optional(),
  materialsNeeded: z.string().trim().optional(),
});

export type UserInput = z.infer<typeof userSchema>;
export type CourseInput = z.infer<typeof courseSchema>;

// For updates, a partial schema
export const userUpdateSchema = userSchema.partial();
export const courseUpdateSchema = courseSchema.partial();
