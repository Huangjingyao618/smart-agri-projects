import sys
import os
from PyQt5.QtWidgets import *
from PyQt5.QtGui import QPixmap
from PyQt5.QtCore import Qt

# 解决 OpenMP 冲突
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"

from predict import predict_vegetable

class YecaiWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("野菜智能识别系统")
        self.setFixedSize(700, 600)
        self.img_path = None
        self.initUI()

    def initUI(self):
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        layout = QVBoxLayout(central_widget)
        layout.setSpacing(20)
        layout.setAlignment(Qt.AlignTop)

        # 标题
        title = QLabel("野菜智能识别")
        title.setAlignment(Qt.AlignCenter)
        title.setStyleSheet("""
            font-size: 28px;
            font-weight: bold;
            color: #2E8B57;
            margin-top: 15px;
        """)
        layout.addWidget(title)

        # 图片预览
        self.img_label = QLabel("图片预览区域")
        self.img_label.setAlignment(Qt.AlignCenter)
        self.img_label.setStyleSheet("""
            QLabel {
                border: 3px dashed #aaa;
                min-height: 280px;
                font-size: 16px;
                color: #666;
                background-color: #f9f9f9;
            }
        """)
        layout.addWidget(self.img_label)

        # 按钮
        btn_layout = QHBoxLayout()
        self.upload_btn = QPushButton("上传野菜图片")
        self.upload_btn.setStyleSheet("""
            QPushButton {
                background-color: #4CAF50;
                color: white;
                padding: 12px 20px;
                font-size: 14px;
                border-radius: 6px;
            }
            QPushButton:hover { background-color: #45a049; }
        """)
        self.upload_btn.clicked.connect(self.upload_image)
        btn_layout.addWidget(self.upload_btn)

        self.recognize_btn = QPushButton("开始识别")
        self.recognize_btn.setStyleSheet("""
            QPushButton {
                background-color: #007BFF;
                color: white;
                padding: 12px 20px;
                font-size: 14px;
                border-radius: 6px;
            }
            QPushButton:hover { background-color: #0069d9; }
        """)
        self.recognize_btn.clicked.connect(self.recognize_vegetable)
        btn_layout.addWidget(self.recognize_btn)
        layout.addLayout(btn_layout)

        # 结果
        self.result_label = QLabel("识别结果将在这里显示")
        self.result_label.setAlignment(Qt.AlignCenter)
        self.result_label.setStyleSheet("""
            QLabel {
                font-size: 18px;
                color: #DC3545;
                font-weight: bold;
                min-height: 60px;
                border: 1px solid #ddd;
                padding: 15px;
                background-color: #ffffff;
            }
        """)
        layout.addWidget(self.result_label)

    def upload_image(self):
        path, _ = QFileDialog.getOpenFileName(
            self, "选择图片", "",
            "图片文件 (*.jpg *.jpeg *.png *.bmp)"
        )
        if path:
            self.img_path = path
            pixmap = QPixmap(path)
            pixmap = pixmap.scaled(
                self.img_label.size(),
                Qt.KeepAspectRatio,
                Qt.SmoothTransformation
            )
            self.img_label.setPixmap(pixmap)
            self.result_label.setText("图片上传成功！")

    def recognize_vegetable(self):
        if not self.img_path:
            QMessageBox.warning(self, "提示", "请先上传图片！")
            return
        try:
            result = predict_vegetable(self.img_path)
            self.result_label.setText(f"识别结果：{result}")
        except Exception as e:
            QMessageBox.critical(self, "错误", f"识别失败：{str(e)}")

if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = YecaiWindow()
    window.show()
    sys.exit(app.exec_())