import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../db/database.module';
import { InternalController } from './internal.controller';
import { InternalService } from './internal.service';

@Module({
  imports: [DatabaseModule],
  controllers: [InternalController],
  providers: [InternalService],
})
export class InternalModule {}
