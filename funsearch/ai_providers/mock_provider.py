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
            reasoning = "Analyzing crossover between Parent 1 (Hamming slice) and Parent 2 (coord differences). Merging affine balance to maximize Cap Set size without collinearity."
            code = """def priority(p: tuple, n: int) -> float:
    # 交叉算子：融合 Parent 1 的对称汉明切片与 Parent 2 的邻位坐标差分
    l0 = sum(1 for x in p if x != 0)
    diff = sum(abs(p[i] - p[(i+1)%n]) for i in range(n))
    parity = sum(p) % 3
    is_balanced = 50.0 if (p.count(1) - p.count(2)) % 3 == 0 else 0.0
    return float((l0 == n // 2 + 1) * 60.0 - diff * 1.2 + is_balanced + (parity == 1) * 25.0)"""
        else:
            reasoning = "Applying algebraic symmetry mutation: prioritizing intermediate Hamming weight spheres and affine mod 3 balance."
            code = """def priority(p: tuple, n: int) -> float:
    # 变异算子：引入中间层汉明切片与仿射同余偏置
    l0 = sum(1 for x in p if x != 0)
    parity = sum(p) % 3
    bonus = 60.0 if l0 == (n // 2 + 1) else 0.0
    return float(bonus + (parity == 2) * 30.0 + p[0] * 2.15)"""

        full_text = f"<think>\n{reasoning}\n</think>\n\nHere is the synthesized mathematical priority function:\n```python\n{code}\n```"
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
