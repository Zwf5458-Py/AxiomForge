# AxiomForge · AI 现代数学发现与分形动力学探索系统

> **AxiomForge (公理熔炉)**：面向无大学文凭独立研究者的 **Proof of Work (PoW) 开源矩阵**。基于 WebGL/HTML5 动力学交互模拟，结合 DeepMind FunSearch 程序演化搜索与 AIMO 奥数竞赛解题流水线，打通从“开源 PoW 建设”到“香港数码港 CCMF / Manifund 独立资助申报”的完整变现闭环。
> 
> 🌐 **GitHub 仓库**: [https://github.com/Zwf5458-Py/AxiomForge](https://github.com/Zwf5458-Py/AxiomForge)

---

## 🌟 核心功能特性

### 1. 科赫雪花 (Koch Snowflake) · 几何自相似
- **连续生长形变动画 (Morphing Animation)**：支持等边三角形凸起从高度 $0 \to h$ 平滑生长萌芽；
- **动态数学推导与指标仪表盘**：周长发散 $P_n \to \infty$、包围面积收敛至 $\frac{8}{5}A_0$、豪斯多夫分形维数 $D \approx 1.26186$；
- **自由缩放与漫游**：鼠标滚轮缩放与平移。

### 2. 曼德勃罗集 (Mandelbrot Set) · 广义高阶复动力学
- **WebGL GPU 极速并行渲染 (60 FPS)**：GLSL 并发执行 $z_{n+1} = z^d + c$ 迭代判定；
- **连续势平滑着色算法**：通过 $\nu = i + 1 - \log_2(\log_2 |z|)$ 消除离散断层；
- **电影级自动深潜巡航与复数轨道探测器**：动态绘制复平面轨道跳跃收敛/逃逸轨迹。

### 3. AI 数学发现 · Cap Set 极值组合搜索 (FunSearch)
- **有限域 $\mathbb{F}_3^3$ 空间 3D 离散点阵交互投影**：实时高亮显示 9 点最优解（已达理论上限），提供 100% 严格无三点共线判定；
- **自主演化程序数据库与沙箱评测**：基于遗传岛屿算法自动变异生成 Python 启发式代码，实现数学规律自主挖掘。

---

## 🛠️ 核心代码与运行指南

### 1. 本地网页可视化原型
```bash
# 启动本地轻量 HTTP 服务器
python3 -m http.server 8080
# 浏览器访问 http://localhost:8080，支持在三大视窗间自由切换
```

### 2. 运行 FunSearch Cap Set 演化搜索
```bash
# 启动离线演化搜索，自动寻找最优 Cap Set 并导出 JSON
python3 run_cap_set_search.py --dimension 3 --iterations 20

# 运行数学判定单元测试
python3 -m unittest discover -s tests
```

### 3. 运行 AIMO 奥数竞赛打榜 Demo
```bash
python3 aimo_pipeline/baseline_solver.py
```

---

## 💰 独立研究者资助申报与生计变现文档

本项目配套完整的独立科研生计变现指南，无学历门槛，纯凭公开 PoW 获取资金：
- 🇭🇰 [香港数码港 CCMF 10万港元无股权资助申报全套方案](docs/grants/ccmf_application_proposal.md)
- 🌐 [Manifund 国际独立研究者微型资助申请 Pitch 文档](docs/grants/manifund_grant_pitch.md)
- 🏆 [Kaggle AIMO 竞赛打榜与全球排名杠杆指南](aimo_pipeline/README.md)

