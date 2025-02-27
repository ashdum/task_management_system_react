// src/services/auth/validation.ts
// Validation using zod for password, fullName and email

import { z } from 'zod';

export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

export const fullNameSchema = z.string()
  .min(2, 'Full name must be at least 2 characters long')
  .max(50, 'Full name must be less than 50 characters')
  .regex(/^[a-zA-Z\s'-]+$/, 'Full name can only contain letters, spaces, hyphens, and apostrophes');

export const emailSchema = z.string().email('Please enter a valid email address');

export const validatePassword = (password: string): string[] => {
  try {
    passwordSchema.parse(password);
    return [];
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.errors.map(err => err.message);
    }
    return ['Invalid password'];
  }
};

export const validateFullName = (fullName: string): string[] => {
  try {
    fullNameSchema.parse(fullName);
    return [];
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.errors.map(err => err.message);
    }
    return ['Invalid full name'];
  }
};

export const validateEmail = (email: string): string[] => {
  try {
    emailSchema.parse(email);
    return [];
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.errors.map(err => err.message);
    }
    return ['Invalid email address'];
  }
};
