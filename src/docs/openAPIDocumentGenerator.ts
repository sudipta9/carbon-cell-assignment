import { OpenApiGeneratorV3, OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';

import { authRegistry } from '@/api/auth/authRouter';
import { dataRegistry } from '@/api/data/dataRouter';
import { healthCheckRegistry } from '@/api/healthCheck/healthCheckRouter';
import { privateDataRegistry } from '@/api/privateData/privateDataRoute';
// import { userRegistry } from '@/api/user/userRouter';

export function generateOpenAPIDocument() {
  const registry = new OpenAPIRegistry([healthCheckRegistry, authRegistry, dataRegistry, privateDataRegistry]);
  const generator = new OpenApiGeneratorV3(registry.definitions);

  return generator.generateDocument({
    openapi: '3.0.0',
    info: {
      version: '1.0.0',
      title: 'Swagger API',
    },
    externalDocs: {
      description: 'View the raw OpenAPI Specification in JSON format',
      url: '/swagger.json',
    },
  });
}
