"""
FunSearch 提示词构建器 (PromptBuilder)
======================================
负责组装符合 FunSearch 论文规范的上下文提示词：
- 任务规范定义 (Task Specification)
- 亲本程序注入 (In-Context Parent Programs)
- 变异 (Mutation) 与 交叉 (Crossover) 专项指令引导
"""

from typing import List
from funsearch.core_types import Program

CAP_SET_SPECIFICATION = """You are a mathematical researcher and expert algorithm designer working on extremal combinatorics.

### Problem Background:
We are studying the **Cap Set Problem** in the finite affine space $\\mathbb{F}_3^n$ (where every vector component $x_i \\in \\{0, 1, 2\\}$).
A subset $S \\subseteq \\mathbb{F}_3^n$ is a **Cap Set** if it contains no three distinct points $x, y, z \\in S$ in arithmetic progression (i.e. $x + y + z \\equiv 0 \\pmod 3$).

### Algorithmic Framework:
Our system uses a greedy selector:
1. All $3^n$ points in $\\mathbb{F}_3^n$ are scored using your function `priority(p: tuple, n: int) -> float`.
2. Points are sorted by score in descending order.
3. The algorithm greedily accepts points into the set $S$ as long as no three collinear points are formed.
4. The objective is to maximize $|S|$ (the size of the valid Cap Set found).

### Mathematical Invariants to Consider:
- **Hamming Weight L0 Slices**: The count of non-zero entries or frequency of 0, 1, 2.
- **Affine Hyperplane Congruences**: Linear combinations $\\sum a_i x_i \\pmod 3$.
- **Cyclic Shift Invariance**: Differences like $|p_i - p_{(i+1) \\% n}|$.
- **Non-linear / Quadratic Forms**: Interactions like $p_i \\cdot p_j$.
"""

MUTATION_INSTRUCTIONS = """
### Current High-Scoring Parent Program (Score: {score}):
```python
{code}
```

### Your Task (Mutation Operator):
Analyze the parent function above. Design an improved, mutated version that:
1. Preserves what works (e.g. good coordinate filtering or modulo balance).
2. Introduces a novel algebraic variation (e.g. adjusting Hamming slice bounds, testing different modulo targets, or adding cross-coordinate parity).
3. Remains computationally efficient (only pure Python, no external libraries other than `math`).

Output ONLY valid Python code containing the function:
```python
def priority(p: tuple, n: int) -> float:
    # Your improved implementation
    ...
```
"""

CROSSOVER_INSTRUCTIONS = """
### Two Distinct High-Scoring Parent Programs:

**Parent Program 1 (Score: {score1}, ID: {id1})**:
```python
{code1}
```

**Parent Program 2 (Score: {score2}, ID: {id2})**:
```python
{code2}
```

### Your Task (Crossover Operator):
Synthesize and cross-breed the distinct mechanisms of Parent 1 and Parent 2:
1. Identify the complementary strengths of both algorithms (e.g., Parent 1's hyperplane slicing and Parent 2's cyclic coordinate differences).
2. Create a unified child function combining their best mathematical features.
3. Output ONLY valid Python code containing the function:
```python
def priority(p: tuple, n: int) -> float:
    # Combined hybrid implementation
    ...
```
"""

class PromptBuilder:
    """提示词组装器"""
    @staticmethod
    def build_prompt(parents: List[Program], operator: str, dimension: int) -> str:
        base = CAP_SET_SPECIFICATION + f"\n**Target Dimension**: n = {dimension} ($3^{dimension} = {3**dimension}$ points)\n"
        
        if operator == "crossover" and len(parents) >= 2:
            p1, p2 = parents[0], parents[1]
            inst = CROSSOVER_INSTRUCTIONS.format(
                score1=p1.score, id1=p1.id, code1=p1.code,
                score2=p2.score, id2=p2.id, code2=p2.code
            )
            return base + inst
        else:
            p = parents[0] if parents else Program("def priority(p, n): return sum(p)", 0, 0, 0)
            inst = MUTATION_INSTRUCTIONS.format(
                score=p.score, code=p.code
            )
            return base + inst
