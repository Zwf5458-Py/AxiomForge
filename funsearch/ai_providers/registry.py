"""
AxiomForge AI Providers: 统一注册表与模型管理容器 (Models Registry)
高度对齐 @earendil-works/pi-ai 架构：
提供 builtin_models(), create_custom_provider(), 凭据自动解析, 流式与非流式统一分发。
"""

from typing import Callable, Dict, Iterator, List, Optional, Tuple, Union
from .anthropic_provider import AnthropicProvider
from .base import BaseProvider
from .credentials import AuthResolver, CredentialStore
from .mock_provider import MockProvider
from .ollama_provider import OllamaProvider
from .openai_provider import OpenAICompatibleProvider
from .types import CompletionResult, ModelInfo, ProviderAuth, StreamEvent

class Models:
    """统一模型管理容器 (对齐 pi-ai 的 Models 类)"""

    def __init__(self, credential_store: Optional[CredentialStore] = None):
        self._providers: Dict[str, BaseProvider] = {}
        self.auth_resolver = AuthResolver(credential_store)
        self._transform_headers_hook: Optional[Callable[[Dict[str, str]], Dict[str, str]]] = None

    def set_provider(self, provider: BaseProvider):
        """注册或更新一个提供商"""
        self._providers[provider.id] = provider

    def get_provider(self, provider_id: str) -> Optional[BaseProvider]:
        return self._providers.get(provider_id)

    def get_providers(self) -> List[BaseProvider]:
        return list(self._providers.values())

    def get_models(self, provider_id: Optional[str] = None) -> List[ModelInfo]:
        """获取所有模型或指定 Provider 下的模型列表"""
        if provider_id:
            provider = self.get_provider(provider_id)
            return provider.get_models() if provider else []
        
        all_models = []
        for p in self._providers.values():
            all_models.extend(p.get_models())
        return all_models

    def get_model(self, model_id: str, provider_id: Optional[str] = None) -> Optional[ModelInfo]:
        """按 model_id 查找模型元信息"""
        if provider_id:
            p = self.get_provider(provider_id)
            return p.get_model(model_id) if p else None

        for p in self._providers.values():
            m = p.get_model(model_id)
            if m:
                return m
        return None

    def get_auth(self, provider_id: str, explicit_key: Optional[str] = None, explicit_base: Optional[str] = None) -> ProviderAuth:
        """解析鉴权信息"""
        return self.auth_resolver.resolve(provider_id, explicit_key=explicit_key, explicit_base=explicit_base)

    def check_auth(self, provider_id: str, explicit_key: Optional[str] = None, explicit_base: Optional[str] = None) -> Tuple[bool, str]:
        """检测连通性与密钥有效性"""
        p = self.get_provider(provider_id)
        if not p:
            return False, f"未知的 Provider: {provider_id}"
        auth = self.get_auth(provider_id, explicit_key, explicit_base)
        return p.check_auth(auth)

    def refresh_provider_models(self, provider_id: str, explicit_key: Optional[str] = None, explicit_base: Optional[str] = None) -> List[ModelInfo]:
        """动态拉取并刷新 Provider 的模型清单 (对齐 pi-ai models.refresh())"""
        p = self.get_provider(provider_id)
        if not p:
            raise ValueError(f"未找到 Provider: {provider_id}")
        auth = self.get_auth(provider_id, explicit_key=explicit_key, explicit_base=explicit_base)
        return p.fetch_remote_models(auth)

    def set_transform_headers(self, hook: Callable[[Dict[str, str]], Dict[str, str]]):
        """设置请求头转换拦截器 (对齐 pi-ai transformHeaders)"""
        self._transform_headers_hook = hook

    def complete(
        self,
        model_id: str,
        prompt: str,
        system_prompt: Optional[str] = None,
        provider_id: Optional[str] = None,
        api_key: Optional[str] = None,
        api_base: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: Optional[int] = None,
        timeout: float = 60.0,
        headers: Optional[Dict[str, str]] = None
    ) -> CompletionResult:
        """统一非流式调用"""
        # 1. 确定 Provider
        provider = None
        if provider_id:
            provider = self.get_provider(provider_id)
        if not provider:
            model_info = self.get_model(model_id)
            if model_info:
                provider = self.get_provider(model_info.provider)
        if not provider:
            # 默认尝试 deepseek 或 mock
            provider = self.get_provider("deepseek") or self.get_provider("mock")

        if not provider:
            raise ValueError(f"未找到可用于处理模型 '{model_id}' 的 Provider")

        # 2. 解析鉴权
        auth = self.auth_resolver.resolve(provider.id, explicit_key=api_key, explicit_base=api_base)

        # 3. 变换 Headers
        final_headers = dict(headers or {})
        if self._transform_headers_hook:
            final_headers = self._transform_headers_hook(final_headers)

        return provider.complete(
            model_id=model_id,
            prompt=prompt,
            system_prompt=system_prompt,
            auth=auth,
            temperature=temperature,
            max_tokens=max_tokens,
            timeout=timeout,
            extra_headers=final_headers
        )

    def stream(
        self,
        model_id: str,
        prompt: str,
        system_prompt: Optional[str] = None,
        provider_id: Optional[str] = None,
        api_key: Optional[str] = None,
        api_base: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: Optional[int] = None,
        timeout: float = 60.0,
        headers: Optional[Dict[str, str]] = None
    ) -> Iterator[StreamEvent]:
        """统一流式调用"""
        provider = None
        if provider_id:
            provider = self.get_provider(provider_id)
        if not provider:
            model_info = self.get_model(model_id)
            if model_info:
                provider = self.get_provider(model_info.provider)
        if not provider:
            provider = self.get_provider("deepseek") or self.get_provider("mock")

        if not provider:
            yield StreamEvent(type="error", error_message=f"未找到可用 Provider 处理 '{model_id}'")
            return

        auth = self.auth_resolver.resolve(provider.id, explicit_key=api_key, explicit_base=api_base)
        final_headers = dict(headers or {})
        if self._transform_headers_hook:
            final_headers = self._transform_headers_hook(final_headers)

        yield from provider.stream(
            model_id=model_id,
            prompt=prompt,
            system_prompt=system_prompt,
            auth=auth,
            temperature=temperature,
            max_tokens=max_tokens,
            timeout=timeout,
            extra_headers=final_headers
        )

