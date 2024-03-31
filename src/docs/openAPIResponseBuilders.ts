import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';

import { ServiceResponseSchema } from '@/common/models/serviceResponse';

export function createApiResponse(
  schema: z.ZodTypeAny,
  description: string,
  success: boolean,
  statusCode = StatusCodes.OK
) {
  return {
    [statusCode]: {
      description,
      content: {
        'application/json': {
          schema: ServiceResponseSchema(schema, success),
        },
      },
    },
  };
}

// Use if you want multiple responses for a single endpoint

import { ResponseConfig } from '@asteasolutions/zod-to-openapi';
export type ApiResponseConfig = {
  schema: z.ZodTypeAny;
  description: string;
  success: boolean;
  statusCode: StatusCodes;
};
export function createApiResponses(configs: ApiResponseConfig[]) {
  const responses: { [key: string]: ResponseConfig } = {};
  configs.forEach(({ schema, description, statusCode, success }) => {
    responses[statusCode] = {
      description,
      content: {
        'application/json': {
          schema: ServiceResponseSchema(schema, success),
        },
      },
    };
  });
  return responses;
}
