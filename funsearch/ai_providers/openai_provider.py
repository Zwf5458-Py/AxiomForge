"""
AxiomForge AI Providers: OpenAI 兼容通用提供商
覆盖 OpenAI、DeepSeek、SiliconFlow、OpenRouter 及各类自定义 OpenAI 兼容接口。
支持思考链 (reasoning_content / <think>) 及 SSE 流式提取。
"""

import json
import time
import urllib.error
import urllib.request
from typing import Dict, Iterator, List, Optional, Tuple
from .base import BaseProvider
from .types import CompletionResult, ModelInfo, ProviderAuth, StreamEvent, UsageStats

class OpenAICompatibleProvider(BaseProvider):
    def __init__(
        self,
        provider_id: str,
        name: str,
        default_base_url: str,
        default_headers: Optional[Dict[str, str]] = None
    ):
        super().__init__(provider_id, name, default_base_url, default_headers)

    def _build_url(self, auth: Optional[ProviderAuth]) -> str:
        base = (auth.api_base if auth and auth.api_base else self.default_base_url).rstrip("/")
        if not base.endswith("/chat/completions"):
            return f"{base}/chat/completions"
        return base

    def _build_headers(self, auth: Optional[ProviderAuth], extra_headers: Optional[Dict[str, str]] = None) -> Dict[str, str]:
        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
        headers.update(self.default_headers)
        if auth and auth.headers:
            headers.update(auth.headers)
        if auth and auth.api_key:
            headers["Authorization"] = f"Bearer {auth.api_key}"
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

        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        payload = {
            "model": model_id,
            "messages": messages,
            "temperature": temperature
        }
        if max_tokens:
            payload["max_tokens"] = max_tokens

        start_t = time.time()
        req = urllib.request.Request(url, data=json.dumps(payload).encode("utf-8"), headers=headers, method="POST")
        try:
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                choice = data["choices"][0]["message"]
                raw_text = choice.get("content", "")
                reasoning = choice.get("reasoning_content")

                # 如果模型原生没有 reasoning_content，尝试从 <think> 中提取
                if not reasoning:
                    parsed_r, cleaned = self.extract_reasoning_and_text(raw_text)
                    if parsed_r:
                        reasoning = parsed_r
                        raw_text = cleaned

                usage_data = data.get("usage", {})
                latency = time.time() - start_t
                model_meta = self.get_model(model_id)

                inp_tokens = usage_data.get("prompt_tokens", 0)
                out_tokens = usage_data.get("completion_tokens", 0)
                cost = 0.0
                if model_meta:
                    cost = (inp_tokens / 1e6) * model_meta.cost_input_per_m + (out_tokens / 1e6) * model_meta.cost_output_per_m

                return CompletionResult(
                    text=raw_text,
                    reasoning=reasoning,
                    model=model_id,
                    provider=self.id,
                    usage=UsageStats(
                        input_tokens=inp_tokens,
                        output_tokens=out_tokens,
                        reasoning_tokens=usage_data.get("reasoning_tokens", 0),
                        total_tokens=usage_data.get("total_tokens", inp_tokens + out_tokens),
                        cost_estimate_usd=cost,
                        latency_seconds=latency
                    ),
                    raw_response=data
                )
        except Exception as e:
            raise RuntimeError(f"[{self.name}] API 请求失败: {e}")

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
        url = self._build_url(auth)
        headers = self._build_headers(auth, extra_headers)
        headers["Accept"] = "text/event-stream"

        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        payload = {
            "model": model_id,
            "messages": messages,
            "temperature": temperature,
            "stream": True
        }
        if max_tokens:
            payload["max_tokens"] = max_tokens

        yield StreamEvent(type="start")
        start_t = time.time()
        full_text = []
        reasoning_pieces = []
        is_thinking = False

        req = urllib.request.Request(url, data=json.dumps(payload).encode("utf-8"), headers=headers, method="POST")
        try:
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                for line_bytes in resp:
                    line = line_bytes.decode("utf-8").strip()
                    if not line or not line.startswith("data:"):
                        continue
                    data_str = line[5:].strip()
                    if data_str == "[DONE]":
                        break
                    try:
                        chunk = json.loads(data_str)
                        delta = chunk.get("choices", [{}])[0].get("delta", {})

                        # 1. 检测思考链字段
                        r_delta = delta.get("reasoning_content") or delta.get("reasoning")
                        if r_delta:
                            if not is_thinking:
                                is_thinking = True
                                yield StreamEvent(type="thinking_start")
                            reasoning_pieces.append(r_delta)
                            yield StreamEvent(type="thinking_delta", delta=r_delta)

                        # 2. 正文文本字段
                        t_delta = delta.get("content")
                        if t_delta:
                            if is_thinking:
                                is_thinking = False
                                yield StreamEvent(type="thinking_end")
                            full_text.append(t_delta)
                            yield StreamEvent(type="text_delta", delta=t_delta)
                    except Exception:
                        continue

            if is_thinking:
                yield StreamEvent(type="thinking_end")
            yield StreamEvent(type="text_end")

            combined_text = "".join(full_text)
            combined_reasoning = "".join(reasoning_pieces) or None

            # 若未包含 reasoning_content，检测是否在正文使用了 <think>
            if not combined_reasoning and combined_text:
                parsed_r, cleaned = self.extract_reasoning_and_text(combined_text)
                if parsed_r:
                    combined_reasoning = parsed_r
                    combined_text = cleaned

            latency = time.time() - start_t
            yield StreamEvent(
                type="done",
                full_text=combined_text,
                reasoning_content=combined_reasoning or "",
                usage=UsageStats(
                    input_tokens=len(prompt.split()) * 2,
                    output_tokens=len(combined_text.split()) * 2,
                    reasoning_tokens=len(combined_reasoning.split()) * 2 if combined_reasoning else 0,
                    total_tokens=len(prompt.split()) * 2 + len(combined_text.split()) * 2,
                    latency_seconds=latency
                )
            )
        except Exception as e:
            yield StreamEvent(type="error", error_message=f"[{self.name}] 流式传输异常: {e}")

    def check_auth(self, auth: ProviderAuth) -> Tuple[bool, str]:
        """轻量级连通性测试"""
        if not auth.api_key and self.id != "ollama":
            return False, f"未配置 {self.name} 的 API Key"
        try:
            # 请求最基础的 completions 测试连通性
            models = self.get_models()
            test_model = models[0].id if models else "default"
            res = self.complete(
                model_id=test_model,
                prompt="Say OK",
                auth=auth,
                max_tokens=5,
                timeout=10.0
            )
            return True, f"连接成功！延迟: {res.usage.latency_seconds:.2f}s"
        except Exception as e:
            return False, f"验证失败: {str(e)}"