def create_custom_provider(
    provider_id: str,
    name: str,
    api_base: str,
    models: List[Dict[str, Any]],
    default_headers: Optional[Dict[str, str]] = None
) -> BaseProvider:
    """动态创建一个自定义第三方 OpenAI 兼容 Provider"""
    provider = OpenAICompatibleProvider(
        provider_id=provider_id,
        name=name,
        default_base_url=api_base,
        default_headers=default_headers
    )
    for m in models:
        if isinstance(m, str):
            m_id = m
            m_name = m
            supports_reasoning = any(k in m.lower() for k in ["r1", "reasoner", "o1", "o3", "thinking", "pro", "qwq"])
            m_api = "openai-completions"
            cw = 64000
            cin = 0.0
            cout = 0.0
        else:
            m_id = m.get("id", "default")
            m_name = m.get("name", m_id)
            supports_reasoning = m.get("supports_reasoning", False)
            m_api = m.get("api", "openai-completions")
            cw = m.get("context_window", 64000)
            cin = m.get("cost_input_per_m", 0.0)
            cout = m.get("cost_output_per_m", 0.0)

        provider.register_model(ModelInfo(
            id=m_id,
            name=m_name,
            provider=provider_id,
            api=m_api,
            context_window=cw,
            supports_reasoning=supports_reasoning,
            cost_input_per_m=cin,
            cost_output_per_m=cout
        ))
    return provider

