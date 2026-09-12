"""
AIMO (AI Mathematical Olympiad) Kaggle 竞赛打榜基线求解器
=========================================================
核心算法架构：
1. Tool-Integrated Reasoning (TIR): 引导模型编写并执行 Python 验证脚本
2. Safe REPL Sandbox: 毫秒级安全运行数学解题代码并捕获 print 输出
3. Self-Consistency Majority Voting: 多候选解答采样与加权多数投票
"""

import collections
import contextlib
import io
import math
import os
import re
import sys
import time
from typing import List, Dict, Any, Optional

def execute_math_code(code_str: str, timeout_seconds: float = 5.0) -> Optional[int]:
    """
    在隔离环境中执行数学计算代码，并尝试提取 print 输出的整数解
    AIMO 竞赛规则：最终输出必须为 0 ~ 999 之间的非负整数
    """
    buffer = io.StringIO()
    # 限制可用内置函数以确保安全
    safe_globals = {
        "math": math,
        "__builtins__": {
            "range": range, "len": len, "sum": sum, "min": min, "max": max,
            "abs": abs, "pow": pow, "divmod": divmod, "int": int, "float": float,
            "list": list, "set": set, "dict": dict, "tuple": tuple, "sorted": sorted,
            "enumerate": enumerate, "zip": zip, "print": print
        }
    }
    local_scope: Dict[str, Any] = {}

    try:
        with contextlib.redirect_stdout(buffer):
            exec(code_str, safe_globals, local_scope)
        output = buffer.getvalue().strip()
        
        # 优先从 print 输出中提取最后出现的整数
        numbers = re.findall(r"-?\d+", output)
        if numbers:
            ans = int(numbers[-1])
            return ans % 1000  # AIMO 模 1000 规则
            
        # 若无输出，尝试检查局部变量中的 result 或 ans
        for var in ["result", "ans", "answer"]:
            if var in local_scope and isinstance(local_scope[var], int):
                return local_scope[var] % 1000
    except Exception:
        return None
    return None

class AIMOSolver:
    """AIMO 自动化解题基线流水线"""
    def __init__(self, num_samples: int = 3):
        self.num_samples = num_samples

    def solve_problem_offline_mock(self, problem_text: str) -> Dict[str, Any]:
        """
        离线演示求解器（用于在没有外部 API 时验证流程跑通）
        内置经典 AIME 问题求解代码
        """
        sample_code = """
# 针对组合/数论问题的模拟求解脚本
def solve():
    count = 0
    for x in range(1, 100):
        if x % 7 == 3 and x % 5 == 2:
            count += x
    print(count)

solve()
"""
        ans = execute_math_code(sample_code)
        return {
            "problem": problem_text,
            "candidates": [ans] * self.num_samples,
            "final_answer": ans,
            "confidence": 1.0,
            "execution_trace": sample_code.strip()
        }

    def aggregate_votes(self, candidate_answers: List[Optional[int]]) -> Optional[int]:
        """对多个采样的候选解执行多数投票集成 (Majority Voting)"""
        valid_answers = [a for a in candidate_answers if a is not None and 0 <= a <= 999]
        if not valid_answers:
            return 0  # 竞赛默认保底
        counter = collections.Counter(valid_answers)
        best_answer, _ = counter.most_common(1)[0]
        return best_answer

def run_aimo_demo():
    print("=" * 65)
    print("🏆 AIMO Prize / Kaggle 竞赛打榜基线流水线启动")
    print("📐 架构：CoT 思维链 + Python 沙箱解释器 + 自洽性多数投票")
    print("=" * 65)

    sample_problem = (
        "Let S be the set of positive integers n <= 100 such that "
        "n is congruent to 3 mod 7 and congruent to 2 mod 5. "
        "Find the sum of all elements in S."
    )
    print(f"\n[题目输入]: {sample_problem}\n")

    solver = AIMOSolver(num_samples=3)
    start_t = time.time()
    result = solver.solve_problem_offline_mock(sample_problem)
    duration = time.time() - start_t

    print(f"[生成的验证代码]:\n{result['execution_trace']}\n")
    print(f"⏱️ 执行与沙箱验算耗时: {duration * 1000:.2f} ms")
    print(f"🎯 最终集成预测答案 (0-999): {result['final_answer']}")
    print(f"🌟 置信度: {result['confidence'] * 100:.1f}%\n")
    print("=" * 65)

if __name__ == "__main__":
    run_aimo_demo()
