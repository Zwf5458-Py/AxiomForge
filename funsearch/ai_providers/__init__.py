"""
AxiomForge AI Providers Module
参考 @earendil-works/pi-ai 架构设计的统一多模型平台接入层
"""

from .base import BaseProvider
from .credentials import AuthResolver, CredentialStore
from .mock_provider import MockProvider
from .openai_provider import OpenAICompatibleProvider
from .anthropic_provider import AnthropicProvider
from .ollama_provider import OllamaProvider
from .registry import Models, builtin_models, create_custom_provider
from .types import CompletionResult, ModelInfo, ProviderAuth, StreamEvent, UsageStats

__all__ = [
    "BaseProvider",
    "AuthResolver",
    "CredentialStore",
    "MockProvider",
    "OpenAICompatibleProvider",
    "AnthropicProvider",
    "OllamaProvider",
    "Models",
    "builtin_models",
    "create_custom_provider",
    "CompletionResult",
    "ModelInfo",
    "ProviderAuth",
    "StreamEvent",
    "UsageStats"
]
