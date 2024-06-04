import { Body, Controller, Get, Param, Post, Res } from '@nestjs/common';
import { ConfigurationService } from './configuration.service';
import { ConfigurationsDictionary, UpdateConfigurationRequest } from './configuration.dto';
import { MqttService } from '../mqtt/mqtt.service';
import { Response } from 'express';

@Controller('configuration')
export class ConfigurationController {
    constructor(private readonly configurationService: ConfigurationService, private readonly mqtt: MqttService) {}

    @Post('update')
    updateConfiguration(@Body() req: UpdateConfigurationRequest) {
        return this.configurationService.updateConfiguration(req);
    }

    @Get(':group/:key')
    getConfiguration(@Param ('group') group: string, @Param('key') key: string) {
        return this.configurationService.getConfiguration({group, key});
    }

    @Get()
    getConfigurations(): Promise<ConfigurationsDictionary>  {
        return this.configurationService.getConfigurations();
    }

    @Post()
    async setConfigurations(@Body() req: ConfigurationsDictionary) {
        for (const group in req) {
            for (const key in req[group]) {
                await this.configurationService.updateConfiguration({group, key, value: req[group][key]});
            }
        }

        this.mqtt.publish('configurations', JSON.stringify(req));

        return req;
    }

    @Get('stream')
    asyncstreamEvents(@Res() res: Response) {
        res.set({
            'Cache-Control': 'private, no-cache, no-store, must-revalidate, max-age=0, no-transform',
            'Connection': 'keep-alive',
            'Content-Type': 'text/event-stream',
        })
        
        res.flushHeaders();

        this.configurationService.curConfig.subscribe(async () => {
            const data = JSON.stringify(await this.configurationService.getConfigurations());
            res.write(`data: ${data}\n\n`);
        });

        res.on('close', () => {
            res.end();
        });
    }
}
