import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth(): { status: string; message: string; timestamp: string } {
    return {
      status: 'ok',
      message: 'Service is running',
      timestamp: new Date().toISOString(),
    };
  }
}
