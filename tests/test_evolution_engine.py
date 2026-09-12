"""
FunSearch 完整系统端到端单元测试
===============================
检验：
1. 语言模型代码抽取器
2. 多岛屿程序数据库精英 Softmax 选择
3. 交叉与变异 Prompt 构建
4. 岛屿基因迁移与早熟重置
5. 端到端演化调度与审计日志生成
"""

import os
import unittest
from funsearch.core_types import Program, EvaluationResult
from funsearch.programs_database import Island, ProgramsDatabase
from funsearch.prompt_builder import PromptBuilder
from funsearch.llm_client import LLMClient
from funsearch.evolution_engine import EvolutionEngine

class TestEvolutionSystem(unittest.TestCase):

    def test_llm_code_extraction(self):
        sample_markdown = """Here is the solution:
```python
def priority(p: tuple, n: int) -> float:
    return sum(p) * 2.0
```
This should work well."""
        extracted = LLMClient.extract_code(sample_markdown)
        self.assertIn("def priority(p: tuple, n: int) -> float:", extracted)
        self.assertIn("return sum(p) * 2.0", extracted)

    def test_island_elite_selection(self):
        island = Island(island_id=0, max_size=10, temperature=0.5)
        # 注册 3 个不同得分的程序
        island.add_program(Program("code_low", 10, 0, 0))
        island.add_program(Program("code_mid", 20, 0, 0))
        island.add_program(Program("code_high", 30, 0, 0))

        # 检查排序与最佳
        self.assertEqual(island.best_program.score, 30)

        # 采样单个变异亲本
        parents_mut = island.sample_parents(count=1)
        self.assertEqual(len(parents_mut), 1)

        # 采样双亲本交叉
        parents_cross = island.sample_parents(count=2)
        self.assertEqual(len(parents_cross), 2)
        self.assertNotEqual(parents_cross[0].code, parents_cross[1].code)

    def test_database_resetting(self):
        db = ProgramsDatabase(num_islands=2, reset_stagnant_threshold=5)
        # 注册高分程序
        db.register_program("elite_code", 100, 0, 0)

        # 模拟岛屿 1 停滞
        db.islands[1].generations_since_improvement = 6
        db.check_and_reset_islands()

        # 验证岛屿 1 是否被重置为包含精英程序
        self.assertEqual(db.islands[1].best_program.score, 100)
        self.assertEqual(db.islands[1].generations_since_improvement, 0)

    def test_prompt_builder(self):
        p1 = Program("def priority(p, n): return sum(p)", 16, 0, 0)
        p2 = Program("def priority(p, n): return p.count(1)", 18, 0, 0)

        # 测试变异 Prompt
        prompt_mut = PromptBuilder.build_prompt([p1], operator="mutation", dimension=4)
        self.assertIn("Mutation Operator", prompt_mut)
        self.assertIn("Score: 16", prompt_mut)

        # 测试交叉 Prompt
        prompt_cross = PromptBuilder.build_prompt([p1, p2], operator="crossover", dimension=4)
        self.assertIn("Crossover Operator", prompt_cross)
        self.assertIn("Parent Program 1", prompt_cross)
        self.assertIn("Parent Program 2", prompt_cross)

    def test_end_to_end_evolution_engine(self):
        test_log = "experiments/test_trace_tmp.jsonl"
        if os.path.exists(test_log):
            os.remove(test_log)

        engine = EvolutionEngine(
            dimension=3,
            num_islands=2,
            llm_backend="mock",
            temperature=0.7,
            log_file=test_log,
            crossover_prob=0.5
        )

        # 运行 6 轮演化
        summary = engine.run(total_generations=6)

        self.assertGreater(summary["global_best_score"], 0)
        self.assertEqual(summary["total_evaluations"], 8) # 2 seed + 6 steps
        self.assertTrue(os.path.exists(test_log))

        # 清理临时测试日志
        if os.path.exists(test_log):
            os.remove(test_log)

if __name__ == "__main__":
    unittest.main()
