/**
 * LED 控制页
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
  },

  onShow: function () {
    this.refreshData();
  },

  /** 刷新数据 */
  refreshData: function () {
    var app = getApp();
    var gd = app.globalData;
    this.setData({
      deviceData: {
        temp: gd.deviceData.temp,
        humidity: gd.deviceData.humidity,
        LED1: gd.deviceData.LED1,
        LED2: gd.deviceData.LED2,
        timestamp: gd.deviceData.timestamp,
      },
      connectStatus: gd.connectStatus,
    });

    var that = this;
    setTimeout(function () {
      that.refreshData();
    }, 2000);
  },

  /** 切换 LED1 */
  handleToggleLED1: function () {
    this.toggleLED('LED1');
  },

  /** 切换 LED2 */
  handleToggleLED2: function () {
    this.toggleLED('LED2');
  },

  /** 切换 LED */
  toggleLED: function (led) {
    var app = getApp();

    if (app.globalData.connectStatus !== 'connected') {
      wx.showToast({ title: '设备未连接', icon: 'none' });
      return;
    }

    var newState = !app.globalData.deviceData[led];

    // 先更新本地状态
    app.globalData.deviceData[led] = newState;
    app.globalData.deviceData.timestamp = Date.now();

    // 即时刷新 UI
    this.refreshData();

    // 下发命令到 OneNET
    app.sendLedCommand(led, newState);

    wx.showToast({
      title: led + ' ' + (newState ? '已开启' : '已关闭'),
      icon: 'success',
      duration: 1000,
    });
  },
});