import { Module, forwardRef } from '@nestjs/common';
import { ConfigurationController } from './configuration.controller';
import { LibApiModule } from '../lib-api.module';
@Module({
  controllers: [ConfigurationController],
  providers: [],
  imports: [forwardRef(() => LibApiModule)],
})
export class ConfigurationModule {}
