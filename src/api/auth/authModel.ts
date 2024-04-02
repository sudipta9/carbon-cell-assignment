import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

extendZodWithOpenApi(z);

export const SignInRequest = z.object({
  body: z.object(
    {
      email: z
        .string({
          required_error: 'Email is required',
          description: 'Email of the user',
        })
        .email(),
      password: z.string({
        required_error: 'Password is required',
        description: 'Password of the user',
      }),
    },
    {
      required_error: 'Body is required',
    }
  ),
});

export const SignUpRequest = z.object({
  body: z.object(
    {
      email: z
        .string({
          required_error: 'Email is required',
          description: 'Email of the user',
        })
        .email(),
      name: z.string({
        required_error: 'Name is required',
        description: 'Name of the user',
      }),
      password: z.string({
        required_error: 'Password is required',
        description: 'Password of the user',
      }),
    },
    {
      required_error: 'Body is required',
    }
  ),
});

export const refreshTokenRequest = z.object({
  body: z.object(
    {
      refreshToken: z.string({
        required_error: 'Refresh token is required',
        description: 'JWT refresh token',
      }),
    },
    {
      required_error: 'Body is required',
    }
  ),
});

export const SignOutRequest = z.object({
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

export const SignInResponse = z.object({
  accessToken: z.string({
    description: 'JWT access token',
  }),
  refreshToken: z.string({
    description: 'JWT refresh token',
  }),
});

export const SignInErrorResponse = z.object({});

export const SignUpResponse = z.object({
  message: z.string(),
});
