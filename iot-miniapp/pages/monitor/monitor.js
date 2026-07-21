/**
 * 数据监控页
 */
Page({
  data: {
    deviceData: {
      temp: 0,
      humidity: 0,
      LED1: false,
      LED2: false,
      timestamp: 0,
    },
    connectStatus: 'disconnected',
    statusText: '未连接',
    updateTime: '',
  },

  onLoad: function () {
    this.refreshData();
  },

  onShow: function () {
    this.refreshData();
  },

  /** 从全局数据中刷新 */
  refreshData: function () {
    var app = getApp();
    var globalData = app.globalData;
    var deviceData = globalData.deviceData;

    var statusMap = {
      connected: '已连接',
      connecting: '连接中...',
      disconnected: '未连接',
      error: '连接失败',
    };

    this.setData({
      deviceData: {
        temp: deviceData.temp ? deviceData.temp.toFixed(1) : '0.0',
        humidity: deviceData.humidity ? deviceData.humidity.toFixed(1) : '0.0',
        LED1: deviceData.LED1,
        LED2: deviceData.LED2,
        timestamp: deviceData.timestamp,
      },
      connectStatus: globalData.connectStatus,
      statusText: statusMap[globalData.connectStatus] || '未知',
      updateTime: deviceData.timestamp > 0
        ? new Date(deviceData.timestamp).toLocaleTimeString()
        : '',
    });

    // 每 2 秒刷新一次数据
    var that = this;
    setTimeout(function () {
      that.refreshData();
    }, 2000);
  },

  /** 重连 */
  handleReconnect: function () {
    var app = getApp();
    app.connectOnenet();
    wx.showToast({ title: '正在连接...', icon: 'loading', duration: 1000 });
  },
});