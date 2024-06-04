import { Configuration } from "@prisma/client";

export type UpdateConfigurationRequest = Omit<Configuration, "updatedAt">
export type GetConfigurationRequest = Omit<Configuration, "updatedAt" | "value">;

export type ConfigurationsDictionary = { [key: string]: { [key: string]: string } };