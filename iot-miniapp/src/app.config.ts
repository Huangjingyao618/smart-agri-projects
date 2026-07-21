export default defineAppConfig({
  pages: [
    'pages/monitor/index',
    'pages/led/index',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#1976d2',
    navigationBarTitleText: 'OneNET 监控',
    navigationBarTextStyle: 'white',
  },
  tabBar: {
    color: '#86909c',
    selectedColor: '#1976d2',
    backgroundColor: '#ffffff',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/monitor/index',
        text: '数据监控',
      },
      {
        pagePath: 'pages/led/index',
        text: 'LED控制',
      },
    ],
  },
});