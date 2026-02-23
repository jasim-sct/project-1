import type { Request, Response, NextFunction } from 'express';

export function createReliabilityLayer() {
  return function (
    err: unknown,
    _req: Request,
    res: Response,
    next: NextFunction,
  ) {
    console.error('Unhandled error:', err);

    if (res.headersSent) {
      return next(err);
    }

    res.status(500).json({
      status: 'error',
      message: 'Service temporarily unavailable',
    });
  };
}
