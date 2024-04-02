import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

extendZodWithOpenApi(z);

export const GetDataRequest = z.object({
  params: z.object(
    {
      category: z
        .string({ description: "Category of the API', example: 'Animals'. minimum length should be 2" })
        .min(2, 'Category must be at least 2 characters long')
        .optional(),
      auth: z
        .string({
          description: "Authentication type of the API', example: 'apiKey'.",
        })
        .optional(),
      https: z
        .enum(['true', 'false'], {
          description: "HTTPS support of the API', boolean value 'true' or 'false' are allowed.",
        })
        .transform((data) => data === 'true')
        .optional(),
      cors: z
        .enum(['yes', 'no', 'unknown'], {
          description: "CORS support of the API', value can be 'yes', 'no' or 'unknown'.",
        })
        .optional(),
      api: z
        .string({
          description: "Name of the API', example: 'Cat Facts'.",
        })
        .optional(),
      records: z
        .string({
          description: "Number of records to return', example: '10'.",
        })
        .transform(Number)
        .refine((data) => data > 0, 'records must be a positive number')
        .optional(),
    },
    {
      description: 'Query parameters for filtering APIs',
    }
  ),
});

export const GetDataResponse = z.array(
  z.object({
    API: z.string(),
    Description: z.string(),
    Auth: z.string(),
    HTTPS: z.boolean(),
    Cors: z.string(),
    Link: z.string(),
    Category: z.string(),
  })
);
