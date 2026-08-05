# 🌱 Smart Agri Projects — 智慧农业全栈项目集

> **黄敬耀 (Jingyao Huang)** · 长江大学 智慧农业 2027届
>
> 一个涵盖 IoT 全链路、嵌入式开发、AI 视觉识别、数据分析与小程序应用的智慧农业综合项目仓库。

---

## 📂 项目总览

| # | 项目 | 类型 | 核心技术 |
|---|------|------|----------|
| 1 | [stm32-hardware](./stm32-hardware) | 🔧 嵌入式硬件 | STM32 + ESP8266 + MQTT + DHT11 |
| 2 | [iot-miniapp](./iot-miniapp) | 📱 微信小程序 | 微信原生 + MQTT WebSocket + OneNET |
| 3 | [stm32-experiments](./stm32-experiments) | 🔬 嵌入式实验 | STM32F103C8T6 × 8 个外设实验 |
| 4 | [vegetable-recognition](./vegetable-recognition) | 🤖 AI 视觉 | YOLOv11 + PyQt5 桌面应用 |
| 5 | [watermelon-leaf-ai](./watermelon-leaf-ai) | 🍉 AI 测量 | YOLOv8-seg 实例分割 + OpenCV |
| 6 | [leaf-water-content](./leaf-water-content) | 📊 数据分析 | Python 机器学习 + 光谱数据分析 |
| 7 | [agri-food-miniapp](./agri-food-miniapp) | 🛒 电商小程序 | 微信小程序 · 扫码点餐 |

---

## 🏗️ IoT 全链路架构 (stm32-hardware + iot-miniapp)

```
┌─────────────────┐     MQTT      ┌─────────────────┐     MQTT/WebSocket     ┌─────────────────┐
│  STM32F103C8T6  │ ◄──────────► │  OneNET 云平台    │ ◄──────────────────► │  微信小程序       │
│  + DHT11 传感器  │   数据上报    │  (中国移动 IoT)   │   订阅/下发命令       │  (用户端)         │
│  + ESP8266 WiFi  │   命令接收    │                  │                      │  实时监控+LED控制  │
│  + OLED 显示屏   │              │                  │                      │                  │
└─────────────────┘              └─────────────────┘                      └─────────────────┘
```

---

## 🛠️ 技术栈总览

### 硬件 & 嵌入式
- **MCU:** STM32F103C8T6 (ARM Cortex-M3)
- **传感器:** DHT11 温湿度、光敏传感器、AD 多通道
- **通信:** ESP8266 WiFi、USART 串口
- **外设:** OLED (I2C)、舵机 (PWM)、蜂鸣器、LED
- **IDE:** Keil MDK + STM32 标准外设库
- **语言:** C

### 物联网 & 云
- **协议:** MQTT (手写报文构造：CONNECT / SUBSCRIBE / PUBLISH / PINGREQ)
- **云平台:** 中国移动 OneNET IoT
- **通信模式:** ESP8266 AT 命令 / TCP 透传双模式自适应

### AI & 机器学习
- **目标检测:** YOLOv11n (野菜识别)、YOLOv8n-seg (叶片分割)
- **传统 ML:** RandomForest、AdaBoost、GBDT、CatBoost、PLS 回归
- **图像处理:** OpenCV、LabelMe 标注
- **GUI:** PyQt5 桌面应用

### 前端 & 小程序
- **框架:** 微信小程序原生开发
- **通信:** MQTT over WebSocket (报文编解码 / 心跳保活)
- **状态管理:** 全局 App 状态 + 页面实时绑定

### 数据处理
- **数据分析:** Pandas、NumPy
- **可视化:** Matplotlib
- **模型评估:** R²、RMSE、MAE、特征重要性、残差分析

---

## 👤 我的角色 (Author's Role)

本仓库所有项目均为我个人在 **长江大学智慧农业专业** 课程学习期间的独立开发成果。我在每个项目中承担的角色包括：

- **全链路架构设计** — 从硬件传感器 → 云平台 → 用户端小程序的完整数据通路设计
- **嵌入式驱动开发** — STM32 外设驱动编写、MQTT 协议栈手动实现
- **AI 模型训练与部署** — 数据集准备、模型选型、训练调参、推理部署
- **前后端全栈开发** — 微信小程序 UI 开发、MQTT 通信层实现
- **数据分析与建模** — 光谱数据特征工程、多模型对比评估、可视化输出

---

## 🚀 快速开始

### 硬件端 (stm32-hardware)
1. 使用 Keil MDK 打开工程
2. 修改 `User/esp8266.c` 中的 WiFi SSID/密码 和 OneNET 设备凭证
3. 编译烧录至 STM32F103C8T6
4. 硬件接线：DHT11 → PB5, ESP8266 → USART1, OLED → I2C (PB6/PB7)

### 小程序端 (iot-miniapp)
1. 安装 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 导入 `iot-miniapp/` 目录
3. 修改 `utils/mqtt.js` 中的 OneNET 产品 ID / 设备名称 / Token
4. 编译预览

### AI 项目
```bash
# 野菜识别
cd vegetable-recognition
pip install ultralytics pyqt5
python main.py          # 启动桌面 GUI

# 西瓜叶面积测量
cd watermelon-leaf-ai
pip install ultralytics opencv-python pandas tqdm
python batch_measure.py  # 批量测量
```

### 数据分析
```bash
cd leaf-water-content
pip install pandas numpy matplotlib scikit-learn catboost openpyxl
python exercise2.py     # 多模型对比训练
```

---

## ⚠️ 注意事项

- MQTT Token 等敏感凭证已移除，运行时请替换为自己的 OneNET 设备凭证
- AI 项目的模型权重文件 (`.pt`) 因体积过大未上传，需自行训练生成
- 数据集由课程教师提供，不在本仓库中
- 部分脚本中的硬编码路径 (如 `D:\zhnysx\...`) 需根据实际环境修改

---

## 📄 License

本项目仅用于学习与展示目的。

---

*Last updated: 2025-08-05*
