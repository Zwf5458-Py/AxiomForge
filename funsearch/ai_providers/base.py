"""
AxiomForge AI Providers: Provider 抽象基类
参考 @earendil-works/pi-ai 设计。
"""

import abc
import re
import time
from typing import Any, AsyncIterator, Dict, Iterator, List, Optional, Tuple
from .types import CompletionResult, ModelInfo, ProviderAuth, StreamEvent, UsageStats

class BaseProvider(abc.ABC):
    """大模型提供商基础抽象基类"""

    def __init__(
        self,
        provider_id: str,
        name: str,
        default_base_url: str,
        default_headers: Optional[Dict[str, str]] = None
    ):
        self.id = provider_id
        self.name = name
        self.default_base_url = default_base_url
        self.default_headers = default_headers or {}
        self._models: Dict[str, ModelInfo] = {}

    def register_model(self, model: ModelInfo):
        """注册支持的模型"""
        self._models[model.id] = model

    def get_models(self) -> List[ModelInfo]:
        """获取该 Provider 下的所有可用模型"""
        return list(self._models.values())

    def get_model(self, model_id: str) -> Optional[ModelInfo]:
        """获取单个模型元信息"""
        return self._models.get(model_id)

    @abc.abstractmethod
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
        """非流式完整调用"""
        pass

    @abc.abstractmethod
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
        """流式调用生成器"""
        pass

    @abc.abstractmethod
    def check_auth(self, auth: ProviderAuth) -> Tuple[bool, str]:
        """连通性与鉴权校验，返回 (is_valid, message)"""
        pass

    @staticmethod
    def extract_code(text: str) -> str:
        """从模型回复中抽取出 Python 优先级函数 priority 代码"""
        # 1. 匹配标准 ```python def priority ... ``` 代码块
        blocks = re.findall(r"```(?:python)?\s*(def\s+priority\b.*?)```", text, re.DOTALL)
        if blocks:
            return blocks[0].strip()
        # 2. 匹配任意 ```python ... ``` 块中包含 def priority 的内容
        all_blocks = re.findall(r"```(?:python)?\s*(.*?)```", text, re.DOTALL)
        for b in all_blocks:
            if "def priority" in b:
                return b.strip()
        # 3. 正则查找 def priority 开始的函数体至下一个顶层定义或文本结尾
        match = re.search(r"(def\s+priority\s*\(.*?\):.*)", text, re.DOTALL)
        if match:
            lines = match.group(1).split("\n")
            code_lines = [lines[0]]
            for line in lines[1:]:
                if line.startswith(" ") or line.startswith("\t") or line.strip() == "":
                    code_lines.append(line)
                else:
                    break
            return "\n".join(code_lines).strip()
        return text.strip()

    @staticmethod
    def extract_reasoning_and_text(raw_text: str) -> Tuple[Optional[str], str]:
        """
        从文本中提取 <think>...</think> 标签中的思考过程
        支持 DeepSeek-R1 / QwQ 等开源思考模型
        """
        think_pattern = re.compile(r"<think>(.*?)</think>", re.DOTALL)
        match = think_pattern.search(raw_text)
        if match:
            reasoning = match.group(1).strip()
            cleaned_text = think_pattern.sub("", raw_text).strip()
            return reasoning, cleaned_text
        return None, raw_text
