"""
AxiomForge AI Providers: 数据模型与协议定义
参考 @earendil-works/pi-ai 架构设计，提供统一的多模型平台抽象。
"""

from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Union, Literal

@dataclass
class ModelInfo:
    """模型元信息定义"""
    id: str                                      # 内部唯一 ID (如 "deepseek-chat")
    name: str                                    # 人类可读名称 (如 "DeepSeek-V3")
    provider: str                                # 所属 Provider ID (如 "deepseek", "openai", "custom")
    api: str = "openai-completions"              # 通信协议类型 ("openai-completions", "anthropic-messages", "ollama")
    context_window: int = 64000                  # 上下文窗口大小 (tokens)
    supports_reasoning: bool = False             # 是否支持显式思考链 (如 DeepSeek-R1 / o1 / o3)
    supports_tools: bool = True                  # 是否支持工具调用 (Function Calling)
    cost_input_per_m: float = 0.0                # 每百万输入 Token 费用 (美元或预估基准)
    cost_output_per_m: float = 0.0               # 每百万输出 Token 费用 (美元或预估基准)
    headers: Dict[str, str] = field(default_factory=dict) # 模型特有额外 Headers

@dataclass
class UsageStats:
    """Token 使用量与费用统计"""
    input_tokens: int = 0
    output_tokens: int = 0
    reasoning_tokens: int = 0
    total_tokens: int = 0
    cost_estimate_usd: float = 0.0
    latency_seconds: float = 0.0

@dataclass
class StreamEvent:
    """流式事件对象 (对齐 pi-ai Stream Events)"""
    type: Literal[
        "start",
        "thinking_start",
        "thinking_delta",
        "thinking_end",
        "text_start",
        "text_delta",
        "text_end",
        "done",
        "error"
    ]
    delta: str = ""
    reasoning_content: str = ""
    full_text: str = ""
    usage: Optional[UsageStats] = None
    error_message: Optional[str] = None

@dataclass
class CompletionResult:
    """单次非流式完整响应结果"""
    text: str
    reasoning: Optional[str] = None
    model: str = ""
    provider: str = ""
    usage: UsageStats = field(default_factory=UsageStats)
    raw_response: Dict[str, Any] = field(default_factory=dict)

@dataclass
class ProviderAuth:
    """解析后的鉴权凭据"""
    api_key: Optional[str] = None
    api_base: Optional[str] = None
    headers: Dict[str, str] = field(default_factory=dict)
    source: str = "unconfigured"                  # "explicit", "env", "credentials_file", "default"
