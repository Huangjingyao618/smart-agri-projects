from ultralytics import YOLO

# ====== 修改为你的项目根目录 ======
dataset_root = "D:/zhnysx/野菜种类图像识别"

model = YOLO("yolo11n.pt")   # 注意是 yolo11n，不是 yolov11n

if __name__ == '__main__':
    model.train(
        data=dataset_root + "/data.yaml",
        epochs=30,          # 先试跑30轮，毕设可以加到100
        imgsz=640,
        batch=8,            # 如果报内存不足，改为4或2
        device="cpu",       # 有NVIDIA显卡且安装了CUDA版torch，可改为 "0"
        patience=20,
        save=True,
        name="vegetable_yolov11"
    )