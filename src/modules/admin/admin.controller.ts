import { Body, Controller, Post, Get } from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('login')
  login() {
    return this.adminService.login();
  }
}
