# 西瓜叶面积AI测量系统

## 技术栈
- YOLOv8-seg 实例分割
- LabelMe 数据标注
- OpenCV + Pandas

## 核心文件
- `train_cpu.py` - YOLOv8n-seg训练脚本 (120轮, mAP50=0.9843)
- `labelme2yolo_cpu.py` - LabelMe标注转YOLO格式
- `batch_measure.py` - 批量测量脚本
- `measure.py` - 单张测量脚本
- `resize_all_to_640.py` - 图片预处理

## 说明
课程项目，数据集由老师提供。模型文件因体积过大未上传。
