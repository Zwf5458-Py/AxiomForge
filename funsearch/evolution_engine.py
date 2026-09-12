"""
FunSearch 演化调度总控引擎 (EvolutionEngine)
============================================
将“程序数据库 + 精英选择 + 提示词组装 + 真实/模拟LLM调用 + 沙箱反馈 + 岛屿演化”
全流程组装为可自动化闭环运行的科研引擎。
"""

import json
import os
import random
import time
from typing import Dict, Any, List, Optional

from funsearch.core_types import Program, EvaluationResult, GenerationTrace
from funsearch.programs_database import ProgramsDatabase
from funsearch.prompt_builder import PromptBuilder
from funsearch.llm_client import LLMClient
from funsearch.evaluator import evaluate_program, is_valid_cap_set

SEED_PROGRAM_CAPSET = """def priority(p: tuple, n: int) -> float:
    # 基础基线函数：坐标和启发式
    return float(sum(p))"""

class EvolutionEngine:
    """FunSearch 自动化演化总控引擎"""
    def __init__(
        self,
        dimension: int = 4,
        num_islands: int = 4,
        llm_backend: str = "mock",
        llm_model: Optional[str] = None,
        api_key: Optional[str] = None,
        api_base: Optional[str] = None,
        temperature: float = 0.7,
        log_file: Optional[str] = None,
        crossover_prob: float = 0.3
    ):
        self.dimension = dimension
        self.crossover_prob = crossover_prob
        self.log_file = log_file or f"experiments/trace_n{dimension}.jsonl"

        # 1. 初始化演化数据库与岛屿集群
        self.database = ProgramsDatabase(num_islands=num_islands)

        # 2. 初始化大模型客户端
        self.llm_client = LLMClient(
            backend=llm_backend,
            model=llm_model,
            api_key=api_key,
            api_base=api_base,
            temperature=temperature
        )

        # 3. 记录跟踪轨迹
        self.traces: List[GenerationTrace] = []
        os.makedirs(os.path.dirname(self.log_file), exist_ok=True) if os.path.dirname(self.log_file) else None

        # 4. 初始化种子程序
        self._initialize_islands_with_seed()

    def _initialize_islands_with_seed(self):
        """用初始种子程序填满各岛屿的原始基因池"""
        t0 = time.time()
        res_dict = evaluate_program(SEED_PROGRAM_CAPSET, self.dimension)
        eval_res = EvaluationResult(
            valid=res_dict["valid"],
            score=res_dict["score"],
            points=res_dict["points"],
            execution_time=time.time() - t0,
            error=res_dict["error"]
        )

        for isl_id in range(self.database.num_islands):
            self.database.register_program(
                code=SEED_PROGRAM_CAPSET,
                score=eval_res.score,
                generation=0,
                island_id=isl_id,
                parent_ids=[],
                operator="seed"
            )

    def step(self, generation: int) -> Optional[GenerationTrace]:
        """执行单步演化循环：采样亲本 -> 提示组装 -> 模型生成 -> 沙箱评测 -> 基因入库"""
        # 1. 轮换激活岛屿
        active_island = (generation - 1) % self.database.num_islands

        # 2. 决定算子类型 (变异 Mutation 或 交叉 Crossover)
        operator = "crossover" if random.random() < self.crossover_prob else "mutation"

        # 3. 精英 Softmax 采样亲本
        parents = self.database.sample_parents(active_island, operator=operator)
        if operator == "crossover" and len(parents) < 2:
            operator = "mutation"
            parents = self.database.sample_parents(active_island, operator="mutation")

        parent_ids = [p.id for p in parents]

        # 4. 组装符合 FunSearch 规范的提示词
        prompt = PromptBuilder.build_prompt(parents, operator, self.dimension)

        # 5. 调用语言模型（真实 API 或确定性模拟器）
        raw_completion, extracted_code = self.llm_client.complete(prompt)

        # 6. 在沙箱中严格执行并评估数学得分
        t_eval_start = time.time()
        eval_dict = evaluate_program(extracted_code, self.dimension)
        eval_time = time.time() - t_eval_start

        eval_res = EvaluationResult(
            valid=eval_dict["valid"],
            score=eval_dict["score"],
            points=eval_dict["points"],
            execution_time=eval_time,
            error=eval_dict["error"]
        )

        # 7. 反馈与注册：若有效则注册入库
        accepted = False
        if eval_res.valid and eval_res.score > 0:
            registered = self.database.register_program(
                code=extracted_code,
                score=eval_res.score,
                generation=generation,
                island_id=active_island,
                parent_ids=parent_ids,
                operator=operator
            )
            accepted = (registered is not None)

        # 8. 周期性检查与岛屿早熟重置
        if generation % 25 == 0:
            self.database.check_and_reset_islands()

        # 9. 记录审计跟踪日志
        trace = GenerationTrace(
            generation=generation,
            island_id=active_island,
            operator=operator,
            parent_ids=parent_ids,
            prompt=prompt,
            raw_completion=raw_completion,
            extracted_code=extracted_code,
            eval_result=eval_res,
            accepted=accepted
        )
        self.traces.append(trace)
        self._append_log_trace(trace)

        return trace

    def _append_log_trace(self, trace: GenerationTrace):
        """将审计日志实时以 JSONL 形式追加至磁盘"""
        try:
            with open(self.log_file, "a", encoding="utf-8") as f:
                f.write(json.dumps(trace.to_dict(), ensure_ascii=False) + "\n")
        except Exception:
            pass

    def run(self, total_generations: int) -> Dict[str, Any]:
        """运行完整的多轮演化过程并打印实时状态"""
        print("=" * 70)
        print(f"🧬 FunSearch 自动化演化总控引擎启动 · F_3^{self.dimension} 帽集问题")
        print(f"⚙️ 后端: {self.llm_client.backend.upper()} ({self.llm_client.model}) | 岛屿数: {self.database.num_islands} | 交叉率: {self.crossover_prob*100:.0f}%")
        print(f"📁 审计追踪日志: {self.log_file}")
        print("=" * 70)

        best_score_so_far = self.database.global_best.score if self.database.global_best else 0
        t0 = time.time()

        for gen in range(1, total_generations + 1):
            trace = self.step(gen)
            if not trace:
                continue

            score = trace.eval_result.score
            op_tag = "🔀 交叉" if trace.operator == "crossover" else "🧬 变异"

            if trace.eval_result.valid:
                if score > best_score_so_far:
                    best_score_so_far = score
                    print(f"✨ [Gen {gen:02d} | 岛屿 #{trace.island_id} | {op_tag}] 突破新纪录！得分: {score:3d} (耗时 {trace.eval_result.execution_time*1000:.1f}ms)")
                else:
                    if gen % 5 == 0 or gen == total_generations:
                        print(f"   [Gen {gen:02d} | 岛屿 #{trace.island_id} | {op_tag}] 评估有效，当前得分: {score:3d} (全局最高: {best_score_so_far})")
            else:
                print(f"⚠️ [Gen {gen:02d} | 岛屿 #{trace.island_id} | {op_tag}] 编译/沙箱失败: {trace.eval_result.error}")

        elapsed = time.time() - t0
        summary = self.database.get_summary()
        summary["total_runtime_seconds"] = round(elapsed, 3)
        summary["global_best_code"] = self.database.global_best.code if self.database.global_best else ""

        print("\n" + "=" * 70)
        print("🎉 FunSearch 演化探索完成！")
        print(f"⏱️ 总耗时: {elapsed:.2f}s | 总程序评估: {summary['total_evaluations']}")
        print(f"🏆 全局最高得分 (最大帽集基数): {summary['global_best_score']}")
        print("=" * 70)

        return summary
