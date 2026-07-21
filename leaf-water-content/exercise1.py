import os
import pandas as pd

# 文件夹路径（即您的“数据提取”文件夹）
folder_path = r"D:\zhnysx\叶片含水量数据文件\数据提取"

# 获取所有 txt 文件（按名称排序）
file_list = sorted([f for f in os.listdir(folder_path) if f.endswith('.txt')])

rows_data = []          # 存储每个文件提取的一行数据

for file_name in file_list:
    file_path = os.path.join(folder_path, file_name)
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    # 找到数据起始行（包含 "0.349445"）
    start_idx = None
    for i, line in enumerate(lines):
        if "0.349445" in line:
            start_idx = i
            break
    
    if start_idx is None:
        print(f"警告：{file_name} 中未找到 0.349445，跳过")
        continue
    
    # 从起始行开始，提取每行的第 2 列（索引1）
    col2 = []
    for line in lines[start_idx:]:
        parts = line.strip().split()   # 按空白分割
        if len(parts) >= 2:
            try:
                col2.append(float(parts[1]))
            except ValueError:
                pass   # 忽略非数值行
    rows_data.append(col2)

# 转成 DataFrame（每行是一个文件的数据）
df_result = pd.DataFrame(rows_data, index=file_list[:len(rows_data)])
output_path = os.path.join(folder_path, "提取结果.xlsx")
df_result.to_excel(output_path, index=True, header=False)
print(f"✅ 提取完成！结果保存在：{output_path}")