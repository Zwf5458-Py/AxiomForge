"""
FunSearch LLM 变异采样器 (Sampler & Prompt Engineer)
==================================================
负责将优秀的父代函数注入 Prompt，驱动大模型变异生成新的优先级启发式代码。
同时内置规则变异生成器（可在无外部 API Key 时进行离线自主演化测试）。
"""

import os
import random
import re
from typing import Optional, Dict, Any

SYSTEM_PROMPT = """你是一位精通极值组合数学与算法设计的世界级专家。
你的任务是在有限域 F_3^n（每个元素取值为 0, 1, 2）中寻找尽可能大的 Cap Set（即不存在任何三个不同的向量 x, y, z 满足 x + y + z ≡ 0 mod 3）。
算法框架将通过贪心方式，依据你编写的优先级函数 priority(p, n) 计算每个向量的分数并降序选取。
请仔细改进先前的优先级函数，引入新的代数对称性、模运算特征或几何特征，使得贪心选取的子集大小最大化。

必须严格返回 Python 函数，格式如下：
```python
def priority(p: tuple, n: int) -> float:
    # 你的计算逻辑
    return score
```
"""

PROMPT_SKELETON = """
已有的优秀程序基准（得分：{best_score}）：
```python
{parent_code}
```

请对上述 priority 函数进行变异与结构升级：
1. 考虑高维空间中的汉明权重、坐标对称性以及坐标间两两相互作用。
2. 保持函数高效且健壮，不能使用额外全局依赖。
请只输出包含 `def priority(p: tuple, n: int) -> float:` 的 Python 代码块。
"""

class LLMSampler:
    """LLM 演化代码采样器"""
    def __init__(self, api_type: str = "offline", api_key: Optional[str] = None, model: str = "deepseek-chat"):
        self.api_type = api_type
        self.api_key = api_key or os.environ.get("LLM_API_KEY", "")
        self.model = model

    def generate_prompt(self, parent_code: str, best_score: int, n: int) -> str:
        return PROMPT_SKELETON.format(parent_code=parent_code.strip(), best_score=best_score, n=n)

    def sample_mutation(self, parent_code: str, best_score: int, n: int) -> str:
        """根据配置调用真实 API 或离线生成变异"""
        if self.api_type == "online" and self.api_key:
            return self._call_online_api(parent_code, best_score, n)
        else:
            return self._offline_algebraic_mutate(parent_code, n)

    def _extract_code(self, response_text: str) -> str:
        """从 LLM 返回的 Markdown 中提取 Python 函数体"""
        match = re.search(r"```python\s*(def priority.*?)\s*```", response_text, re.DOTALL)
        if match:
            return match.group(1)
        match_raw = re.search(r"(def priority\(.*?\):.*)", response_text, re.DOTALL)
        if match_raw:
            return match_raw.group(1)
        return response_text.strip()

    def _call_online_api(self, parent_code: str, best_score: int, n: int) -> str:
        """在线调用 API（兼容 OpenAI / DeepSeek 等标准接口）"""
        try:
            import urllib.request
            import json
            
            prompt = self.generate_prompt(parent_code, best_score, n)
            payload = {
                "model": self.model,
                "messages": [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.7
            }
            url = os.environ.get("LLM_API_BASE", "https://api.deepseek.com/v1") + "/chat/completions"
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode("utf-8"),
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {self.api_key}"
                }
            )
            with urllib.request.urlopen(req, timeout=30) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                reply = data["choices"][0]["message"]["content"]
                return self._extract_code(reply)
        except Exception:
            # 降级走离线代数变异
            return self._offline_algebraic_mutate(parent_code, n)

    def _offline_algebraic_mutate(self, parent_code: str, n: int) -> str:
        """
        离线代数特征演化变异器：
        自主探索代数对称性、模代数权重、汉明距离分布与非线性项组合
        """
        templates = [
            # 变异策略 1：模 3 权重与坐标二次相互作用
            """def priority(p: tuple, n: int) -> float:
    # 变异策略：汉明权重与二阶坐标交叉项
    c0 = p.count(0)
    c1 = p.count(1)
    c2 = p.count(2)
    score = c0 * {w0} + c1 * {w1} + c2 * {w2}
    for i in range(len(p) - 1):
        score += (p[i] ^ p[i+1]) * {cross_w}
    return float(score)""",
            
            # 变异策略 2：离散傅里叶/余弦投影特征
            """def priority(p: tuple, n: int) -> float:
    # 变异策略：非线性三角正交投影
    import math
    val = 0.0
    for idx, x in enumerate(p):
        angle = 2.0 * math.pi * x / 3.0
        val += math.cos(angle * (idx + 1)) * {coeff1} + math.sin(angle) * {coeff2}
    # 增加非零坐标稀疏性偏置
    val += (p.count(1) - p.count(2)) * {sparse_w}
    return float(val)""",

            # 变异策略 3：高维球谐偏置与对称性破缺
            """def priority(p: tuple, n: int) -> float:
    # 变异策略：非对称加权汉明范数
    norm = sum(x * x for x in p)
    diff = sum(abs(p[i] - p[(i+1)%n]) for i in range(n))
    return float(norm * {norm_w} - diff * {diff_w} + p[0] * {lead_w})""",

            # 变异策略 4：有限域仿射超平面同余约束 (Affine Hyperplane Modulo)
            """def priority(p: tuple, n: int) -> float:
    # 变异策略：仿射超平面特征 ∑ a_i * x_i ≡ target (mod 3)
    linear_comb = sum(p[i] * {w_hyper} for i in range(len(p)))
    is_on_hyperplane = (linear_comb % 3 == {target_mod})
    return 100.0 if is_on_hyperplane else float(p.count(1) * 1.5 - p.count(0))"""
        ]

        tpl = random.choice(templates)
        code = tpl.format(
            w0=round(random.uniform(-2.0, 3.0), 3),
            w1=round(random.uniform(0.5, 4.0), 3),
            w2=round(random.uniform(0.5, 4.0), 3),
            cross_w=round(random.uniform(-1.5, 2.5), 3),
            coeff1=round(random.uniform(0.5, 3.0), 3),
            coeff2=round(random.uniform(-2.0, 2.0), 3),
            sparse_w=round(random.uniform(0.1, 1.8), 3),
            norm_w=round(random.uniform(0.2, 2.5), 3),
            diff_w=round(random.uniform(0.1, 1.5), 3),
            lead_w=round(random.uniform(-1.0, 2.0), 3),
            w_hyper=random.choice([1, 2]),
            target_mod=random.choice([1, 2])
        )
        return code
