<p align="center">
  <a href="https://github.com/Zwf5458-Py/AxiomForge">
    <img src="assets/logo.svg" alt="AxiomForge Logo" width="130" height="130">
  </a>
</p>

<h1 align="center">AxiomForge · AI 数学发现平台</h1>

<p align="center">
  <strong>自主程序演化 · 极值组合 · 复杂动力学</strong>
</p>

<p align="center">
  <a href="README.md">English</a> | 
  <strong>简体中文</strong>
</p>

<p align="center">
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT"></a>
  <a href="https://github.com/Zwf5458-Py/AxiomForge/actions"><img src="https://github.com/Zwf5458-Py/AxiomForge/actions/workflows/tests.yml/badge.svg" alt="CI Tests"></a>
  <a href="https://www.python.org/"><img src="https://img.shields.io/badge/Python-3.10%2B-blue.svg" alt="Python 3.10+"></a>
  <a href="https://manifund.org/projects/axiomforge-exploring-algebraic-structural-priors-in-heuristic-search-for-extrem"><img src="https://img.shields.io/badge/Manifund-Fast_Grant_Active-orange.svg" alt="Manifund Fast Grant"></a>
  <a href="http://localhost:8080"><img src="https://img.shields.io/badge/Web_UI-3D_Interactive-emerald.svg" alt="Web UI Available"></a>
</p>

> **项目定位**：一个面向独立研究者的高标准**早期开源研究原型（Early Research Prototype）**，旨在探索代数结构先验（Symmetry & Modular Invariants）与大语言模型程序演化（FunSearch 范式）在有限域极值组合问题（如 Cap Set 问题）中的有效结合，并提供高阶复动力学与几何自相似分形的专业级交互推演平台。

---

## 📸 项目代表特性视觉画廊 (Visual Gallery)

| 1. AI 极值数学发现 · 3D切片阵列与高维帽集演化 | 2. 广义高阶复动力学 · 曼德勃罗多重螺旋巡航 | 3. 几何自相似生长 · 科赫雪花测度论收敛仪表盘 |
| :---: | :---: | :---: |
| [![Cap Set Discovery](assets/preview_funsearch_5d.png)](assets/preview_funsearch_5d.png) | [![Mandelbrot Dynamics](assets/preview_mandelbrot.png)](assets/preview_mandelbrot.png) | [![Koch Snowflake](assets/preview_koch.png)](assets/preview_koch.png) |
| **3D 切片超立方阵列与超球流形**<br>突破 $2^n$ 局部陷阱（5维38点、6维64+点），A/B 对抗收敛图，大模型思考链与沙箱严格共线验算 | **广义高阶复动力学**<br>多臂螺旋开花形变、逃逸时间轨道陷阱（Orbit Traps）与复数轨道实时仪表盘 | **几何测度论推演**<br>周长指数发散（$P_n \to \infty$）、面积单调收敛至 $\frac{8}{5}A_0$、豪斯多夫维数 $D \approx 1.26186$ |

---

## 🏛️ 项目五大核心技术支柱 (Five Pillars)

### 支柱一：AI 极值数学发现与有限域帽集 (Cap Set) 真实推演

帽集问题（Cap Set Problem）是极值组合数学与加性组合学中的著名难题，亦是陶哲轩（Terence Tao）与 DeepMind FunSearch（Nature 2023）重点关注的研究标杆：在有限向量空间 $\mathbb{F}_3^n$ 中，寻找不包含任何三点共线（即满足 $x + y + z \equiv 0 \pmod 3$ 的非平凡三元组）的最大子集。

<div align="center">
  <img src="assets/preview_funsearch_5d.png" alt="AxiomForge 交互式数学发现与高维切片演化控制台" width="92%">
</div>

- **突破超立方体局部陷阱**：朴素贪心搜索极易被困在容量为 $2^n$ 的退化子空间中（$n=4 \to 16$, $n=5 \to 32$, $n=6 \to 64$, $n=7 \to 128$）。
- **高维极值突破（6D 达到 81 点，7D 突破 166 点）**：依托全新三进制索引架构（`FastCapSetEnv`）与反演对极破缺先验，AxiomForge 在 6 维空间（729 点）跑出 **81 点**（达到 $9 \times 9 = 81$ 正交直积理论上限），在 7 维空间（2,187 点）跑出 **166 点**（相对基线提升 **+29.69%**），100% 严格无共线。详见独立技术报告：[**高维空间极值搜索突破报告**](EXPERIMENT_HIGH_DIM_CN.md)（[English Version](EXPERIMENT_HIGH_DIM.md)）。
- **严格数学有效性检验**：内置经严格单元测试检验的 $O(k^2)$ 增量共线检测器，毫秒级扫描任意候选集的全部 $\binom{k}{2}$ 个点对，确保**共线三元组数量严格为 0**。
- **高维可视化与双轨投影**：Web 端支持超球拓扑投影（Hypersphere Projection）与 3D 切片阵列（3D Slice Array），直观展现 5 维金色点阵在有限域中的代数对称分布。

