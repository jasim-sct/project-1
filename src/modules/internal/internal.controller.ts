import { Body, Controller, Post, Get } from '@nestjs/common';
import { InternalService } from './internal.service';

@Controller('internal')
export class InternalController {
  constructor(private readonly adminService: InternalService) {}

  @Get('login')
  @Post('login')
  login() {
    return this.adminService.login();
  }
}
