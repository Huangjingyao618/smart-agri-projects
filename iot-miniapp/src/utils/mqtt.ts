/**
 * 轻量级 MQTT 3.1.1 WebSocket 客户端 (适配微信小程序)
 * 支持 CONNECT / SUBSCRIBE / PUBLISH / PING 基本操作
 */

type MessageCallback = (topic: string, payload: string) => void;
type StatusCallback = (status: 'connected' | 'disconnected' | 'error', msg?: string) => void;

/** 剩余长度编码 */
function encodeLength(len: number): number[] {
  const bytes: number[] = [];
  let remaining = len;
  do {
    let byte = remaining % 128;
    remaining = Math.floor(remaining / 128);
    if (remaining > 0) byte |= 0x80;
    bytes.push(byte);
  } while (remaining > 0);
  return bytes;
}

/** 剩余长度解码 */
function decodeLength(bytes: number[], start: number): { length: number; bytesRead: number } {
  let multiplier = 1;
  let value = 0;
  let bytesRead = 0;
  let byte: number;
  do {
    if (start + bytesRead >= bytes.length) throw new Error('Incomplete length');
    byte = bytes[start + bytesRead];
    value += (byte & 0x7f) * multiplier;
    multiplier *= 128;
    bytesRead++;
    if (multiplier > 128 * 128 * 128) throw new Error('Malformed length');
  } while ((byte & 0x80) !== 0);
  return { length: value, bytesRead };
}

/** 编码 UTF-8 字符串为字节数组 (MQTT 格式: 2字节长度前缀 + UTF-8) */
function encodeStr(str: string): number[] {
  const encoder = new TextEncoder();
  const utf8 = encoder.encode(str);
  const len = utf8.length;
  return [(len >> 8) & 0xff, len & 0xff, ...Array.from(utf8)];
}

/** 解码 MQTT 字符串 (2字节长度前缀 + UTF-8) */
function decodeStr(bytes: number[], start: number): { value: string; bytesRead: number } {
  const len = ((bytes[start] & 0xff) << 8) | (bytes[start + 1] & 0xff);
  const decoder = new TextDecoder();
  const value = decoder.decode(new Uint8Array(bytes.slice(start + 2, start + 2 + len)));
  return { value, bytesRead: 2 + len };
}

/** 构造 CONNECT 报文 */
function buildConnectPacket(clientId: string, username: string, password: string, keepAlive = 60): ArrayBuffer {
  const protocol = encodeStr('MQTT');
  const protocolLevel = [0x04]; // MQTT 3.1.1
  let flags = 0x02; // Clean Session
  if (username) flags |= 0x80;
  if (password) flags |= 0x40;
  const keepAliveBytes = [(keepAlive >> 8) & 0xff, keepAlive & 0xff];

  const cid = encodeStr(clientId);
  const u = username ? encodeStr(username) : [];
  const p = password ? encodeStr(password) : [];

  const variableHeader = [...protocol, ...protocolLevel, flags, ...keepAliveBytes];
  const payload = [...cid, ...u, ...p];
  const remaining = variableHeader.length + payload.length;
  const remainingBytes = encodeLength(remaining);

  const packet = [0x10, ...remainingBytes, ...variableHeader, ...payload];
  return new Uint8Array(packet).buffer;
}

/** 构造 SUBSCRIBE 报文 */
function buildSubscribePacket(packetId: number, topics: string[]): ArrayBuffer {
  let payload: number[] = [];
  for (const topic of topics) {
    payload = payload.concat(encodeStr(topic));
    payload.push(0x00); // QoS 0
  }
  const variableHeader = [(packetId >> 8) & 0xff, packetId & 0xff];
  const remaining = variableHeader.length + payload.length;
  const remainingBytes = encodeLength(remaining);
  const packet = [0x82, ...remainingBytes, ...variableHeader, ...payload];
  return new Uint8Array(packet).buffer;
}

/** 构造 PUBLISH 报文 */
function buildPublishPacket(topic: string, message: string): ArrayBuffer {
  const topicBytes = encodeStr(topic);
  const encoder = new TextEncoder();
  const msgBytes = Array.from(encoder.encode(message));
  const remaining = topicBytes.length + msgBytes.length;
  const remainingBytes = encodeLength(remaining);
  const packet = [0x30, ...remainingBytes, ...topicBytes, ...msgBytes];
  return new Uint8Array(packet).buffer;
}

/** PINGREQ 报文 */
const PINGREQ_PACKET = new Uint8Array([0xc0, 0x00]).buffer;

class MqttClient {
  private ws: any = null;
  private url: string;
  private clientId: string;
  private username: string;
  private password: string;
  private keepAlive: number;
  private pingTimer: ReturnType<typeof setInterval> | null = null;
  private packetId = 0;
  private buffer: number[] = [];
  private onMsg: MessageCallback | null = null;
  private onStatus: StatusCallback | null = null;
  private _connected = false;

