import { Body, Controller, Get, Logger, Param, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { MqttService } from './mqtt.service';

const log = new Logger("MqttController");

@Controller('mqtt')
export class MqttController {
    constructor(private readonly mqttService: MqttService) {}

    @Get('stream')
    dataStream(@Res() res: Response) {
        res.set({
            'Cache-Control': 'private, no-cache, no-store, must-revalidate, max-age=0, no-transform',
            'Connection': 'keep-alive',
            'Content-Type': 'text/event-stream',
        })
        
        res.flushHeaders();
        setInterval(() => {
            const data = JSON.stringify(
                {
                    temperatures: this.mqttService.getLatestData("Temperature"),
                    humidities: this.mqttService.getLatestData("Humidity"),
                    moisture: this.mqttService.getLatestData("Moisture"),
                    lightLevel: this.mqttService.getLatestData("LightLevel")
                })
            res.write(`data: ${data}\n\n`);
        }, 1000);

        res.on('close', () => {
            res.end();
        });
    }

    @Get('data')
    getData() {
        return {
            temperatures: this.mqttService.getLatestData("Temperature"),
            humidities: this.mqttService.getLatestData("Humidity"),
            moisture: this.mqttService.getLatestData("Moisture"),
            lightLevel: this.mqttService.getLatestData("LightLevel")
        }
    }

    @Get("history/:sensor/:unit") 
    getHistory(@Param('sensor') sensor: string, @Param('unit') unit: "minutes" | "quarter" | "hours" | "days" | "weeks" | "months")
    {
        return this.mqttService.getLatestDataFromDB(sensor, unit ?? "minutes");
    }

    @Post('lcd_display')
    toggleLcdDisplay(@Body() body: {display: boolean}) {
        this.mqttService.publish("lcd_display", body.display.toString());
    }

    @Get("reference-values") 
    getReferenceValues() {
        return this.mqttService.getReferenceValues();
    }
}
