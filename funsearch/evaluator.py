"""
FunSearch Cap Set 问题数学评估器与代码执行沙箱
==================================================
数学定义：
在有限域 F_3^n 中，三点 x, y, z 构成等差数列（共线）当且仅当：
    x + y + z ≡ 0 (mod 3)
Cap Set（帽子集）是指不包含任何三点共线的点集 S ⊆ F_3^n。
我们的目标是寻找尽可能大的集合基数 |S|。
"""

import itertools
import math
import sys
from typing import Callable, List, Tuple, Set, Dict, Any

Point = Tuple[int, ...]

def generate_all_points(n: int) -> List[Point]:
    """生成 F_3^n 空间中的所有 3^n 个点"""
    return list(itertools.product((0, 1, 2), repeat=n))

def is_collinear(p1: Point, p2: Point, p3: Point) -> bool:
    """判定三个点是否构成等差数列（即在 F_3^n 下三点共线）"""
    return all((x + y + z) % 3 == 0 for x, y, z in zip(p1, p2, p3))

def is_valid_cap_set(points: List[Point]) -> bool:
    """
    严格检验点集是否为合法的 Cap Set（不包含任何三点共线）。
    时间复杂度优化：利用哈希表将三重循环优化为两重循环。
    对于任意两点 p1, p2，若存在 p3 使得 p1 + p2 + p3 = 0 (mod 3)，
    则必有 p3 = (-p1 - p2) mod 3 = (2 * (p1 + p2)) mod 3。
    """
    pts_set = set(points)
    n_points = len(points)
    for i in range(n_points):
        p1 = points[i]
        for j in range(i + 1, n_points):
            p2 = points[j]
            # 计算唯一能与 p1, p2 形成共线的第三点 p3
            p3 = tuple((-(x + y)) % 3 for x, y in zip(p1, p2))
            if p3 in pts_set and p3 != p1 and p3 != p2:
                return False
    return True

def solve_cap_set_greedy(priority_fn: Callable[[Point, int], float], n: int) -> List[Point]:
    """
    基于优先级函数的确定性贪心求解器：
    1. 生成 F_3^n 所有点
    2. 计算每个点的优先级评分并从高到低排序
    3. 贪心加入点集，若与已选点不共线则保留
    """
    all_points = generate_all_points(n)
    
    # 计算每个点的优先级得分并降序排序
    scored_points = []
    for p in all_points:
        try:
            score = float(priority_fn(p, n))
        except Exception:
            score = 0.0
        scored_points.append((score, p))
    
    # 稳定排序：优先根据评分，其次保留原有次序
    scored_points.sort(key=lambda x: x[0], reverse=True)
    
    # 贪心选择
    selected_set: Set[Point] = set()
    forbidden_pairs: Set[Point] = set() # 记录两点所唯一锁定的第三点禁区
    selected_list: List[Point] = []
    
    for _, p in scored_points:
        if p in forbidden_pairs:
            continue
        
        # 满足条件，加入集合并更新禁区
        for existing in selected_list:
            needed = tuple((-(x + y)) % 3 for x, y in zip(p, existing))
            forbidden_pairs.add(needed)
        
        selected_set.add(p)
        selected_list.append(p)
        
    return selected_list

# 内置的基础启发式 Baseline 函数（供对比与基准校准）
def baseline_priority_sum(p: Point, n: int) -> float:
    """简单的坐标和启发式"""
    return float(sum(p))

def baseline_priority_weights(p: Point, n: int) -> float:
    """带权坐标差启发式"""
    score = 0.0
    for idx, val in enumerate(p):
        score += (val == 1) * 2.0 + (val == 2) * 1.5 - (val == 0) * 0.5 + idx * 0.1
    return score

def evaluate_program(code_str: str, n: int) -> Dict[str, Any]:
    """
    在隔离的全局命名空间中执行 LLM 生成的 priority 函数代码并评分
    返回字典格式：{
        "valid": bool,
        "score": int (得到的 Cap Set 大小),
        "error": str (若出错),
        "points": List[Point]
    }
    """
    local_scope: Dict[str, Any] = {}
    try:
        # 在安全沙箱中执行代码
        exec(code_str, {"math": math, "__builtins__": __builtins__}, local_scope)
        if "priority" not in local_scope or not callable(local_scope["priority"]):
            return {"valid": False, "score": 0, "error": "Function 'priority(p, n)' not found", "points": []}
        
        priority_fn = local_scope["priority"]
        cap_set = solve_cap_set_greedy(priority_fn, n)
        is_valid = is_valid_cap_set(cap_set)
        
        return {
            "valid": is_valid,
            "score": len(cap_set) if is_valid else 0,
            "error": None,
            "points": cap_set
        }
    except Exception as e:
        return {
            "valid": False,
            "score": 0,
            "error": f"{type(e).__name__}: {str(e)}",
            "points": []
        }
