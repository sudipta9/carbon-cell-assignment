import { isEmail } from 'validator';
import { z } from 'zod';

export const commonValidations = {
  id: z
    .string({
      description: 'ID of the user',
    })
    .refine((data) => !isNaN(Number(data)), 'ID must be a numeric value')
    .transform(Number)
    .refine((num) => num > 0, 'ID must be a positive number'),
};
