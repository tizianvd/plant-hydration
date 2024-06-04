import { Module, forwardRef } from '@nestjs/common';
import { MqttController } from './mqtt.controller';
import { LibApiModule } from '../lib-api.module';
@Module({
  controllers: [MqttController],
  providers: [],
  imports: [forwardRef(() => LibApiModule)],
})
export class MqttModule {}