def builtin_models() -> Models:
    """构建包含所有内置提供商的统一 Models 集合 (类似 pi-ai 的 builtinModels())"""
    collection = Models()

    # 1. 离线确定性模拟器
    collection.set_provider(MockProvider())

    # 2. DeepSeek 官方
    deepseek = OpenAICompatibleProvider("deepseek", "DeepSeek", "https://api.deepseek.com/v1")
    deepseek.register_model(ModelInfo(
        id="deepseek-chat",
        name="DeepSeek-V3 (Chat & Code)",
        provider="deepseek",
        context_window=64000,
        supports_reasoning=False,
        cost_input_per_m=0.14,
        cost_output_per_m=0.28
    ))
    deepseek.register_model(ModelInfo(
        id="deepseek-reasoner",
        name="DeepSeek-R1 (Thinking & Math)",
        provider="deepseek",
        context_window=64000,
        supports_reasoning=True,
        cost_input_per_m=0.55,
        cost_output_per_m=2.19
    ))
    collection.set_provider(deepseek)

    # 3. OpenAI 官方
    openai_p = OpenAICompatibleProvider("openai", "OpenAI", "https://api.openai.com/v1")
    openai_p.register_model(ModelInfo(
        id="gpt-4o",
        name="GPT-4o (Omni)",
        provider="openai",
        context_window=128000,
        supports_reasoning=False,
        cost_input_per_m=2.5,
        cost_output_per_m=10.0
    ))
    openai_p.register_model(ModelInfo(
        id="gpt-4o-mini",
        name="GPT-4o mini",
        provider="openai",
        context_window=128000,
        supports_reasoning=False,
        cost_input_per_m=0.15,
        cost_output_per_m=0.60
    ))
    openai_p.register_model(ModelInfo(
        id="o3-mini",
        name="o3-mini (Reasoning)",
        provider="openai",
        context_window=200000,
        supports_reasoning=True,
        cost_input_per_m=1.10,
        cost_output_per_m=4.40
    ))
    collection.set_provider(openai_p)

    # 4. Anthropic Claude
    collection.set_provider(AnthropicProvider())

    # 5. SiliconFlow 硅基流动
    silicon = OpenAICompatibleProvider("siliconflow", "SiliconFlow (硅基流动)", "https://api.siliconflow.cn/v1")
    silicon.register_model(ModelInfo(
        id="deepseek-ai/DeepSeek-V3",
        name="SiliconFlow DeepSeek-V3",
        provider="siliconflow",
        context_window=64000,
        supports_reasoning=False,
        cost_input_per_m=0.14,
        cost_output_per_m=0.28
    ))
    silicon.register_model(ModelInfo(
        id="deepseek-ai/DeepSeek-R1",
        name="SiliconFlow DeepSeek-R1",
        provider="siliconflow",
        context_window=64000,
        supports_reasoning=True,
        cost_input_per_m=0.55,
        cost_output_per_m=2.19
    ))
    silicon.register_model(ModelInfo(
        id="Qwen/Qwen2.5-Coder-32B-Instruct",
        name="SiliconFlow Qwen2.5-Coder-32B",
        provider="siliconflow",
        context_window=32768,
        supports_reasoning=False,
        cost_input_per_m=0.10,
        cost_output_per_m=0.20
    ))
    collection.set_provider(silicon)

    # 6. OpenRouter
    openrouter = OpenAICompatibleProvider("openrouter", "OpenRouter", "https://openrouter.ai/api/v1")
    openrouter.register_model(ModelInfo(
        id="auto",
        name="OpenRouter Auto",
        provider="openrouter",
        context_window=128000
    ))
    openrouter.register_model(ModelInfo(
        id="deepseek/deepseek-r1",
        name="OpenRouter DeepSeek-R1",
        provider="openrouter",
        context_window=64000,
        supports_reasoning=True
    ))
    collection.set_provider(openrouter)

    # 7. Ollama 本地
    collection.set_provider(OllamaProvider())

    # 8. 通用自定义 Provider 占位
    custom = OpenAICompatibleProvider("custom", "Custom OpenAI-Compatible API", "http://localhost:11434/v1")
    custom.register_model(ModelInfo(
        id="custom-default",
        name="Custom Model",
        provider="custom",
        context_window=64000
    ))
    collection.set_provider(custom)

    return collection
