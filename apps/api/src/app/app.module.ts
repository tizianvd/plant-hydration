import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LibApiModule } from '@plant-hydration/lib-api';

@Module({
  imports: [LibApiModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
