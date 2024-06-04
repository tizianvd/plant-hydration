import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
// import {ConfigService} from "@nestjs/config";
import { MqttClient, connect } from "mqtt";
import { MqttData } from "./mqtt.dto";
import { ConfigurationService } from "../configuration/configuration.service";
import { PrismaService } from "../prisma/prisma.service";

const log = new Logger("MqttService");

const LATEST_DATA_COUNT = 10;
const TOPICS = [
  {name: "Humidity", isDataSource: true},
  {name: "Temperature", isDataSource: true},
  {name: "Moisture", isDataSource: true},
  {name: "LightLevel", isDataSource: true},
  {name: "System", isDataSource: false},
  {name: "Configurations", isDataSource: false},
  {name: "ReferenceValue", isDataSource: false}
];

const TESTING_MODE  = false;
const TESTING_DATA: {[key: string]: number[]} = {
  "Temperature": [25, 26, 27, 28, 29, 30, 31, 32, 33, 34],
  "Humidity": [50, 51, 52, 53, 54, 55, 56, 57, 58, 59],
  "Moisture": [100, 99, 98, 97, 96, 95, 94, 93, 92, 91],
  "LightLevel": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
}

@Injectable()
export class MqttService implements OnModuleInit {
  private mqttClient!: MqttClient;

  private latestData: Map<string, MqttData[]> = new Map();

  private lastDBUpdate: Map<string, Date> = new Map();

  private refererenceValues: number[][] = [];

  constructor(private readonly configurationService: ConfigurationService, private readonly prisma: PrismaService) {}

  onModuleInit() {
    const host = "tnas7.synology.me"
    const port = 1883;
    const clientId = `mqtt_${Math.random().toString(16).slice(3)}`;

    const connectUrl = `mqtt://${host}:${port}`;

    this.mqttClient = connect(connectUrl, {
      clientId,
      clean: true,
      connectTimeout: 4000,
      username: 'tizian',
      password: '13ti04zi96an',
      reconnectPeriod: 1000,
    });

    log.debug(`Connecting to ${connectUrl}`);

    this.mqttClient.on("connect", () => {
      log.debug("Connected to MQTT Server");
      for (const topic of TOPICS) {
        this.mqttClient.subscribe(topic.name, (err: any) => {
          if (!err) {
            log.debug(`Subscribed to ${topic.name}`);
          } else {
            log.debug(`Error in subscribing to ${topic.name}`);
          }
        });
      }
    })

    this.mqttClient.on("message", async (topic, message) => {
      // log.debug(`Receive message ${message} for ${topic}`);
      if (topic && TOPICS.find((t) => t.name === topic && t.isDataSource)) {

        const latestData = this.latestData.get(topic) || [];
        if (latestData.length === LATEST_DATA_COUNT) {
          latestData.shift();
        }
        this.latestData.set(topic, [...latestData, {value: parseFloat(message.toString()), timestamp: Date.now()}]);
        
        if (!this.lastDBUpdate.get(topic) || Date.now() - (this.lastDBUpdate.get(topic)?.getTime() || 0) > 1000 * 60) {
          this.AddSensorDataToDB(topic, message.toString());
          this.lastDBUpdate.set(topic, new Date());
        }
      }

      if (topic === "System") {
        this.processSystemMessage(message.toString());
      } 
      else if (topic == "ReferenceValue") {
        this.storeReferenceValue(message.toString());
      }
      else if (topic === "Configurations") {
        const req = JSON.parse(message.toString());
        for (const group in req) {
          for (const key in req[group]) {
              await this.configurationService.updateConfiguration({group, key, value: req[group][key]});
          }
        }
        this.configurationService.curConfig.next(req);
      }
    })
  }

  getLatestData(topic: string): MqttData[] {
    if (TESTING_MODE) {
      return TESTING_DATA[topic].map((value, index) => ({value: value + Math.random() * 10 - 5, timestamp: Date.now() - (index * 1000)}));
    }
    return this.latestData.get(topic) || [];
  }

  // Fetches sensor data from the database and returns it filtered by the given unit (so for minutes only every minute, for hours every hour, etc.)
  getLatestDataFromDB(sensorId: string, unit: 'minutes' | 'quarter' | 'hours' | 'days' | 'weeks' | 'months'): Promise<MqttData[]> {
    let unitModifier = 1;
    switch (unit) {
      case 'minutes': unitModifier = 60 * 1000; break;
      case 'quarter': unitModifier = 15 * 60 * 1000; break;
      case 'hours': unitModifier = 60 * 60 * 1000; break;
      case 'days': unitModifier = 24 * 60 * 60 * 1000; break;
      case 'weeks': unitModifier = 7 * 24 * 60 * 60 * 1000; break;
      case 'months': unitModifier = 30 * 24 * 60 * 60 * 1000; break;
    }
    return this.prisma.$queryRaw`
        SELECT value, createdAt FROM "sensor_data"
        WHERE sensorId = ${sensorId}
        GROUP BY (createdAt / (${unitModifier}))
    `
    .then((data) => {
      const parsedData = JSON.parse(JSON.stringify(data)) as {value: number, createdAt: string}[];
      return parsedData.map((d) => ({value: d.value, timestamp: new Date(d.createdAt).getTime()}));
    });
  }

  publish(topic: string, message: string) {
    log.debug(`Publishing to ${topic}: ${message}`)
    this.mqttClient.publish(topic, message);
  }

  private async processSystemMessage(message: string) {
    switch (message) {
      case "power_on": {
        log.debug("ESP32 powered on");
        this.mqttClient.publish("configurations", JSON.stringify(await this.configurationService.getConfigurations()));
      } break;
    }
  }

  private storeReferenceValue(message: string) {
    const data: number[] = message.split(',').map((n) => Number(n));
    this.refererenceValues[data[0]] = data.slice(1);
  }

  public getReferenceValues() {
    return this.refererenceValues;
  }

  private async AddSensorDataToDB(topic: string, value: string) {
    if (!value) {
      return;
    }
    await this.prisma.sensorData.create({
      data: {
        sensorId: topic,
        value: parseFloat(value),
      }
    });
  }
}