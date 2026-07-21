import cv2
import numpy as np
from ultralytics import YOLO

# ========== 请修改这里的参数 ==========
# 1. 模型路径（训练好的最佳模型）
MODEL_PATH = "runs/segment/watermelon_leaf_train/cpu_leaf_seg/weights/best.pt"

# 2. 要测量的图片路径（可以换成任何一张 leaf_xx.jpg）
IMAGE_PATH = "raw_images_640/leaf_01.jpg"

# 3. 尺子比例（1厘米 = ? 像素）—— 你测出来是 9 像素/厘米
RULER_SCALE = 9.0  # 改成你测到的值
# =====================================

# 加载模型
model = YOLO(MODEL_PATH)

# 预测
results = model.predict(IMAGE_PATH, device="cpu", imgsz=640, conf=0.25)

# 获取分割掩码
masks = results[0].masks
if masks is None:
    print("❌ 未检测到叶片！")
    exit()

# 读取图片
img = cv2.imread(IMAGE_PATH)
h, w = img.shape[:2]

# 统计叶片数
num_leaf = len(masks.data)
print(f"🍉 检测到 {num_leaf} 片叶子")
print("-" * 40)

# 计算每片叶子的面积
for i, mask in enumerate(masks.data):
    mask_np = mask.cpu().numpy().astype(np.uint8)
    pixel_area = np.sum(mask_np)
    real_area_cm2 = pixel_area / (RULER_SCALE ** 2)

    print(f"叶片 {i + 1}: 像素面积 = {pixel_area} px²，实际面积 ≈ {real_area_cm2:.2f} cm²")

print("-" * 40)

# 显示带有轮廓的图片
annotated = results[0].plot()
cv2.imshow("叶片分割结果", annotated)
print("按任意键关闭图片...")
cv2.waitKey(0)
cv2.destroyAllWindows()