  constructor(url: string, clientId: string, username: string, password: string, keepAlive = 60) {
    this.url = url;
    this.clientId = clientId;
    this.username = username;
    this.password = password;
    this.keepAlive = keepAlive;
  }

  get connected(): boolean {
    return this._connected;
  }

  onMessage(cb: MessageCallback): void {
    this.onMsg = cb;
  }

  onStatusChange(cb: StatusCallback): void {
    this.onStatus = cb;
  }

  connect(): void {
    if (this.ws) {
      try { this.ws.close(); } catch (e) { /* ignore */ }
    }
    this._connected = false;
    this.buffer = [];

    this.ws = (wx as any).connectSocket({
      url: this.url,
      header: { 'content-type': 'application/json' },
      protocols: [],
      tcpNoDelay: true,
    });

    this.ws.onOpen(() => {
      console.log('[MQTT] WebSocket connected');
      const connectPacket = buildConnectPacket(this.clientId, this.username, this.password, this.keepAlive);
      this.ws.send({ data: connectPacket });
    });

    this.ws.onMessage((res: any) => {
      const data = new Uint8Array(res.data);
      this.buffer = this.buffer.concat(Array.from(data));
      this.parseBuffer();
    });

    this.ws.onError((err: any) => {
      console.error('[MQTT] WebSocket error:', err);
      this._connected = false;
      this.stopPing();
      this.onStatus?.('error', String(err));
    });

    this.ws.onClose(() => {
      console.log('[MQTT] WebSocket closed');
      this._connected = false;
      this.stopPing();
      this.onStatus?.('disconnected');
    });
  }

  subscribe(topics: string[]): void {
    if (!this._connected || !this.ws) {
      console.warn('[MQTT] Not connected, cannot subscribe');
      return;
    }
    this.packetId++;
    const packet = buildSubscribePacket(this.packetId, topics);
    this.ws.send({ data: packet });
    console.log('[MQTT] Subscribed to:', topics);
  }

  publish(topic: string, message: string): void {
    if (!this._connected || !this.ws) {
      console.warn('[MQTT] Not connected, cannot publish');
      return;
    }
    const packet = buildPublishPacket(topic, message);
    this.ws.send({ data: packet });
    console.log('[MQTT] Published to', topic, ':', message);
  }

  disconnect(): void {
    this.stopPing();
    if (this.ws) {
      try { this.ws.close(); } catch (e) { /* ignore */ }
      this.ws = null;
    }
    this._connected = false;
  }

  private startPing(): void {
    this.stopPing();
    this.pingTimer = setInterval(() => {
      if (this._connected && this.ws) {
        this.ws.send({ data: PINGREQ_PACKET });
      }
    }, (this.keepAlive - 5) * 1000);
  }

  private stopPing(): void {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }

  private parseBuffer(): void {
    while (this.buffer.length >= 2) {
      const type = this.buffer[0] >> 4;
      try {
        const { length: remaining, bytesRead } = decodeLength(this.buffer, 1);
        const totalLen = 1 + bytesRead + remaining;
        if (this.buffer.length < totalLen) return; // 数据不完整，等待

        const packet = this.buffer.splice(0, totalLen);
        this.handlePacket(type, packet);
      } catch (e) {
        console.error('[MQTT] Parse error:', e);
        this.buffer = [];
        return;
      }
    }
  }

  private handlePacket(type: number, packet: number[]): void {
    switch (type) {
      case 2: { // CONNACK
        const returnCode = packet[3] || 0;
        if (returnCode === 0) {
          this._connected = true;
          this.startPing();
          console.log('[MQTT] Connected successfully');
          this.onStatus?.('connected');
        } else {
          console.error('[MQTT] Connection refused, code:', returnCode);
          this.onStatus?.('error', `Connection refused (code ${returnCode})`);
        }
        break;
      }
      case 3: { // PUBLISH
        let pos = 1;
        const lenResult = decodeLength(packet, pos);
        pos += lenResult.bytesRead;
        const topicResult = decodeStr(packet, pos);
        pos += topicResult.bytesRead;
        const decoder = new TextDecoder();
        const payload = decoder.decode(new Uint8Array(packet.slice(pos)));
        console.log('[MQTT] Message received:', topicResult.value, payload);
        this.onMsg?.(topicResult.value, payload);
        break;
      }
      case 9: // SUBACK
        console.log('[MQTT] Subscribe acknowledged');
        break;
      case 13: // PINGRESP
        // keep-alive ok
        break;
      default:
        // ignore
    }
  }
}

export default MqttClient;