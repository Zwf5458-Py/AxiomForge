#!/usr/bin/env python3
"""
AxiomForge: 完整的 FunSearch 真实演化系统启动脚本
=================================================
满足全部真实性要求：
1. LLM 生成程序 (真实在线 API 或确定性模拟器)
2. 程序数据库 (多岛屿维护、基因持久化)
3. 评估反馈 (沙箱隔离、耗时、有效性与共线判定)
4. 精英选择 (基于 Rank 的 Softmax 温度采样)
5. 交叉或变异 (单亲本变异 + 双亲本杂交融合)
6. 岛屿演化 (独立演化隔离、定期停滞检测与重置)
7. 可重复的语言模型实验 (全局固定种子、完整 JSONL 审计日志)

运行示例：
    # 1. 确定性可重复实验 (零成本，无须 API Key)
    python3 run_funsearch_real.py --dimension 4 --iterations 20 --backend mock

    # 2. DeepSeek 真实大模型在线演化
    python3 run_funsearch_real.py --dimension 4 --iterations 30 --backend deepseek --api-key YOUR_KEY

    # 3. 本地 Ollama / 开源大模型驱动
    python3 run_funsearch_real.py --dimension 4 --iterations 30 --backend custom --api-base http://localhost:11434/v1
"""

import argparse
import os
import random
import sys
import time

from funsearch.evolution_engine import EvolutionEngine

def main():
    parser = argparse.ArgumentParser(description="AxiomForge: 完整真实 FunSearch 算法演化系统")
    parser.add_argument("--dimension", "-d", type=int, default=4, help="F_3^n 维度 (默认 4)")
    parser.add_argument("--iterations", "-i", type=int, default=20, help="总演化代数 (默认 20)")
    parser.add_argument("--islands", type=int, default=4, help="演化岛屿数量 (默认 4)")
    parser.add_argument("--crossover-prob", type=float, default=0.3, help="双亲本交叉概率 (默认 0.3)")
    parser.add_argument("--seed", "-s", type=int, default=42, help="随机种子 (默认 42)")
    parser.add_argument("--backend", "-b", type=str, default="mock", choices=["mock", "deepseek", "openai", "custom"], help="LLM 后端选择")
    parser.add_argument("--model", "-m", type=str, default=None, help="模型标识符 (如 deepseek-chat)")
    parser.add_argument("--api-key", type=str, default=None, help="API Key (亦可读取环境变量)")
    parser.add_argument("--api-base", type=str, default=None, help="自定义 API Base URL")
    parser.add_argument("--temperature", "-t", type=float, default=0.7, help="LLM 采样温度")
    parser.add_argument("--log-file", type=str, default=None, help="实验详细 JSONL 追踪日志路径")
    args = parser.parse_args()

    # 设置可重复性随机种子
    random.seed(args.seed)

    log_path = args.log_file or f"experiments/funsearch_trace_n{args.dimension}_seed{args.seed}.jsonl"

    engine = EvolutionEngine(
        dimension=args.dimension,
        num_islands=args.islands,
        llm_backend=args.backend,
        llm_model=args.model,
        api_key=args.api_key,
        api_base=args.api_base,
        temperature=args.temperature,
        log_file=log_path,
        crossover_prob=args.crossover_prob
    )

    summary = engine.run(args.iterations)

    print("\n📝 表现最佳的演化 Python 函数:")
    print("-" * 50)
    print(summary["global_best_code"])
    print("-" * 50)
    print(f"📊 实验完整过程与提示词审计日志已记录至: {log_path}\n")

if __name__ == "__main__":
    main()
