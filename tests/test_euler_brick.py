"""Unit tests for Euler Brick and Perfect Cuboid arithmetic solver."""

import pytest
from funsearch.euler_brick import (
    generate_saunderson_brick,
    get_brick_metrics,
    is_euler_brick,
    is_perfect_cuboid,
    is_perfect_square,
    search_minimal_residual,
    verify_modular_constraints,
)


def test_is_perfect_square():
    assert is_perfect_square(0) == (True, 0)
    assert is_perfect_square(1) == (True, 1)
    assert is_perfect_square(4) == (True, 2)
    assert is_perfect_square(144) == (True, 12)
    assert is_perfect_square(73225) == (False, 270)
    assert is_perfect_square(-4) == (False, 0)


def test_halcke_smallest_euler_brick_1719():
    """
    Paul Halcke (1719) discovered the smallest Euler brick:
    Edges: (44, 117, 240)
    Face diagonals:
      d_ab = sqrt(44^2 + 117^2) = sqrt(15625) = 125
      d_ac = sqrt(44^2 + 240^2) = sqrt(59536) = 244
      d_bc = sqrt(117^2 + 240^2) = sqrt(71289) = 267
    Space body diagonal:
      g = sqrt(44^2 + 117^2 + 240^2) = sqrt(73225) ≈ 270.60118... (not integer)
    """
    metrics = get_brick_metrics(44, 117, 240)
    assert metrics["is_euler_brick"] is True
    assert metrics["is_perfect_cuboid"] is False

    assert metrics["d_ab"] == 125
    assert metrics["d_ac"] == 244
    assert metrics["d_bc"] == 267
    assert metrics["is_d_ab_int"] is True
    assert metrics["is_d_ac_int"] is True
    assert metrics["is_d_bc_int"] is True

    assert metrics["is_g_int"] is False
    assert 270.60 < metrics["g"] < 270.61
    assert 0.39 < metrics["residual_g"] < 0.41
    assert metrics["integer_lengths_count"] == 6  # 3 edges + 3 face diagonals


def test_second_euler_brick():
    """(85, 132, 720) is another classic Euler brick."""
    assert is_euler_brick(85, 132, 720) is True
    metrics = get_brick_metrics(85, 132, 720)
    assert metrics["d_ab"] == 157
    assert metrics["d_ac"] == 725
    assert metrics["d_bc"] == 732
    assert metrics["is_perfect_cuboid"] is False


def test_ordinary_cuboid():
    """Ordinary cuboid (1, 2, 3) has no integer diagonals."""
    metrics = get_brick_metrics(1, 2, 3)
    assert metrics["is_euler_brick"] is False
    assert metrics["is_perfect_cuboid"] is False
    assert metrics["integer_lengths_count"] == 3


def test_saunderson_brick_generation():
    """Saunderson (1740) formula using Pythagorean triple (3, 4, 5)."""
    # u=3, v=4, w=5 -> u^2 + v^2 = 9 + 16 = 25 = w^2
    a, b, c = generate_saunderson_brick(3, 4, 5)
    metrics = get_brick_metrics(a, b, c)
    assert metrics["is_euler_brick"] is True
    assert metrics["integer_lengths_count"] == 6


def test_modular_constraints():
    """Check modular sieve conditions."""
    # Halcke brick (44, 117, 240)
    # 240 % 16 == 0 (passes mod 16)
    # 240 % 5 == 0 (passes mod 5)
    # 44 % 11 == 0 (passes mod 11)
    # Even edges: 44, 240 (at least two even)
    res = verify_modular_constraints(44, 117, 240)
    assert res["pass_mod4"] is True
    assert res["pass_mod16"] is True
    assert res["pass_mod5"] is True
    assert res["pass_mod11"] is True
    assert res["all_passed"] is True

    # Violating brick (1, 3, 5) fails mod constraints
    res_fail = verify_modular_constraints(1, 3, 5)
    assert res_fail["pass_mod4"] is False
    assert res_fail["pass_mod16"] is False
    assert res_fail["all_passed"] is False


def test_search_minimal_residual():
    """Verify search identifies Halcke's brick among smaller ranges."""
    results = search_minimal_residual(max_edge=250, top_k=3)
    assert len(results) > 0
    # Smallest Euler brick (44, 117, 240) should be discovered
    found_halcke = any(r["a"] == 44 and r["b"] == 117 and r["c"] == 240 for r in results)
    assert found_halcke is True
