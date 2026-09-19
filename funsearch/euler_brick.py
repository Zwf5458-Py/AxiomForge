"""Euler Brick and Perfect Cuboid arithmetic engine and Diophantine solver."""

import math
from typing import Any


def is_perfect_square(n: int) -> tuple[bool, int]:
    """Check if an integer is a perfect square. Returns (is_square, root)."""
    if n < 0:
        return False, 0
    root = math.isqrt(n)
    return root * root == n, root


def get_brick_metrics(a: int, b: int, c: int) -> dict[str, Any]:
    """
    Calculate all 7 key geometric lengths for a cuboid (a, b, c) and their integrality.
    1. Edge a
    2. Edge b
    3. Edge c
    4. Face diagonal d_ab = sqrt(a^2 + b^2)
    5. Face diagonal d_ac = sqrt(a^2 + c^2)
    6. Face diagonal d_bc = sqrt(b^2 + c^2)
    7. Space body diagonal g = sqrt(a^2 + b^2 + c^2)
    """
    a, b, c = abs(int(a)), abs(int(b)), abs(int(c))
    if a == 0 or b == 0 or c == 0:
        raise ValueError("Edges must be non-zero positive integers.")

    # Face diagonals
    sq_ab = a * a + b * b
    is_ab_int, root_ab = is_perfect_square(sq_ab)
    val_ab = root_ab if is_ab_int else math.sqrt(sq_ab)

    sq_ac = a * a + c * c
    is_ac_int, root_ac = is_perfect_square(sq_ac)
    val_ac = root_ac if is_ac_int else math.sqrt(sq_ac)

    sq_bc = b * b + c * c
    is_bc_int, root_bc = is_perfect_square(sq_bc)
    val_bc = root_bc if is_bc_int else math.sqrt(sq_bc)

    # Space body diagonal
    sq_g = a * a + b * b + c * c
    is_g_int, root_g = is_perfect_square(sq_g)
    val_g = root_g if is_g_int else math.sqrt(sq_g)

    # Residual towards nearest integer for body diagonal
    nearest_g = round(val_g)
    residual_g = abs(val_g - nearest_g)

    is_euler = is_ab_int and is_ac_int and is_bc_int
    is_perfect = is_euler and is_g_int

    int_count = 3 + int(is_ab_int) + int(is_ac_int) + int(is_bc_int) + int(is_g_int)

    return {
        "a": a,
        "b": b,
        "c": c,
        "d_ab": val_ab,
        "is_d_ab_int": is_ab_int,
        "d_ac": val_ac,
        "is_d_ac_int": is_ac_int,
        "d_bc": val_bc,
        "is_d_bc_int": is_bc_int,
        "g": val_g,
        "is_g_int": is_g_int,
        "residual_g": residual_g,
        "is_euler_brick": is_euler,
        "is_perfect_cuboid": is_perfect,
        "integer_lengths_count": int_count,  # Out of 7
    }


def is_euler_brick(a: int, b: int, c: int) -> bool:
    """Return True iff cuboid (a, b, c) is an Euler brick (all face diagonals are integers)."""
    try:
        metrics = get_brick_metrics(a, b, c)
        return metrics["is_euler_brick"]
    except ValueError:
        return False


def is_perfect_cuboid(a: int, b: int, c: int) -> bool:
    """Return True iff cuboid (a, b, c) is a perfect cuboid (face & body diagonals are all integers)."""
    try:
        metrics = get_brick_metrics(a, b, c)
        return metrics["is_perfect_cuboid"]
    except ValueError:
        return False


def verify_modular_constraints(a: int, b: int, c: int) -> dict[str, bool]:
    """
    Check necessary modular arithmetic conditions proven by number theorists
    that any potential Perfect Cuboid MUST satisfy.
    1. mod 4: At most one edge is odd. At least two edges are divisible by 4.
    2. mod 16: At least one edge is divisible by 16.
    3. mod 5: At least one edge is divisible by 5. (Furthermore, face diagonals mod 5 constraints).
    4. mod 11: At least one edge is divisible by 11.
    """
    edges = [abs(int(a)), abs(int(b)), abs(int(c))]

    # 1. mod 4
    even_count = sum(1 for e in edges if e % 2 == 0)
    div4_count = sum(1 for e in edges if e % 4 == 0)
    pass_mod4 = (even_count >= 2) and (div4_count >= 1)

    # 2. mod 16
    pass_mod16 = any(e % 16 == 0 for e in edges)

    # 3. mod 5
    pass_mod5 = any(e % 5 == 0 for e in edges)

    # 4. mod 11
    pass_mod11 = any(e % 11 == 0 for e in edges)

    all_passed = pass_mod4 and pass_mod16 and pass_mod5 and pass_mod11

    return {
        "pass_mod4": pass_mod4,
        "pass_mod16": pass_mod16,
        "pass_mod5": pass_mod5,
        "pass_mod11": pass_mod11,
        "all_passed": all_passed,
    }


def generate_saunderson_brick(u: int, v: int, w: int) -> tuple[int, int, int]:
    """
    Generate an Euler cuboid using Nicholas Saunderson's classical formula (1740).
    Given u, v, w such that u^2 + v^2 = w^2 (a Pythagorean triple),
    Saunderson's derived brick has:
      a = u * |4v^2 - w^2|
      b = v * |4u^2 - w^2|
      c = 4 * u * v * w
    This cuboid guarantees integer face diagonals:
      d_ab = w^3
      d_bc = v * (4u^2 + w^2)
      d_ac = u * (4v^2 + w^2)
    Note: Body diagonal is typically irrational.
    """
    u, v, w = abs(int(u)), abs(int(v)), abs(int(w))
    if u * u + v * v != w * w:
        raise ValueError("Inputs (u, v, w) must form a valid Pythagorean triple: u^2 + v^2 = w^2")

    a = u * abs(4 * v * v - w * w)
    b = v * abs(4 * u * u - w * w)
    c = 4 * u * v * w

    # Reduce by gcd to get primitive representative
    g = math.gcd(a, math.gcd(b, c))
    if g > 1:
        a //= g
        b //= g
        c //= g

    return a, b, c


def search_minimal_residual(
    max_edge: int = 300,
    top_k: int = 5,
) -> list[dict[str, Any]]:
    """
    Search for Euler bricks or cuboids with minimal body diagonal residual epsilon.
    Epsilon = |sqrt(a^2 + b^2 + c^2) - round(sqrt(a^2 + b^2 + c^2))|
    """
    results = []

    # Pre-filter Pythagorean pairs
    squares = {x * x: x for x in range(1, max_edge * 2 + 1)}

    for a in range(1, max_edge + 1):
        a2 = a * a
        for b in range(a, max_edge + 1):
            ab2 = a2 + b * b
            if ab2 not in squares:
                continue
            for c in range(b, max_edge + 1):
                ac2 = a2 + c * c
                if ac2 not in squares:
                    continue
                bc2 = b * b + c * c
                if bc2 not in squares:
                    continue

                # Found an Euler brick!
                metrics = get_brick_metrics(a, b, c)
                results.append(metrics)

    # Sort by residual of body diagonal ascending
    results.sort(key=lambda m: m["residual_g"])
    return results[:top_k]
