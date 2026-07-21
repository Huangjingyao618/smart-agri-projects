/**
 * OneNET MQTT WebSocket 客户端
 * 用于微信小程序直连 OneNET 云平台
 */

// OneNET 配置
var ONENET_CONFIG = {
  productId: '46LC0850o3',
  deviceName: 'stm32',
  token: 'version=2018-10-31&res=products%2F46LC0850o3%2Fdevices%2Fstm32&et=1893456000&method=md5&sign=k4uDjK3Zp1aR%2BWFjvSXsEg%3D%3D',
  brokerUrl: 'wxs://183.230.40.39:6003/mqtt',
};

/**
 * 编码剩余长度 (MQTT 可变长度编码)
 */
function encodeRemainingLength(length) {
  var bytes = [];
  var remaining = length;
  do {
    var byte = remaining % 128;
    remaining = Math.floor(remaining / 128);
    if (remaining > 0) byte |= 0x80;
    bytes.push(byte);
  } while (remaining > 0);
  return bytes;
}

/**
 * 解码剩余长度
 */
function decodeRemainingLength(buffer, start) {
  var multiplier = 1;
  var value = 0;
  var bytesRead = 0;
  var byte;
  do {
    if (start + bytesRead >= buffer.length) throw new Error('Incomplete length');
    byte = buffer[start + bytesRead];
    value += (byte & 0x7f) * multiplier;
    multiplier *= 128;
    bytesRead++;
  } while ((byte & 0x80) !== 0);
  return { length: value, bytesRead: bytesRead };
}

/**
 * 编码 MQTT 字符串 (2字节长度前缀 + UTF-8)
 */
function encodeString(str) {
  // 微信小程序不支持 TextEncoder，用简单方法编码 ASCII / 中文
  var utf8 = stringToUtf8ByteArray(str);
  var len = utf8.length;
  var result = [(len >> 8) & 0xff, len & 0xff];
  return result.concat(utf8);
}

/**
 * 解码 MQTT 字符串
 */
function decodeString(buffer, start) {
  var len = ((buffer[start] & 0xff) << 8) | (buffer[start + 1] & 0xff);
  var end = start + 2 + len;
  var str = '';
  var pos = start + 2;
  while (pos < end) {
    var byte = buffer[pos++];
    if ((byte & 0x80) === 0) {
      str += String.fromCharCode(byte);
    } else if ((byte & 0xe0) === 0xc0) {
      var byte2 = buffer[pos++];
      str += String.fromCharCode(((byte & 0x1f) << 6) | (byte2 & 0x3f));
    } else if ((byte & 0xf0) === 0xe0) {
      var byte2 = buffer[pos++];
      var byte3 = buffer[pos++];
      str += String.fromCharCode(((byte & 0x0f) << 12) | ((byte2 & 0x3f) << 6) | (byte3 & 0x3f));
    }
  }
  return { value: str, bytesRead: 2 + len };
}

/**
 * 字符串转 UTF-8 字节数组 (微信小程序兼容)
 */
function stringToUtf8ByteArray(str) {
  var bytes = [];
  for (var i = 0; i < str.length; i++) {
    var code = str.charCodeAt(i);
    if (code < 0x80) {
      bytes.push(code);
    } else if (code < 0x800) {
      bytes.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
    } else {
      bytes.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
    }
  }
  return bytes;
}

/**
 * 构造 CONNECT 报文
 */
function buildConnectPacket(clientId, username, password, keepAlive) {
  keepAlive = keepAlive || 60;
  var protocol = encodeString('MQTT');
  var protocolLevel = [0x04];
  var flags = 0x02; // Clean Session
  if (username) flags |= 0x80;
  if (password) flags |= 0x40;
  var keepAliveBytes = [(keepAlive >> 8) & 0xff, keepAlive & 0xff];

  var cid = encodeString(clientId);
  var u = username ? encodeString(username) : [];
  var p = password ? encodeString(password) : [];

  var variableHeader = protocol.concat(protocolLevel, [flags], keepAliveBytes);
  var payload = cid.concat(u, p);
  var remaining = variableHeader.length + payload.length;
  var remainingBytes = encodeRemainingLength(remaining);

  return new Uint8Array([0x10].concat(remainingBytes, variableHeader, payload)).buffer;
}

/**
 * 构造 SUBSCRIBE 报文
 */
function buildSubscribePacket(packetId, topics) {
  var payload = [];
  for (var i = 0; i < topics.length; i++) {
    payload = payload.concat(encodeString(topics[i]));
    payload.push(0x00); // QoS 0
  }
  var variableHeader = [(packetId >> 8) & 0xff, packetId & 0xff];
  var remaining = variableHeader.length + payload.length;
  var remainingBytes = encodeRemainingLength(remaining);
  return new Uint8Array([0x82].concat(remainingBytes, variableHeader, payload)).buffer;
}

/**
 * 构造 PUBLISH 报文
 */
function buildPublishPacket(topic, message) {
  var topicBytes = encodeString(topic);
  var msgBytes = stringToUtf8ByteArray(message);
  var remaining = topicBytes.length + msgBytes.length;
  var remainingBytes = encodeRemainingLength(remaining);
  return new Uint8Array([0x30].concat(remainingBytes, topicBytes, msgBytes)).buffer;
}

// PINGREQ 报文
var PINGREQ_PACKET = new Uint8Array([0xc0, 0x00]).buffer;

/**
 * 创建 MQTT 客户端
 */
