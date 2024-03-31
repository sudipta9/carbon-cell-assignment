import { ZodRequestBody } from '@asteasolutions/zod-to-openapi';
import { AnyZodObject, ZodType } from 'zod';
import { z } from 'zod';

export function createApiRequest(
  requestBody?: z.ZodObject<any, any, any>,
  params?: AnyZodObject,
  query?: AnyZodObject,
  cookies?: AnyZodObject,
  headers?: AnyZodObject | ZodType<unknown>[]
): {
  body?: ZodRequestBody;
  params?: AnyZodObject;
  query?: AnyZodObject;
  cookies?: AnyZodObject;
  headers?: AnyZodObject | ZodType<unknown>[];
} {
  return {
    body: requestBody
      ? {
          content: {
            'application/json': {
              schema: requestBody,
            },
          },
        }
      : undefined,
    params,
    query,
    cookies,
    headers,
  };
}
