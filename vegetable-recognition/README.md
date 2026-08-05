# 🤖 野菜种类图像识别系统

> YOLOv11 目标检测 + PyQt5 桌面 GUI · 识别 5 种常见野菜 · 完整的 AI 产品化交付

---

## 📋 项目简介

基于 YOLOv11n 深度学习模型训练，识别 **5 种常见野菜** 的图像分类系统。提供 PyQt5 桌面 GUI 应用，用户上传图片即可一键识别野菜种类。实现了从**数据准备 → 模型训练 → 推理预测 → GUI 应用**的完整 AI 产品化流程。

---

## 🏗️ 系统流程

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Roboflow    │ ──► │  YOLOv11n    │ ──► │  predict.py  │ ──► │  PyQt5 GUI   │
│  数据集准备   │     │  模型训练     │     │  推理接口     │     │  桌面应用     │
│  (5类野菜)   │     │  (30 epochs) │     │  (best.pt)   │     │  上传→识别    │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
```

---

## 📁 项目结构

```
vegetable-recognition/
├── main.py                  # PyQt5 桌面 GUI 主程序
│                            #   - 图片上传 (jpg/png/bmp)
│                            #   - 预览显示
│                            #   - 一键识别 + 结果显示
├── train.py                 # YOLOv11n 模型训练脚本
│                            #   - 30 epochs, batch=8
│                            #   - patience=20 早停机制
├── predict.py               # 模型推理接口
│                            #   - 加载 best.pt 权重
│                            #   - predict_vegetable() 函数
├── data.yaml                # 数据集配置 (5类标签)
└── README.md
```

---

## 🛠️ 技术栈

| 类别 | 技术 |
|------|------|
| **深度学习** | YOLOv11n (Ultralytics) |
| **目标检测** | 单阶段检测器 (One-Stage Detector) |
| **桌面 GUI** | PyQt5 (QWidget + QLabel + QPushButton) |
| **数据集** | Roboflow 在线平台标注与导出 |
| **推理加速** | CPU / CUDA GPU 双模式 |
| **语言** | Python 3 |

---

## 📊 识别的 5 种野菜

| 品种 | 说明 |
|------|------|
| 马齿苋 | 常见田间野菜 |
| 荠菜 | 春季常见食用野菜 |
| 蒲公英 | 药食同源野菜 |
| 蕨菜 | 山野常见野菜 |
| 灰灰菜 | 田间地头常见 |

---

## 🚀 使用说明

### 1. 训练模型 (可选，已有预训练权重)

```bash
pip install ultralytics
# 修改 train.py 中的数据集路径
python train.py
```

### 2. 启动桌面应用

```bash
pip install ultralytics pyqt5
python main.py
```

### 3. 使用 GUI
1. 点击 **"上传野菜图片"** 选择图片
2. 点击 **"开始识别"**
3. 查看识别结果 (5 种野菜之一 或 "未识别到野菜")

---

## 👤 我的角色

- 独立完成项目全流程：数据集准备 → 模型选型 → 训练调参 → GUI 开发
- 使用 Roboflow 平台进行数据标注与预处理
- 基于 PyQt5 开发友好的桌面 GUI 应用，完成 AI 模型的产品化封装
- 解决 PyTorch + OpenMP 冲突问题 (KMP_DUPLICATE_LIB_OK 环境变量)

---

## 🖼️ 运行截图

> *(运行截图占位 — 请替换为实际 GUI 截图)*
>
> ![GUI主界面](./images/app-screenshot.png)
> *识别主界面 — 上传图片后点击"开始识别"*
>
> ![识别结果](./images/result-screenshot.png)
> *识别结果展示*

---

## ⚠️ 注意事项

- 模型权重文件 (`best.pt`) 因体积过大未上传，需运行 `train.py` 自行训练
- 训练数据集由课程教师在 Roboflow 平台提供
- `main.py` 中的 `KMP_DUPLICATE_LIB_OK = "TRUE"` 用于解决 Windows 下 PyTorch + OpenMP 冲突
- 如需 GPU 训练，将 `train.py` 和 `predict.py` 中的 `device="cpu"` 改为 `device="cuda"`
