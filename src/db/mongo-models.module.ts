import { Global, Module } from '@nestjs/common';
import { DatabaseModule } from './database.module';
import { modelProviders } from './mongo-model.provide';

@Global()
@Module({
  imports: [DatabaseModule],
  providers: [...modelProviders],
  exports: [...modelProviders],
})
export class MongoModelsModule {}
