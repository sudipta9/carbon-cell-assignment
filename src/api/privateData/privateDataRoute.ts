import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import express, { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';

import authValidation from '@/common/middleware/authValidation';
import { ResponseStatus, ServiceResponse } from '@/common/models/serviceResponse';
import { handleServiceResponse, validateRequest } from '@/common/utils/httpHandlers';
import { createApiResponses } from '@/docs/openAPIResponseBuilders';

import { PrivateDataRequest } from './privateDataModel';

export const privateDataRegistry = new OpenAPIRegistry();

export const privateDataRouter: Router = (() => {
  const router = express.Router();

  // ================ Private Data ================
  privateDataRegistry.registerPath({
    method: 'get',
    path: '/private-data',
    tags: ['Private Data'],
    responses: createApiResponses([
      {
        statusCode: StatusCodes.OK,
        description: 'Private data retrieved successfully',
        schema: z.literal(null),
        success: true,
      },
      {
        statusCode: StatusCodes.UNAUTHORIZED,
        description: 'Unauthorized',
        schema: z.literal(null),
        success: false,
      },
    ]),
    request: {
      headers: PrivateDataRequest.shape.headers,
    },
  });

  router.get('/', authValidation, validateRequest(PrivateDataRequest), async (req: Request, res: Response) => {
    // @ts-expect-error user is added to request object
    const { name } = req.user;

    const serviceResponse = new ServiceResponse(ResponseStatus.Success, `Hello, ${name}`, null, StatusCodes.OK);
    return handleServiceResponse(serviceResponse, res);
  });

  return router;
})();
