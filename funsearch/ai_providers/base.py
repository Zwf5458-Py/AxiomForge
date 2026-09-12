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

    def fetch_remote_models(self, auth: ProviderAuth, timeout: float = 15.0) -> List[ModelInfo]:
        """动态从远端端点获取模型清单 (对齐 pi-ai models.refresh())"""
        return self.get_models()

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
        if not text:
            return ""

        # 1. 优先提取标准 Markdown 代码块 (含 ```python 或 ```py，也容错未闭合代码块)
        code_candidates = []
        for m in re.finditer(r"```(?:python|py)?\s*([\s\S]*?)(?:```|$)", text):
            blk = m.group(1).strip()
            if blk:
                code_candidates.append(blk)
        # 将原始文本本身也作为候选
        code_candidates.append(text.strip())

        # 2. 在候选文本中查找 def priority 函数声明 (完全兼容 -> float / -> int 等返回类型注解与各种形参)
        sig_pattern = re.compile(r"^[ \t]*def\s+priority\s*\([^)]*\)(?:\s*->\s*[^:]+)?:", re.MULTILINE)
        for candidate in code_candidates:
            m = sig_pattern.search(candidate)
            if m:
                sub = candidate[m.start():]
                lines = sub.split("\n")
                result_lines = [lines[0].strip()]
                for line in lines[1:]:
                    if line.startswith(" ") or line.startswith("\t") or line.strip() == "":
                        result_lines.append(line)
                    else:
                        break
                return "\n".join(result_lines).strip()

        # 3. 别名与相似函数容错匹配 (如 def cap_set_priority / def evaluate / def score 等)
        alias_pattern = re.compile(
            r"^[ \t]*def\s+(?:cap_set_priority|heuristic_priority|point_priority|evaluate_point|score_point|heuristic|evaluate|\w+)\s*\((?:p|point|vector|coord)[^)]*\)(?:\s*->\s*[^:]+)?:",
            re.MULTILINE
        )
        for candidate in code_candidates:
            m = alias_pattern.search(candidate)
            if m:
                sub = candidate[m.start():]
                lines = sub.split("\n")
                result_lines = ["def priority(p: tuple, n: int) -> float:"]
                for line in lines[1:]:
                    if line.startswith(" ") or line.startswith("\t") or line.strip() == "":
                        result_lines.append(line)
                    else:
                        break
                return "\n".join(result_lines).strip()

        # 4. 如果代码块直接写了 return 语句而没有 def
        for candidate in code_candidates:
            if "return " in candidate and "def " not in candidate:
                return f"def priority(p: tuple, n: int) -> float:\n    {candidate}"

        return ""

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
