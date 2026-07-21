from ultralytics import YOLO

MODEL_PATH = "runs/detect/vegetable_yolov11-2/weights/best.pt"

model = YOLO(MODEL_PATH)

def predict_vegetable(image_path):
    results = model(image_path, verbose=False)
    names = model.names
    detected = []
    for r in results:
        for c in r.boxes.cls:
            detected.append(names[int(c)])
    if detected:
        return max(set(detected), key=detected.count)
    else:
        return "未识别到野菜"

if __name__ == "__main__":
    test_img = "test.jpg"   # 测试用
    print(predict_vegetable(test_img))