---

### 支柱二：深度克隆 `@earendil-works/pi-ai` 架构的多模型通用调度枢纽

受优秀开源项目 [@earendil-works/pi-ai](https://github.com/earendil-works/pi/tree/main/packages/ai) 启发，AxiomForge 构建了一套完全解耦、零配置门槛的统一大模型接入架构：

- **动态远程模型发现**：支持一键向 `${baseUrl}/models` 抓取远程服务商的实时模型全量列表，告别硬编码。
- **多平台自由命名与管理**：用户可任意新增自定义服务商（如“DST 聚合平台”、“硅基流动”、“本地 vLLM”），自定义平台标签、API Base 与模型选择。
- **智能免 403 阻断探测机制**：针对部分第三方聚合网关在收到未注册模型名时强行返回 HTTP 403 的痛点，重构了鉴权心跳逻辑，优先通过 `/models` 探测凭证有效性，根治了误报问题。
- **凭证独立持久化**：多平台的配置与 API Key 在前端 `localStorage` 中完全隔离并安全持久化，刷新页面无需重复输入。
- **思考链 (Reasoning / `<think>`) 深度提取**：完美解析 DeepSeek-R1、o1/o3 及其他推理模型的思维链输出，支持折叠展开与代数推演实时高亮。

---

### 支柱三：广义高阶复动力学与几何自相似分形引擎

数学之美不仅存在于离散代数中，同样闪耀于连续复动力系统与几何分形中。AxiomForge 集成了工业级 WebGL/Canvas 数学渲染器：

<div align="center">
  <img src="assets/preview_mandelbrot.png" alt="Generalized Mandelbrot Dynamics" width="48%">
  <img src="assets/preview_koch.png" alt="Koch Snowflake Fractal" width="48%">
</div>

- **广义高阶曼德勃罗动力学 ($z_{k+1} = z_k^d + c$)**：
  - 支持从经典 2 次幂到 10 次幂的连续形变，展现多重开花的高阶对称性；
  - 集成平滑着色、逃逸时间算法、轨道陷阱（Orbit Traps）与复平面实时轨道探测器。
- **科赫雪花几何自相似生长与测度论演示**：
  - 动态展示 $0 \sim 6$ 阶自相似迭代生长；
  - 实时仪表盘动态推演：
    - **周长指数发散**：$P_n = 3 \times \left(\frac{4}{3}\right)^n \to \infty$；
    - **面积单调有界收敛**：$A_\infty = \frac{8}{5} A_0$；
    - **豪斯多夫分形维数**：$D = \frac{\ln 4}{\ln 3} \approx 1.26186$。

---

### 支柱四：离散算术动力学与考拉兹猜想（冰雹轨迹与逆向分形拓扑树）

被埃尔德什称为“现代数学尚未成熟到足以解决”的考拉兹猜想（$3x+1$ 猜想），是离散动力系统与计算数论的典范：

- **冰雹轨迹动力学全屏推演引擎 (Hailstone Dynamics)**：
  - **全屏沉浸式画幅**：彻底消除视窗留白，图表自适应满幅铺开，支持对数刻度（$\log_{10}$）与线性刻度平滑切换；
  - **离散动力学节点标注**：在折线上精细标注每一个 Step 的数据节点与离散数值，并支持鼠标吸附悬停（Hover Tooltip），彻底破解对数坐标下连续除以 2 共线导致的视觉错觉；
  - **学术级停机指标区分**：严格并列展示**首次跌破初值的经典停机时间**（$\sigma(n)$，如种子 11 为 8 步，此时到达 $10 < 11$）与**终极归一总步数**（$\sigma_\infty(n)$，如种子 11 为 14 步），并在轨迹上清晰标注峰值点（Peak）、停机点（Stop）与收敛点；
- **全功能双模式平移与缩放**：轨迹折线图与逆向拓扑树双模式均原生支持鼠标左键抓手平移拖拽、滚轮指数阻尼缩放与一键视角复位；
- **逆向分形拓扑树 (Inverse Collatz Tree)**：从宇宙终点 $1$ 逆向向上展开偶数主干（$2n$）与同余奇数分支（$(n-1)/3$，当 $n \equiv 4 \pmod 6$），展现正整数全覆盖的壮丽无环连通拓扑网络；
- **极值停机时间探索器**：支持在任意正整数区间内一键搜寻存活步数最长、反弹最顽强的极值冰雹冠军；
- **高鲁棒排版设计**：侧边栏操作按钮采用对称网格（`1fr 1fr`）硬编码锁定统一规格，无论中英文字符长度均绝不溢出。

---

### 支柱五：完美欧拉砖问题（空间几何极限、同余筛选、AI 双轨推演与椭圆曲线参数化）

完美欧拉砖问题（Perfect Euler Brick / Perfect Cuboid）被誉为三维欧氏空间几何与丢番图数论的终极皇冠：寻找一个各棱长 $a, b, c$、三个面对角线 $d_{ab}, d_{bc}, d_{ca}$ 以及贯穿体对角线 $g$ 均为正整数的长方体。自欧拉以来历经近 300 年，数学界至今未证明其存在性，亦未证伪。

- **三维仿射透视推演引擎**：纯原生 Canvas 2D 实现无依赖三维透视投影与旋转矩阵，支持鼠标任意拖拽自由旋转、滚轮视角缩放、面对角线与体对角线剖面动态高亮；
- **3D 几何线条与数值卡片双向联动高亮**：
  - 点击面对角线（$d_{ab}, d_{bc}, d_{ca}$）或体对角线（$g$）指标卡片，3D 视窗中即刻以超粗加持光晕（`shadowBlur: 24`）高亮显示对应线段，并点亮半透明空间切面薄纱（前侧面、右侧面、底面与穿心对角剖面），其余线条智能弱化；
  - 点击棱长药丸（$a, b, c$）即刻高亮对应轴向的 4 条平行棱；再次点击或轻点画布空白处平滑复原全景；
- **丢番图同余筛选约束卡 (Modular Obstructions)**：
  - **模 4 / 模 16 约束**：任意本原砖必恰有两偶一奇，且至少一条偶棱被 16 整除；
  - **模 5 / 模 11 约束**：必有 $5 \mid abc$ 且 $11 \mid abc$；
  - 实时高亮当前三元组是否满足必要同余约束，并在精确面对角线判定前执行低成本预筛；
- **AI 神经符号模型双轨数论推演系统 (AI Diophantine Reasoning Engine)**：
  - **多模型真实端到端推演**：支持 DeepSeek-R1、OpenAI o1/o3、SiliconFlow、本地 Ollama 等多种模型；
  - **双轨自适应高可用通道**：优先“前端浏览器原生 Fetch 直连端点”（零依赖、极低延迟），CORS 异常时自动无缝降级走“本地 Python 后端 `/api/llm/generate`”，未填 API Key 或完全断网时秒级平滑回退至“学术级确定性离线仿真”，具备严密的 `try ... finally` 状态机解锁保护，彻底杜绝死锁；
  - **深度思考链原生解析**：原生支持 `[Deep Chain-of-Thought]` 思维链提取，并自动从输出文本中结构化提取 `SOLUTION: [a, b, c]`，支持一键将推演解应用至 3D 视窗；
- **名垂青史经典解预设 (Hall of Fame)**：一键载入 Halcke 1719 最小欧拉砖 $(44, 117, 240)$、次小砖 $(85, 132, 720)$、Saunderson 参数砖 $(240, 252, 275)$ 等；
- **体对角线极小残差智能探索器**：实时监测体对角线整数残差 $\Delta = |g - \lfloor g \rceil|$，并在给定参数半径内自动搜索局部残差极小点；
- **代数几何与椭圆曲线理论报告**：详见独立学术技术报告：[**完美欧拉砖理论推导报告**](docs/EULER_BRICK_THEORY_CN.md)（[English Version](docs/EULER_BRICK_THEORY.md)）。

---

## 🛠️ 快速开始与实验复现

### 1. 安装环境与依赖
```bash
git clone https://github.com/Zwf5458-Py/AxiomForge.git
cd AxiomForge
pip install -r requirements.txt
```

### 2. 运行单元测试
```bash
pytest tests/                                  # Python：33 项核心算法测试
node tests/test_collatz_core.mjs               # JS：真实浏览器代码的考拉兹数学 + 可视化
node tests/test_euler_brick_ui.mjs             # JS：真实浏览器代码的欧拉砖验证/搜索
```

### 3. 运行完整的 FunSearch 真实算法演化系统
```bash
# 模式 A: 确定性离线复现模式 (零成本，无需 API Key)
python3 run_funsearch_real.py --dimension 4 --iterations 20 --backend mock --seed 42

# 模式 B: 接入真实大模型在线演化 (支持 DeepSeek / OpenAI / Qwen 等)
python3 run_funsearch_real.py --dimension 4 --iterations 30 --backend deepseek --api-key YOUR_API_KEY

# 模式 C: 接入本地 Ollama / vLLM 开源大模型
python3 run_funsearch_real.py --dimension 4 --iterations 30 --backend custom --api-base http://localhost:11434/v1
```

### 4. 运行多随机种子统计评测
```bash
# 在 n=5 维度下运行 10 组随机种子对比评测
python3 experiments/run_ab_experiment.py --dimension 5 --iterations 30 --seeds 10

# 在 n=6 维度下运行 5 组随机种子对比评测
python3 experiments/run_ab_experiment.py --dimension 6 --iterations 30 --seeds 5
```

### 5. 运行 6 维与 7 维高维极值搜索突破对决
```bash
# 运行 6 维空间极值搜索 (729 点空间，对决正交直积 81 点上限)
python3 run_high_dim_search.py --dim 6 --iterations 15 --local-steps 30

# 运行 7 维空间极值搜索 (2,187 点空间，突破 160 点至 166 点)
python3 run_high_dim_search.py --dim 7 --iterations 20 --local-steps 50
```

### 6. 启动 AxiomForge Web 端交互推演平台
```bash
# 启动内置的交互推演与 API 网关服务器 (支持实时代码评估与模型代理)
python3 web_server.py --port 8080

# 打开浏览器访问: http://localhost:8080
# 1. 切换至 "AI 数学发现 (Cap Set)" 模块，选择 5 维 (243点) 观察超球投影与突破 32 点的金色点阵；
# 2. 点击右上角 "模型设置"，体验全自定义模型平台（自动拉取模型、自定义平台命名）；
# 3. 切换至 "广义曼德勃罗集" 或 "科赫雪花"，体验复动力学与几何自相似的实时测度推演。
```

---

## 📂 项目工程架构 (Repository Structure)

```text
AxiomForge/
├── assets/                           # 项目高清代表图片与视觉资产
│   ├── preview_funsearch_5d.png     # 5维 Cap Set 演化与超球拓扑
│   ├── preview_mandelbrot.png       # 广义高阶曼德勃罗复动力学
│   └── preview_koch.png             # 科赫雪花自相似生长仪表盘
├── funsearch/                        # FunSearch 启发式程序演化核心引擎
│   ├── programs_database.py         # 多岛屿精英种群数据库与多样性维护
│   ├── evaluator.py                 # 安全沙箱与 O(k^2) 极速共线评估器
│   ├── sampler.py                   # 进化采样、变异与交叉逻辑
│   ├── ai_providers/                # 解耦的大模型适配器 (OpenAI/DeepSeek/Claude/Ollama)
│   └── mock_provider.py             # 离线确定性代数变异仿真器
├── js/                              # 前端核心交互引擎
│   ├── i18n.js                      # 国际化引擎 (默认英文，一键切换中文)
│   ├── app.js                       # 工作区路由、事件总线与 Markdown 报告导出
│   ├── math_discovery.js            # 5维帽集投影、思考链解析与沙箱验算
│   ├── model_platform.js            # 通用模型枢纽、远程模型发现与本地隔离存储
│   ├── mandelbrot.js                # 广义高阶复动力学与轨道陷阱着色引擎
│   ├── orbit.js                     # 复平面相空间动态轨道追踪器
│   └── snowflake.js                 # 科赫雪花几何自相似生长与测度仪表盘
├── css/                             # 赛博霓虹数学风格样式表
│   └── style.css
├── experiments/                     # 统计实验与跨种子基准脚本
│   └── run_ab_experiment.py         # 对照组 vs 对称性先验组 A/B 自动化评测
├── aimo_pipeline/                   # Kaggle AIMO 竞赛实战与代码沙箱验算流水线
│   └── baseline_solver.py           # 超时隔离的多进程多数投票求解器
├── tests/                           # 完整自动化单元测试套件
├── web_server.py                    # 融合静态资源托管与模型中转的轻量级服务
├── run_funsearch_real.py            # 端到端 CLI 真实大模型自主演化脚本
├── EXPERIMENT_CAPSET.md             # 5维帽集统计评测正式报告 (英文)
├── EXPERIMENT_CAPSET_CN.md          # 5维帽集统计评测正式报告 (简体中文)
├── README.md                        # 项目主文档 (英文)
└── README_CN.md                     # 项目主文档 (简体中文)
```

---

## 📊 实验证据：多随机种子统计基准评测 (Experimental Evidence)

以下全部结果均由可完全复现的命令生成：
```bash
python3 experiments/run_ab_experiment.py --dimension N --iterations M --seeds 10
```
每一行报告 10 组独立随机种子试验；朴素启发式（单纯线性坐标加权）在相同评估预算下确定性地停滞于 $2^n$ 超立方体下界，而对称性先验启发式成功打破该瓶颈。

| 维度 | 对照组 (Naive) | 对称性先验组 (Symmetry) | 最佳观测 | 参照基准 | 增益 | 种子数×轮数 |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| $n=4$ | $16 \pm 0.0$ | $19.2 \pm 1.03$ | **20 / 20** | 20（理论上限，Pellegrino 1971） | **+20.0%** | 10 × 20 |
| $n=5$ | $32 \pm 0.0$ | $37.6 \pm 0.70$ | **38 / 45** | 45（理论上限，Edel 2004） | **+17.5%** | 10 × 20 |
| $n=6$ | $64 \pm 0.0$ | $77.2 \pm 1.03$ | **78 / 112** | 112（理论上限，Edel/Potechin 2008） | **+20.6%** | 10 × 20 |
| $n=7$ | $128 \pm 0.0$ | $156.8 \pm 0.63$ | **157 / 236** | 236（最佳已知下界，Edel 2004） | **+22.5%** | 10 × 50 |

可复现原始数据：`experiments/results_n{4,5,6,7}_statistical.json`。

---

## ⚖️ 学术诚信与客观边界 (Academic Rigor & Limitations)

1. **客观成果声明**：
   - **$n=4$**：对称性先验在 10 个种子中的 7 个稳定达到**理论上限（20/20）**。
   - **$n=5$**：稳定达到 38 点（均值 $37.6 \pm 0.7$），占 Edel 理论上限（45）的 84.4%。
   - **$n=6$**：达到 78 点（均值 $77.2 \pm 1.03$），占理论上限（112）的 69.6%。
   - **$n=7$**：达到 157 点（均值 $156.8 \pm 0.63$），占 Edel 最佳已知下界（236）的 66.5%；该维度与公开最佳之间仍存在真实差距。
2. **原型阶段声明**：本项目定位为**早期开源研究原型（Proof of Work）**，旨在为后续申请小额探索型科研资助（如 Manifund / SFF / Open Philanthropy）提供真实可复现的工程基石，不作夸大宣称。**$n=7$ 的 236 点是"最佳已知下界"而非被证明的最优解，特此声明不作出任何世界纪录主张。**

---

## 🤝 科研资助与社区支持 (Grants & Community Funding)

AxiomForge 目前正在通过 **[Manifund](https://manifund.org/projects/axiomforge-exploring-algebraic-structural-priors-in-heuristic-search-for-extrem)**（美国 501(c)3 免税慈善机构平台）申请探索型小额科研资助，用于覆盖高维有限域（6~8维）演化搜索所需的 GPU 算力与模型 API 支出。欢迎学术机构、基金会评审人与开源资助者支持！

[![Manifund Grant Application](https://img.shields.io/badge/Manifund-Fast_Grant_Active-orange.svg?style=for-the-badge)](https://manifund.org/projects/axiomforge-exploring-algebraic-structural-priors-in-heuristic-search-for-extrem)

---

## 📄 学术引用与许可证

本项目采用 [MIT License](LICENSE) 开源许可证。若您在研究中参考了本项目的实验或代码，请按 [CITATION.cff](CITATION.cff) 进行引用：

```bibtex
@software{axiomforge2026,
  author = {Zwf5458-Py},
  title = {AxiomForge: A FunSearch-Inspired Heuristic Search Framework for Combinatorial Problems},
  year = {2026},
  url = {https://github.com/Zwf5458-Py/AxiomForge}
}
```

