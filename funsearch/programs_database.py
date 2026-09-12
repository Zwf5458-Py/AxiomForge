"""
FunSearch 程序数据库与岛屿演化集群 (ProgramsDatabase & Island Model)
=================================================================
维护演化程序群，通过岛屿隔离机制防止早熟收敛，提供基于得分的锦标赛采样。
"""

import random
import time
from typing import List, Dict, Any, Optional

class Program:
    """单个可执行数学程序实体"""
    def __init__(self, code: str, score: int, generation: int, island_id: int):
        self.code = code
        self.score = score
        self.generation = generation
        self.island_id = island_id
        self.timestamp = time.time()

    def to_dict(self) -> Dict[str, Any]:
        return {
            "code": self.code,
            "score": self.score,
            "generation": self.generation,
            "island_id": self.island_id,
            "timestamp": self.timestamp
        }

class Island:
    """独立的演化岛屿"""
    def __init__(self, island_id: int, max_size: int = 50):
        self.island_id = island_id
        self.max_size = max_size
        self.programs: List[Program] = []

    def add_program(self, prog: Program):
        self.programs.append(prog)
        # 按得分从高到低排序，若超出容量则淘汰低分程序
        self.programs.sort(key=lambda p: p.score, reverse=True)
        if len(self.programs) > self.max_size:
            self.programs.pop()

    def sample_parent(self) -> Optional[Program]:
        """轮盘赌或软最大值采样高分父代程序"""
        if not self.programs:
            return None
        # 简单锦标赛选择：随机挑选 2 个，选其中得分高者
        candidates = random.sample(self.programs, min(2, len(self.programs)))
        return max(candidates, key=lambda p: p.score)

    @property
    def best_program(self) -> Optional[Program]:
        return self.programs[0] if self.programs else None

class ProgramsDatabase:
    """多岛屿演化程序数据库管理器"""
    def __init__(self, num_islands: int = 4, max_island_size: int = 30):
        self.num_islands = num_islands
        self.islands = [Island(i, max_island_size) for i in range(num_islands)]
        self.global_best: Optional[Program] = None
        self.total_evaluations = 0

    def register_program(self, code: str, score: int, generation: int, island_id: int) -> Program:
        prog = Program(code, score, generation, island_id)
        self.islands[island_id].add_program(prog)
        self.total_evaluations += 1

        if self.global_best is None or score > self.global_best.score:
            self.global_best = prog
            
        return prog

    def sample_parent(self, island_id: int) -> Optional[Program]:
        return self.islands[island_id].sample_parent()

    def get_summary(self) -> Dict[str, Any]:
        return {
            "total_evaluations": self.total_evaluations,
            "global_best_score": self.global_best.score if self.global_best else 0,
            "islands_stats": [
                {
                    "island_id": i.island_id,
                    "count": len(i.programs),
                    "best_score": i.best_program.score if i.best_program else 0
                }
                for i in self.islands
            ]
        }
