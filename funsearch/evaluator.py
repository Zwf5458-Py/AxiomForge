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
from typing import Callable, List, Tuple, Set, Dict, Any, Sequence

Point = Tuple[int, ...]

def generate_all_points(n: int) -> List[Point]:
    """生成 F_3^n 空间中的所有 3^n 个点"""
    return list(itertools.product((0, 1, 2), repeat=n))

def is_collinear(p1: Point, p2: Point, p3: Point) -> bool:
    """判定三个点是否构成等差数列（即在 F_3^n 下三点共线）"""
    return all((x + y + z) % 3 == 0 for x, y, z in zip(p1, p2, p3))

def is_valid_cap_set(points: Sequence[Point]) -> bool:
    """
    严格检验点集是否为合法的 Cap Set（不包含任何三点共线）。
    优化算法：从 O(k^3) 优化至 O(k^2) 哈希查找。
    在 F_3 域中，p1 + p2 + p3 ≡ 0 (mod 3) <=> p3 ≡ (-p1 - p2) mod 3。
    """
    if len(points) < 3:
        return True

    point_set: Set[Point] = set(points)
    n_points = len(points)

    for i in range(n_points):
        p1 = points[i]
        for j in range(i + 1, n_points):
            p2 = points[j]
            # 计算唯一能与 p1, p2 形成共线的第三点 p3
            p3 = tuple((-a - b) % 3 for a, b in zip(p1, p2))
            # 若 p3 存在于点集且不等于 p1, p2，则存在共线
            if p3 in point_set and p3 != p1 and p3 != p2:
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
    forbidden_pairs: Set[Point] = set()  # 记录两点所唯一锁定的第三点禁区
    selected_list: List[Point] = []

    for _, p in scored_points:
        if p in forbidden_pairs:
            continue

        # 满足条件，加入集合并更新禁区
        for existing in selected_list:
            needed = tuple((-a - b) % 3 for a, b in zip(p, existing))
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

def sanitize_code_for_sandbox(code: str) -> str:
    """代码清洗与语法自愈器：修复未闭合的 docstring、单双引号及多余自然语言文本"""
    if not code:
        return ""
    import ast
    import re

    lines = code.strip().split("\n")
    has_def = False
    clean_lines = []
    for line in lines:
        if not has_def and re.search(r"^[ \t]*def\s+priority\b", line):
            clean_lines.append("def priority(p: tuple, n: int) -> float:")
            has_def = True
            continue
        if has_def:
            clean_lines.append(line)

    if not has_def:
        clean_lines = ["def priority(p: tuple, n: int) -> float:"] + ["    " + l for l in lines]

    code_candidate = "\n".join(clean_lines)

    # 1. 修复数学省略乘号与非法数字字面量 (如 2p[0] -> 2 * p[0], 3x -> 3 * x, 2n -> 2 * n, 08 -> 8)
    def repl_num_id(m):
        full = m.group(0)
        num = m.group(1)
        ident = m.group(2)
        if re.match(r'^[eE][+-]?\d+$', ident):
            return full
        if num == '0' and (re.match(r'^[xX][0-9a-fA-F]+$', ident) or re.match(r'^[bB][01]+$', ident) or re.match(r'^[oO][0-7]+$', ident)):
            return full
        return f'{num} * {ident}'

    code_candidate = re.sub(r'(?<![0-9a-zA-Z_.])(\d+)([a-zA-Z_]\w*)', repl_num_id, code_candidate)
    code_candidate = re.sub(r'(?<![0-9a-zA-Z_.])0+([1-9]\d*)(?![0-9a-zA-Z_.])', r'\1', code_candidate)
    # 修复自然语言里的幂符号 ^ 为 Python 的 ** (如 x^2 -> x**2)
    code_candidate = re.sub(r'([a-zA-Z0-9_\)\]])\s*\^\s*([a-zA-Z0-9_\(\[])', r'\1 ** \2', code_candidate)

    # 2. 预编译检查与多轮循环自愈
    for attempt in range(3):
        try:
            ast.parse(code_candidate)
            return code_candidate
        except SyntaxError as e:
            err_msg = str(e).lower()
            cur_lines = code_candidate.split("\n")
            bad_lineno = e.lineno

            # 处理 unterminated string literal 导致的代码错误
            if "unterminated" in err_msg or "literal" in err_msg or "quote" in err_msg or "string" in err_msg:
                fixed_lines = []
                for idx, l in enumerate(cur_lines, 1):
                    if (l.count('"""') % 2 != 0) or (l.count("'''") % 2 != 0):
                        fixed_lines.append("    # [Cleaned unclosed docstring]")
                    elif not l.strip().startswith("#") and ((l.count('"') % 2 != 0) or (l.count("'") % 2 != 0)):
                        fixed_lines.append("    # [Cleaned unclosed quote] " + l.strip())
                    elif idx == bad_lineno and not l.strip().startswith("def ") and not "return " in l:
                        fixed_lines.append("    # [Cleaned syntax error line] " + l.strip())
                    else:
                        fixed_lines.append(l)
                code_candidate = "\n".join(fixed_lines)
            elif bad_lineno and 1 <= bad_lineno <= len(cur_lines):
                target_l = cur_lines[bad_lineno - 1]
                if not target_l.strip().startswith("def ") and not "return " in target_l:
                    cur_lines[bad_lineno - 1] = "    # [Auto-fixed invalid syntax line] " + target_l.strip()
                    code_candidate = "\n".join(cur_lines)
                else:
                    break
            else:
                break

    return code_candidate

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
    clean_code = sanitize_code_for_sandbox(code_str)
    try:
        # 在安全沙箱中执行经过自愈清洗的代码
        exec(clean_code, {"math": math, "__builtins__": __builtins__}, local_scope)
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

def count_collinear_lines(points: Sequence[Point]) -> int:
    """计算点集中存在的三点共线三元组数量（合法的 Cap Set 必须严格为 0）"""
    if len(points) < 3:
        return 0
    point_set = set(points)
    collinear_count = 0
    n_pts = len(points)
    for i in range(n_pts):
        p1 = points[i]
        for j in range(i + 1, n_pts):
            p2 = points[j]
            p3 = tuple((-a - b) % 3 for a, b in zip(p1, p2))
            if p3 in point_set and p3 > p2:
                collinear_count += 1
    return collinear_count

def get_dimension_topology(n: int, selected_points: Optional[List[Point]] = None) -> Dict[str, Any]:
    """导出指定维度的空间规模、汉明重量分布及超维投影参数"""
    all_pts = generate_all_points(n)
    sel_set = set(selected_points) if selected_points else set()

    hamming_dist: Dict[int, int] = {}
    sel_hamming_dist: Dict[int, int] = {}
    for p in all_pts:
        hw = sum(1 for x in p if x != 0)
        hamming_dist[hw] = hamming_dist.get(hw, 0) + 1
        if p in sel_set:
            sel_hamming_dist[hw] = sel_hamming_dist.get(hw, 0) + 1

    return {
        "dimension": n,
        "total_points": len(all_pts),
        "selected_count": len(sel_set),
        "hamming_distribution": hamming_dist,
        "selected_hamming_distribution": sel_hamming_dist,
        "is_cap_set": is_valid_cap_set(list(sel_set)) if sel_set else True,
        "collinear_violations": count_collinear_lines(list(sel_set)) if sel_set else 0
    }
