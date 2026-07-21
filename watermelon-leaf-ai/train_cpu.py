from ultralytics import YOLO
import os

# 1. 加载预训练模型
print("🚀 正在加载模型...")
model = YOLO("yolov8n-seg.pt")

# 2. 开始训练（针对22张图片的优化参数）
print("🌱 开始训练西瓜叶片分割模型...")
results = model.train(
    data=os.path.join("dataset", "dataset.yaml"),  # 数据集配置
    epochs=120,
    imgsz=640,
    batch=4,
    device="cpu",
    patience=25,
    save=True,
    project="watermelon_leaf_train",
    name="cpu_leaf_seg",
    exist_ok=True,
    workers=0,               # CPU必须为0
    cache=True,              # 缓存图片加速训练
    single_cls=True,         # 单类别
    pretrained=True,
    lr0=0.001,               # 初始学习率
    lrf=0.01,                # 🔥 最终学习率因子 (lr0 * lrf = 最终学习率)
    warmup_epochs=5,
    weight_decay=0.0001,
)

# 3. 验证模型性能
print("\n📊 验证模型性能...")
metrics = model.val(device="cpu")

print("\n" + "="*50)
print("🎉 训练完成！模型已保存！")
print(f"📁 最佳模型路径: {model.ckpt_path}")
print(f"📈 分割精度 mAP50: {metrics.seg.map50:.4f}（≥0.7 即达标）")
print(f"📈 召回率: {metrics.seg.r[0]:.4f}（≥0.8 即达标）")
print(f"📈 精确率: {metrics.seg.p[0]:.4f}")
print("="*50)