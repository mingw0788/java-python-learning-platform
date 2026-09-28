# CSV 清洗工具

本包使用 Python 标准库，无第三方依赖；Python 3.9+ 可以运行。学习环境优先选受维护的 Python 版本。

```powershell
python clean.py --input scores.csv --output result
python -m unittest -v
```

样例应输出：有效=2 错误=4。`result/valid.csv` 为 01 和 02，0 分有效；`errors.csv` 为格式错误、重复、空 id 和超范围四条。

同一输出目录重复执行会重新生成报告，不追加重复数据。不会覆盖原始输入。每次运行只处理一份输入，非并发工具。

练习：给每条错误增加文件名；支持第二种字段名称映射；增加头部空格与大小写规则，先说明业务约定再实现。遇到带引号或嵌入换行的 CSV，由标准库解析；错误序号是逻辑记录序号。

提交物：代码、字段字典、正常与异常样例、测试记录、README。
