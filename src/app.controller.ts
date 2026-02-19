import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

type HealthResponse = {
  status: string;
  message: string;
  timestamp: string;
};

@Controller('health')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHealth(): HealthResponse {
    return this.appService.getHealth();
  }
}
