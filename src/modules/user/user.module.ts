import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../db/database.module';
import { UserService } from './user.service';
import { UserController } from './user.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [UserController],
  providers: [
    UserService,
  ],
})
export class UserModule {}
