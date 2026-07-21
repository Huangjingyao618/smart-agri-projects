/**
 * OneNET 云平台 MQTT 服务
 * 使用 Token 认证方式连接，订阅设备数据，下发命令控制 LED
 */
import MqttClient from '@/utils/mqtt';
import type { DeviceData } from '@/types/device';
import { useDeviceStore } from '@/store/device';

// OneNET MQTT WebSocket 地址
const MQTT_BROKER = 'wxs://183.230.40.39:6003/mqtt';

const ONENET_CONFIG = {
  productId: '46LC0850o3',
  deviceName: 'stm32',
  token: 'version=2018-10-31&res=products%2F46LC0850o3%2Fdevices%2Fstm32&et=1893456000&method=md5&sign=k4uDjK3Zp1aR%2BWFjvSXsEg%3D%3D',
};

let mqttClient: MqttClient | null = null;

/** 初始化并连接 OneNET MQTT */
export function connectOnenet(): void {
  const store = useDeviceStore.getState();

  if (mqttClient) {
    mqttClient.disconnect();
  }

  store.setStatus('connecting');

  mqttClient = new MqttClient(
    MQTT_BROKER,
    ONENET_CONFIG.deviceName,
    ONENET_CONFIG.productId,
    ONENET_CONFIG.token,
  );

  mqttClient.onStatusChange((status, msg) => {
    if (status === 'connected') {
      store.setStatus('connected');
      // 订阅设备数据上报主题
      mqttClient!.subscribe([
        `$sys/${ONENET_CONFIG.productId}/${ONENET_CONFIG.deviceName}/dp/post/json/+`,
      ]);
    } else if (status === 'disconnected') {
      store.setStatus('disconnected');
    } else if (status === 'error') {
      store.setStatus('error');
    }
  });

  mqttClient.onMessage((_topic, payload) => {
    try {
      const data = JSON.parse(payload);
      const store2 = useDeviceStore.getState();

      // OneNET 数据点格式: {"datastreams":[{"id":"temp","datapoints":[{"value":25.5}]}, ...]}
      if (data.datastreams) {
        const updates: Partial<DeviceData> = {};
        for (const ds of data.datastreams) {
          const id = ds.id;
          const value = ds.datapoints?.[0]?.value;
          if (id === 'temp' || id === 'humidity') {
            (updates as any)[id] = Number(value);
          } else if (id === 'LED1' || id === 'LED2') {
            (updates as any)[id] = value === 1 || value === true || value === '1';
          }
        }
        if (Object.keys(updates).length > 0) {
          store2.updateData({ ...updates, timestamp: Date.now() });
        }
      }

      // 兼容扁平格式: {"temp":25.5, "humidity":60, "LED1":1, "LED2":0}
      if (typeof data.temp !== 'undefined' || typeof data.humidity !== 'undefined') {
        store2.updateData({
          temp: data.temp !== undefined ? Number(data.temp) : store2.data.temp,
          humidity: data.humidity !== undefined ? Number(data.humidity) : store2.data.humidity,
          LED1: data.LED1 !== undefined ? (data.LED1 === 1 || data.LED1 === true || data.LED1 === '1') : store2.data.LED1,
          LED2: data.LED2 !== undefined ? (data.LED2 === 1 || data.LED2 === true || data.LED2 === '1') : store2.data.LED2,
          timestamp: Date.now(),
        });
      }
    } catch (e) {
      console.error('[OneNET] Failed to parse message:', e);
    }
  });

  mqttClient.connect();
}

/** 断开 OneNET 连接 */
export function disconnectOnenet(): void {
  if (mqttClient) {
    mqttClient.disconnect();
    mqttClient = null;
  }
  useDeviceStore.getState().setStatus('disconnected');
}

/** 下发 LED 控制命令 */
export function sendLedCommand(led: 'LED1' | 'LED2', on: boolean): void {
  if (!mqttClient || !mqttClient.connected) {
    console.warn('[OneNET] Not connected, cannot send command');
    return;
  }

  const cmdid = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const topic = `$sys/${ONENET_CONFIG.productId}/${ONENET_CONFIG.deviceName}/cmd/request/${cmdid}`;
  const payload = JSON.stringify({ [led]: on });

  mqttClient.publish(topic, payload);
  console.log(`[OneNET] Command sent: ${led}=${on}`);
}