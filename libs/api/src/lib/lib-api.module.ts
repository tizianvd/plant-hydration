import { Module } from '@nestjs/common';
import { MqttModule } from './mqtt/mqtt.module';
import { ConfigurationModule } from './configuration/configuration.module';
import { ConfigurationService } from './configuration/configuration.service';
import { MqttService } from './mqtt/mqtt.service';
import { PrismaService } from './prisma/prisma.service';

@Module({
  controllers: [],
  providers: [ConfigurationService, MqttService, PrismaService],
  exports: [ConfigurationService, MqttService, PrismaService],
  imports: [MqttModule, ConfigurationModule]
})
export class LibApiModule {}
