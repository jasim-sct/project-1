import type { Request, Response, NextFunction } from 'express';

export function createReliabilityLayer() {
  return function (
    err: unknown,
    req: Request,
    res: Response,
    _next: NextFunction,
  ) {
    console.error('Unhandled error:', err);

    if (res.headersSent) {
      return;
    }

    res.status(500).json({
      status: 'error',
      message: 'Service temporarily unavailable',
    });
  };
}
