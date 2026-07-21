import os
import cv2

# =============== 只需要看这里 ================
INPUT_FOLDER = "raw_images"          # 原始图片文件夹
OUTPUT_FOLDER = "raw_images_640"     # 输出640×640图片的文件夹
TARGET_SIZE = 640                    # 缩放尺寸
PREFIX = "leaf"                      # 新文件名前缀
# ===========================================

os.makedirs(OUTPUT_FOLDER, exist_ok=True)
count = 1
for fname in os.listdir(INPUT_FOLDER):
    # 只处理图片格式
    if fname.lower().endswith((".jpg", ".jpeg", ".png")):
        file_ext = os.path.splitext(fname)[-1]
        new_filename = f"{PREFIX}_{count:02d}{file_ext}"   # leaf_01.jpg, leaf_02.jpg ...
        print(f"正在处理：{fname} → {new_filename}")
        img_path = os.path.join(INPUT_FOLDER, fname)
        img = cv2.imread(img_path)
        if img is None:
            print(f"警告：无法读取 {fname}，跳过")
            continue
        img_resized = cv2.resize(img, (TARGET_SIZE, TARGET_SIZE))
        out_path = os.path.join(OUTPUT_FOLDER, new_filename)
        cv2.imwrite(out_path, img_resized)
        count += 1
print(f"\n全部完成！共处理 {count-1} 张图片，已保存到：{OUTPUT_FOLDER}")