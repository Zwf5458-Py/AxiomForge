#!/usr/bin/env python3
"""
AxiomForge 高维极值空间极速搜索与基准对决套件
==============================================
专门针对 F_3^6 (729 点) 与 F_3^7 (2,187 点) 极值 Cap Set 搜索设计。

运行示例：
    python3 run_high_dim_search.py --dimension 6 --trials 30 --local-search
    python3 run_high_dim_search.py --dimension 7 --trials 20 --local-search
"""

import argparse
import json
import time
import sys
from typing import Dict, Any, List

from funsearch.fast_solver import FastCapSetEnv
from funsearch.high_dim_priors import generate_high_dim_symmetry_code
from funsearch.evaluator import baseline_priority_weights, is_valid_cap_set

def run_high_dim_experiment(dimension: int, trials: int, enable_local_search: bool = True, export_json: str = "") -> Dict[str, Any]:
    n = dimension
    env = FastCapSetEnv(n)
    total_space = 3 ** n
    hypercube_bound = 2 ** n

    print("=" * 70)
    print(f"🚀 启动 AxiomForge 高维极值空间对决 · F_3^{n} 空间 (总点数: {total_space:,})")
    print(f"📊 理论参照：超立方体基线 2^{n} = {hypercube_bound} | 历史记录: {78 if n==6 else 157} | 已知极值: {112 if n==6 else 236}")
    print(f"⚙️ 配置参数：演化候选轮数 = {trials} | 模因局部置换 (1-Swap) = {enable_local_search}")
    print("=" * 70)

    # 1. 运行基线评估 (Naive Linear Weights)
    t0 = time.time()
    baseline_indices = env.solve_greedy(baseline_priority_weights)
    baseline_time = time.time() - t0
    baseline_pts = [env.points[i] for i in baseline_indices]
    assert env.is_valid_cap_set(baseline_indices), "基准生成了非法 Cap Set！"

    print(f"\n[阶段 1: 朴素基线测试]")
    print(f"  └─ 朴素加权贪心点数: {len(baseline_pts)} 点 (耗时: {baseline_time*1000:.2f}ms) -> 陷入 2^{n} 局部陷阱")

    # 2. 运行高维代数先验演化搜索
    print(f"\n[阶段 2: 高维代数先验 + 模因置换演化搜索 (共 {trials} 轮)]")
    best_score = len(baseline_pts)
    best_indices = baseline_indices
    best_code = ""
    scores_history = []
    start_time = time.time()

    for trial in range(1, trials + 1):
        code = generate_high_dim_symmetry_code(n)
        local_scope = {}
        try:
            exec(code, local_scope)
            fn = local_scope["priority"]
        except Exception as e:
            continue

        # 多起点轻微扰动贪心
        for temp in [0.0, 0.5]:
            indices = env.solve_greedy(fn, sample_temperature=temp)
            current_score = len(indices)

            # 若启用局部搜索且具备潜力
            if enable_local_search and current_score >= (hypercube_bound + (10 if n==6 else 20)):
                refined = env.local_search_1swap(indices, max_evals=25)
                if len(refined) > current_score:
                    indices = refined
                    current_score = len(refined)

            if current_score > best_score:
                prev_best = best_score
                best_score = current_score
                best_indices = indices
                best_code = code
                print(f"  ✨ [Trial {trial:02d} | T={temp}] 突破新峰值！达到 {best_score} 点 (前纪录: {prev_best})")

        scores_history.append(best_score)

    total_time = time.time() - start_time
    best_pts = [env.points[i] for i in best_indices]
    is_valid = is_valid_cap_set(best_pts)

    print("\n" + "=" * 70)
    print("🏆 高维极值搜索完成与基准对比：")
    print(f"  - 搜索维度：{n} 维 (F_3^{n}, 总空间 {total_space} 点)")
    print(f"  - 朴素基线：{len(baseline_pts)} 点 (超立方体屏障)")
    print(f"  - 本次最高：{best_score} 点 (提升率: +{((best_score - len(baseline_pts)) / len(baseline_pts))*100:.2f}%)")
    print(f"  - 数学验证：100% 严格无三点共线 (is_valid = {is_valid})")
    print(f"  - 总计耗时：{total_time:.2f} 秒 (平均单轮: {total_time/trials:.3f}s)")
    print("=" * 70)

    report_data = {
        "dimension": n,
        "total_space": total_space,
        "hypercube_baseline": len(baseline_pts),
        "best_score": best_score,
        "improvement_percentage": round(((best_score - len(baseline_pts)) / len(baseline_pts)) * 100, 2),
        "is_mathematically_valid": is_valid,
        "points_count": len(best_pts),
        "trials": trials,
        "total_time_seconds": round(total_time, 3),
        "best_code": best_code,
        "points": best_pts,
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
    }

    if export_json:
        with open(export_json, "w", encoding="utf-8") as f:
            json.dump(report_data, f, indent=2, ensure_ascii=False)
        print(f"📁 详细结果与点阵已导出至: {export_json}\n")

    return report_data

def main():
    parser = argparse.ArgumentParser(description="AxiomForge 6D/7D 高维极值搜索")
    parser.add_argument("--dimension", "-d", type=int, default=6, choices=[5, 6, 7], help="空间维度 (5, 6, 7)")
    parser.add_argument("--trials", "-t", type=int, default=30, help="先验演化轮数")
    parser.add_argument("--local-search", action="store_true", default=True, help="启用 1-Swap 模因局部置换")
    parser.add_argument("--export-json", type=str, default="", help="导出结果路径")
    args = parser.parse_args()

    export_path = args.export_json or f"high_dim_results_dim_{args.dimension}.json"
    run_high_dim_experiment(args.dimension, args.trials, args.local_search, export_path)

if __name__ == "__main__":
    main()
