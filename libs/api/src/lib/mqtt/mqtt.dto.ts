export interface MqttData {
    value: number;
    timestamp: number;
  }
  
export interface MqttDataResponse {
    temperatures: MqttData[];
    humidities: MqttData[];
    moisture: MqttData[];
    lightLevel: MqttData[];
}