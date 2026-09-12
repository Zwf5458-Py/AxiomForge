"""
AIMO (AI Mathematical Olympiad) Kaggle 竞赛打榜基线求解器
=========================================================
核心算法架构：
1. Tool-Integrated Reasoning (TIR): 引导模型编写并执行 Python 验证脚本
2. Multi-Process Hard Timeout: 基于 ProcessPoolExecutor 的硬超时防护，杜绝死循环挂起
3. Self-Consistency Majority Voting: 基于 collections.Counter 的自洽性多数投票
"""

import collections
from collections import Counter
import concurrent.futures
import contextlib
import io
import math
import os
import re
import sys
import time
from typing import Any, Dict, List, Optional, Tuple

def _eval_worker(code_str: str) -> Dict[str, Any]:
    """子进程独立工作函数：在沙箱命名空间内执行解题代码"""
    buffer = io.StringIO()
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

        # 优先从标准输出中提取最后一个整数
        output = buffer.getvalue().strip()
        numbers = re.findall(r"-?\d+", output)
        if numbers:
            ans = int(numbers[-1]) % 1000
            return {"success": True, "result": ans, "error": None}

        # 其次从局部变量中提取 ans / result / answer
        for var_name in ["ans", "result", "answer"]:
            if var_name in local_scope and isinstance(local_scope[var_name], int):
                return {"success": True, "result": local_scope[var_name] % 1000, "error": None}

        return {"success": False, "result": None, "error": "No integer result found in output or variables"}
    except Exception as e:
        return {"success": False, "result": None, "error": f"{type(e).__name__}: {str(e)}"}

def execute_math_code(
    code_str: str,
    timeout_seconds: float = 5.0
) -> Tuple[Optional[int], Optional[str]]:
    """
    带多进程硬超时保护的代码执行器：
    利用 ProcessPoolExecutor 隔离执行，彻底杜绝死循环挂起，超时时强制截断
    """
    try:
        with concurrent.futures.ProcessPoolExecutor(max_workers=1) as executor:
            future = executor.submit(_eval_worker, code_str)
            try:
                res = future.result(timeout=timeout_seconds)
                return res["result"], res["error"]
            except concurrent.futures.TimeoutError:
                return None, f"TimeoutError: Code execution exceeded {timeout_seconds}s limit"
            except Exception as e:
                return None, f"ExecutionError: {str(e)}"
    except Exception as e:
        # 兜底降级处理（例如在极少数不支持 fork/spawn 的受限环境下）
        res = _eval_worker(code_str)
        return res["result"], res["error"]

def aggregate_votes(valid_answers: List[Any]) -> Optional[int]:
    """基于 collections.Counter 的加权多数投票集成"""
    clean_answers = [a for a in valid_answers if a is not None and isinstance(a, int) and 0 <= a <= 999]
    if not clean_answers:
        return 0  # 官方竞赛默认保底值
    counter = Counter(clean_answers)
    most_common = counter.most_common(1)
    return most_common[0][0] if most_common else 0

class AIMOSolver:
    """AIMO 自动化解题流水线"""
    def __init__(self, num_samples: int = 3, timeout_per_eval: float = 5.0):
        self.num_samples = num_samples
        self.timeout = timeout_per_eval

    def solve_problem_offline_mock(self, problem_text: str) -> Dict[str, Any]:
        """离线解题演示（用于本地无 API 时的基准流水线测试）"""
        sample_code = """
# 针对同余方程组与数论极值问题的验证脚本
def solve():
    count = 0
    for x in range(1, 100):
        if x % 7 == 3 and x % 5 == 2:
            count += x
    print(count)

solve()
"""
        ans, err = execute_math_code(sample_code, timeout_seconds=self.timeout)
        candidates = [ans] * self.num_samples
        final_ans = aggregate_votes(candidates)

        return {
            "problem": problem_text,
            "candidates": candidates,
            "final_answer": final_ans,
            "confidence": 1.0 if final_ans is not None else 0.0,
            "error": err,
            "execution_trace": sample_code.strip()
        }

def run_aimo_demo():
    print("=" * 65)
    print("🏆 AIMO Prize / Kaggle 竞赛打榜基线求解器 (硬超时防护升级版)")
    print("📐 架构：ProcessPoolExecutor 硬超时 + Counter 多数投票")
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
    print(f"⏱️ 进程沙箱执行与验算耗时: {duration * 1000:.2f} ms")
    print(f"🎯 最终集成预测答案 (0-999): {result['final_answer']}")
    print(f"🌟 置信度: {result['confidence'] * 100:.1f}%\n")
    print("=" * 65)

if __name__ == "__main__":
    run_aimo_demo()
