import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

extendZodWithOpenApi(z);

export const PrivateDataRequest = z.object({
  headers: z.object(
    {
      authorization: z
        .string({
          required_error: 'Authorization header is required',
          description: 'Bearer token for authentication',
        })
        .includes('Bearer ', {
          message: 'Authorization header must be in the format "Bearer <token>"',
        }),
    },
    {
      required_error: 'Headers are required',
    }
  ),
});
