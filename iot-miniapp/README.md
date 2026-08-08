# 📱 IoT 监控小程序 — OneNET 温湿度监控 + LED 远程控制

> 微信小程序原生开发 · MQTT WebSocket 直连 OneNET · 实时数据监控 + 远程设备控制

---

## 📋 项目简介

本项目是智慧农业 IoT 全链路系统的**用户端应用**。微信小程序通过 MQTT over WebSocket 协议直连中国移动 OneNET 云平台，实现温湿度数据的实时监控展示与 LED 设备的远程开关控制。

---

## 🏗️ 功能架构

```
┌─────────────────────────────────────────────┐
│            微信小程序 (用户端)                 │
│                                              │
│  ┌────────────────┐  ┌────────────────┐     │
│  │   数据监控页     │  │   LED 控制页    │     │
│  │  Monitor Page   │  │   LED Page     │     │
│  │                 │  │                │     │
│  │  🌡️ 温度: 25.3°C│  │  💡 LED1: ON  │     │
│  │  💧 湿度: 58%   │  │  🔴 LED2: OFF │     │
│  │  📶 连接状态     │  │  Toggle 开关   │     │
│  └────────┬───────┘  └───────┬────────┘     │
│           │                  │               │
│           └──────┬───────────┘               │
│                  ▼                            │
│     ┌─────────────────────────┐              │
│     │   MQTT WebSocket 客户端  │              │
│     │   (报文编解码/心跳保活)   │              │
│     └────────────┬────────────┘              │
└──────────────────┼──────────────────────────┘
                   │ MQTT over WebSocket
                   ▼
        ┌─────────────────────┐
        │   OneNET 云平台      │
        │   设备数据 + 命令下发  │
        └─────────────────────┘
```

---

## 📁 项目结构

```
iot-miniapp/
├── app.js                    # 全局入口: OneNET MQTT 连接管理 + LED 命令下发
├── app.json                  # 小程序配置 (页面路由 + TabBar)
├── app.wxss                  # 全局样式
├── pages/
│   ├── monitor/              # 温湿度实时监控页 (2秒轮询刷新)
│   │   ├── monitor.js        # 页面逻辑: 数据绑定 + 定时刷新
│   │   ├── monitor.wxml      # 页面模板: 温湿度仪表盘
│   │   └── monitor.wxss      # 页面样式
│   └── led/                  # LED 远程控制页
│       ├── led.js            # Toggle 开关逻辑
│       ├── led.wxml          # LED 控制面板
│       └── led.wxss          # 页面样式
├── utils/
│   └── mqtt.js               # MQTT WebSocket 客户端核心
│                              # (CONNECT/SUBSCRIBE/PUBLISH 报文构造 + 编解码 + PINGREQ 心跳)
├── components/
│   └── navigation-bar/       # 自定义导航栏组件
├── config/                   # 项目配置
├── src/
│   ├── pages/                # TypeScript 页面源码
│   ├── services/             # API 服务层
│   ├── store/                # 状态管理
│   ├── styles/               # 样式文件
│   ├── types/                # TypeScript 类型定义
│   └── utils/                # 工具函数
└── types/                    # 全局类型声明
```

---

## 🛠️ 技术栈

| 类别 | 技术 |
|------|------|
| **框架** | 微信小程序原生开发 |
| **语言** | JavaScript / TypeScript |
| **通信** | MQTT v3.1.1 over WebSocket |
| **云平台** | 中国移动 OneNET IoT |
| **UI** | WXML + WXSS 原生组件 |
| **构建** | 微信开发者工具 |

---

## ✅ 功能清单

- ✅ 温湿度数据实时监控 (2秒自动刷新)
- ✅ 数据仪表盘展示 (温度/湿度可视化)
- ✅ LED 远程开关控制 (Toggle 开关)
- ✅ MQTT 连接状态实时显示 (已连接/连接中/已断开/错误)
- ✅ MQTT 心跳保活 (PINGREQ 定时发送)
- ✅ 前后台切换自动重连机制
- ✅ 设备数据多格式兼容解析 (OneNET 标准格式 / 扁平 JSON)
- ✅ 命令下发确认机制 (cmdId 追踪)

---

## 🚀 使用说明

1. 安装 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 导入 `iot-miniapp/` 目录
3. 修改 `utils/mqtt.js` 中的 OneNET 配置：
   - `productId`: 你的 OneNET 产品 ID
   - `deviceName`: 设备名称
   - `token`: MQTT 访问 Token
4. 编译预览 (确保 [stm32-hardware](../stm32-hardware) 已上电运行)

---

## 🔗 关联项目

- [stm32-hardware](../stm32-hardware) — 硬件终端 (STM32 + DHT11 + ESP8266)
- IoT 全链路: **硬件端 → OneNET 云平台 → 本小程序**

---

## 👤 我的角色

- 完成小程序页面 UI 开发（监控页 / LED 控制页）
- 集成 MQTT over WebSocket 通信模块（mqtt.js）
- 实现跨页面数据共享与状态同步
- 实现前后台切换时的自动重连机制

---

## 🖼️ 运行截图

> 详见于(./images)

---

## ⚠️ 注意事项

- OneNET Token 已从代码中移除，请使用自己的设备凭证
- 小程序需要 HTTPS/WSS 域名，开发阶段可在开发者工具中关闭域名校验
- 需确保 STM32 硬件端已上电并连接 OneNET，小程序才能收到实时数据
