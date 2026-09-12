"""
FunSearch 核心数据类型与实体定义
==================================
定义程序实体 (Program)、评估反馈结果 (EvaluationResult) 与实验跟踪轨迹 (GenerationTrace)。
"""

import time
from typing import Optional, Dict, Any, List, Tuple

Point = Tuple[int, ...]

class Program:
    """单个由 LLM 生成或初始化的可执行算法程序实体"""
    def __init__(
        self,
        code: str,
        score: int,
        generation: int,
        island_id: int,
        parent_ids: Optional[List[str]] = None,
        operator: str = "mutation"  # "initial", "mutation", "crossover"
    ):
        self.code = code.strip()
        self.score = score
        self.generation = generation
        self.island_id = island_id
        self.parent_ids = parent_ids or []
        self.operator = operator
        self.timestamp = time.time()
        # 依据代码生成唯一指纹
        self.id = f"prog_gen{generation}_isl{island_id}_{abs(hash(self.code)) % 1000000:06d}"

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "code": self.code,
            "score": self.score,
            "generation": self.generation,
            "island_id": self.island_id,
            "parent_ids": self.parent_ids,
            "operator": self.operator,
            "timestamp": self.timestamp
        }

class EvaluationResult:
    """沙箱代码执行与数学判定反馈结果"""
    def __init__(
        self,
        valid: bool,
        score: int,
        points: List[Point],
        execution_time: float,
        error: Optional[str] = None
    ):
        self.valid = valid
        self.score = score
        self.points = points
        self.execution_time = execution_time
        self.error = error

    def to_dict(self) -> Dict[str, Any]:
        return {
            "valid": self.valid,
            "score": self.score,
            "points_count": len(self.points),
            "execution_time": round(self.execution_time, 4),
            "error": self.error
        }

class GenerationTrace:
    """用于可重复性实验的单步生成审计日志条目"""
    def __init__(
        self,
        generation: int,
        island_id: int,
        operator: str,
        parent_ids: List[str],
        prompt: str,
        raw_completion: str,
        extracted_code: str,
        eval_result: EvaluationResult,
        accepted: bool
    ):
        self.generation = generation
        self.island_id = island_id
        self.operator = operator
        self.parent_ids = parent_ids
        self.prompt = prompt
        self.raw_completion = raw_completion
        self.extracted_code = extracted_code
        self.eval_result = eval_result
        self.accepted = accepted
        self.timestamp = time.time()

    def to_dict(self) -> Dict[str, Any]:
        return {
            "generation": self.generation,
            "island_id": self.island_id,
            "operator": self.operator,
            "parent_ids": self.parent_ids,
            "prompt_length": len(self.prompt),
            "extracted_code": self.extracted_code,
            "eval_result": self.eval_result.to_dict(),
            "accepted": self.accepted,
            "timestamp": self.timestamp
        }
