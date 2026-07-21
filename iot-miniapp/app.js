/**
 * OneNET DHT11 温湿度监控小程序 - 全局入口
 */
var mqtt = require('./utils/mqtt.js');

var mqttClient = null;

App({
  globalData: {
    deviceData: {
      temp: 0,
      humidity: 0,
      LED1: false,
      LED2: false,
      timestamp: 0,
    },
    connectStatus: 'disconnected', // disconnected | connecting | connected | error
  },

  onLaunch: function () {
    console.log('[App] 小程序启动');
    this.connectOnenet();
  },

  onShow: function () {
    console.log('[App] 小程序显示');
    // 从后台切回前台时检查连接状态
    if (this.globalData.connectStatus !== 'connected') {
      this.connectOnenet();
    }
  },

  onHide: function () {
    console.log('[App] 小程序隐藏');
    // 切到后台断开连接
    this.disconnectOnenet();
  },

  /** 连接 OneNET */
  connectOnenet: function () {
    var that = this;
    if (this.globalData.connectStatus === 'connecting') return;
    this.setStatus('connecting');

    if (mqttClient) {
      mqttClient.disconnect();
      mqttClient = null;
    }

    mqttClient = mqtt.createMqttClient({
      url: mqtt.ONENET_CONFIG.brokerUrl,
      clientId: mqtt.ONENET_CONFIG.deviceName,
      username: mqtt.ONENET_CONFIG.productId,
      password: mqtt.ONENET_CONFIG.token,
    });

    mqttClient.onStatusChange(function (status, msg) {
      if (status === 'connected') {
        that.setStatus('connected');
        // 订阅设备数据主题
        mqttClient.subscribe([
          '$sys/' + mqtt.ONENET_CONFIG.productId + '/' + mqtt.ONENET_CONFIG.deviceName + '/dp/post/json/+',
        ]);
      } else if (status === 'disconnected') {
        that.setStatus('disconnected');
      } else if (status === 'error') {
        that.setStatus('error');
      }
    });

    mqttClient.onMessage(function (topic, payload) {
      that.handleMessage(payload);
    });

    mqttClient.connect();
  },

  /** 断开连接 */
  disconnectOnenet: function () {
    if (mqttClient) {
      mqttClient.disconnect();
      mqttClient = null;
    }
    this.setStatus('disconnected');
  },

  /** 处理设备数据消息 */
  handleMessage: function (payload) {
    var data;
    try {
      data = JSON.parse(payload);
    } catch (e) {
      console.error('[App] JSON 解析失败:', e);
      return;
    }

    var updates = {};
    var hasUpdate = false;

    // OneNET 数据点格式: {"datastreams":[{"id":"temp","datapoints":[{"value":25.5}]}, ...]}
    if (data.datastreams) {
      for (var i = 0; i < data.datastreams.length; i++) {
        var ds = data.datastreams[i];
        var value = ds.datapoints && ds.datapoints[0] ? ds.datapoints[0].value : undefined;
        if (ds.id === 'temp' || ds.id === 'humidity') {
          updates[ds.id] = Number(value);
          hasUpdate = true;
        } else if (ds.id === 'LED1' || ds.id === 'LED2') {
          updates[ds.id] = (value === 1 || value === true || value === '1');
          hasUpdate = true;
        }
      }
    }

    // 兼容扁平格式: {"temp":25.5, "humidity":60, "LED1":1, "LED2":0}
    if (typeof data.temp !== 'undefined') {
      updates.temp = Number(data.temp);
      hasUpdate = true;
    }
    if (typeof data.humidity !== 'undefined') {
      updates.humidity = Number(data.humidity);
      hasUpdate = true;
    }
    if (typeof data.LED1 !== 'undefined') {
      updates.LED1 = (data.LED1 === 1 || data.LED1 === true || data.LED1 === '1');
      hasUpdate = true;
    }
    if (typeof data.LED2 !== 'undefined') {
      updates.LED2 = (data.LED2 === 1 || data.LED2 === true || data.LED2 === '1');
      hasUpdate = true;
    }

    if (hasUpdate) {
      updates.timestamp = Date.now();
      for (var key in updates) {
        this.globalData.deviceData[key] = updates[key];
      }
    }
  },

  /** 下发 LED 控制命令 */
  sendLedCommand: function (led, on) {
    if (!mqttClient || !mqttClient.isConnected()) {
      console.warn('[App] 未连接，无法下发命令');
      wx.showToast({ title: '设备未连接', icon: 'none' });
      return;
    }

    var cmdid = Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    var topic = '$sys/' + mqtt.ONENET_CONFIG.productId + '/' + mqtt.ONENET_CONFIG.deviceName + '/cmd/request/' + cmdid;
    var payload = JSON.stringify((function () {
      var obj = {};
      obj[led] = on;
      return obj;
    })());

    mqttClient.publish(topic, payload);
    console.log('[App] 命令已下发: ' + led + '=' + on);
  },

  /** 更新连接状态 */
  setStatus: function (status) {
    this.globalData.connectStatus = status;
  },
});