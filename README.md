# Smart Agri Projects - IoT Remote Monitoring System

> 💡 IoT全链路远程监控系统: STM32硬件 → OneNET云平台 → 微信小程序

## 项目结构

```
smart-agri-projects/
├── stm32-hardware/         # 🔧 STM32F103C8T6 硬件端代码
│   ├── User/
│   │   ├── main.c          # 主程序: DHT11采集 + ESP8266通信 + OLED显示
│   │   ├── esp8266.c/h     # WiFi连接 + MQTT协议栈手动实现 (CONNECT/SUBSCRIBE/PUBLISH)
│   │   ├── DHT11.c/h       # DHT11温湿度传感器驱动
│   │   └── stm32f10x_it.c  # 中断服务
│   ├── Hardware/           # 外设驱动 (LED/OLED/Buzzer/Key)
│   └── System/             # 系统延时函数
│
├── iot-miniapp/            # 📱 微信小程序端代码
│   ├── app.js              # 全局: OneNET MQTT连接管理 + LED命令下发
│   ├── pages/
│   │   ├── monitor/        # 温湿度实时监控页 (2秒轮询)
│   │   └── led/            # LED远程控制页 (Toggle开关)
│   └── utils/
│       └── mqtt.js         # MQTT WebSocket客户端 (报文构造/编解码/心跳)
│
└── README.md
```

## 技术栈

- **硬件**: STM32F103C8T6 + DHT11 + ESP8266
- **通信**: MQTT 协议 (手写报文构造)
- **云平台**: 中国移动 OneNET IoT
- **应用**: 微信小程序原生开发

## 功能

- ✅ 温湿度数据实时采集 (DHT11, 1秒/次)
- ✅ 数据定时上报至OneNET云平台 (10秒/次)
- ✅ 远程LED控制 (小程序Toggle → MQTT命令下发 → STM32执行)
- ✅ OLED本地显示 (温湿度 + 上报次数)
- ✅ 按键本地控制LED
- ✅ WiFi断线自动重连 (3次重试)
- ✅ MQTT双模式自适应 (AT命令 / TCP透传+手动MQTT)
- ✅ 弱网可靠性: 指令下发→云端确认→硬件执行 三段式机制

## Author

黄敬耀 (Jingyao Huang) · 长江大学 智慧农业 2027届

---

📌 注: 此仓库为课程项目代码，用于展示 IoT 全链路技术能力。MQTT Token 等敏感信息已移除。
