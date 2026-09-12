"""
AxiomForge AI Providers: 确定性离线模拟 Provider (MockProvider)
用于无 API Key 本地体验、自动化 CI 测试与实验确定性复现。
"""

import time
from typing import Dict, Iterator, List, Optional, Tuple
from .base import BaseProvider
from .types import CompletionResult, ModelInfo, ProviderAuth, StreamEvent, UsageStats

class MockProvider(BaseProvider):
    def __init__(self):
        super().__init__(
            provider_id="mock",
            name="AxiomForge Reproducible Mock Engine",
            default_base_url="mock://internal"
        )
        self.register_model(ModelInfo(
            id="reproducible-mock-llm",
            name="Deterministic Math Evolver (Offline)",
            provider="mock",
            api="mock",
            context_window=32768,
            supports_reasoning=True,
            supports_tools=True,
            cost_input_per_m=0.0,
            cost_output_per_m=0.0
        ))

    def _generate_synthetic_response(self, prompt: str, temperature: float) -> Tuple[str, str]:
        is_crossover = "Two Distinct High-Scoring Parent Programs" in prompt
        if is_crossover:
            reasoning = """【仿射空间交叉代数推演 (Algebraic Crossover Deduction)】
针对有限向量空间 F_3^n (基数 3^n)：
1. 几何对称性融合：提取 Parent 1 的高维汉明中层切片不变性，与 Parent 2 的一阶环状坐标差分特征。
2. 规避共线闭包：三点共线充要条件为 x + y + z = (0,...,0) mod 3。通过引入非对称仿射同余偏置，打破贪心算法易收敛于仿射子空间 (基数 2^n) 的局部极大值陷阱。
3. 代数构造：在目标汉明球面 (L0 范数约为 n//2 + 1) 上赋予阶跃式势能，对循环差分进行负反馈抑制，引导选点跨越低维仿射平面。"""
            code = """def priority(p: tuple, n: int) -> float:
    # 交叉算子：融合 Parent 1 的对称汉明切片与 Parent 2 的邻位坐标差分
    l0 = sum(1 for x in p if x != 0)
    diff = sum(abs(p[i] - p[(i+1)%n]) for i in range(n))
    parity = sum(p) % 3
    is_balanced = 50.0 if (p.count(1) - p.count(2)) % 3 == 0 else 0.0
    return float((l0 == n // 2 + 1) * 60.0 - diff * 1.2 + is_balanced + (parity == 1) * 25.0)"""
        else:
            reasoning = """【代数对称性变异与不变性推演 (Algebraic Symmetry Mutation)】
针对有限向量空间 F_3^n (基数 3^n) 的 Cap Set 极值结构推演：
1. 几何对称性与局部陷阱：朴素贪心搜索极易落入 2^n 子空间（即各坐标仅取 {0, 1} 的超立方体切面）。若要在高维下取得突破，必须主动向坐标 2 的点集拓展。
2. 汉明中层球切片先验：根据 Tao 等人在组合数论中的研究，极大 Cap Set 点集在汉明权重中层 (Weight-balanced level sets) 呈现出极高的结构凝聚度。
3. 仿射同余偏置：对 sum(p) mod 3 施加约束，打破 3-AP (等差数列三元组) 的退化解分布。
4. 综合优先级函数：将点 p 的汉明权值峰值激励与仿射同余项耦合，使贪心选择优先吸纳空间张角最大且无共线的三元组合。"""
            code = """def priority(p: tuple, n: int) -> float:
    # 变异算子：引入中间层汉明切片与仿射同余偏置，打破 2^n 陷阱
    l0 = sum(1 for x in p if x != 0)
    parity = sum(p) % 3
    bonus = 60.0 if l0 == (n // 2 + 1) else 0.0
    return float(bonus + (parity == 2) * 30.0 + p[0] * 2.15)"""

        full_text = f"<think>\n{reasoning}\n</think>\n\n### 极值组合代数推导与先验设计：\n{reasoning}\n\n```python\n{code}\n```"
        return reasoning, full_text

    def complete(
        self,
        model_id: str,
        prompt: str,
        system_prompt: Optional[str] = None,
        auth: Optional[ProviderAuth] = None,
        temperature: float = 0.7,
        max_tokens: Optional[int] = None,
        timeout: float = 60.0,
        extra_headers: Optional[Dict[str, str]] = None
    ) -> CompletionResult:
        reasoning, full_text = self._generate_synthetic_response(prompt, temperature)
        return CompletionResult(
            text=full_text,
            reasoning=reasoning,
            model=model_id,
            provider=self.id,
            usage=UsageStats(
                input_tokens=len(prompt.split()) * 2,
                output_tokens=len(full_text.split()) * 2,
                reasoning_tokens=len(reasoning.split()) * 2,
                total_tokens=len(prompt.split()) * 2 + len(full_text.split()) * 2,
                cost_estimate_usd=0.0,
                latency_seconds=0.01
            ),
            raw_response={"mock": True}
        )

    def stream(
        self,
        model_id: str,
        prompt: str,
        system_prompt: Optional[str] = None,
        auth: Optional[ProviderAuth] = None,
        temperature: float = 0.7,
        max_tokens: Optional[int] = None,
        timeout: float = 60.0,
        extra_headers: Optional[Dict[str, str]] = None
    ) -> Iterator[StreamEvent]:
        yield StreamEvent(type="start")
        reasoning, full_text = self._generate_synthetic_response(prompt, temperature)

        # 模拟流式发送思考过程
        yield StreamEvent(type="thinking_start")
        for chunk in reasoning.split(" "):
            yield StreamEvent(type="thinking_delta", delta=chunk + " ", reasoning_content=reasoning)
        yield StreamEvent(type="thinking_end")

        # 模拟流式发送正文代码
        yield StreamEvent(type="text_start")
        content_after_think = full_text.split("</think>\n\n")[-1]
        for line in content_after_think.split("\n"):
            yield StreamEvent(type="text_delta", delta=line + "\n", full_text=full_text)

        yield StreamEvent(type="text_end")
        yield StreamEvent(
            type="done",
            full_text=full_text,
            reasoning_content=reasoning,
            usage=UsageStats(
                input_tokens=len(prompt.split()) * 2,
                output_tokens=len(full_text.split()) * 2,
                reasoning_tokens=len(reasoning.split()) * 2,
                total_tokens=len(prompt.split()) * 2 + len(full_text.split()) * 2,
                cost_estimate_usd=0.0,
                latency_seconds=0.02
            )
        )

    def check_auth(self, auth: ProviderAuth) -> Tuple[bool, str]:
        return True, "离线模拟引擎就绪 (无需 API Key)"
