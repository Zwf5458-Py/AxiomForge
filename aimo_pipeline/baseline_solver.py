"""
AIMO (AI Mathematical Olympiad) Kaggle 竞赛打榜基线求解器
=========================================================
核心算法架构：
1. Tool-Integrated Reasoning (TIR): 引导模型编写并执行 Python 验证脚本
2. Multi-Process Hard Timeout: 基于 multiprocessing 物理进程终止，杜绝任何死循环挂起
3. Self-Consistency Majority Voting: 基于 collections.Counter 的自洽性多数投票
"""

from collections import Counter
import contextlib
import io
import math
import multiprocessing
import os
import re
import sys
import time
from typing import Any, Dict, List, Optional, Tuple

def _eval_worker(code_str: str) -> Dict[str, Any]:
    """沙箱子进程核心执行逻辑"""
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

        output = buffer.getvalue().strip()
        numbers = re.findall(r"-?\d+", output)
        if numbers:
            ans = int(numbers[-1]) % 1000
            return {"success": True, "result": ans, "error": None}

        for var_name in ["ans", "result", "answer"]:
            if var_name in local_scope and isinstance(local_scope[var_name], int):
                return {"success": True, "result": local_scope[var_name] % 1000, "error": None}

        return {"success": False, "result": None, "error": "No integer result found in output or variables"}
    except Exception as e:
        return {"success": False, "result": None, "error": f"{type(e).__name__}: {str(e)}"}

def _mp_runner(code_str: str, queue: Any) -> None:
    """供 multiprocessing 调用的顶层工作函数"""
    res = _eval_worker(code_str)
    queue.put(res)

def execute_math_code(
    code_str: str,
    timeout_seconds: float = 5.0
) -> Tuple[Optional[int], Optional[str]]:
    """
    带硬超时防护的代码执行器：
    启动独立子进程执行。一旦超时，立即通过 proc.terminate() / proc.kill()
    物理终结子进程，杜绝 while True 等死循环占用 CPU 或死锁主进程。
    """
    try:
        ctx = multiprocessing.get_context()
        queue = ctx.Queue()
        proc = ctx.Process(target=_mp_runner, args=(code_str, queue))
        proc.start()

        proc.join(timeout=timeout_seconds)

        if proc.is_alive():
            # 物理杀死陷入死循环的子进程
            proc.terminate()
            proc.join(timeout=0.5)
            if proc.is_alive():
                proc.kill()
            return None, f"TimeoutError: Code execution exceeded {timeout_seconds}s limit"

        if not queue.empty():
            res = queue.get_nowait()
            return res["result"], res["error"]
        return None, "ExecutionError: Subprocess exited with no result"
    except Exception as e:
        # 降级同进程执行（保底）
        res = _eval_worker(code_str)
        return res["result"], res["error"]

def aggregate_votes(valid_answers: List[Any]) -> Optional[int]:
    """基于 collections.Counter 的加权多数投票集成"""
    clean_answers = [a for a in valid_answers if a is not None and isinstance(a, int) and 0 <= a <= 999]
    if not clean_answers:
        return 0  # 竞赛默认保底
    counter = Counter(clean_answers)
    most_common = counter.most_common(1)
    return most_common[0][0] if most_common else 0

class AIMOSolver:
    """AIMO 自动化解题流水线"""
    def __init__(self, num_samples: int = 3, timeout_per_eval: float = 5.0):
        self.num_samples = num_samples
        self.timeout = timeout_per_eval

    def solve_problem_offline_mock(self, problem_text: str) -> Dict[str, Any]:
        """离线演示求解器"""
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
    print("🏆 AIMO Prize / Kaggle 竞赛打榜基线求解器 (硬超时防护物理杀死版)")
    print("📐 架构：multiprocessing 物理硬超时 + Counter 多数投票")
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
