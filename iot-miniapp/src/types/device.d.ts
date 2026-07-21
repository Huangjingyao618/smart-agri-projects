/** 设备数据类型 */
export interface DeviceData {
  temp: number;
  humidity: number;
  LED1: boolean;
  LED2: boolean;
  timestamp: number;
}

/** MQTT 连接状态 */
export type ConnectStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

/** OneNET 配置 */
export interface OnenetConfig {
  productId: string;
  deviceName: string;
  token: string;
  brokerUrl: string;
}