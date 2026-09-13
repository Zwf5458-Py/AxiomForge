#!/usr/bin/env python3
"""
FunSearch 自动演化搜索主程序
===========================
运行示例：
    python3 run_cap_set_search.py --dimension 3 --iterations 15
    python3 run_cap_set_search.py --dimension 4 --iterations 20
"""

import argparse
import json
import os
import sys
import time

from funsearch.evaluator import (
    evaluate_program,
    baseline_priority_sum,
    baseline_priority_weights,
    solve_cap_set_greedy,
    is_valid_cap_set
)
from funsearch.programs_database import ProgramsDatabase
from funsearch.sampler import LLMSampler

INITIAL_SEED_PROGRAM = """def priority(p: tuple, n: int) -> float:
    # 初始种群基线：基于坐标加权与模特征
    score = 0.0
    for idx, val in enumerate(p):
        if val == 1:
            score += 2.0
        elif val == 2:
            score += 1.5
        else:
            score -= 0.5
        score += idx * 0.1
    return float(score)"""

def main():
    parser = argparse.ArgumentParser(description="FunSearch Cap Set 演化搜索器")
    parser.add_argument("--dimension", "-d", type=int, default=3, help="F_3^n 空间的维度 n (默认 3)")
    parser.add_argument("--iterations", "-i", type=int, default=20, help="演化迭代总轮数 (默认 20)")
    parser.add_argument("--islands", type=int, default=3, help="演化隔离岛屿数量 (默认 3)")
    parser.add_argument("--api-type", type=str, default="offline", choices=["offline", "online"], help="采样模式 (offline / online)")
    parser.add_argument("--export-json", type=str, default="cap_set_results.json", help="最佳结果导出路径")
    args = parser.parse_args()

    n = args.dimension
    print("=" * 65)
    print(f"🔬 启动 FunSearch-inspired 启发式搜索 · Cap Set 在有限域 F_3^{n} 空间")
    print(f"📊 已知最佳构造/基准参照：n=2->4, n=3->9, n=4->20, n=5->45, n=6->112, n=7->236 (Edel 2004)")
    print(f"⚙️ 模式：{args.api_type.upper()} | 迭代轮数：{args.iterations} | 岛屿数：{args.islands}")
    print("=" * 65)

    db = ProgramsDatabase(num_islands=args.islands)
    sampler = LLMSampler(api_type=args.api_type)

    # 1. 评估初始种子程序
    seed_eval = evaluate_program(INITIAL_SEED_PROGRAM, n)
    print(f"\n[种子程序] 评估得分: {seed_eval['score']} (验证有效: {seed_eval['valid']})")
    for island_id in range(args.islands):
        db.register_program(INITIAL_SEED_PROGRAM, seed_eval["score"], generation=0, island_id=island_id, parent_ids=[], operator="seed")

    best_so_far = seed_eval["score"]
    best_points = seed_eval["points"]

    # 2. 迭代演化
    start_time = time.time()
    for gen in range(1, args.iterations + 1):
        island_id = (gen - 1) % args.islands
        parents = db.sample_parents(island_id, operator="mutation")
        if not parents:
            continue
        parent = parents[0]

        mutated_code = sampler.sample_mutation(parent.code, db.global_best.score, n)
        result = evaluate_program(mutated_code, n)

        if result["valid"]:
            score = result["score"]
            db.register_program(mutated_code, score, generation=gen, island_id=island_id)
            if score > best_so_far:
                best_so_far = score
                best_points = result["points"]
                print(f"✨ [Gen {gen:02d} | Island {island_id}] 突破新纪录！得分: {score} (前纪录: {parent.score})")
            else:
                print(f"   [Gen {gen:02d} | Island {island_id}] 程序评估有效，得分: {score}")
        else:
            print(f"⚠️ [Gen {gen:02d} | Island {island_id}] 程序编译/验证失败: {result['error']}")

    elapsed = time.time() - start_time
    print("\n" + "=" * 65)
    print("🎉 演化探索完成！")
    print(f"⏱️ 耗时：{elapsed:.2f} 秒 | 总评估次数：{db.total_evaluations}")
    print(f"🏆 全局最高得分（最大 Cap Set 基数）：{best_so_far}")
    print("=" * 65)

    # 导出搜索成果
    export_data = {
        "dimension": n,
        "best_score": best_so_far,
        "is_valid": is_valid_cap_set(best_points),
        "points_count": len(best_points),
        "best_code": db.global_best.code if db.global_best else "",
        "points": best_points,
        "total_evaluations": db.total_evaluations,
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
    }

    with open(args.export_json, "w", encoding="utf-8") as f:
        json.dump(export_data, f, indent=2, ensure_ascii=False)
    print(f"📁 最佳程序与点阵数据已成功导出至：{args.export_json}\n")

if __name__ == "__main__":
    main()
