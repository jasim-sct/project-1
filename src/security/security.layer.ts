import * as express from 'express';
import type { Express } from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import * as compression from 'compression';
import * as cookieParser from 'cookie-parser';
import * as cors from 'cors';
import { randomUUID } from 'crypto';

export function createSecurityLayer(): Express {
  const securityApp = express();

  /* Trust proxy (for LB / nginx) */
  securityApp.set('trust proxy', 1);

  /* Disable fingerprinting */
  securityApp.disable('x-powered-by');

  /* CORS */
  securityApp.use(
    cors({
      origin: process.env.CORS_ORIGIN?.split(',') || [],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization', 'x-request-id'],
    }),
  );

  /* Security Headers */
  securityApp.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:'],
        },
      },
      frameguard: { action: 'deny' },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
      referrerPolicy: { policy: 'no-referrer' },
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  /* Compression */
  securityApp.use(compression());

  /* Body limits */
  securityApp.use(express.json({ limit: '1mb' }));
  securityApp.use(express.urlencoded({ extended: true, limit: '1mb' }));

  /* Cookie parsing */
  securityApp.use(cookieParser());

  /* Request Correlation ID */
  securityApp.use((req: any, res: any, next: any) => {
    const requestId = req.headers['x-request-id'] || randomUUID();
    req.requestId = requestId;
    res.setHeader('x-request-id', requestId);
    next();
  });

  /* Basic NoSQL injection key stripping */
  securityApp.use((req: any, _res, next) => {
    if (req.body && typeof req.body === 'object') {
      for (const key of Object.keys(req.body)) {
        if (key.includes('$') || key.includes('.')) {
          delete req.body[key];
        }
      }
    }
    next();
  });

  /* Brute-force protection */
  securityApp.use(
    slowDown({
      windowMs: 60 * 1000,
      delayAfter: 50,
      delayMs: 100,
    }),
  );

  /* Rate limiting */
  securityApp.use(
    rateLimit({
      windowMs: 60 * 1000,
      max: 200,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  return securityApp;
}
