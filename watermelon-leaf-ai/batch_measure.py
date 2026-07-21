import os
import cv2
import numpy as np
import pandas as pd
from ultralytics import YOLO
from tqdm import tqdm
from datetime import datetime

# ========== 配置参数 ==========
MODEL_PATH = "runs/segment/watermelon_leaf_train/cpu_leaf_seg/weights/best.pt"
IMAGE_FOLDER = "raw_images_640"
RULER_SCALE = 9.0  # 1厘米 = 9像素
CONF_THRESHOLD = 0.25
# ================================

# 生成带时间戳的文件名（格式：年-月-日_时-分-秒）
timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
OUTPUT_FILE = f"leaf_area_results_{timestamp}.csv"  # 如果你想要.xlsx，改成 .xlsx，但需要安装openpyxl

print(f"📁 本次结果将保存为: {OUTPUT_FILE}")

# 加载模型
print("🚀 正在加载模型...")
model = YOLO(MODEL_PATH)

# 获取所有图片
image_extensions = (".jpg", ".jpeg", ".png")
image_files = [f for f in os.listdir(IMAGE_FOLDER) if f.lower().endswith(image_extensions)]
image_files.sort()

if not image_files:
    print("❌ 未找到图片文件！")
    exit()

print(f"📁 找到 {len(image_files)} 张图片，开始批量测量...\n")

results_list = []

for img_name in tqdm(image_files, desc="处理进度"):
    img_path = os.path.join(IMAGE_FOLDER, img_name)
    results = model.predict(img_path, device="cpu", imgsz=640, conf=CONF_THRESHOLD, verbose=False)

    masks = results[0].masks
    if masks is None:
        results_list.append({
            "图片名称": img_name,
            "叶片数": 0,
            "总面积_cm2": 0,
            "叶片面积详情": ""
        })
        continue

    leaf_areas_px = [np.sum(mask.cpu().numpy().astype(np.uint8)) for mask in masks.data]
    leaf_areas_cm2 = [area / (RULER_SCALE ** 2) for area in leaf_areas_px]
    total_area_cm2 = sum(leaf_areas_cm2)
    num_leaf = len(leaf_areas_cm2)
    area_details = "; ".join([f"{area:.2f}" for area in leaf_areas_cm2])

    results_list.append({
        "图片名称": img_name,
        "叶片数": num_leaf,
        "总面积_cm2": round(total_area_cm2, 2),
        "叶片面积详情": area_details
    })

df = pd.DataFrame(results_list)

# 保存为CSV（带时间戳）
df.to_csv(OUTPUT_FILE, index=False, encoding="utf-8-sig")

# 如果你想要.xlsx格式，取消下面两行的注释，并注释掉上面那行
# df.to_excel(OUTPUT_FILE.replace(".csv", ".xlsx"), index=False, engine="openpyxl")
# print(f"✅ 已保存为Excel格式: {OUTPUT_FILE.replace('.csv', '.xlsx')}")

print("\n" + "=" * 50)
print("✅ 批量测量完成！")
print(f"📄 结果已保存至: {OUTPUT_FILE}")
print(f"📊 共处理 {len(df)} 张图片")
print(f"🍃 总叶片数: {df['叶片数'].sum()} 片")
print(f"📏 总叶面积: {df['总面积_cm2'].sum():.2f} cm²")
print("=" * 50)

print("\n前5行预览:")
print(df.head().to_string(index=False))