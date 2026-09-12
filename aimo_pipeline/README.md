# Kaggle AIMO (AI Mathematical Olympiad) 竞赛实战与排名杠杆指南

> **目标**：利用 Kaggle 平台免费算力（每周 30 小时 GPU），建立公开的全球竞赛排名（Proof of Work），以此作为申请 Manifund、SFF 及香港数码港 CCMF 资助的顶级信誉背书。

---

## 1. 竞赛关键事实与奖励机制

- **官方主办方**：XTX Markets 与 AI Mathematical Olympiad (AIMO) 咨询委员会。
- **总奖池**：1,000 万美元（包含首期及阶段性 Progress Prize，每期发放数十万美元现金奖励）。
- **评测形式**：在 Kaggle 官方受限沙箱中运行 Notebook（禁止联网，总运行时间不超过 9 小时，单题限时计算）。
- **答案格式**：非负整数，取值范围 `0 ~ 999`（题目包含 AIME / AMC / 中学数学奥赛高难度题目）。

---

## 2. 核心提分技术栈 (Winning Formula)

根据历届 Kaggle AIMO 前 10 名获奖方案，纯 LLM 容易在多步算术和边界条件上失误，**最有效的框架为“思维链 + Python 代码沙箱即时验算 + 多数投票”**：

```
[奥数题目文本]
       │
       ▼
[大模型生成解题推理 + 嵌入式 Python 验证脚本]
       │
       ▼
[本地 Python REPL 沙箱毫秒级执行代码并捕获标准输出]
       │
       ▼
[若执行出错 -> 自动将错误反馈回模型进行二次自愈 (Self-Debug)]
       │
       ▼
[多温度采样 5~8 次解答 -> 执行加权多数投票 (Majority Voting)]
       │
       ▼
[输出最终整数答案 (0 - 999)]
```

---

## 3. 零成本打榜四步法

### 第一步：注册并完成手机验证
- 访问 [Kaggle](https://www.kaggle.com/) 注册账号，完成手机号短信验证以激活每周 **30 小时的免费 GPU 加速配额**（T4 x 2 或 P100）。

### 第二步：加入比赛与挂载开源基准权重
- 搜索并进入最新的 `AI Mathematical Olympiad - Progress Prize` 赛道。
- 在 Kaggle Notebook 右侧面板中，点击 **Add Models / Datasets**，一键挂载开源数学小模型（例如社区已有的 `Qwen2.5-Math-7B-Instruct` 或 `DeepSeek-Math-7B-Base`）。

### 第三步：上传打榜推理脚本
- 将本目录下的 `baseline_solver.py` 核心逻辑复制到 Kaggle Notebook 中。
- 绑定官方评测 API：
  ```python
  import aimo
  env = aimo.make_env()
  iter_test = env.iter_test()
  for (test, revealed_targets_template) in iter_test:
      # 调用我们的 baseline_solver 计算解答
      pred = solver.solve(test['problem'].iloc[0])
      revealed_targets_template['answer'] = pred
      env.predict(revealed_targets_template)
  ```

### 第四步：将竞赛排名转化为资金杠杆
- **排行榜展示**：即使初赛进入前 20% / 前 10%，该全球排名的公开链接（Kaggle Profile）即是无可辩驳的“工作量证明（PoW）”。
- **直接写入资助申请**：在提交给香港数码港 CCMF 或 Manifund 时，将 Kaggle 排名截图与公开代码仓库并列，可直接免去任何学历与背景质疑。
