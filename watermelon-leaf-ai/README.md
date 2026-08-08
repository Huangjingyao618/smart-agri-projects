# 🍉 西瓜叶面积 AI 测量系统

> YOLOv8n-seg 实例分割 + OpenCV 面积计算 · 批量自动化测量西瓜叶片面积

---

## 📋 项目简介

基于 YOLOv8n-seg 实例分割模型，自动识别西瓜叶片轮廓并计算叶面积。支持**单张测量**与**批量自动化处理**，输出 CSV 格式的面积报告。训练集 17 张、测试集 5 张，测试集 mAP50 达到 **0.9843**。

---

## 🏗️ 工作流程

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  LabelMe      │     │  YOLOv8n-seg │     │  OpenCV       │     │  CSV/Excel   │
│  图像标注     │ ──► │  实例分割训练  │ ──► │  像素→面积计算 │ ──► │  结果报告     │
│  (多边形轮廓)  │     │  120 epochs  │     │  (比例尺换算)  │     │  (带时间戳)   │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
```

---

## 📁 项目结构

```
watermelon-leaf-ai/
├── train_cpu.py              # YOLOv8n-seg 训练脚本
│                             #   - 120 epochs, batch=4
│                             #   - lr=0.001, warmup=5
│                             #   - patience=25 早停
├── labelme2yolo_cpu.py       # LabelMe JSON → YOLO txt 格式转换
│                             #   - 多边形轮廓 → 归一化坐标
│                             #   - 自动生成 dataset.yaml
├── batch_measure.py          # 批量叶面积测量脚本
│                             #   - 遍历图片文件夹
│                             #   - YOLO 分割 → mask 像素面积 → cm²
│                             #   - 输出: 叶片数/总面积/面积详情
├── measure.py                # 单张图片测量脚本
├── resize_all_to_640.py      # 图片批量预处理 (统一 640px)
├── leaf_area_results.csv     # 测量结果示例
└── README.md
```

---

## 🛠️ 技术栈

| 类别 | 技术 |
|------|------|
| **实例分割** | YOLOv8n-seg (Ultralytics) — 最轻量的分割模型 |
| **图像处理** | OpenCV (cv2) |
| **数据标注** | LabelMe (多边形标注工具) |
| **数据分析** | Pandas (面积统计 + CSV 输出) |
| **进度显示** | tqdm (批量处理进度条) |
| **训练精度** | 测试集 mAP50 = 0.9843 (17 训练 / 5 测试) |
| **语言** | Python 3 |

---

## 📏 面积计算方法

```
叶片实际面积 (cm²) = mask 像素面积 / (比例尺)^2
```

- `比例尺 = 9 px/cm` — 即图片中 1 厘米 = 9 个像素
- mask 像素面积：将模型输出的分割 mask 二值化后统计白色像素总数
- 比例尺因子：通过标定物（如硬币/标尺）在图片中的像素长度与实际长度的比值确定

---

## 🚀 使用说明

### 1. 数据标注与格式转换

```bash
# 使用 LabelMe 标注叶片轮廓 (多边形)
# 将 JSON 标注文件放入 dataset/ 目录
python labelme2yolo_cpu.py
```

### 2. 训练模型

```bash
pip install ultralytics
python train_cpu.py
# 训练完成后模型保存在 watermelon_leaf_train/cpu_leaf_seg/weights/best.pt
```

### 3. 批量测量

```bash
pip install ultralytics opencv-python pandas tqdm
# 将图片放入 raw_images_640/ 目录
python batch_measure.py
# 输出: leaf_area_results_<时间戳>.csv
```

---

## 📊 输出示例

| 图片名称 | 叶片数 | 总面积_cm² | 叶片面积详情 |
|----------|--------|-----------|-------------|
| leaf_001.jpg | 3 | 45.32 | 18.21; 15.67; 11.44 |
| leaf_002.jpg | 1 | 22.15 | 22.15 |

---

## 👤 我的角色

- 独立完成项目全流程：LabelMe 标注 → 格式转换 → 模型训练 → 批量测量脚本
- 训练得到测试集 mAP50 = 0.9843 的实例分割模型
- 编写 LabelMe → YOLO 格式转换工具，打通标注与训练的数据链路
- 设计带时间戳的 CSV 输出格式，方便多次测量结果的归档对比

---

## 🖼️ 运行截图

> 详见于(./images)

---

## ⚠️ 注意事项

- 模型权重文件 (`best.pt`) 因体积过大未上传，需运行 `train_cpu.py` 自行训练
- 数据集由课程教师提供，不在本仓库中
- 比例尺值 (`9 px/cm`) 需根据实际拍摄条件重新标定
- 训练在 CPU 上完成，约需 2-3 小时 (22 张图片 × 120 epochs)
- 如需 GPU 训练，将 `device="cpu"` 改为 `device="cuda"`
