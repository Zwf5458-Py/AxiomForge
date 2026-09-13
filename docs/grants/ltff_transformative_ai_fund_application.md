# Long-Term Future Fund (LTFF - Transformative AI Fund) 申请全套通关指南与文案

> **资助主体**：Effective Altruism Funds (EA Funds) —— Transformative AI Fund (原 LTFF AI 专项)  
> **申请系统**：Paperform (`av20jp3z.paperform.co`)  
> **资助性质**：无须出让任何股权或知识产权的纯公益/学术科研资助 (Non-dilutive philanthropic grant)  
> **推荐申请金额**：**$15,000 USD** (6 个月独立全职研发津贴 + 高阶推理模型算力)  
> **开源代码库**：[`https://github.com/Zwf5458-Py/AxiomForge`](https://github.com/Zwf5458-Py/AxiomForge)

---

## 📋 模块一：第一步选择基金与基础信息 (Select Funds & Basic Info)

| 表单字段 (Field) | 推荐填写值 (Recommended Input) | 填写说明与策略 |
| :--- | :--- | :--- |
| **Fund** * | 点击选中中间卡片：**`Transformative AI Fund`** | **核心重点**：原 LTFF 的 AI 专项已升级为此基金（图标为地球月球 `ltff copy.jpg`） |
| **Confirmation of fund scope** * | 点击勾选：`I confirm that I have read the information about the scope of each fund...` | 确认符合资助范围（您截图中已勾好） |
| **Funding from Coefficient Giving** * | 选中：`INDIVIDUAL OR ORGANIZATION WITHOUT COEFFICIENT GIVING FUNDING` | 表明此前未获得过 Coefficient 资助 |
| **Name** * | `Wanfu Zhuang` | 申请人姓名拼音（需与银行账户一致） |
| **Organization name** | *(留空)* | 选填，个人/独立研究者直接留空即可 |
| **Which Grant Program do you believe your application aligns with most?** * | 下拉选择：**`Transformative AI Research Grants`** | 精准匹配：变革性 AI 技术安全、形式化验证与研究 |
| **Main collaborators** | `Hua Lin`（或留空） | 协作者姓名 |
| **Email address** * | `zwf225458@gmail.com` | 主联系人邮箱 |
| **Additional email addresses** | `dmklin01@gmail.com` | 备用抄送邮箱 |
| **Have you ever been employed by or contracted with Effective Ventures...** * | 填写：`No` | 确认此前未受雇于 EV |

---

## 📝 模块二：核心问答文案（严格受字符数限制，可直接复制）

### 1. Short description (一句话概括，限制 120 字符，实际 107 字符)
```text
Open-source LLM program evolution with algebraic priors for extremal combinatorics & formal math discovery.
```

### 2. Summary (项目摘要，限制 1000 字符，实际 930 字符)
```text
AxiomForge investigates how algebraic structural priors (modular invariants, Hamming weight stratification, and affine symmetries) can eliminate combinatorial stagnation in LLM program evolution (the FunSearch paradigm).

Rather than trusting black-box LLM hallucinations, AxiomForge enforces "Code as Hypothesis, Execution as Truth." Models act as stochastic program mutators inside an AST-sandboxed verification loop with deterministic collinearity checkers.

On the Cap Set benchmark, our prior-guided search broke the 2^n hypercube barrier in F_3^5 (reaching 38 points vs. naive 32), with 16 passing CI tests on GitHub (MIT license).

This grant ($15,000 USD / 6 months) supports:
1. Scaling automated multi-island LLM evolution (o1/DeepSeek) to F_3^6 (729 pts) and F_3^7 (2,187 pts);
2. 30+ seed randomized ablation benchmarks isolating prior contributions;
3. Generalizing evolved heuristics to industrial 1D/2D bin packing.
```

### 3. Project goals (项目目标，具体、可量化、有时间限定的 SMART 目标)
```markdown
Our 6-month research roadmap is structured into three concrete, verifiable deliverables:

- Outcome 1 (Month 1–2): Autonomous LLM-in-the-Loop Search Pipeline
  - Connect OpenAI reasoning models (o1-mini) and DeepSeek-R1 via an automated AST self-healing sandbox, achieving a 24/7 program mutation throughput of >5,000 candidate evaluations per day with <2ms execution overhead.

- Outcome 2 (Month 3–4): High-Dimensional Cap Set Scaling & Statistical Rigor
  - Scale vector collinearity verification to F_3^6 (729 points) and F_3^7 (2,187 points).
  - Execute pre-registered evaluations over 30+ random seeds across dimensions n=5, 6, 7. Publish a multi-seed statistical benchmark dataset (CSV/JSON) isolating the exact performance delta attributable to algebraic priors vs. unconstrained LLM search.

- Outcome 3 (Month 5–6): Cross-Domain Generalization & Open-Access Publication
  - Adapt the priority-function evolution framework to industrial 1D/2D Online Bin Packing benchmarks, measuring competitive ratio improvements over First-Fit Decreasing (FFD).
  - Release 100% of code, prompt templates, and program lineages on GitHub under MIT license, and submit a comprehensive technical preprint to arXiv.
```

### 4. What are the main reasons why these goals might not be achieved? (失败风险与应对策略，EA 极其看重的批判反思)
```markdown
We identify two primary technical risks and have engineered specific mitigations:

1. Risk 1: Premature Convergence & Mode Collapse in Genetic Program Pools
   - *Failure Mode*: LLMs might repeatedly produce syntactically trivial permutations of the same local maximum, stalling search diversity before breaking dimensional thresholds.
   - *Mitigation*: We implement an isolated multi-island genetic architecture with strict island migration frequencies. Island prompts are initialized with orthogonal algebraic projections (Grassmannian slices), forcing the model to explore topologically distinct regions of the search space.

2. Risk 2: Combinatorial Blowup in Verification Overhead at High Dimensions (F_3^7)
   - *Failure Mode*: Naive collinearity checking across 2,187 points scales cubically, potentially throttling LLM iteration speed.
   - *Mitigation*: We precompute affine hyperplane lookup tables and utilize bitwise vectorization (SIMD / NumPy bitsets), reducing 3-term progression validation from seconds to sub-millisecond execution.
```

### 5. Track record (申请人背景与前期成果)
```markdown
I am an independent developer and mathematical researcher with extensive software engineering expertise and a dedicated focus on discrete mathematics and complex dynamical systems.

Key Proof of Work to date:
- Single-handedly architected and implemented AxiomForge (https://github.com/Zwf5458-Py/AxiomForge) from scratch, including an AST AST-based self-healing parser, genetic population managers, and WebGL high-dimensional projections.
- Achieved an empirical breakthrough on the Cap Set benchmark: our prototype consistently discovers 38 points in F_3^5, outperforming the classical 32-point hypercube trap by +18.75%.
- Rigorous Software Quality: Maintained 16 automated unit tests covering evaluators, vector generators, and priority algorithms with 100% green pass rates (0.04s execution) on GitHub Actions CI.
- Active Grant Pipeline: Recently signed the official research grant agreement on Manifund (https://manifund.org/projects/axiomforge-exploring-algebraic-structural-priors-in-heuristic-search-for-extrem).
```

### 6. Public Portfolio (公开作品集链接)
```text
- Primary Codebase & CI: https://github.com/Zwf5458-Py/AxiomForge
- Cap Set Benchmark Evaluation: https://github.com/Zwf5458-Py/AxiomForge/blob/main/EXPERIMENT_CAPSET.md
- Manifund Proposal: https://manifund.org/projects/axiomforge-exploring-algebraic-structural-priors-in-heuristic-search-for-extrem
```

---

## 💰 模块三：资金预算与管理 (Funding & Logistics)

| 表单字段 (Field) | 推荐填写值 (Value) |
| :--- | :--- |
| **Funding amount and breakdown** | 见下方详细预算明细说明 |
| **Requested amount (USD)** * | `15000` |
| **Organizational budget (USD)** | *(留空)* |
| **Alternatives to funding** | `If unfunded, I will continue this research part-time supported by personal savings, while aggressively seeking smaller compute grants (e.g., OpenAI Researcher Access Program). Grant funding will accelerate our iteration velocity by roughly 4x and ensure full-time focus.` |
| **Use for additional funding** | `With additional funding, we would expand compute to GPU cluster instances for exhaustive parallel search in F_3^8 (6,561 points) and fund formal Lean 4 verification of newly discovered extremal structures.` |
| **LinkedIn/CV** * | `https://github.com/Zwf5458-Py` |
| **Start date** * | 选择下个月初（例如 `2026-10-01`） |
| **End date** * | 选择 6 个月后（例如 `2027-03-31`） |
| **Requested Currency** * | 下拉选择 `USD` |
| **Location** * | `Suzhou, China` |
| **Will activities take place in China or India?** * | 选择 `Yes`（EA Funds 完全接受，仅需常规合规流程） |
| **Is this an application for past achievement award?** * | 选择 `No` |
| **Under 18 contributing?** * | 选择 `No` |
| **Lobbying / political activity?** * | 填 `No` 或留空 |
| **Referral to other funders** * | 选择 `Yes`（允许转介给其他友好资助人） |
| **Secondary fund: EA Infrastructure Fund** * | 选择 `Yes` |
| **How did you hear about EA Funds?** * | `Manifund, EA Forum, and LessWrong` |
| **Time-sensitive grant** * | 选择 `No` |
| **Public reporting** * | 选择 `Yes, I am happy for a public report to be written`（非常利于建立公信力） |

### 预算明细文本 (Funding amount and breakdown)：
```text
Total Requested: $15,000 USD (6-Month Focused Research Runway)

Budget Allocation:
1. Independent Research Runway ($9,000):
   - $1,500/month for 6 months to cover basic living expenses in China, enabling 100% full-time dedication without client distractions.
2. LLM Inference & Frontier API Credits ($4,000):
   - API calls across OpenAI (o1-mini, GPT-4o), DeepSeek-R1, and Claude 3.5 Sonnet for ~80,000 program generation, mutation, and reflection cycles.
3. Cloud Compute & High-Memory Verification ($2,000):
   - High-RAM instances (e.g., AWS/GCP memory-optimized) for high-dimensional matrix collinearity validation in F_3^6 and F_3^7, plus public reproducibility portal hosting.
```
