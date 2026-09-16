"""
AxiomForge 高维求解器与代数先验系统单元测试
==========================================
覆盖 FastCapSetEnv 三进制索引映射、共线三点快速判定、
模因局部搜索单调性及 6D/7D 代数先验有效性。
"""

import pytest
from funsearch.fast_solver import FastCapSetEnv
from funsearch.evaluator import is_valid_cap_set, baseline_priority_weights
from funsearch.high_dim_priors import generate_high_dim_symmetry_code

def test_fast_env_initialization():
    """测试三进制环境基本属性与维度映射"""
    for n in [3, 4, 5]:
        env = FastCapSetEnv(n)
        assert len(env.points) == 3 ** n
        assert len(env.point_to_idx) == 3 ** n
        assert len(env.neg_idx) == 3 ** n

def test_third_point_algebraic_consistency():
    """测试 (-x - y) mod 3 三点共线定理的数学等价性"""
    env = FastCapSetEnv(4)
    # 取任意两个不同点
    idx1, idx2 = 5, 12
    third_idx = env.third_point_idx(idx1, idx2)
    p1 = env.points[idx1]
    p2 = env.points[idx2]
    p3 = env.points[third_idx]
    # 验证三点对应坐标模 3 和为 0
    assert all((a + b + c) % 3 == 0 for a, b, c in zip(p1, p2, p3))

def test_fast_solver_validity():
    """测试 fast_solver 贪心输出的结果 100% 为合法 Cap Set"""
    env = FastCapSetEnv(5)
    indices = env.solve_greedy(baseline_priority_weights)
    pts = [env.points[i] for i in indices]
    assert env.is_valid_cap_set(indices)
    assert is_valid_cap_set(pts)
    assert len(pts) == 32  # 5 维超立方体朴素基准

def test_local_search_validity_and_monotonicity():
    """测试 1-Swap 局部搜索保持无三点共线且非降"""
    env = FastCapSetEnv(4)
    init_indices = env.solve_greedy(baseline_priority_weights)
    refined = env.local_search_1swap(init_indices, max_evals=10)
    assert env.is_valid_cap_set(refined)
    assert len(refined) >= len(init_indices)

def test_high_dim_priors_execution():
    """测试 6 维与 7 维专属先验代码语法与返回值合法性"""
    for n in [6, 7]:
        code = generate_high_dim_symmetry_code(n)
        local_scope = {}
        exec(code, local_scope)
        priority_fn = local_scope["priority"]
        test_pt = tuple([1] * n)
        score = priority_fn(test_pt, n)
        assert isinstance(score, float)
