import * as mongoose from 'mongoose';
import { Logger } from '@nestjs/common';

const logger = new Logger('MongoDB');

const {
  MONGO_URI,
  MONGO_HOST = 'localhost',
  MONGO_PORT = '27017',
  MONGO_DB = 'nest',
  MONGO_USER,
  MONGO_PASS,
  MONGO_AUTH_SOURCE = 'admin',
  NODE_ENV = 'development',
  MONGO_RETRY_ATTEMPTS = '7',
  MONGO_RETRY_BASE_DELAY = '2000',
  MONGO_MAX_POOL = '50',
  MONGO_MIN_POOL = '10',
  MONGO_TLS_CA_PATH,
} = process.env;

const buildUri = () => {
  if (MONGO_URI) return MONGO_URI;

  const credentials =
    MONGO_USER && MONGO_PASS
      ? `${encodeURIComponent(MONGO_USER)}:${encodeURIComponent(MONGO_PASS)}@`
      : '';

  return `mongodb://${credentials}${MONGO_HOST}:${MONGO_PORT}/${MONGO_DB}?authSource=${MONGO_AUTH_SOURCE}`;
};

const exponentialBackoff = (attempt: number, baseDelay: number) =>
  baseDelay * Math.pow(2, attempt - 1);

export const databaseProviders = [
  {
    provide: 'DATABASE_CONNECTION',
    useFactory: async (): Promise<mongoose.Connection> => {
      mongoose.set('strictQuery', true);
      mongoose.set('sanitizeFilter', true);
      mongoose.set('autoCreate', false);
      mongoose.set('bufferCommands', false);

      const uri = buildUri();
      const maxAttempts = parseInt(MONGO_RETRY_ATTEMPTS, 10);
      const baseDelay = parseInt(MONGO_RETRY_BASE_DELAY, 10);

      const tlsOptions =
        NODE_ENV === 'production'
          ? {
              tls: true,
              tlsCAFile: MONGO_TLS_CA_PATH,
              tlsAllowInvalidCertificates: false,
            }
          : {};

      mongoose.connection.on('connected', () => {
        logger.log(
          `Connected → ${mongoose.connection.host}:${mongoose.connection.port} | DB: ${mongoose.connection.name}`,
        );
      });

      mongoose.connection.on('reconnected', () => {
        logger.warn('MongoDB reconnected');
      });

      mongoose.connection.on('error', (err: Error) => {
        logger.error('MongoDB error', err?.stack);
      });

      mongoose.connection.on('disconnected', () => {
        logger.warn('MongoDB disconnected');
      });

      mongoose.connection.on('close', () => {
        logger.warn('MongoDB connection closed');
      });

      const gracefulShutdown = async (signal: string) => {
        try {
          logger.warn(`Graceful shutdown (${signal})`);
          await mongoose.connection.close(false);
          logger.log('MongoDB closed cleanly');
          process.exit(0);
        } catch (err) {
          logger.error(
            'Shutdown error',
            err instanceof Error ? err.stack : String(err),
          );
          process.exit(1);
        }
      };

      process.once('SIGINT', () => {
        void gracefulShutdown('SIGINT');
      });
      process.once('SIGTERM', () => {
        void gracefulShutdown('SIGTERM');
      });
      process.once('uncaughtException', (err) => {
        logger.error('Uncaught Exception', err?.stack);
        void gracefulShutdown('uncaughtException');
      });
      process.once('unhandledRejection', (reason: any) => {
        logger.error(
          'Unhandled Rejection',
          reason instanceof Error ? reason.stack : reason,
        );
        void gracefulShutdown('unhandledRejection');
      });

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          logger.log(`MongoDB connect attempt ${attempt}/${maxAttempts}`);

          await mongoose.connect(uri, {
            dbName: MONGO_DB,
            autoIndex: NODE_ENV !== 'production',
            maxPoolSize: parseInt(MONGO_MAX_POOL, 10),
            minPoolSize: parseInt(MONGO_MIN_POOL, 10),
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            connectTimeoutMS: 10000,
            retryWrites: true,
            w: 'majority',
            heartbeatFrequencyMS: 10000,
            family: 4,
            ...tlsOptions,
          });

          return mongoose.connection;
        } catch (error) {
          logger.error(
            `MongoDB attempt ${attempt} failed`,
            error instanceof Error ? error.stack : String(error),
          );

          if (attempt === maxAttempts) {
            logger.error('Max retry attempts reached. Exiting.');
            throw error;
          }

          const delay = exponentialBackoff(attempt, baseDelay);
          logger.warn(`Retrying in ${delay}ms`);
          await new Promise((res) => setTimeout(res, delay));
        }
      }

      throw new Error('MongoDB connection bootstrap failure');
    },
  },
];
