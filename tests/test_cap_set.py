"""
Cap Set 数学判定与 FunSearch 评测器单元测试
"""

import unittest
from funsearch.evaluator import (
    generate_all_points,
    is_collinear,
    is_valid_cap_set,
    solve_cap_set_greedy,
    baseline_priority_weights,
    evaluate_program
)

class TestCapSetEvaluator(unittest.TestCase):

    def test_point_generation(self):
        pts2 = generate_all_points(2)
        self.assertEqual(len(pts2), 9)
        pts3 = generate_all_points(3)
        self.assertEqual(len(pts3), 27)

    def test_collinear_detection(self):
        # 模 3 下: (0,0) + (1,1) + (2,2) = (3,3) ≡ (0,0) (mod 3)，三点共线
        self.assertTrue(is_collinear((0, 0), (1, 1), (2, 2)))
        # (0,0) + (0,1) + (0,2) = (0,3) ≡ (0,0) (mod 3)，三点共线
        self.assertTrue(is_collinear((0, 0), (0, 1), (0, 2)))
        # (0,0), (0,1), (1,1): 和为 (1,2) 不为 0，不共线
        self.assertFalse(is_collinear((0, 0), (0, 1), (1, 1)))

    def test_valid_cap_set_verification(self):
        # 已知包含共线点的集合
        invalid_set = [(0, 0), (1, 1), (2, 2)]
        self.assertFalse(is_valid_cap_set(invalid_set))

        # n=2 下的最大 Cap Set（基数为 4），例如：
        valid_cap_4 = [(1, 1), (1, 2), (2, 1), (2, 2)]
        self.assertTrue(is_valid_cap_set(valid_cap_4))

    def test_greedy_solver_accuracy(self):
        # 使用内置权重启发式求解 n=2
        cap2 = solve_cap_set_greedy(baseline_priority_weights, 2)
        self.assertTrue(is_valid_cap_set(cap2))
        self.assertEqual(len(cap2), 4)

        # 求解 n=3
        cap3 = solve_cap_set_greedy(baseline_priority_weights, 3)
        self.assertTrue(is_valid_cap_set(cap3))
        # 验证能达到或接近理论最优（理论最大为 9）
        self.assertGreaterEqual(len(cap3), 8)

    def test_sandbox_evaluation(self):
        # 正常有效代码
        valid_code = "def priority(p, n):\n    return sum(p)"
        res = evaluate_program(valid_code, 2)
        self.assertTrue(res["valid"])
        self.assertGreater(res["score"], 0)

        # 语法错误代码
        syntax_err_code = "def priority(p, n):\n    return sum(p) +++ "
        res_err = evaluate_program(syntax_err_code, 2)
        self.assertFalse(res_err["valid"])
        self.assertIn("SyntaxError", res_err["error"])

if __name__ == "__main__":
    unittest.main()
