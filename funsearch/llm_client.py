"""
FunSearch LLM 客户端与代码抽取器 (LLM Client & Code Extractor)
============================================================
底层集成 AxiomForge AI Providers (参考 @earendil-works/pi-ai 架构)，
支持 DeepSeek / OpenAI / Anthropic / SiliconFlow / Ollama / Custom 任意自定义模型平台，
并原生保留 ReproducibleMockLLM 保证完全确定性的离线复现能力。
"""

import os
from typing import Any, Dict, Optional, Tuple

from .ai_providers import Models, builtin_models, BaseProvider
from .ai_providers.mock_provider import MockProvider

class LLMClient:
    """通用大语言模型调用客户端（基于 ai_providers 统一架构）"""
    def __init__(
        self,
        backend: str = "deepseek",  # "deepseek", "openai", "anthropic", "siliconflow", "ollama", "custom", "mock"
        model: Optional[str] = None,
        api_key: Optional[str] = None,
        api_base: Optional[str] = None,
        temperature: float = 0.7,
        timeout: float = 45.0,
        models_registry: Optional[Models] = None
    ):
        self.backend = backend.lower()
        self.temperature = temperature
        self.timeout = timeout
        self.api_key = api_key
        self.api_base = api_base
        self.models = models_registry or builtin_models()

        # 默认模型推断
        if not model:
            if self.backend == "deepseek":
                self.model = "deepseek-chat"
            elif self.backend == "openai":
                self.model = "gpt-4o-mini"
            elif self.backend == "anthropic":
                self.model = "claude-3-5-sonnet-20241022"
            elif self.backend == "siliconflow":
                self.model = "deepseek-ai/DeepSeek-V3"
            elif self.backend == "ollama":
                self.model = "qwen2.5-coder:latest"
            elif self.backend == "custom":
                self.model = "custom-default"
            else:
                self.backend = "mock"
                self.model = "reproducible-mock-llm"
        else:
            self.model = model

    def complete(self, prompt: str, system_prompt: Optional[str] = None) -> Tuple[str, str]:
        """
        向大模型发起调用，返回 (raw_completion, extracted_python_code)
        支持思考链自动识别、网络重试与离线确定性模拟回退。
        """
        # 1. 如果指定为 mock，直接调用 ReproducibleMockLLM
        if self.backend == "mock":
            raw = ReproducibleMockLLM.generate_completion(prompt, self.temperature)
            code = self.extract_code(raw)
            return raw, code

        sys_msg = system_prompt or "You are an expert mathematician and algorithm engineer specializing in extremal combinatorics."

        try:
            res = self.models.complete(
                model_id=self.model,
                prompt=prompt,
                system_prompt=sys_msg,
                provider_id=self.backend,
                api_key=self.api_key,
                api_base=self.api_base,
                temperature=self.temperature,
                timeout=self.timeout
            )
            raw = res.text
            code = self.extract_code(raw)
            return raw, code
        except Exception as e:
            # 当网络调用失败时，告警并安全降级到确定性离线模拟器，保证演化流水线永不崩溃
            print(f"⚠️ [LLMClient 告警] 模型平台 '{self.backend}/{self.model}' 调用失败: {e}，优雅回退至本地确定性演化模拟器")
            raw = ReproducibleMockLLM.generate_completion(prompt, self.temperature)
            return raw, self.extract_code(raw)

    @staticmethod
    def extract_code(text: str) -> str:
        """从模型回复中抽取出 Python 优先级函数 priority 代码"""
        return BaseProvider.extract_code(text)


class ReproducibleMockLLM:
    """确定性、可重复的语言模型生成模拟器（用于离线测试与 CI 流水线）"""
    @staticmethod
    def generate_completion(prompt: str, temperature: float = 0.7) -> str:
        provider = MockProvider()
        res = provider.complete("reproducible-mock-llm", prompt, temperature=temperature)
        return res.text
