import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import axios, { AxiosResponse } from 'axios';
import express, { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import _ from 'lodash';
import { z } from 'zod';

import { ResponseStatus, ServiceResponse } from '@/common/models/serviceResponse';
import { handleServiceResponse, validateRequest } from '@/common/utils/httpHandlers';
import { createApiResponses } from '@/docs/openAPIResponseBuilders';

import { GetDataRequest, GetDataResponse } from './dataModel';

export const dataRegistry = new OpenAPIRegistry();

export const dataRouter: Router = (() => {
  const router = express.Router();

  // ================ Get Data ================
  dataRegistry.registerPath({
    method: 'get',
    path: '/data',
    tags: ['Data'],
    responses: createApiResponses([
      {
        statusCode: StatusCodes.OK,
        description: 'Data fetched successfully',
        schema: GetDataResponse,
        success: true,
      },
      {
        statusCode: StatusCodes.BAD_REQUEST,
        description: 'Bad request',
        schema: z.object({
          message: z.string(),
        }),
        success: false,
      },
    ]),
    request: {
      params: GetDataRequest.shape.params,
    },
  });

  router.get('/', validateRequest(GetDataRequest), async (req: Request, res: Response) => {
    const { category, auth, https, cors, api, records } = req.query;

    // request on https://api.publicapis.org/entries

    const response: AxiosResponse<{
      entries: Array<{
        API: string;
        Description: string;
        Auth: string;
        HTTPS: boolean;
        Cors: string;
        Link: string;
        Category: string;
      }>;
    }> = await axios.get('https://api.publicapis.org/entries');

    const data = response.data.entries;

    const filteredData = data.filter((entry) => {
      return (
        (!category || entry.Category === category) &&
        (!auth || entry.Auth === auth) &&
        (!https || entry.HTTPS === (https === 'true')) &&
        (!cors || entry.Cors === cors) &&
        (!api || entry.API === api)
      );
    });

    const limitedData = records ? _.take(filteredData, Number(records)) : filteredData;

    const serviceResponse = new ServiceResponse(
      ResponseStatus.Success,
      'Data fetched successfully',
      limitedData,
      StatusCodes.OK
    );

    handleServiceResponse(serviceResponse, res);
  });

  return router;
})();
