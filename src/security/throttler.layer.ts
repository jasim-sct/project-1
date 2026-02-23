import { ThrottlerModule } from '@nestjs/throttler';

export const Throttler = ThrottlerModule.forRoot({
  throttlers: [
    {
      ttl: 60000,
      limit: 10,
    },
  ],
});
