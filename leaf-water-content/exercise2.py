import os
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.ensemble import RandomForestRegressor, AdaBoostRegressor, GradientBoostingRegressor
from sklearn.cross_decomposition import PLSRegression
from sklearn.metrics import r2_score, mean_squared_error, mean_absolute_error
from catboost import CatBoostRegressor
import warnings
warnings.filterwarnings('ignore')

# ===== 数据文件路径 =====
file_path = r"D:\zhnysx\叶片含水量数据文件\作业2.xlsx"
# ========================

# 1. 读取数据
data = pd.read_excel(file_path)
print(f"数据形状：{data.shape}")

# 假设第一列为含水量（y），其余为特征（X）
y = data.iloc[:, 0]
X = data.iloc[:, 1:]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 2. 评估函数
def evaluate_model(model, X_train, X_test, y_train, y_test):
    model.fit(X_train, y_train)
    y_train_pred = model.predict(X_train)
    y_test_pred = model.predict(X_test)
    return {
        'model': model,
        'y_train_pred': y_train_pred,
        'y_test_pred': y_test_pred,
        'r2_train': r2_score(y_train, y_train_pred),
        'r2_test': r2_score(y_test, y_test_pred),
        'rmse_train': np.sqrt(mean_squared_error(y_train, y_train_pred)),
        'rmse_test': np.sqrt(mean_squared_error(y_test, y_test_pred)),
        'mae_train': mean_absolute_error(y_train, y_train_pred),
        'mae_test': mean_absolute_error(y_test, y_test_pred)
    }

# 3. 调优+评估
def tune_and_evaluate(model, param_grid, X_train, X_test, y_train, y_test, model_name):
    gs = GridSearchCV(model, param_grid, cv=5, scoring='r2', n_jobs=-1)
    gs.fit(X_train, y_train)
    best_model = gs.best_estimator_
    res = evaluate_model(best_model, X_train, X_test, y_train, y_test)
    res['best_params'] = gs.best_params_
    res['model_name'] = model_name
    return res

# 4. 模型与参数（精简组合，速度较快）
models_info = [
    ('RandomForest', RandomForestRegressor(random_state=42),
     {'n_estimators': [50, 100], 'max_depth': [10, 20]}),
    ('AdaBoost', AdaBoostRegressor(random_state=42),
     {'n_estimators': [50, 100], 'learning_rate': [0.05, 0.1]}),
    ('GBDT', GradientBoostingRegressor(random_state=42),
     {'n_estimators': [50, 100], 'learning_rate': [0.05, 0.1], 'max_depth': [3, 5]}),
    ('CatBoost', CatBoostRegressor(verbose=0, random_state=42),
     {'iterations': [50, 100], 'learning_rate': [0.05, 0.1], 'depth': [4, 6]}),
    ('PLS', PLSRegression(),
     {'n_components': list(range(1, min(X_train.shape[1], 5) + 1))})
]

all_results = []
for name, model, param in models_info:
    print(f"正在调优 {name} ...")
    res = tune_and_evaluate(model, param, X_train, X_test, y_train, y_test, name)
    all_results.append(res)
    print(f"{name} 最优参数: {res['best_params']}")
    print(f"  Train: R²={res['r2_train']:.4f}, RMSE={res['rmse_train']:.4f}, MAE={res['mae_train']:.4f}")
    print(f"  Test:  R²={res['r2_test']:.4f}, RMSE={res['rmse_test']:.4f}, MAE={res['mae_test']:.4f}\n")

# 5. 保存性能汇总
base_name = "作业2"   # 也可从文件名自动提取
summary = pd.DataFrame([{
    '模型': r['model_name'],
    'R2(训练集)': r['r2_train'],
    'R2(测试集)': r['r2_test'],
    'RMSE(训练集)': r['rmse_train'],
    'RMSE(测试集)': r['rmse_test'],
    'MAE(训练集)': r['mae_train'],
    'MAE(测试集)': r['mae_test'],
    '最优参数': str(r['best_params'])
} for r in all_results])
summary.to_excel(f"D:\\zhnysx\\叶片含水量数据文件\\{base_name}_模型性能汇总.xlsx", index=False)
print(f"✅ 性能汇总保存至：D:\\zhnysx\\叶片含水量数据文件\\{base_name}_模型性能汇总.xlsx")

# 6. 绘图（特征重要性 + 残差图）
for res in all_results:
    name = res['model_name']
    model = res['model']
    # 特征重要性（树模型）
    if hasattr(model, 'feature_importances_'):
        imp = model.feature_importances_
        idx = np.argsort(imp)[::-1]
        plt.figure(figsize=(10,6))
        plt.bar(range(len(imp)), imp[idx])
        plt.xticks(range(len(imp)), X.columns[idx], rotation=90)
        plt.title(f"{name} 特征重要性")
        plt.tight_layout()
        plt.savefig(f"D:\\zhnysx\\叶片含水量数据文件\\{base_name}_{name}_特征重要性.png", dpi=300)
        plt.close()
    # 残差图（所有模型）
    y_all = np.concatenate([y_train, y_test])
    y_pred_all = np.concatenate([res['y_train_pred'], res['y_test_pred']])
    residuals = y_all - y_pred_all
    plt.figure(figsize=(8,6))
    plt.scatter(y_pred_all, residuals, alpha=0.6)
    plt.axhline(0, color='r', linestyle='--')
    plt.xlabel('预测值'); plt.ylabel('残差')
    plt.title(f'{name} 残差图')
    plt.tight_layout()
    plt.savefig(f"D:\\zhnysx\\叶片含水量数据文件\\{base_name}_{name}_残差图.png", dpi=300)
    plt.close()
    print(f"📊 {name} 图表已保存")