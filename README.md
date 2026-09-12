# AxiomForge: FunSearch-Inspired Heuristic Search Framework for Combinatorial Problems

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI Tests](https://github.com/Zwf5458-Py/AxiomForge/actions/workflows/tests.yml/badge.svg)](https://github.com/Zwf5458-Py/AxiomForge/actions)

> **项目定位**：一个面向独立研究者的**早期开源研究原型（Early Research Prototype）**，旨在探索代数结构先验（Symmetry & Modular Invariants）是否能改善有限域极值组合问题（如 Cap Set 问题）中的启发式贪心搜索。

---

## 🔬 研究背景与初步发现

在有限域 $\mathbb{F}_3^n$ 的帽集问题（Cap Set Problem，即寻找无三点共线 $x + y + z \equiv 0 \pmod 3$ 的最大子集）中，朴素启发式贪心往往容易被困在容量为 $2^n$ 的低维超立方体子空间中（例如 $n=4 \to 16$, $n=5 \to 32$, $n=6 \to 64$, $n=7 \to 128$）。

我们构建了一套受 DeepMind FunSearch 启发的轻量级启发式搜索与评测框架。在跨多组随机种子的初步受限实验中：
- 对照组（朴素线性启发式）：受限于 $2^n$ 超立方体局部解；
- 实验组（注入仿射同余与汉明范数切片先验）：打破了 $2^n$ 封印，观测到统计显著的容量增益（$n=4$ 稳定达到已知理论上限 20 点，$n=5$ 均值达到 $37.6 \pm 0.7$ 点，$n=7$ 观测到 157 点）。

> [!NOTE]
> **关于基准与当前局限的说明**：
> - 在 $n=7$ 维度下，当前最好单次结果为 157 点，距离数学家 Edel (2004) 构造的已知最佳下界（236 点）仍有约 33.5% 的差距。
> - 本项目目前处于**早期探索型原型阶段**，核心代码为模板化启发式变异，尚不构成完整的大模型自主程序演化闭环。下一阶段目标是通过多随机种子、严格基准、公开实验日志和接入大模型 API，检验改进是否具有一般统计稳定性。

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
pytest tests/
```

### 3. 运行多随机种子统计评测
```bash
# 在 n=5 维度下运行 10 组随机种子对比评测
python3 experiments/run_ab_experiment.py --dimension 5 --iterations 30 --seeds 10

# 在 n=6 维度下运行 5 组随机种子对比评测
python3 experiments/run_ab_experiment.py --dimension 6 --iterations 30 --seeds 5
```

### 4. 启动 WebGL 3D 交互原型
```bash
python3 -m http.server 8080
# 访问 http://localhost:8080 观察 F_3^3 空间的 27 点阵三维正交投影与动力学系统
```

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
