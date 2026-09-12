"""
FunSearch 完整程序数据库与多岛屿演化集群 (ProgramsDatabase & Island Model)
=======================================================================
严格复现 DeepMind FunSearch 论文核心架构：
1. 多岛屿隔离演化 (Island Model)
2. 基于排名的 Softmax 精英选择 (Rank-based Softmax Selection)
3. 变异 (Mutation, 1 亲本) 与交叉 (Crossover, 2 亲本) 采样
4. 岛屿基因迁移与早熟停滞岛屿重置 (Island Migration & Resetting)
"""

import math
import random
import time
from typing import List, Dict, Any, Optional, Tuple

from funsearch.core_types import Program

class Island:
    """单个独立的演化岛屿"""
    def __init__(self, island_id: int, max_size: int = 30, temperature: float = 1.0):
        self.island_id = island_id
        self.max_size = max_size
        self.temperature = max(0.1, temperature)
        self.programs: List[Program] = []
        self.best_score_record = 0
        self.generations_since_improvement = 0

    def add_program(self, prog: Program) -> bool:
        """向岛屿注册程序，去重并维持容量限制"""
        # 基于代码内容去重
        for p in self.programs:
            if p.code == prog.code:
                return False

        self.programs.append(prog)
        # 按得分从高到低排序
        self.programs.sort(key=lambda p: p.score, reverse=True)

        if prog.score > self.best_score_record:
            self.best_score_record = prog.score
            self.generations_since_improvement = 0
        else:
            self.generations_since_improvement += 1

        # 若超出容量上限，淘汰末位程序
        if len(self.programs) > self.max_size:
            self.programs.pop()

        return True

    def sample_parents(self, count: int = 1) -> List[Program]:
        """
        基于排名的 Softmax 精英采样 (Rank-based Softmax Sampling)
        Rank 越靠前（得分越高），被采样的概率越大，通过温度系数控制多样性。
        """
        if not self.programs:
            return []
        if len(self.programs) <= count:
            return list(self.programs)

        n = len(self.programs)
        # 排名权重计算：rank 0 为最高分
        logits = [-i / self.temperature for i in range(n)]
        max_logit = max(logits)
        exp_weights = [math.exp(l - max_logit) for l in logits]
        total_weight = sum(exp_weights)
        probs = [w / total_weight for w in exp_weights]

        # 无放回采样指定数量的亲本
        selected_indices = []
        available_indices = list(range(n))
        curr_probs = list(probs)

        for _ in range(min(count, n)):
            # 依概率选取
            r = random.random()
            cum = 0.0
            chosen = available_indices[-1]
            for idx, p in zip(available_indices, curr_probs):
                cum += p
                if r <= cum:
                    chosen = idx
                    break
            selected_indices.append(chosen)
            # 移除已选项重新归一化
            del_pos = available_indices.index(chosen)
            available_indices.pop(del_pos)
            curr_probs.pop(del_pos)
            s = sum(curr_probs)
            if s > 0:
                curr_probs = [p / s for p in curr_probs]

        return [self.programs[i] for i in selected_indices]

    @property
    def best_program(self) -> Optional[Program]:
        return self.programs[0] if self.programs else None

    def reset(self, elite_seeds: List[Program]):
        """用全局精英程序重新初始化陷入停滞的岛屿"""
        self.programs = [
            Program(
                code=p.code,
                score=p.score,
                generation=p.generation,
                island_id=self.island_id,
                parent_ids=[p.id],
                operator="migration_reset"
            )
            for p in elite_seeds[:self.max_size // 2]
        ]
        self.programs.sort(key=lambda p: p.score, reverse=True)
        self.best_score_record = self.programs[0].score if self.programs else 0
        self.generations_since_improvement = 0

class ProgramsDatabase:
    """多岛屿演化集群管理器 (ProgramsDatabase)"""
    def __init__(
        self,
        num_islands: int = 4,
        max_island_size: int = 25,
        temperature: float = 1.0,
        reset_stagnant_threshold: int = 40
    ):
        self.num_islands = num_islands
        self.max_island_size = max_island_size
        self.reset_threshold = reset_stagnant_threshold
        self.islands = [Island(i, max_island_size, temperature) for i in range(num_islands)]
        self.global_best: Optional[Program] = None
        self.total_evaluations = 0
        self.all_registered_programs: Dict[str, Program] = {}

    def register_program(
        self,
        code: str,
        score: int,
        generation: int,
        island_id: int,
        parent_ids: Optional[List[str]] = None,
        operator: str = "mutation"
    ) -> Optional[Program]:
        """将新生成的程序注册进指定岛屿"""
        prog = Program(code, score, generation, island_id, parent_ids, operator)
        accepted = self.islands[island_id].add_program(prog)
        self.total_evaluations += 1

        if accepted:
            self.all_registered_programs[prog.id] = prog
            if self.global_best is None or score > self.global_best.score:
                self.global_best = prog
            return prog
        return None

    def sample_parents(self, island_id: int, operator: str = "mutation") -> List[Program]:
        """根据算子类型在指定岛屿中采样亲本（变异取 1，交叉取 2）"""
        count = 2 if operator == "crossover" else 1
        return self.islands[island_id].sample_parents(count=count)

    def check_and_reset_islands(self):
        """定期检查各岛屿，若某个岛屿长时间陷入停滞，则执行精英重置"""
        if not self.global_best:
            return

        # 收集全局排名前列的精英程序
        all_progs = list(self.all_registered_programs.values())
        all_progs.sort(key=lambda p: p.score, reverse=True)
        top_elites = all_progs[:5]

        for island in self.islands:
            if island.generations_since_improvement >= self.reset_threshold:
                print(f"🔄 [岛屿重置] 岛屿 #{island.island_id} 已连续 {island.generations_since_improvement} 步未突破，执行精英基因重置！")
                island.reset(top_elites)

    def get_summary(self) -> Dict[str, Any]:
        """获取当前种群数据库状态快照"""
        return {
            "total_evaluations": self.total_evaluations,
            "global_best_score": self.global_best.score if self.global_best else 0,
            "global_best_id": self.global_best.id if self.global_best else None,
            "islands": [
                {
                    "island_id": isl.island_id,
                    "population": len(isl.programs),
                    "best_score": isl.best_score_record,
                    "stagnant_steps": isl.generations_since_improvement
                }
                for isl in self.islands
            ]
        }
