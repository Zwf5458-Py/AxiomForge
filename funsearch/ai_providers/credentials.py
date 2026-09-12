"""
AxiomForge AI Providers: 认证与凭据解析系统 (Credentials & Auth Resolver)
参考 @earendil-works/pi-ai 的 Auth Resolution 体系。
优先级：显式传入 (Explicit) > 环境变量 (Env) > 本地凭据存储 (File) > 默认配置 (Default)
"""

import json
import os
from pathlib import Path
from typing import Any, Dict, Optional, Tuple
from .types import ProviderAuth

ENV_VAR_MAPPING = {
    "deepseek": ["DEEPSEEK_API_KEY"],
    "openai": ["OPENAI_API_KEY"],
    "anthropic": ["ANTHROPIC_API_KEY"],
    "openrouter": ["OPENROUTER_API_KEY"],
    "siliconflow": ["SILICONFLOW_API_KEY", "SILICON_API_KEY"],
    "ollama": ["OLLAMA_API_KEY"],
    "custom": ["CUSTOM_LLM_API_KEY", "LLM_API_KEY"]
}

ENV_BASE_URL_MAPPING = {
    "deepseek": "DEEPSEEK_API_BASE",
    "openai": "OPENAI_API_BASE",
    "anthropic": "ANTHROPIC_API_BASE",
    "openrouter": "OPENROUTER_API_BASE",
    "siliconflow": "SILICONFLOW_API_BASE",
    "ollama": "OLLAMA_API_BASE",
    "custom": "CUSTOM_LLM_API_BASE"
}

DEFAULT_BASE_URLS = {
    "deepseek": "https://api.deepseek.com/v1",
    "openai": "https://api.openai.com/v1",
    "anthropic": "https://api.anthropic.com/v1",
    "openrouter": "https://openrouter.ai/api/v1",
    "siliconflow": "https://api.siliconflow.cn/v1",
    "ollama": "http://localhost:11434/v1",
    "custom": "http://localhost:11434/v1",
    "mock": "mock://internal"
}

class CredentialStore:
    """本地加密/明文凭据存储管理器"""
    def __init__(self, storage_path: Optional[str] = None):
        if storage_path:
            self.path = Path(storage_path)
        else:
            # 优先项目根目录 .axiomforge/credentials.json，次选用户主目录
            local_proj = Path(".axiomforge/credentials.json")
            if local_proj.parent.exists() or local_proj.exists():
                self.path = local_proj
            else:
                self.path = Path.home() / ".axiomforge" / "credentials.json"

    def load(self) -> Dict[str, Dict[str, Any]]:
        if not self.path.exists():
            return {}
        try:
            with open(self.path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return {}

    def save(self, provider_id: str, api_key: str, api_base: Optional[str] = None, headers: Optional[Dict[str, str]] = None):
        data = self.load()
        self.path.parent.mkdir(parents=True, exist_ok=True)
        data[provider_id] = {
            "api_key": api_key,
            "api_base": api_base or DEFAULT_BASE_URLS.get(provider_id, ""),
            "headers": headers or {}
        }
        with open(self.path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

    def delete(self, provider_id: str):
        data = self.load()
        if provider_id in data:
            del data[provider_id]
            with open(self.path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)

class AuthResolver:
    """鉴权解析器"""
    def __init__(self, credential_store: Optional[CredentialStore] = None):
        self.store = credential_store or CredentialStore()

    def resolve(
        self,
        provider_id: str,
        explicit_key: Optional[str] = None,
        explicit_base: Optional[str] = None,
        explicit_headers: Optional[Dict[str, str]] = None
    ) -> ProviderAuth:
        """
        按优先级自动解析 Provider 的可用凭据与端点
        """
        # 1. 显式提供
        if explicit_key:
            return ProviderAuth(
                api_key=explicit_key,
                api_base=explicit_base or DEFAULT_BASE_URLS.get(provider_id, ""),
                headers=explicit_headers or {},
                source="explicit"
            )

        # 2. 环境变量
        env_vars = ENV_VAR_MAPPING.get(provider_id, [])
        for var in env_vars:
            val = os.environ.get(var)
            if val:
                env_base_var = ENV_BASE_URL_MAPPING.get(provider_id)
                env_base = os.environ.get(env_base_var) if env_base_var else None
                return ProviderAuth(
                    api_key=val,
                    api_base=explicit_base or env_base or DEFAULT_BASE_URLS.get(provider_id, ""),
                    headers=explicit_headers or {},
                    source=f"env:{var}"
                )

        # 3. 凭据文件
        stored = self.store.load().get(provider_id)
        if stored and stored.get("api_key"):
            merged_headers = dict(stored.get("headers", {}))
            if explicit_headers:
                merged_headers.update(explicit_headers)
            return ProviderAuth(
                api_key=stored["api_key"],
                api_base=explicit_base or stored.get("api_base") or DEFAULT_BASE_URLS.get(provider_id, ""),
                headers=merged_headers,
                source="credentials_file"
            )

        # 4. 特殊 Provider (如 mock 或本地免密 ollama)
        if provider_id == "mock":
            return ProviderAuth(
                api_key="mock-key",
                api_base="mock://internal",
                source="default_mock"
            )
        if provider_id == "ollama":
            env_base = os.environ.get("OLLAMA_API_BASE", DEFAULT_BASE_URLS["ollama"])
            return ProviderAuth(
                api_key="ollama-local",
                api_base=explicit_base or env_base,
                source="default_ollama"
            )

        return ProviderAuth(
            api_key=None,
            api_base=explicit_base or DEFAULT_BASE_URLS.get(provider_id, ""),
            headers=explicit_headers or {},
            source="unconfigured"
        )
