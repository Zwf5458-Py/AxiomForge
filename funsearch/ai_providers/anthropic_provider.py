"""
AxiomForge AI Providers: Anthropic Claude 专用提供商
支持 Claude 3.5 Sonnet / 3.7 Sonnet 及 Thinking 思考预算机制。
"""

import json
import time
import urllib.error
import urllib.request
from typing import Dict, Iterator, List, Optional, Tuple
from .base import BaseProvider
from .types import CompletionResult, ModelInfo, ProviderAuth, StreamEvent, UsageStats

class AnthropicProvider(BaseProvider):
    def __init__(self):
        super().__init__(
            provider_id="anthropic",
            name="Anthropic Claude",
            default_base_url="https://api.anthropic.com/v1"
        )
        self.register_model(ModelInfo(
            id="claude-3-7-sonnet-20250219",
            name="Claude 3.7 Sonnet (Hybrid Reasoning)",
            provider="anthropic",
            api="anthropic-messages",
            context_window=200000,
            supports_reasoning=True,
            cost_input_per_m=3.0,
            cost_output_per_m=15.0
        ))
        self.register_model(ModelInfo(
            id="claude-3-5-sonnet-20241022",
            name="Claude 3.5 Sonnet",
            provider="anthropic",
            api="anthropic-messages",
            context_window=200000,
            supports_reasoning=False,
            cost_input_per_m=3.0,
            cost_output_per_m=15.0
        ))
        self.register_model(ModelInfo(
            id="claude-3-5-haiku-20241022",
            name="Claude 3.5 Haiku",
            provider="anthropic",
            api="anthropic-messages",
            context_window=200000,
            supports_reasoning=False,
            cost_input_per_m=0.8,
            cost_output_per_m=4.0
        ))

    def _build_url(self, auth: Optional[ProviderAuth]) -> str:
        base = (auth.api_base if auth and auth.api_base else self.default_base_url).rstrip("/")
        if not base.endswith("/messages"):
            return f"{base}/messages"
        return base

    def _build_headers(self, auth: Optional[ProviderAuth], extra_headers: Optional[Dict[str, str]] = None) -> Dict[str, str]:
        headers = {
            "Content-Type": "application/json",
            "anthropic-version": "2023-06-01",
            "Accept": "application/json"
        }
        if auth and auth.api_key:
            headers["x-api-key"] = auth.api_key
        if auth and auth.headers:
            headers.update(auth.headers)
        if extra_headers:
            headers.update(extra_headers)
        return headers

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
        url = self._build_url(auth)
        headers = self._build_headers(auth, extra_headers)

        payload = {
            "model": model_id,
            "max_tokens": max_tokens or 4096,
            "messages": [{"role": "user", "content": prompt}]
        }
        if system_prompt:
            payload["system"] = system_prompt

        model_meta = self.get_model(model_id)
        if model_meta and model_meta.supports_reasoning:
            payload["thinking"] = {"type": "enabled", "budget_tokens": 2048}
        else:
            payload["temperature"] = temperature

        start_t = time.time()
        req = urllib.request.Request(url, data=json.dumps(payload).encode("utf-8"), headers=headers, method="POST")
        try:
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                text_parts = []
                reasoning_parts = []
                for block in data.get("content", []):
                    if block.get("type") == "text":
                        text_parts.append(block.get("text", ""))
                    elif block.get("type") == "thinking":
                        reasoning_parts.append(block.get("thinking", ""))

                usage_data = data.get("usage", {})
                latency = time.time() - start_t
                inp_tokens = usage_data.get("input_tokens", 0)
                out_tokens = usage_data.get("output_tokens", 0)
                cost = 0.0
                if model_meta:
                    cost = (inp_tokens / 1e6) * model_meta.cost_input_per_m + (out_tokens / 1e6) * model_meta.cost_output_per_m

                return CompletionResult(
                    text="".join(text_parts),
                    reasoning="".join(reasoning_parts) or None,
                    model=model_id,
                    provider=self.id,
                    usage=UsageStats(
                        input_tokens=inp_tokens,
                        output_tokens=out_tokens,
                        total_tokens=inp_tokens + out_tokens,
                        cost_estimate_usd=cost,
                        latency_seconds=latency
                    ),
                    raw_response=data
                )
        except Exception as e:
            raise RuntimeError(f"[Anthropic] API 调用异常: {e}")

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
        # 降级实现：调用 complete 并流式 yield 对应事件
        yield StreamEvent(type="start")
        try:
            res = self.complete(model_id, prompt, system_prompt, auth, temperature, max_tokens, timeout, extra_headers)
            if res.reasoning:
                yield StreamEvent(type="thinking_start")
                yield StreamEvent(type="thinking_delta", delta=res.reasoning, reasoning_content=res.reasoning)
                yield StreamEvent(type="thinking_end")
            yield StreamEvent(type="text_start")
            yield StreamEvent(type="text_delta", delta=res.text, full_text=res.text)
            yield StreamEvent(type="text_end")
            yield StreamEvent(type="done", full_text=res.text, reasoning_content=res.reasoning or "", usage=res.usage)
        except Exception as e:
            yield StreamEvent(type="error", error_message=str(e))

    def check_auth(self, auth: ProviderAuth) -> Tuple[bool, str]:
        if not auth.api_key:
            return False, "未配置 ANTHROPIC_API_KEY"
        try:
            res = self.complete("claude-3-5-haiku-20241022", "Hello", max_tokens=10, timeout=10.0, auth=auth)
            return True, f"Anthropic 认证成功！延迟: {res.usage.latency_seconds:.2f}s"
        except Exception as e:
            return False, f"Anthropic 鉴权失败: {e}"
