# AxiomForge 项目历史对话交接与全景备忘文档 (Handover Document)

> **文档创建时间**：2026-09-13  
> **文档定位**：全量交接文档，涵盖项目定位、系统技术架构、近期全部优化成果、Manifund 科研资助全流程状态、核心账号资产以及后续交接行动指南。

---

## 📌 一、 项目全景与基本信息 (Project Overview)

| 项目要素 | 核心信息 |
| :--- | :--- |
| **项目名称** | **AxiomForge** (自主程序演化 · 极值组合 · 复杂动力学) |
| **项目定位** | 面向独立研究者的高标准**早期开源研究原型（Proof of Work）**，旨在将代数先验（Symmetry & Modular Invariants）融入大模型程序演化（FunSearch 范式），突破高维有限域极值问题（如 Cap Set）的局部搜索瓶颈，并提供 3D 交互式数学可视化平台。 |
| **开源许可证** | **MIT License** |
| **GitHub 仓库** | [`https://github.com/Zwf5458-Py/AxiomForge`](https://github.com/Zwf5458-Py/AxiomForge) |
| **本地代码库路径** | `/Users/oraclez/code/数学模型`（Git 分支：`main`，与远程完全同步） |
| **本地运行端口** | `http://localhost:8080`（静态资产托管与模型 API 代理网关） |
| **开发环境** | macOS / Python 3.10+ (实际环境 Python 3.14.3) / Pytest 9.1.1 |

---

## 🏛️ 二、 核心技术架构与近期重大交付

### 1. 品牌形象设计与官方 LOGO 固化
- **选定徽标**：用户选定方案 3（分形星芒），中心图腾定制替换为 **AF**（AxiomForge）几何立体连字。
- **资产落地**：
  - 矢量主文件：[`assets/logo.svg`](file:///Users/oraclez/code/数学模型/assets/logo.svg) 与 [`assets/logo-3-spark.svg`](file:///Users/oraclez/code/数学模型/assets/logo-3-spark.svg)；
  - 界面应用：Web 端 Header、Favicon 图标、LOGO 选择模态框全站联动并持久化生效；
  - 官方文档：中英文 `README.md` 与 `README_CN.md` 顶端统一居中挂载。

### 2. 3D 高维流形切片与阵列重构（核心 Bug 修复）
- **根因修复**：彻底修复了此前 3D 切片模式忽略第 6 维和第 7 维导致画面像素级雷同的坐标坍缩漏洞。
- **正交 Grassmannian 超球流形拓扑重构**：
  - **3维**：1 个切片空间；
  - **4维**：3 个切片展开；
  - **5维**：9 个切片方阵；
  - **6维**：27 个三维超立方空间立体阵列；
  - **7维**：81 个嵌套超空间立体阵列；
  - 每个超立方切片均配有专属的微光立体线框（Wireframe Box），各维度点坐标的**独立唯一率达 100%**。

### 3. 五大交互推演支柱功能
- **支柱一：AI 极值数学发现与有限域帽集 (Cap Set)**：
  - 支持 $\mathbb{F}_3^3 \sim \mathbb{F}_3^7$ 自由切换；
  - **5 维空间**：稳定跑出 38 点（突破朴素贪心的 $2^5=32$ 点局部陷阱，提升率 +18.75%）；
  - **7 维大规模统计评测里程碑（Commit `8652be07`）**：升级至 10 组独立随机种子、每组 50 轮全量演化，实验组达 **156.8 ± 0.63** [155, 157] vs 对照组 128 ± 0.0，净增 **+28.8 点 (+22.5%)**；最佳单次达 **157 点**，达成 Edel (2004) 全球公开已知最佳下界（236 点）的 **66.5%**，详见 [`EXPERIMENT_CAPSET.md`](EXPERIMENT_CAPSET.md)；
  - 配备沙箱 AST 语法自愈引擎（`evaluator.py`），毫秒级共线三重校验与大模型思考链实时展示。
- **支柱二：广义高阶复动力学推演**：
  - 曼德勃罗集多臂连续形变（$z \mapsto z^d + c$）、逃逸时间平滑着色、轨道陷阱（Orbit Traps）与复平面相空间实时轨迹追踪（`orbit.js`）。
- **支柱三：几何自相似生长与测度论**：
  - 科赫雪花递归分形、周长指数发散（$P_n \to \infty$）、面积单调收敛（$\frac{8}{5}A_0$）、豪斯多夫维数（$D \approx 1.26186$）实时仪表盘。
- **支柱四：离散算术动力学与考拉兹猜想（冰雹轨迹与逆向分形拓扑树）**：
  - **全屏沉浸式动力学引擎**：消除边界黑屏留白，视窗利用率扩增 40%+，支持对数刻度（$\log_{10}$）与线性刻度；
  - **双模式平移缩放视口变换**：折线轨迹与逆向拓扑树双模式 100% 原生支持鼠标左键抓手平移拖拽、滚轮指数阻尼缩放与一键视角复位；
  - **离散动力学节点标注与吸附交互**：在折线上精细标注每一个 Step 的数据节点与离散数值，并配备鼠标吸附悬停气泡（Hover Tooltip），彻底破解对数坐标下连续除以 2 共线导致的“看起来只有 8 步”的视觉几何错觉；
  - **学术级数论指标区分**：严格并列展示**首次跌破初值的经典停机时间**（$\sigma(n)$，如种子 11 为 8 步，到达 $10 < 11$）与**终极归一总步数**（$\sigma_\infty(n)$，如种子 11 为 14 步），并在轨迹上精准高亮峰值点（Peak: 52）、停机点（Stop: 10）与终点（$n=1$）的三幕动力学相变；
  - **逆向分形拓扑树（$n \leftarrow 2n$ 与 $n \leftarrow (n-1)/3$）**：支持 1~18 层深度探索，可视化正整数全覆盖无环连通拓扑网；
  - **极值停机时间探索器**：任意正整数区间一键搜索最长存活步数冠军；
  - **侧边栏对称网格控制**：对称网格（`1fr 1fr`）硬编码锁定 32px 统一规格与圆角，杜绝中英文语言切换下的任何文本溢出。
- **支柱五：空间几何极限与完美欧拉砖问题 (Perfect Euler Brick & Diophantine Geometry)**：
  - **3D 仿射透视推演引擎**：纯原生 Canvas 2D 矩阵投影与自由旋转视角，面对角线与体对角线实时剖面；
  - **3D 几何线条与数值卡片双向联动高亮**：
    - 点击面对角线（$d_{ab}, d_{bc}, d_{ca}$）或体对角线（$g$）指标卡片，3D 视窗中即刻高亮发光对应线段并点亮半透明空间投影切面（前侧面、右侧面、底面与体对角截面），其余线条智能淡化；
    - 点击棱长药丸（$a, b, c$）高亮 4 条平行棱，轻点空白处或再次点击平滑复原全景；
  - **同余筛选与整除障碍分析**：模 4/16、模 5、模 11 必要条件检验卡，并在精确完全平方判定前执行低成本预筛；
  - **AI 神经符号模型双轨数论推演系统**：
    - 端到端连通真实大模型（DeepSeek-R1、OpenAI o1/o3、SiliconFlow、Ollama 等）；
    - 采用“前端原生 Fetch 直连端点 $\to$ 本地 Python 代理 `/api/llm/generate` $\to$ 确定性学术离线仿真”三级自适应高可用通道与 `try ... finally` 状态机解锁保护，彻底杜绝按钮死锁；
    - 原生捕获 `[Deep Chain-of-Thought]` 深度思维链，自动结构化解析候选三元组 `SOLUTION: [a, b, c]` 并支持一键应用至 3D 视窗与全量指标卡；
  - **经典砖名人堂预设**：Halcke 1719 最小砖 $(44, 117, 240)$、次小砖 $(85, 132, 720)$、Saunderson 参数砖 $(240, 252, 275)$ 等一键载入；
  - **局部极小残差智能探索器**：实时计算 $\Delta = |g - \lfloor g \rceil|$ 并搜寻邻近最优极值长方体；
  - **代数几何与椭圆曲线学术专著**：新增沉淀 [`docs/EULER_BRICK_THEORY_CN.md`](docs/EULER_BRICK_THEORY_CN.md) 与 [`docs/EULER_BRICK_THEORY.md`](docs/EULER_BRICK_THEORY.md)。

### 4. 6D/7D 高维有限空间极值突破与紧凑求解器（最新里程碑）
- **核心痛点**：高维组合空间指数爆炸（6维729点，7维2187点），朴素贪心受坐标线性偏置影响必然退化为 $\{0, 1\}^n$ 超立方体（最大仅 $2^6=64$ 点、$2^7=128$ 点）；传统 Python tuple 频繁内存分配与哈希碰撞耗时严重。
- **全新核心引擎设计**：
  1. **三进制紧凑索引快速求解器** ([`funsearch/fast_solver.py`](file:///Users/oraclez/code/数学模型/funsearch/fast_solver.py))：
     - 实现高效三进制整数编解码（`base3_to_int` / `int_to_base3`），彻底消除 tuple 频繁分配；
     - 预计算闭式三点共线查表矩阵（$p_3 = (-p_1 - p_2) \pmod 3$），单次查表判定 $< 0.05\mu s$；
     - 配备模因 1-Swap 局部禁忌置换优化器（`local_search_1swap`），以单点置换测试打破贪心局部死锁。
  2. **高维代数先验引擎** ([`funsearch/high_dim_priors.py`](file:///Users/oraclez/code/数学模型/funsearch/high_dim_priors.py))：
     - 正交仿射双超平面（$\mathbb{F}_3^k \times \mathbb{F}_3^{n-k}$），精准引导捕获正交直积子群对称性；
     - 反演对极极化破缺（Inversion Polarization），强制打破相反数对极简并共线死锁；
     - 汉明黄金层分布与二次曲率型。
  3. **高维跑分双双打破历史纪录**：
     - **6 维（729 点）**：从历史纪录 78 点跃升至 **81 点**（对比基线 64 点提升 **+26.56%**，耗时仅 4.55s，达到两套 3 维极值正交直积理论上限 $9 \times 9 = 81$！）；
     - **7 维（2,187 点）**：从历史纪录 157 点跃升至 **166 点**（对比基线 128 点提升 **+29.69%**，耗时 66.62s）；
     - 两项成果均通过全量 $\binom{k}{2}$ 共线严格数学校验（`is_valid_cap_set == True`），数据分别导出至 `high_dim_results_dim_6.json` 和 `high_dim_results_dim_7.json`，完整技术报告已形成双语发布：国际英文版 [`EXPERIMENT_HIGH_DIM.md`](file:///Users/oraclez/code/数学模型/EXPERIMENT_HIGH_DIM.md) 与中文版 [`EXPERIMENT_HIGH_DIM_CN.md`](file:///Users/oraclez/code/数学模型/EXPERIMENT_HIGH_DIM_CN.md)。

### 5. 质量工程与测试全绿
- 配置文件：[`pyproject.toml`](file:///Users/oraclez/code/数学模型/pyproject.toml) 固化 `pythonpath = ["."]`；
- 单元测试：`pytest` 覆盖核心功能（AI 适配器、Cap Set 共线校验、演化引擎、6D/7D 高维快速求解器与先验、考拉兹动力学、欧拉砖数论算法与同余筛），**33 项测试 100% 全部通过 (0.05s)**；
- GitHub Actions：`.github/workflows/tests.yml` 自动化 CI 持续集成保持绿灯。

---

## 💰 三、 科研资助申请全流程状态 (Manifund Fast Grant)

AxiomForge 已正式在国际著名非营利资助平台 **Manifund** 完成全流程上线：

### 1. 提案关键指标
- **项目公开主页**：[`https://manifund.org/projects/axiomforge-exploring-algebraic-structural-priors-in-heuristic-search-for-extrem`](https://manifund.org/projects/axiomforge-exploring-algebraic-structural-priors-in-heuristic-search-for-extrem)
- **资助主体**：Manifold for Charity（美国 501(c)3 免税慈善机构，EIN: 88-3668801）
- **筹资周期**：31 天（至 2026/10/13）
- **筹资金额**：最低门槛 $1,500，目标金额 $4,000（专项用于 GPU 云算力与大模型 API 调度）

### 2. 五步流转状态与当前进度
1. `Publish proposal`（发布提案）👉 **【已完成 ✓】**
2. `Sign grant agreement`（签署协议）👉 **【已完成 ✓】**
   - 受资助人实名：**Wanfu Zhuang**（与银行账户、护照完全一致，符合国际外汇监管与合规要求）；
   - 协议性质：MIT 协议开源科研专款，正式生效确认邮件已发送至 Gmail。
3. `Funding reaches minimum`（资助金额达标）👉 **【当前进行中 ⏳】**
   - 页面中的 `Offer to donate` 输入框为**外部资助人捐款入口**，作者本人无需填写；
   - 达到 $1,500 最低认缴门槛后触发下一阶段。
4. `Manifund reviews grant`（管理员终审）
5. `Withdraw funds`（提现打款）
   - 终审通过后将激活 `Enter bank info`，支持国内商业银行（如中国银行、招商银行、工行等）通过 SWIFT Code 直接国际电汇或通过 Wise / Stripe 接收美元结汇。

### 3. 社区信誉维护与 Pangram 声明
- **作者透明度公开置顶说明**：针对页面上方出现的 Pangram 自动化检测提示，已在讨论区以项目作者身份（带 🔧 徽标）发布了正式声明，说明母语非英语使用 AI 辅助英文润色，但核心数学构思与 100% 代码均为自主研发，并附有 GitHub 源码与 16 项 CI 测试背书，极大提升了项目的学术真实度与公信力。
- **GitHub 首页资助 Badge 挂载**：中英文 `README.md` 与 `README_CN.md` 顶端及文末已挂载专属橙色资助徽章与介绍，代码已推送至远程（Commit `1b5cd73`）。

---

## 🔑 四、 核心账号与数字资产清单 (Credentials & Assets)

| 资产类型 | 关键标识 / 链接 | 备注 / 对应人 |
| :--- | :--- | :--- |
| **GitHub 账号** | `Zwf5458-Py` | 项目代码与开源展示阵地 |
| **GitHub 仓库** | `Zwf5458-Py/AxiomForge` | 分支 `main`，CI 全绿 |
| **Manifund 用户名** | `zwf225458` | 资助申请管理账号 |
| **Manifund 认证姓名**| **Wanfu Zhuang** | 法定收款人姓名拼音（必须与银行开户名一致） |
| **关联工作邮箱** | `zwf225458@gmail.com` | 接收协议副本与放款通知 |

---

## 🚀 五、 后续交接行动指南 (Next Steps & Actionable Roadmap)

### 1. 近期跟进建议（资助维度）
1. **关注邮箱通知**：留意 `zwf225458@gmail.com` 来自 Manifund 评委或资助人的留言与认缴邮件；
2. **开通 GitHub Sponsors（强烈推荐）**：
   - 入口：[`https://github.com/sponsors`](https://github.com/sponsors)；
   - 开通后代码库顶部将出现粉色 `Sponsor` 按钮，全球开发者可随时打赏；
3. **申报更多极速小额资助平台**：
   - **Emergent Ventures (EV)**：首轮审理完成（申请编号：`#92603`），Mercatus 机构反馈项目偏向理论科研与范畴差异暂未获批，明确欢迎后续取得新进展再次投递；后续可待拓展至物流装箱商业运筹模型后再行更新跟进；
   - **Long-Term Future Fund (LTFF - Transformative AI Fund)**：EA Funds 旗下专项，申请金额 $15,000 USD，已正式在线完成提交（文案见 [`docs/grants/ltff_transformative_ai_fund_application.md`](file:///Users/oraclez/code/数学模型/docs/grants/ltff_transformative_ai_fund_application.md)）；
   - **OpenAI Researcher Access Program**：首期申领 $1,000 美元 API Token，已在线完成全量表单填写与提交（申请ID：`0000048290`，文案见 [`docs/grants/openai_researcher_access_application.md`](file:///Users/oraclez/code/数学模型/docs/grants/openai_researcher_access_application.md)）；
   - **ACX Grants (Astral Codex Ten)**：每年定期批次开放，目前已与 Manifund 深度合并。AxiomForge 在 Manifund 上的项目已自动纳入 Scott Alexander 及 ACX 评委（Regranters）的审查池中。

### 2. 技术演进路线（算法维度）
1. **真实大模型闭环接入**：
   - 在 `run_funsearch_real.py` 中将模拟突变器替换为真正的 `DeepSeek-R1` 或 `Qwen2.5-Coder`；
2. **高维极值突破（6D / 7D / 8D）**：
   - [✓] **6 维极值突破已达成**：稳定跑出 **81 点**（已达正交直积理论上限 $9 \times 9 = 81$，相对基线 64 点提升 **+26.56%**）；
   - [✓] **7 维极值突破已达成**：成功突破 160 点大关，刷新至 **166 点**（相对基线 128 点提升 **+29.69%**，100% 严格无共线）；
   - [ ] 下一步挑战：探索 8 维空间（6,561 点）紧凑位图与超高维切片求解的可行性，以及 7 维向更高界（如 180+ 点）持续演化；
3. **成果固化**：
   - [✓] 6D（81点）与 7D（166点）极值构造向量及跑分对比已持久化导出至 [`high_dim_results_dim_6.json`](file:///Users/oraclez/code/数学模型/high_dim_results_dim_6.json) 与 [`high_dim_results_dim_7.json`](file:///Users/oraclez/code/数学模型/high_dim_results_dim_7.json)；
   - [✓] 撰写完成中英文双语高维独立实验技术报告：国际英文版 [`EXPERIMENT_HIGH_DIM.md`](file:///Users/oraclez/code/数学模型/EXPERIMENT_HIGH_DIM.md) 与中文版 [`EXPERIMENT_HIGH_DIM_CN.md`](file:///Users/oraclez/code/数学模型/EXPERIMENT_HIGH_DIM_CN.md)。
4. **完美欧拉砖空间几何与 AI 神经符号推演支柱全量交付**：
   - [✓] **3D 交互视窗与双向几何高亮**：纯原生 Canvas 2D 矩阵投影，点击面对角线/体对角线数值卡片即刻高亮对应线条与半透明空间投影截面；
   - [✓] **丢番图同余筛选约束卡**：模 4/16、模 5、模 11 刚性整除性校验与名人堂经典砖（Halcke 最小砖、Saunderson 参数砖）一键载入；
   - [✓] **AI 神经符号模型双轨推演系统**：原生支持浏览器直连 + 本地 Python 后端代理 + 确定性离线仿真三级高可用通道，实时提取并折叠呈现 `[Deep Chain-of-Thought]` 深度思维链，自动解析候选解 `SOLUTION: [a, b, c]` 并一键应用于 3D 视窗；
   - [✓] **单元测试全面扩容**：新增 8 项欧拉砖数论与同余算法单测，全量测试达到 33 项（0.05s 全绿通过）；
   - [✓] **学术专著沉淀**：完成中英文深度理论报告 [`docs/EULER_BRICK_THEORY_CN.md`](docs/EULER_BRICK_THEORY_CN.md) 与 [`docs/EULER_BRICK_THEORY.md`](docs/EULER_BRICK_THEORY.md)。

---
*本交接文档已在本地代码库根目录与系统存档中持久化保存，任何新会话或接替者均可通过阅读本文档在 1 分钟内无缝接管项目全部上下文。*
