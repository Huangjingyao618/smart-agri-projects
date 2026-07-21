import json
import os
import numpy as np
from PIL import Image
import shutil

# =============== 可修改参数 ================
LABELME_DIR = "raw_images_640"      # 包含json和原图(640×640)的目录
YOLO_DIR = "dataset"                # 输出YOLO格式数据集的目录
CLASS_NAME = ["watermelon_leaf"]    # 类别名（必须与标注时一致）
IMG_SIZE = 640                      # 图片尺寸（已缩放，保持640）
TRAIN_RATIO = 0.8                  # 训练集比例
# ==========================================

# 创建YOLO目录结构
for split in ["train", "val"]:
    os.makedirs(os.path.join(YOLO_DIR, "images", split), exist_ok=True)
    os.makedirs(os.path.join(YOLO_DIR, "labels", split), exist_ok=True)

# 获取所有json文件
json_files = [f for f in os.listdir(LABELME_DIR) if f.endswith(".json")]
np.random.shuffle(json_files)
train_num = int(len(json_files) * TRAIN_RATIO)
train_files = json_files[:train_num]
val_files = json_files[train_num:]

def convert_labelme_to_yolo(json_file, split):
    # 读取json
    with open(os.path.join(LABELME_DIR, json_file), "r", encoding="utf-8") as f:
        data = json.load(f)

    # 图片名称（与json同名的图片）
    img_name = data["imagePath"]
    # 处理图片：因为已经是640×640，直接复制即可
    src_img_path = os.path.join(LABELME_DIR, img_name)
    if not os.path.exists(src_img_path):
        # 尝试其他扩展名
        base = os.path.splitext(img_name)[0]
        for ext in [".jpg", ".jpeg", ".png"]:
            test_path = os.path.join(LABELME_DIR, base + ext)
            if os.path.exists(test_path):
                src_img_path = test_path
                break
    # 复制图片到对应split目录
    dst_img_path = os.path.join(YOLO_DIR, "images", split, os.path.basename(src_img_path))
    shutil.copy2(src_img_path, dst_img_path)

    # 生成标签文件
    label_file = os.path.splitext(json_file)[0] + ".txt"
    label_save_path = os.path.join(YOLO_DIR, "labels", split, label_file)

    # 获取原始图片尺寸（用于归一化，实际已是640，但为了通用）
    img = Image.open(src_img_path)
    img_w, img_h = img.size

    with open(label_save_path, "w", encoding="utf-8") as f:
        for shape in data["shapes"]:
            if shape["label"] != CLASS_NAME[0]:
                continue
            points = shape["points"]  # 多边形点列表 [[x1,y1],[x2,y2],...]
            # 归一化
            norm_points = []
            for x, y in points:
                nx = x / img_w
                ny = y / img_h
                # 限制在0-1之间（防止边界溢出）
                nx = max(0, min(1, nx))
                ny = max(0, min(1, ny))
                norm_points.append(f"{nx:.6f} {ny:.6f}")
            # 写入：类别id 0 + 所有归一化坐标
            line = "0 " + " ".join(norm_points) + "\n"
            f.write(line)

# 转换训练集
for f in train_files:
    convert_labelme_to_yolo(f, "train")
# 转换验证集
for f in val_files:
    convert_labelme_to_yolo(f, "val")

# 生成 dataset.yaml 配置文件
yaml_content = f"""
# 西瓜叶片分割数据集 (CPU版)
path: {os.path.abspath(YOLO_DIR)}
train: images/train
val: images/val

nc: 1
names: ['watermelon_leaf']
"""
with open(os.path.join(YOLO_DIR, "dataset.yaml"), "w", encoding="utf-8") as f:
    f.write(yaml_content)

print(f"转换完成！训练集 {len(train_files)} 张，验证集 {len(val_files)} 张。")
print(f"数据集保存在: {os.path.abspath(YOLO_DIR)}")