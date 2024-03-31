import mongoose from 'mongoose';

import { env } from './envConfig';

export const connectDB = async () => {
  try {
    await mongoose.connect(env.MONGO_URI);
  } catch (error) {
    process.exit(1);
  }
};
