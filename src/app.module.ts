import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { appConfig } from './configs/appConfig';

import { UserModule } from './modules/user/user.module';
import { DatabaseModule } from './db/database.module';
import { MongoModelsModule } from './db/mongo-models.module';
import { InternalModule } from './modules/internal/internal.module';
import { Throttler } from './security/throttler.layer';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [appConfig],
    }),
    Throttler,
    DatabaseModule,
    MongoModelsModule,
    UserModule,
    InternalModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
