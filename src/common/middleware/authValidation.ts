import { RequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';

import User from '@/api/user/userModel';

import { ResponseStatus, ServiceResponse } from '../models/serviceResponse';
import { env } from '../utils/envConfig';
import { handleServiceResponse } from '../utils/httpHandlers';

const authValidation: RequestHandler = async (req, res, next) => {
  const { authorization } = req.headers;

  const token = authorization?.split(' ')[1];
  let serviceResponse;
  if (!token) {
    serviceResponse = new ServiceResponse(
      ResponseStatus.Failed,
      "Authorization header must be in the format 'Bearer <token>",
      null,
      StatusCodes.UNAUTHORIZED
    );
  } else {
    try {
      // validate token
      const decoded = jwt.verify(token, env.JWT_ACCESS_TOKEN_SECRET) as jwt.JwtPayload;

      const user = await User.findById(decoded._id).exec();

      if (!user) {
        serviceResponse = new ServiceResponse(ResponseStatus.Failed, 'User not found', null, StatusCodes.UNAUTHORIZED);
      } else if (user.accessToken !== token) {
        serviceResponse = new ServiceResponse(ResponseStatus.Failed, 'Invalid token', null, StatusCodes.UNAUTHORIZED);
      } else {
        // @ts-expect-error user is added to request object
        req.user = user;
      }
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        serviceResponse = new ServiceResponse(ResponseStatus.Failed, 'Token expired', null, StatusCodes.UNAUTHORIZED);
      } else {
        serviceResponse = new ServiceResponse(ResponseStatus.Failed, 'Invalid token', null, StatusCodes.UNAUTHORIZED);
      }
    }
  }

  if (serviceResponse) handleServiceResponse(serviceResponse, res);
  else next();
};

export default authValidation;
