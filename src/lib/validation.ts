import { z } from 'zod';

/**
 * Sanitizes a string by removing potentially harmful characters
 * @param input - The string to sanitize
 * @returns Sanitized string
 */
export const sanitizeString = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .substring(0, 1000); // Limit length
};

/**
 * Sanitizes a number input
 * @param input - The number to sanitize
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 * @returns Sanitized number or null if invalid
 */
export const sanitizeNumber = (input: number, min = -Infinity, max = Infinity): number | null => {
  if (typeof input !== 'number' || isNaN(input) || !isFinite(input)) {
    return null;
  }
  return Math.max(min, Math.min(max, input));
};

/**
 * Validates and sanitizes email addresses
 */
export const emailSchema = z
  .string()
  .email('Please enter a valid email address')
  .min(1, 'Email is required')
  .max(254, 'Email is too long')
  .transform(sanitizeString);

/**
 * Validates and sanitizes passwords
 */
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password is too long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

/**
 * Validates and sanitizes transaction amounts
 */
export const amountSchema = z
  .number()
  .positive('Amount must be positive')
  .max(1000000, 'Amount is too large')
  .refine((val) => Number.isFinite(val), 'Amount must be a valid number')
  .transform((val) => sanitizeNumber(val, 0.01, 1000000) || 0);

/**
 * Validates and sanitizes text descriptions
 */
export const descriptionSchema = z
  .string()
  .min(1, 'Description is required')
  .max(500, 'Description is too long')
  .transform(sanitizeString);

/**
 * Validates and sanitizes category names
 */
export const categorySchema = z
  .string()
  .min(1, 'Category is required')
  .max(50, 'Category name is too long')
  .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Category can only contain letters, numbers, spaces, hyphens, and underscores')
  .transform(sanitizeString);

/**
 * Validates file uploads
 */
export const fileSchema = z
  .instanceof(File)
  .refine((file) => file.size <= 5 * 1024 * 1024, 'File size must be less than 5MB')
  .refine(
    (file) => ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'].includes(file.type),
    'File must be a JPEG, PNG, WebP image, or PDF'
  );

/**
 * Transaction form validation schema
 */
export const transactionFormSchema = z.object({
  description: descriptionSchema,
  amount: amountSchema,
  category: categorySchema,
  type: z.enum(['income', 'expense'], {
    required_error: 'Transaction type is required',
  }),
  date: z.date({
    required_error: 'Date is required',
  }),
  receipt: fileSchema.optional(),
});

/**
 * Budget form validation schema
 */
export const budgetFormSchema = z.object({
  category: categorySchema,
  amount: amountSchema,
  period: z.enum(['monthly', 'weekly', 'yearly'], {
    required_error: 'Budget period is required',
  }),
});

/**
 * Savings goal form validation schema
 */
export const savingsGoalFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Goal name is required')
    .max(100, 'Goal name is too long')
    .transform(sanitizeString),
  targetAmount: amountSchema,
  currentAmount: z
    .number()
    .min(0, 'Current amount cannot be negative')
    .max(1000000, 'Current amount is too large')
    .transform((val) => sanitizeNumber(val, 0, 1000000) || 0),
  targetDate: z.date({
    required_error: 'Target date is required',
  }),
  description: z
    .string()
    .max(500, 'Description is too long')
    .optional()
    .transform((val) => val ? sanitizeString(val) : undefined),
});

/**
 * User profile form validation schema
 */
export const profileFormSchema = z.object({
  fullName: z
    .string()
    .min(1, 'Full name is required')
    .max(100, 'Full name is too long')
    .regex(/^[a-zA-Z\s\-']+$/, 'Full name can only contain letters, spaces, hyphens, and apostrophes')
    .transform(sanitizeString),
  email: emailSchema,
});

// Export all schemas as a collection for easy access
export const validationSchemas = {
  email: emailSchema,
  password: passwordSchema,
  amount: amountSchema,
  description: descriptionSchema,
  category: categorySchema,
  file: fileSchema,
  transactionForm: transactionFormSchema,
  budgetForm: budgetFormSchema,
  savingsGoalForm: savingsGoalFormSchema,
  profileForm: profileFormSchema,
} as const;
