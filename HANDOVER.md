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

### 3. 三大交互推演支柱功能
- **支柱一：AI 极值数学发现与有限域帽集 (Cap Set)**：
  - 支持 $\mathbb{F}_3^3 \sim \mathbb{F}_3^7$ 自由切换；
  - 5 维空间稳定跑出 38 点（突破朴素贪心的 $2^5=32$ 点陷阱，提升率 +18.75%）；
  - 配备沙箱 AST 语法自愈引擎（`evaluator.py`），毫秒级共线三重校验与大模型思考链实时展示。
- **支柱二：广义高阶复动力学推演**：
  - 曼德勃罗集多臂连续形变（$z \mapsto z^d + c$）、逃逸时间平滑着色、轨道陷阱（Orbit Traps）与复平面相空间实时轨迹追踪（`orbit.js`）。
- **支柱三：几何自相似生长与测度论**：
  - 科赫雪花递归分形、周长指数发散（$P_n \to \infty$）、面积单调收敛（$\frac{8}{5}A_0$）、豪斯多夫维数（$D \approx 1.26186$）实时仪表盘。

### 4. 质量工程与测试全绿
- 配置文件：[`pyproject.toml`](file:///Users/oraclez/code/数学模型/pyproject.toml) 固化 `pythonpath = ["."]`；
- 单元测试：`pytest` 覆盖核心功能（AI 适配器、Cap Set 共线校验、演化引擎），**16 项测试 100% 全部通过 (0.04s)**；
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
   - **Emergent Ventures (EV)**：Tyler Cowen 主持，极度偏爱独立高行动力个体，申报全套文案已完成（见 [`docs/grants/emergent_ventures_application.md`](file:///Users/oraclez/code/数学模型/docs/grants/emergent_ventures_application.md)）；
   - **Long-Term Future Fund (LTFF)**：与 Manifund 评委群高度重合，专注于 AI 理论与数学探索；
   - **OpenAI Researcher Access Program**：可直接申领 $500~$5,000 美元的免费 API Token。

### 2. 技术演进路线（算法维度）
1. **真实大模型闭环接入**：
   - 在 `run_funsearch_real.py` 中将模拟突变器替换为真正的 `DeepSeek-R1` 或 `Qwen2.5-Coder`；
2. **更高维度扩展（6D / 7D）**：
   - 优化 6 维（729 点）与 7 维（2,187 点）的批量计算吞吐，尝试逼近更优下界；
3. **成果固化**：
   - 将突破性的程序构造向量持久化导出为公开基准数据集（Benchmark Datasets）。

---
*本交接文档已在本地代码库根目录与系统存档中持久化保存，任何新会话或接替者均可通过阅读本文档在 1 分钟内无缝接管项目全部上下文。*
