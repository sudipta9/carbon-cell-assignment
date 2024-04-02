import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import express, { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';

import authValidation from '@/common/middleware/authValidation';
import { ResponseStatus, ServiceResponse } from '@/common/models/serviceResponse';
import { handleServiceResponse, validateRequest } from '@/common/utils/httpHandlers';
import { createApiResponses } from '@/docs/openAPIResponseBuilders';

import User from '../user/userModel';
import {
  refreshTokenRequest,
  SignInErrorResponse,
  SignInRequest,
  SignInResponse,
  SignOutRequest,
  SignUpRequest,
} from './authModel';

export const authRegistry = new OpenAPIRegistry();

export const authRouter: Router = (() => {
  const router = express.Router();

  // ================ Sign Up ================
  authRegistry.registerPath({
    method: 'post',
    path: '/auth/sign-up',
    tags: ['Authentication'],
    responses: createApiResponses([
      {
        statusCode: StatusCodes.CREATED,
        description: 'User created successfully',
        schema: SignInResponse,
        success: true,
      },
      {
        statusCode: StatusCodes.BAD_REQUEST,
        description: 'Bad request',
        schema: SignInErrorResponse,
        success: false,
      },
    ]),
    request: {
      body: {
        content: {
          'application/json': {
            schema: SignUpRequest.shape.body,
          },
        },
      },
    },
  });

  router.post('/sign-up', validateRequest(SignUpRequest), async (req: Request, res: Response) => {
    const { email, password, name } = req.body;

    const user = new User({
      email,
      hashedPassword: password, // passing password directly because it will be hashed in the pre save hook
      name,
    });

    await user.save();

    const serviceResponse = new ServiceResponse(
      ResponseStatus.Success,
      'User created successfully',
      null,
      StatusCodes.CREATED
    );
    handleServiceResponse(serviceResponse, res);
  });

  // ================ Sign In ================
  authRegistry.registerPath({
    method: 'post',
    path: '/auth/sign-in',
    tags: ['Authentication'],
    responses: createApiResponses([
      {
        statusCode: StatusCodes.OK,
        description: 'User signed in successfully',
        schema: SignInResponse,
        success: true,
      },
      {
        statusCode: StatusCodes.BAD_REQUEST,
        description: 'Bad request',
        schema: SignInErrorResponse,
        success: false,
      },
    ]),
    request: {
      body: {
        content: {
          'application/json': {
            schema: SignInRequest,
          },
        },
      },
    },
  });

  router.post('/sign-in', validateRequest(SignInRequest), async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).exec();

    if (!user) {
      const serviceResponse = new ServiceResponse(
        ResponseStatus.Failed,
        'Invalid email or password',
        null,
        StatusCodes.FORBIDDEN
      );
      handleServiceResponse(serviceResponse, res);
      return;
    }

    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      const serviceResponse = new ServiceResponse(
        ResponseStatus.Failed,
        'Invalid email or password',
        null,
        StatusCodes.FORBIDDEN
      );
      handleServiceResponse(serviceResponse, res);
      return;
    }

    const { accessToken, refreshToken } = await user.generateTokens();

    await user.save();

    const serviceResponse = new ServiceResponse(
      ResponseStatus.Success,
      'User signed in successfully',
      { accessToken, refreshToken },
      StatusCodes.OK
    );

    handleServiceResponse(serviceResponse, res);
  });

  // ================ Sign Out ================
  authRegistry.registerPath({
    method: 'post',
    path: '/auth/sign-out',
    tags: ['Authentication'],
    responses: createApiResponses([
      {
        statusCode: StatusCodes.OK,
        description: 'User signed out successfully',
        success: true,
        schema: z.null(),
      },
      {
        statusCode: StatusCodes.UNAUTHORIZED,
        description: 'Unauthorized',
        schema: z.null(),
        success: false,
      },
      {
        statusCode: StatusCodes.BAD_REQUEST,
        description: 'Bad request',
        schema: z.null(),
        success: false,
      },
    ]),
    request: {
      headers: SignOutRequest.shape.headers,
    },
  });

  router.post('/sign-out', authValidation, validateRequest(SignOutRequest), async (req: Request, res: Response) => {
    // @ts-expect-error user is added to request object
    const user = req.user;

    user.accessToken = null;
    user.refreshToken = null;

    await user.save();

    const serviceResponse = new ServiceResponse(
      ResponseStatus.Success,
      'User signed out successfully',
      null,
      StatusCodes.OK
    );

    handleServiceResponse(serviceResponse, res);
  });

  // ================ Refresh Token ================
  authRegistry.registerPath({
    method: 'post',
    path: '/auth/refresh-token',
    tags: ['Authentication'],
    responses: createApiResponses([
      {
        statusCode: StatusCodes.OK,
        description: 'Token refreshed successfully',
        schema: SignInResponse,
        success: true,
      },
      {
        statusCode: StatusCodes.BAD_REQUEST,
        description: 'Bad request',
        schema: SignInErrorResponse,
        success: false,
      },
    ]),
    request: {
      body: {
        content: {
          'application/json': {
            schema: refreshTokenRequest.shape.body,
          },
        },
      },
    },
  });

  router.post('/refresh-token', validateRequest(refreshTokenRequest), async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    const user = await User.findOne({ refreshToken }).exec();

    if (!user) {
      const serviceResponse = new ServiceResponse(
        ResponseStatus.Failed,
        'Invalid refresh token',
        null,
        StatusCodes.BAD_REQUEST
      );
      handleServiceResponse(serviceResponse, res);
      return;
    }

    const { accessToken, refreshToken: newRefreshToken } = await user.generateTokens();

    const serviceResponse = new ServiceResponse(
      ResponseStatus.Success,
      'Token refreshed successfully',
      { accessToken, refreshToken: newRefreshToken },
      StatusCodes.OK
    );

    handleServiceResponse(serviceResponse, res);
  });

  return router;
})();
