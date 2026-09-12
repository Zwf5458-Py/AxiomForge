"""
AxiomForge AI Providers: Ollama 本地模型专用提供商
支持零 Key 本地大模型驱动与本地可用模型动态检索。
"""

import json
import urllib.error
import urllib.request
from typing import Dict, List, Optional, Tuple
from .openai_provider import OpenAICompatibleProvider
from .types import ModelInfo, ProviderAuth

class OllamaProvider(OpenAICompatibleProvider):
    def __init__(self):
        super().__init__(
            provider_id="ollama",
            name="Ollama (Local Open Source)",
            default_base_url="http://localhost:11434/v1"
        )
        # 预设几个常用开源代码/数学大模型
        self.register_model(ModelInfo(
            id="qwen2.5-coder:latest",
            name="Qwen2.5-Coder (Local)",
            provider="ollama",
            api="ollama",
            context_window=32768,
            supports_reasoning=False
        ))
        self.register_model(ModelInfo(
            id="deepseek-r1:latest",
            name="DeepSeek-R1 (Local Distill)",
            provider="ollama",
            api="ollama",
            context_window=32768,
            supports_reasoning=True
        ))
        self.register_model(ModelInfo(
            id="llama3.3:latest",
            name="Llama 3.3 (Local)",
            provider="ollama",
            api="ollama",
            context_window=32768,
            supports_reasoning=False
        ))

    def refresh_local_models(self, base_url: Optional[str] = None) -> List[ModelInfo]:
        """向本地 Ollama /api/tags 发起探测，动态同步本地已拉取的模型"""
        target = (base_url or self.default_base_url).replace("/v1", "") + "/api/tags"
        try:
            req = urllib.request.Request(target, method="GET")
            with urllib.request.urlopen(req, timeout=3.0) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                discovered = []
                for m in data.get("models", []):
                    m_id = m.get("name")
                    if m_id:
                        info = ModelInfo(
                            id=m_id,
                            name=f"{m_id} (Ollama Local)",
                            provider=self.id,
                            api="ollama",
                            context_window=32768,
                            supports_reasoning=("r1" in m_id.lower() or "reasoner" in m_id.lower())
                        )
                        self.register_model(info)
                        discovered.append(info)
                return discovered
        except Exception:
            return self.get_models()

    def check_auth(self, auth: ProviderAuth) -> Tuple[bool, str]:
        base = auth.api_base or self.default_base_url
        root_url = base.replace("/v1", "") + "/api/version"
        try:
            req = urllib.request.Request(root_url, method="GET")
            with urllib.request.urlopen(req, timeout=3.0) as resp:
                ver_info = json.loads(resp.read().decode("utf-8"))
                return True, f"Ollama 运行正常 (版本: {ver_info.get('version', 'unknown')})"
        except Exception as e:
            return False, f"未检测到正在运行的 Ollama 守护进程 (尝试访问 {root_url}): {e}"
