"""
AxiomForge 高维代数结构先验引擎 (High-Dim Algebraic Priors)
===========================================================
专为 F_3^6 (729 点) 与 F_3^7 (2,187 点) 极值 Cap Set 搜索设计的高阶代数先验系统。
突破核心：
1. 双仿射超平面正交分解 (Orthogonal Dual-Hyperplane Slicing: F_3^k x F_3^(n-k))；
2. 反演对极极化破缺 (Inversion Antisymmetry Polarization: x vs. -x mod 3)；
3. 黄金汉明权重层过滤 (Golden Hamming Weight L_0 Layers)；
4. 离散二次型曲率引导 (Quadratic Form / Bilinear Curvature Modulo 3)。
"""

import random
from typing import List, Callable, Tuple

Point = Tuple[int, ...]

def generate_high_dim_symmetry_code(n: int) -> str:
    """针对高维 F_3^n (特别针对 n=6, 7) 自动生成高质量的代数先验程序代码"""
    split = n // 2
    c_target1 = random.choice([0, 1, 2])
    c_target2 = random.choice([0, 1, 2])
    target_l0 = (n * 2) // 3  # 6D 对应 4, 7D 对应 4 或 5
    w_plane = round(random.uniform(80.0, 150.0), 1)
    w_l0 = round(random.uniform(40.0, 80.0), 1)
    w_polar = round(random.uniform(20.0, 50.0), 1)
    w_mod = round(random.uniform(10.0, 30.0), 1)

    template_type = random.choice(["dual_hyperplane", "inversion_polar", "quadratic_hamming"])

    if template_type == "dual_hyperplane":
        # 模式 1：正交仿射双超平面切片 (分解空间为 F_3^k x F_3^(n-k))
        return f"""def priority(p: tuple, n: int) -> float:
    # 高维代数先验：正交双超平面切片 + 汉明黄金层
    h1 = sum(p[:{split}]) % 3
    h2 = sum(p[{split}:]) % 3
    plane_score = {w_plane} if (h1 == {c_target1} and h2 == {c_target2}) else 0.0

    # 汉明 L0 范数约束 (黄金切片层)
    l0 = sum(1 for x in p if x != 0)
    l0_score = {w_l0} if l0 in [{target_l0}, {target_l0 + 1}] else 0.0

    # 反演对极破缺：首个非零元极化，打破 x 与 -x 的共线对称
    polar = 0.0
    for v in p:
        if v != 0:
            polar = {w_polar} if v == 1 else -{w_polar}
            break

    # 模 3 奇偶微调
    balance = (p.count(1) - p.count(2)) % 3
    return float(plane_score + l0_score + polar + (balance == 0) * {w_mod})"""

    elif template_type == "inversion_polar":
        # 模式 2：反演极化对称破缺 + 循环循环群差分
        return f"""def priority(p: tuple, n: int) -> float:
    # 高维代数先验：强反演对极破缺 + 环形自相关
    l0 = sum(1 for x in p if x != 0)
    l0_bonus = {w_l0} if l0 == {target_l0} else (-10.0 * abs(l0 - {target_l0}))

    # 环形循环相邻坐标差分
    diff_sum = sum((p[i] - p[(i + 1) % n]) % 3 for i in range(n))
    diff_score = {w_plane} if diff_sum % 3 == {c_target1} else 0.0

    # 极化破缺
    first_nonzero = 0
    for val in p:
        if val != 0:
            first_nonzero = val
            break
    polar_bonus = {w_polar} if first_nonzero == 1 else -{w_polar}

    # 仿射全局和同余
    global_mod = sum(p) % 3
    return float(diff_score + l0_bonus + polar_bonus + (global_mod == {c_target2}) * {w_mod})"""

    else:
        # 模式 3：离散二次型曲率 (Quadratic Bilinear Form) + 模不变性
        return f"""def priority(p: tuple, n: int) -> float:
    # 高维代数先验：二次型离散曲率 + 模不变性
    quad = sum(p[i] * p[(i + 1) % n] for i in range(n)) % 3
    quad_score = {w_plane} if quad == {c_target1} else 0.0

    l0 = sum(1 for x in p if x != 0)
    l0_score = {w_l0} if l0 in [{target_l0 - 1}, {target_l0}] else 0.0

    # 正交投影切片
    proj = (p[0] * 2 + p[-1]) % 3
    proj_score = {w_polar} if proj == {c_target2} else 0.0

    return float(quad_score + l0_score + proj_score)"""

def get_high_dim_heuristic_population(n: int, size: int = 10) -> List[str]:
    """生成一批高维专属多样性代数启发式函数种群"""
    return [generate_high_dim_symmetry_code(n) for _ in range(size)]
