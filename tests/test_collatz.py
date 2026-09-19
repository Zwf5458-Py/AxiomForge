"""Unit tests for Collatz Conjecture (Hailstone) dynamical sequence algorithms."""

import pytest


def get_collatz_sequence(n: int) -> list[int]:
    """Generate the full Collatz trajectory starting from n down to 1."""
    if n <= 0:
        raise ValueError("Collatz sequence is only defined for positive integers.")
    seq = [n]
    curr = n
    while curr != 1:
        if curr % 2 == 0:
            curr = curr // 2
        else:
            curr = 3 * curr + 1
        seq.append(curr)
    return seq


def get_collatz_stats(n: int) -> dict:
    """Calculate key dynamical stats: total steps, stopping time, peak value, odd/even counts."""
    seq = get_collatz_sequence(n)
    total_steps = len(seq) - 1
    peak_value = max(seq)
    odd_steps = sum(1 for x in seq[:-1] if x % 2 != 0)
    even_steps = total_steps - odd_steps

    # Stopping time: inf { k : a_k < a_0 }
    stopping_time = 0
    for idx, val in enumerate(seq):
        if idx > 0 and val < n:
            stopping_time = idx
            break

    return {
        "start": n,
        "total_steps": total_steps,
        "stopping_time": stopping_time,
        "peak_value": peak_value,
        "odd_steps": odd_steps,
        "even_steps": even_steps,
        "expansion_ratio": peak_value / n,
    }


def get_inverse_collatz_children(n: int) -> list[tuple[int, str]]:
    """
    Get children in the inverse Collatz tree rooted upwards from n.
    - Even branch: 2 * n (always valid)
    - Odd branch: (n - 1) // 3 (valid iff n % 6 == 4 and n > 4)
    """
    children = [(2 * n, "even")]
    if n % 6 == 4 and n > 4:
        odd_child = (n - 1) // 3
        if odd_child % 2 != 0:
            children.append((odd_child, "odd"))
    return children


def find_max_stopping_time_in_range(start: int, end: int) -> tuple[int, int, int]:
    """Find the seed with maximal stopping time in [start, end]. Returns (best_seed, max_steps, peak)."""
    best_seed = start
    max_steps = -1
    best_peak = -1
    for x in range(start, end + 1):
        stats = get_collatz_stats(x)
        if stats["total_steps"] > max_steps:
            max_steps = stats["total_steps"]
            best_seed = x
            best_peak = stats["peak_value"]
    return best_seed, max_steps, best_peak


def test_collatz_trivial():
    seq_1 = get_collatz_sequence(1)
    assert seq_1 == [1]
    stats_1 = get_collatz_stats(1)
    assert stats_1["total_steps"] == 0
    assert stats_1["peak_value"] == 1


def test_collatz_classic_seed_27():
    """Seed 27 is the legendary hailstone seed with 111 steps and peak 9232."""
    stats = get_collatz_stats(27)
    assert stats["total_steps"] == 111
    assert stats["peak_value"] == 9232
    assert stats["odd_steps"] == 41
    assert stats["even_steps"] == 70


def test_inverse_collatz_tree_branching():
    """Verify reverse tree rules."""
    # From 1: only 2*1=2 (since 1 % 6 != 4)
    assert get_inverse_collatz_children(1) == [(2, "even")]

    # From 4: 2*4=8 (since 4 is excluded from generating odd child (4-1)/3=1 to avoid 1-4 loop)
    assert get_inverse_collatz_children(4) == [(8, "even")]

    # From 16: 16 % 6 == 4 and 16 > 4. Odd child: (16-1)/3 = 5. Even: 32
    children_16 = get_inverse_collatz_children(16)
    assert (32, "even") in children_16
    assert (5, "odd") in children_16


def test_range_max_stopping_time():
    """In [1, 20], seed 18 or 19 reaches 20 steps."""
    best_seed, max_steps, best_peak = find_max_stopping_time_in_range(1, 20)
    assert max_steps == 20
    assert best_seed in [18, 19]


def test_collatz_seed_11_stopping_time_vs_total_steps():
    """
    Mathematical verification of Seed 11:
    - Stopping time (first drops below 11): Step 8 (a_8 = 10 < 11)
    - Total stopping time (reaches 1): Step 14 (a_14 = 1)
    """
    stats = get_collatz_stats(11)
    assert stats["stopping_time"] == 8, f"Seed 11 stopping time must be 8, got {stats['stopping_time']}"
    assert stats["total_steps"] == 14, f"Seed 11 total steps must be 14, got {stats['total_steps']}"
    assert stats["peak_value"] == 52, f"Seed 11 peak value must be 52, got {stats['peak_value']}"

