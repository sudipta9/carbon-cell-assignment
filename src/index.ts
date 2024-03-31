import { connectDB } from '@/common/utils/db';
import { env } from '@/common/utils/envConfig';
import { app, logger } from '@/server';

// Connect to the database
connectDB()
  .then(() => {
    logger.info('Connected to the database');
    // Start the server
    const server = app.listen(env.PORT, () => {
      const { NODE_ENV, HOST, PORT } = env;
      logger.info(`Server (${NODE_ENV}) running on port http://${HOST}:${PORT}`);
    });

    const onCloseSignal = () => {
      logger.info('sigint received, shutting down');
      server.close(() => {
        logger.info('server closed');
        process.exit();
      });
      setTimeout(() => process.exit(1), 10000).unref(); // Force shutdown after 10s
    };

    process.on('SIGINT', onCloseSignal);
    process.on('SIGTERM', onCloseSignal);
  })
  .catch((error) => {
    logger.error('Failed to connect to the database:', error);
    process.exit(1);
  });
