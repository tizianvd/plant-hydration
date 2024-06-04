import { Injectable, Logger } from "@nestjs/common";
import { ConfigurationsDictionary, GetConfigurationRequest, UpdateConfigurationRequest } from "./configuration.dto";
import { PrismaService } from "../prisma/prisma.service";
import { BehaviorSubject } from "rxjs";

const log = new Logger("ConfigurationService");


@Injectable()
export class ConfigurationService {
  curConfig: BehaviorSubject<ConfigurationsDictionary> = new BehaviorSubject<ConfigurationsDictionary>({});

  constructor(private readonly prisma: PrismaService){}
  
  updateConfiguration(req: UpdateConfigurationRequest) {  
    if (typeof req.value !== "string") {
      req.value = JSON.stringify(req.value);
    }
    return this.prisma.configuration.upsert({
      where: { key_group: {key: req.key, group: req.group} },
      update: req,
      create: req
    });
  }

  getConfiguration(req: GetConfigurationRequest) {
    return this.prisma.configuration.findMany({
      where: req
    });
  }

  getConfigurations(): Promise<ConfigurationsDictionary> {
    return this.prisma.configuration.findMany().then(configs => {
      return configs.reduce((acc: {[key: string]: {[key: string]: any}}, config) => {
          if (!acc[config.group]) {
              acc[config.group] = {};
          }
          acc[config.group][config.key] = config.value;
          return acc;
      }, {});
  });
  }
}