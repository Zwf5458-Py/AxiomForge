# Emergent Ventures (EV) 资助申报全套中英通关文案与操作指南

> **资助项目**：Emergent Ventures (Mercatus Center at George Mason University, directed by Tyler Cowen)  
> **申请入口**：[`https://mercatus.tfaforms.net/5099527`](https://mercatus.tfaforms.net/5099527)  
> **申请人**：Wanfu Zhuang (庄万福)  
> **项目名称**：AxiomForge: Combining Algebraic Structural Priors with LLM Program Evolution  
> **开源代码库**：[`https://github.com/Zwf5458-Py/AxiomForge`](https://github.com/Zwf5458-Py/AxiomForge)  
> **申请金额建议**：**$8,000 USD** (极速探索资助，典型审批周期 3~7 天)

---

## 📋 模块一：表单基础字段速查与填写建议 (Quick Form Fields)

| 表单字段名称 (Form Field) | 推荐填写值 (Recommended Input) | 填写说明 (Notes) |
| :--- | :--- | :--- |
| **Affected Region** * | `Asia (outside of India)` 或 `No specified area` | 纯数学算法与开源代码具有全球通用性，选任一均可 |
| **Project Topic** | `Other` | 可选，官方说明不影响评审优先级 |
| **First Name** * | `Wanfu` | 必须与护照、外汇收款人名完全一致 |
| **Initial** | *(留空)* | Optional |
| **Last Name** * | `Zhuang` | 姓氏拼音 |
| **Suffix** | *(留空)* | Optional |
| **Email Address** * | `zwf225458@gmail.com` | 与 Manifund 保持一致的高频工作邮箱 |
| **Email Type** * | 选中 `Personal` | 个人邮箱 |
| **Phone Number** * | `+86 1XXXXXXXXXX` (请替换为您本人的真实手机号) | **务必带上中国国家区号 `+86`** |
| **Phone Type** * | 选中 `Mobile` | 移动手机 |
| **Twitter (if applicable)** | *(如无则留空，如有可填个人推特 Handle)* | Optional |
| **Country** * | `China` | 实际常驻国家 |
| **State/Province** | *(填入常驻省份英文，如 `Guangdong` / `Zhejiang` / `Beijing`)* | 真实填写即可 |
| **City** * | *(填入常驻城市英文，如 `Shenzhen` / `Guangzhou` / `Hangzhou`)* | 真实填写即可 |
| **Multimedia URL** | `https://github.com/Zwf5458-Py/AxiomForge` | 官方 GitHub 开源仓库地址 |
| **Consent (法律与合规三项勾选)** * | 全部勾选 `Yes, I consent` / `I certify...` | 确认年满 13 岁、资金全额用于学术科研非游说 |

---

## 🐦 模块二：核心问答 1 —— 一句话推文介绍 (In a Tweet)

> **题目要求**：`How do you describe your idea in a tweet?`（限 295 字符内）

### 英文填写内容 (Direct Copy, 237 chars)：
```text
AxiomForge breaks combinatorial search bottlenecks by injecting algebraic geometry priors (symmetry & modular invariants) into LLM-driven program evolution, discovering novel extremal structures and high-dimensional cap sets with 100% open reproducibility.
```

### 中文对照参考：
> AxiomForge 通过将代数几何先验（对称性与模不变性）融入大模型程序演化循环，打破传统极值组合搜索的局部最优瓶颈，在高维仿射空间中自主探索最优帽集（Cap Set），并提供 100% 开源可复现的验证系统。

---

## 📝 模块三：核心问答 2 —— 完整立项提案 (Tell us about your proposal)

> **题目要求**：`Tell us about your proposal`（建议 800 ~ 1,200 英文单词，上限 1,500 词，直击 Tyler Cowen 的四个必答模块）。

### 英文提交全文 (Direct Copy into Textarea)：

```markdown
### 1. About Me & My Personal Story
My name is Wanfu Zhuang, an independent developer and mathematical researcher based in China. My journey has never been driven by traditional academic credentials, titles, or prestige; it has been propelled by a relentless fascination with discrete mathematics and a fierce bias toward action (high agency). 

I have spent years building software systems, but my true intellectual obsession lies in the mysterious geometry of high-dimensional finite spaces and complex dynamical systems. When DeepMind published FunSearch in Nature in late 2023, showcasing how an LLM could evolve mathematical programs to discover new Cap Sets, I was mesmerized. However, while mainstream institutions merely observed from the sidelines or waited for billion-dollar closed labs to push the frontier, I chose to immediately start building from scratch.

Without institutional backing, I engineered AxiomForge: a lightweight, fully modular program evolution and 3D manifold projection engine. I wrote every line of code, built an AST-based automated code self-healing sandbox, constructed 16 automated tests (all passing on GitHub Actions CI), and rendered orthogonal Grassmannian manifolds in WebGL. This project is not a theoretical abstraction—it is my proof of work. Receiving an Emergent Ventures grant would be transformative: it would grant me the dedicated runway to operate as a full-time independent researcher, proving that high-agency individuals can make fundamental contributions at the frontier of AI and mathematics.

---

### 2. A Consensus View I Absolutely Agree With
Tyler Cowen often asks about a contrarian view, but EV's "trick question" asks for a mainstream consensus I fully endorse. 

My answer is: **I unconditionally agree with the strict empirical consensus of computer science—that natural language and pure neural networks can never be trusted for mathematical truth; only executable, sandboxed code verified against immutable formal invariants provides objective ground truth.**

In today’s AI bubble, fashionable techno-optimists claim that end-to-end transformers will soon "solve" unsolved mathematics through magical chain-of-thought tokens. This is wishful thinking. Large language models suffer from hallucinations, stochastic confabulations, and an inability to navigate combinatorial explosions without verification. I deeply align with the conservative, mainstream view: LLMs should never serve as the oracle; they must solely act as stochastic program proposal engines. The ultimate arbiter must always be an unyielding, deterministic execution environment (compilers, AST linters, and algebraic collinearity checkers). This fundamental consensus is the bedrock upon which AxiomForge is architected: "Code as Hypothesis, Execution as Truth."

---

### 3. The Idea: Why AxiomForge is Worth Investing In
The problem we are tackling is one of the most stubborn hurdles in discrete mathematics and combinatorial optimization: **the curse of dimensionality and local stagnation in extremal search.**

Specifically, we focus on the Cap Set problem in affine space F_3^n (a central problem studied by Fields Medalists like Terence Tao and Timothy Gowers). While naive greedy heuristics stall at the elementary hypercube bound of 2^n (e.g., 32 in 5D, 64 in 6D), existing program-search frameworks like FunSearch mutate code uniformly without geometric intuition.

**What is new and unusual in AxiomForge?**
We introduce **Algebraic Structural Priors** into the evolutionary loop:
1. **Symmetry & Modulo Invariants**: Instead of letting the LLM wander randomly in a 3^n discrete space, we enforce affine hyperplane modulo constraints and Hamming weight L0-slices, guiding the search directly into symmetric sub-manifolds.
2. **Dynamic AST Self-Healing Sandbox**: When an LLM generates syntax errors or invalid indexing, our AST rewriter auto-heals signatures and repairs execution traces in milliseconds, preserving diversity across multi-island genetic pools.
3. **Dual Theory-and-Application Mapping**: While starting with Cap Sets, our underlying priority-scoring evolution generalizes directly to industrial combinatorial optimization—specifically 1D/2D Online Bin Packing and high-frequency network routing.

**Current Working Proof of Work:**
In controlled experiments, our algebraic prior heuristics achieve exact theoretical maximums at n=4 (20/20 points) and consistently discover 38 points in F_3^5 (a +18.75% leap over the 32-point hypercube trap). Our code is 100% open-source under the MIT license, with full 3D interactive WebGL visualization. With EV funding, we will scale this engine into n=6 (729 points) and n=7 (2,187 points) to challenge known lower bounds.

---

### 4. Status, Timeline, Ballpark Budget & Runway
- **Project Duration**: I have developed the core architecture over the past 4 months.
- **Commitment**: I will commit to this research full-time over the grant period.
- **Support**: The project is completely independent. We recently signed the grant agreement on Manifund (project live, currently in open donor phase), and AxiomForge has already garnered organic interest in open-source math communities.
- **Total Requested Budget**: **$8,000 USD** (for a 3-month focused sprint)

**Budget Breakdown:**
1. **$4,500 — Independent Living Runway**: $1,500/month for 3 months. This modest amount covers basic living expenses in China, allowing me 100% focused research immersion without taking on distracting freelance client work.
2. **$2,500 — LLM API & Compute Tokens**: DeepSeek-R1, Qwen2.5-Coder, and Claude API calls for executing ~50,000 autonomous program generation and evaluation cycles across high dimensions.
3. **$1,000 — High-Memory Compute & Benchmark Hosting**: Cloud instances for heavy matrix collinearity checks in F_3^6 and F_3^7, and public reproducibility server deployment.

AxiomForge represents a frugal, high-conviction, and fully open attempt to expand human mathematical knowledge using code evolution. An EV grant will directly change my life trajectory and unlock immediate scientific progress.
```

---

## 💰 模块四：预算详情 (Budget Information，如页面展开则填入)

如果表单中的 `Budget Information` 字段激活并显示，请填入以下内容：

- **Estimated Budget**：`8000`
- **Breakdown of Expenses**：
```text
- $4,500: 3-month independent living runway ($1,500/mo) for 100% dedicated full-time research.
- $2,500: LLM API token inference (DeepSeek-R1 / Qwen / Claude) for ~50,000 automated program evolution cycles.
- $1,000: Cloud compute instances for high-dimensional matrix verification (F_3^6 / F_3^7) and open benchmark hosting.
Total: $8,000 USD.
```

---

## 💡 模块五：投递后预期与 Tyler Cowen 沟通锦囊

1. **响应速度极其迅捷**：
   Emergent Ventures 以“极度高效”著称，Tyler Cowen 通常在 **3 ~ 7 天内**亲自查看提案并通过邮件回复。
2. **回复风格极简**：
   如果 Tyler 对项目感兴趣，通常会发送极简的短邮件（例如："Would like to chat", "Can we do a short Zoom?" 或直接告知拨款额度）。请务必每天查看 `zwf225458@gmail.com`。
3. **如需面试 (Zoom Chat)**：
   面试通常仅 10~15 分钟，核心聚焦三个问题：
   - "Why did you build this?"（动机与真实动手能力）
   - "What do you think is your edge over bigger labs?"（敏捷、垂直代数先验、低成本可复现）
   - "What will this money change for you?"（全职全身心投入，摆脱生计琐事，直接验证高维新结构）
