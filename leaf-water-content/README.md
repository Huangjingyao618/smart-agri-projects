# 📊 叶片含水量数据分析

> 光谱数据处理 + 多模型回归预测 · RandomForest / AdaBoost / GBDT / CatBoost / PLS

---

## 📋 项目简介

利用光谱分析数据，构建多个机器学习回归模型预测植物叶片含水量。包含两个核心练习：

- **Exercise 1** — 光谱数据批量提取与整理：从多个 TXT 文件中自动识别数据起始行，提取目标波段反射率，汇总为 Excel
- **Exercise 2** — 多模型对比与评估：5 种回归模型 (RF / AdaBoost / GBDT / CatBoost / PLS) 的 GridSearchCV 调优、性能汇总、特征重要性与残差图可视化

---

## 📁 项目结构

```
leaf-water-content/
├── exercise1.py              # 光谱数据批量提取脚本
│                             #   - 遍历文件夹中所有 .txt 文件
│                             #   - 自动识别数据起始行 (含 "0.349445")
│                             #   - 提取第2列波段数据
│                             #   - 输出: Excel 汇总表格
├── exercise2.py              # 多模型回归对比分析
│                             #   - 5 种模型 GridSearchCV 调优
│                             #   - R² / RMSE / MAE 性能评估
│                             #   - 特征重要性图 (树模型)
│                             #   - 残差图 (所有模型)
│                             #   - 输出: 性能汇总 Excel + 图表 PNG
└── README.md
```

---

## 🛠️ 技术栈

| 类别 | 技术 |
|------|------|
| **数据处理** | Pandas, NumPy |
| **可视化** | Matplotlib (特征重要性 + 残差图, 300dpi) |
| **机器学习** | Scikit-learn (RandomForest, AdaBoost, GBDT, PLS), CatBoost |
| **模型评估** | R², RMSE, MAE, GridSearchCV (5折交叉验证) |
| **优化** | n_jobs=-1 并行搜索 |
| **语言** | Python 3 |

---

## 📊 模型列表

| 模型 | 类型 | 调优参数 |
|------|------|----------|
| **RandomForest** | 集成学习 (Bagging) | n_estimators, max_depth |
| **AdaBoost** | 集成学习 (Boosting) | n_estimators, learning_rate |
| **GBDT** | 梯度提升树 | n_estimators, learning_rate, max_depth |
| **CatBoost** | 梯度提升 (有序编码) | iterations, learning_rate, depth |
| **PLS** | 偏最小二乘回归 | n_components |

---

## 🎯 评估指标

| 指标 | 含义 |
|------|------|
| **R²** | 决定系数 — 模型解释方差比例 (越接近 1 越好) |
| **RMSE** | 均方根误差 — 预测值与真实值的平均偏差 |
| **MAE** | 平均绝对误差 — 更鲁棒的误差度量 |
| **残差图** | 预测值 vs 残差，检验模型假设 (随机分布 = 好) |
| **特征重要性** | 各波段对含水量预测的贡献度 |

---

## 🚀 使用说明

```bash
# 安装依赖
pip install pandas numpy matplotlib scikit-learn catboost openpyxl

# Exercise 1: 批量提取光谱数据
# 注意: 修改 exercise1.py 中的 folder_path 为你的数据文件夹路径
python exercise1.py
# 输出: 提取结果.xlsx

# Exercise 2: 多模型对比分析
# 注意: 修改 exercise2.py 中的 file_path 为作业数据路径
python exercise2.py
# 输出: 作业2_模型性能汇总.xlsx + 各模型特征重要性/残差图 PNG
```

---

## 👤 我的角色

- 独立完成两个练习的全部代码编写
- Exercise 1：设计自动识别数据起始行的健壮算法（通过特征值 "0.349445" 定位），支持批量处理
- Exercise 2：实现 5 种模型的统一评估框架 (`evaluate_model` + `tune_and_evaluate`)，代码高度模块化
- 输出完整的图表报告（特征重要性 + 残差图），适用于学术论文插图

---

## 🖼️ 运行截图

> *(运行截图占位 — 请替换为实际输出图表)*
>
> ![残差图示例](./images/residual-plot.png)
> *某模型的残差图 — 残差随机分布在 0 轴两侧，模型拟合良好*
>
> ![特征重要性](./images/feature-importance.png)
> *RandomForest 特征重要性 — 各波段对含水量的贡献度*

---

## ⚠️ 注意事项

- 脚本中包含硬编码路径 (`D:\zhnysx\...`)，运行前需修改为实际数据路径
- 数据文件由课程教师提供，不在本仓库中
- `exercise1.py` 使用特征值 "0.349445" 作为数据起始标记，如数据结构变化需调整
- CatBoost 安装可能需要 Visual C++ 运行时环境
