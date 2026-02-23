import * as express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import { NestExpressApplication } from '@nestjs/platform-express';
import { IncomingMessage, Server, ServerResponse } from 'http';
// import * as compression from 'compression';
// import * as cookieParser from 'cookie-parser';
// import { randomUUID } from 'crypto';

export function createSecurityLayer(
  security: NestExpressApplication<
    Server<typeof IncomingMessage, typeof ServerResponse>
  >,
): void {
  // const securityApp = express();

  security.set('trust proxy', 1);
  security.disable('x-powered-by');

  security.use(
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

  // security.use(compression());
  security.use(express.json({ limit: '1mb' }));
  security.use(express.urlencoded({ extended: true, limit: '1mb' }));
  // securityApp.use(cookieParser());

  // securityApp.use((req: Request, res: Response, next: NextFunction) => {
  //   const requestId =
  //     (req.headers['x-request-id'] as string | undefined) ?? randomUUID();
  //   req.requestId = requestId;
  //   res.setHeader('x-request-id', requestId);
  //   next();
  // });

  // securityApp.use((req: Request, _res: Response, next: NextFunction) => {
  //   if (req.body && typeof req.body === 'object') {
  //     for (const key of Object.keys(req.body as Record<string, unknown>)) {
  //       if (key.includes('$') || key.includes('.')) {
  //         delete (req.body as Record<string, unknown>)[key];
  //       }
  //     }
  //   }
  //   next();
  // });

  security.use(
    slowDown({
      windowMs: 60 * 1000,
      delayAfter: 50,
      delayMs: () => 100,
    }),
  );

  security.use(
    rateLimit({
      windowMs: 60 * 1000,
      max: 200,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  // return securityApp;
}