function createMqttClient(opts) {
  var ws = null;
  var connected = false;
  var buffer = [];
  var pingTimer = null;
  var packetId = 0;
  var onMsgCallback = null;
  var onStatusCallback = null;

  opts = opts || {};
  var url = opts.url || '';
  var clientId = opts.clientId || '';
  var username = opts.username || '';
  var password = opts.password || '';
  var keepAlive = opts.keepAlive || 60;

  function startPing() {
    stopPing();
    pingTimer = setInterval(function () {
      if (connected && ws) {
        ws.send({ data: PINGREQ_PACKET });
      }
    }, (keepAlive - 5) * 1000);
  }

  function stopPing() {
    if (pingTimer) {
      clearInterval(pingTimer);
      pingTimer = null;
    }
  }

  function parseBuffer() {
    while (buffer.length >= 2) {
      var type = buffer[0] >> 4;
      try {
        var decoded = decodeRemainingLength(buffer, 1);
        var totalLen = 1 + decoded.bytesRead + decoded.length;
        if (buffer.length < totalLen) return;

        var packet = buffer.splice(0, totalLen);
        handlePacket(type, packet);
      } catch (e) {
        console.error('[MQTT] 解析错误:', e);
        buffer = [];
        return;
      }
    }
  }

  function handlePacket(type, packet) {
    switch (type) {
      case 2: // CONNACK
        var returnCode = packet[3] || 0;
        if (returnCode === 0) {
          connected = true;
          startPing();
          console.log('[MQTT] 连接成功');
          if (onStatusCallback) onStatusCallback('connected', '');
        } else {
          console.error('[MQTT] 连接被拒绝, 代码:', returnCode);
          if (onStatusCallback) onStatusCallback('error', '连接被拒绝 (代码 ' + returnCode + ')');
        }
        break;

      case 3: // PUBLISH
        var pos = 1;
        var lenResult = decodeRemainingLength(packet, pos);
        pos += lenResult.bytesRead;
        var topicResult = decodeString(packet, pos);
        pos += topicResult.bytesRead;

        // 尝试多种方式解码 payload
        var payloadStr = '';
        try {
          var arr = [];
          for (var i = pos; i < packet.length; i++) arr.push(packet[i]);
          payloadStr = decodeUtf8Array(arr);
        } catch (e) {
          payloadStr = String.fromCharCode.apply(null, packet.slice(pos));
        }

        console.log('[MQTT] 收到消息:', topicResult.value);
        if (onMsgCallback) onMsgCallback(topicResult.value, payloadStr);
        break;

      case 9: // SUBACK
        console.log('[MQTT] 订阅确认');
        break;

      case 13: // PINGRESP
        break;

      default:
        break;
    }
  }

  function decodeUtf8Array(arr) {
    var str = '';
    var i = 0;
    while (i < arr.length) {
      var byte = arr[i++];
      if ((byte & 0x80) === 0) {
        str += String.fromCharCode(byte);
      } else if ((byte & 0xe0) === 0xc0) {
        str += String.fromCharCode(((byte & 0x1f) << 6) | (arr[i++] & 0x3f));
      } else if ((byte & 0xf0) === 0xe0) {
        str += String.fromCharCode(((byte & 0x0f) << 12) | ((arr[i++] & 0x3f) << 6) | (arr[i++] & 0x3f));
      }
    }
    return str;
  }

  function connect() {
    if (ws) {
      try { ws.close(); } catch (e) {}
      ws = null;
    }
    connected = false;
    buffer = [];

    ws = wx.connectSocket({
      url: url,
      header: { 'content-type': 'application/json' },
      tcpNoDelay: true,
    });

    ws.onOpen(function () {
      console.log('[MQTT] WebSocket 已连接');
      var connectPacket = buildConnectPacket(clientId, username, password, keepAlive);
      ws.send({ data: connectPacket });
    });

    ws.onMessage(function (res) {
      var uint8 = new Uint8Array(res.data);
      buffer = buffer.concat(Array.prototype.slice.call(uint8));
      parseBuffer();
    });

    ws.onError(function (err) {
      console.error('[MQTT] WebSocket 错误:', err);
      connected = false;
      stopPing();
      if (onStatusCallback) onStatusCallback('error', 'WebSocket 错误');
    });

    ws.onClose(function () {
      console.log('[MQTT] WebSocket 已关闭');
      connected = false;
      stopPing();
      if (onStatusCallback) onStatusCallback('disconnected', '');
    });
  }

  function subscribe(topics) {
    if (!connected || !ws) return;
    packetId++;
    var packet = buildSubscribePacket(packetId, topics);
    ws.send({ data: packet });
    console.log('[MQTT] 已订阅:', topics);
  }

  function publish(topic, message) {
    if (!connected || !ws) return;
    var packet = buildPublishPacket(topic, message);
    ws.send({ data: packet });
    console.log('[MQTT] 发布:', topic, message);
  }

  function isConnected() {
    return connected;
  }

  function disconnect() {
    stopPing();
    if (ws) {
      try { ws.close(); } catch (e) {}
      ws = null;
    }
    connected = false;
  }

  return {
    connect: connect,
    subscribe: subscribe,
    publish: publish,
    disconnect: disconnect,
    isConnected: isConnected,
    onMessage: function (cb) { onMsgCallback = cb; },
    onStatusChange: function (cb) { onStatusCallback = cb; },
  };
}

module.exports = {
  ONENET_CONFIG: ONENET_CONFIG,
  createMqttClient: createMqttClient,
};