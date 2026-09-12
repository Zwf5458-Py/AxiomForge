"""
AxiomForge 对称性先验体系与 A/B 对照提示工程
============================================
定义两套对比策略：
1. STRATEGY_NAIVE: 朴素对照组（无几何指引，自由随机演化）
2. STRATEGY_SYMMETRY: 对称性先验组（注入汉明范数切片、仿射超平面同余、循环移位不变性）
"""

import math
import random
from typing import Dict, Any, List

# -------------------------------------------------------------
# 1. 对照组（Naive / 无先验）
# -------------------------------------------------------------
PROMPT_NAIVE = """你是一位算法工程师。请编写一个 Python 优先级函数：
```python
def priority(p: tuple, n: int) -> float:
    # 根据坐标 p 返回一个浮点数权重，用于指导贪心算法选取点
    return score
```
目标：使贪心算法在有限域 F_3^n 空间中选取的帽集（Cap Set）尽可能大。
要求：只输出 Python 函数代码，不提供其他解释。
"""

# -------------------------------------------------------------
# 2. 实验组（Symmetry-Injected / 对称性先验注入）
# -------------------------------------------------------------
PROMPT_SYMMETRY = """你是一位精通极值代数几何与组合数学的专家。
研究表明，F_3^n 空间中的紧致帽集（Cap Set）高度依赖于特殊的代数对称性与不变量：

【必须融合的数学先验知识】：
1. 汉明重量与稀疏性分层 (Hamming Weight Slices)：
   - 计算非零分量个数 (L_0 范数) 以及元素 0, 1, 2 的频次分布；
   - 关注模 3 特征，例如 (count(1) - count(2)) % 3。
2. 仿射超平面同余约束 (Affine Hyperplane Modulo)：
   - 考察一阶仿射和 sum(a_i * x_i) ≡ c (mod 3)；
   - 优先选择落在特定超平面切片上的点。
3. 循环群移位与可乘性特征 (Cyclic Shift & Multiplicative)：
   - 考察坐标循环差分 sum(abs(p[i] - p[(i+1)%n]))；
   - 考察多项式乘积 prod(x_i + 1) 或二次交叉项 (p[i] * p[j]) % 3。

请基于上述先验设计高度结构化的 priority 函数：
```python
def priority(p: tuple, n: int) -> float:
    # 结合代数对称性与汉明切片的启发式打分
    return score
```
"""

def generate_naive_mutation(n: int) -> str:
    """对照组离线代码生成器（朴素权重线性组合）"""
    w = [round(random.uniform(-3.0, 3.0), 2) for _ in range(5)]
    bias = round(random.uniform(-1.0, 1.0), 2)
    templates = [
        f"""def priority(p: tuple, n: int) -> float:
    # 朴素随机加权（无几何先验）
    score = {bias}
    for idx, val in enumerate(p):
        score += val * {w[0]} + (idx % 2) * {w[1]}
    return float(score)""",
        f"""def priority(p: tuple, n: int) -> float:
    # 朴素多项式简单组合
    s = sum(p) * {w[0]}
    prod = (p[0] * p[-1] if len(p) > 1 else 0) * {w[1]}
    return float(s + prod + {bias})"""
    ]
    return random.choice(templates)

def generate_symmetry_mutation(n: int) -> str:
    """实验组离线代码生成器（显式注入代数对称性、模 3 约束与汉明切片）"""
    w0 = round(random.uniform(-2.5, 2.5), 2)
    w1 = round(random.uniform(1.0, 3.5), 2)
    w2 = round(random.uniform(1.0, 3.5), 2)
    cross_w = round(random.uniform(0.5, 2.5), 2)
    mod_target = random.choice([0, 1, 2])
    hyp_coef = random.choice([1, 2])

    templates = [
        # 先验模式 1：仿射超平面模 3 同余 + 汉明权重
        f"""def priority(p: tuple, n: int) -> float:
    # 对称性先验：仿射超平面同余 + 模 3 稀疏分布
    hyper = sum(p[i] * {hyp_coef} for i in range(n)) % 3
    is_plane = 100.0 if hyper == {mod_target} else 0.0
    c0, c1, c2 = p.count(0), p.count(1), p.count(2)
    weight = c0 * {w0} + c1 * {w1} + c2 * {w2}
    return float(is_plane + weight)""",

        # 先验模式 2：循环移位不变量 + 坐标差分二次型
        f"""def priority(p: tuple, n: int) -> float:
    # 对称性先验：循环群移位不变差分 + 模 3 平衡
    diff_sum = sum(abs(p[i] - p[(i + 1) % n]) for i in range(n))
    mod_diff = (p.count(1) - p.count(2)) % 3
    cross = sum((p[i] * p[(i + 2) % n]) for i in range(n - 2)) if n > 2 else 0
    return float(-diff_sum * {cross_w} + (mod_diff == {mod_target}) * 50.0 + cross * 0.5)""",

        # 先验模式 3：可乘性投影与非零分量 (L0 范数) 切片
        f"""def priority(p: tuple, n: int) -> float:
    # 对称性先验：L0 范数切片与多项式可乘性
    l0_norm = sum(1 for x in p if x != 0)
    # 鼓励处于特定中间汉明重量层的点
    slice_bonus = 60.0 if l0_norm == (n // 2 + {random.choice([0, 1])}) else 0.0
    parity = sum(p) % 3
    return float(slice_bonus + (parity == {mod_target}) * 30.0 + p[0] * {w1})"""
    ]
    return random.choice(templates)
