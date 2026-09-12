"""
FunSearch LLM 客户端与代码抽取器 (LLM Client & Code Extractor)
============================================================
支持：
1. 通用 OpenAI 兼容在线 API (DeepSeek / Qwen / OpenAI / Ollama 等)
2. 内置确定性、可重复的离线演化模拟器 (ReproducibleMockLLM)，用于 CI 测试与离线复现
"""

import json
import os
import re
import time
import urllib.error
import urllib.request
from typing import Optional, Dict, Any

class LLMClient:
    """通用大语言模型调用客户端"""
    def __init__(
        self,
        backend: str = "deepseek",  # "deepseek", "openai", "custom", "mock"
        model: Optional[str] = None,
        api_key: Optional[str] = None,
        api_base: Optional[str] = None,
        temperature: float = 0.7,
        timeout: float = 45.0
    ):
        self.backend = backend.lower()
        self.temperature = temperature
        self.timeout = timeout

        if self.backend == "deepseek":
            self.api_base = api_base or os.environ.get("DEEPSEEK_API_BASE", "https://api.deepseek.com/v1")
            self.api_key = api_key or os.environ.get("DEEPSEEK_API_KEY", "")
            self.model = model or "deepseek-chat"
        elif self.backend == "openai":
            self.api_base = api_base or os.environ.get("OPENAI_API_BASE", "https://api.openai.com/v1")
            self.api_key = api_key or os.environ.get("OPENAI_API_KEY", "")
            self.model = model or "gpt-4o-mini"
        elif self.backend == "custom":
            self.api_base = api_base or os.environ.get("LLM_API_BASE", "http://localhost:11434/v1")
            self.api_key = api_key or os.environ.get("LLM_API_KEY", "EMPTY")
            self.model = model or "default"
        else:
            self.backend = "mock"
            self.model = "reproducible-mock-llm"
            self.api_key = "mock-key"
            self.api_base = "mock-base"

    def complete(self, prompt: str, system_prompt: Optional[str] = None) -> Tuple[str, str]:
        """
        向大模型发起调用，返回 (raw_completion, extracted_python_code)
        支持网络重试与离线模拟回退。
        """
        if self.backend == "mock" or not self.api_key:
            raw = ReproducibleMockLLM.generate_completion(prompt, self.temperature)
            code = self.extract_code(raw)
            return raw, code

        sys_msg = system_prompt or "You are an expert mathematician and algorithm engineer."
        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": sys_msg},
                {"role": "user", "content": prompt}
            ],
            "temperature": self.temperature
        }

        # 尝试最多 3 次指数退避调用
        for attempt in range(3):
            try:
                url = self.api_base.rstrip("/") + "/chat/completions"
                data = json.dumps(payload).encode("utf-8")
                req = urllib.request.Request(
                    url,
                    data=data,
                    headers={
                        "Content-Type": "application/json",
                        "Authorization": f"Bearer {self.api_key}"
                    }
                )
                with urllib.request.urlopen(req, timeout=self.timeout) as resp:
                    res_json = json.loads(resp.read().decode("utf-8"))
                    raw = res_json["choices"][0]["message"]["content"]
                    code = self.extract_code(raw)
                    return raw, code
            except Exception as e:
                time.sleep(1.0 * (attempt + 1))
                if attempt == 2:
                    print(f"⚠️ [LLMClient 警告] 线上 API 调用失败: {e}，回退至确定性模拟生成器")
                    raw = ReproducibleMockLLM.generate_completion(prompt, self.temperature)
                    return raw, self.extract_code(raw)

        return "", ""

    @staticmethod
    def extract_code(text: str) -> str:
        """从模型回复的 Markdown 中精准抽取 priority 函数"""
        # 1. 提取 ```python ... ``` 代码块
        blocks = re.findall(r"```(?:python)?\s*(def\s+priority\b.*?)```", text, re.DOTALL)
        if blocks:
            return blocks[0].strip()
        # 2. 正则查找 def priority 开始的函数体
        match = re.search(r"(def\s+priority\s*\(.*?\):.*)", text, re.DOTALL)
        if match:
            # 截取到下一个非缩进行或文本结束
            lines = match.group(1).split("\n")
            code_lines = [lines[0]]
            for line in lines[1:]:
                if line.startswith(" ") or line.startswith("\t") or line.strip() == "":
                    code_lines.append(line)
                else:
                    break
            return "\n".join(code_lines).strip()
        return text.strip()


class ReproducibleMockLLM:
    """确定性、可重复的语言模型生成模拟器（用于离线测试与 CI 流水线）"""
    @staticmethod
    def generate_completion(prompt: str, temperature: float) -> str:
        # 检测是否为双亲本交叉
        is_crossover = "Two Distinct High-Scoring Parent Programs" in prompt
        
        if is_crossover:
            return """Here is the synthesized crossover function combining both parents:
```python
def priority(p: tuple, n: int) -> float:
    # 交叉算子：结合 Parent 1 的汉明切片与 Parent 2 的坐标差分
    l0 = sum(1 for x in p if x != 0)
    diff = sum(abs(p[i] - p[(i+1)%n]) for i in range(n))
    parity = sum(p) % 3
    is_balanced = 50.0 if (p.count(1) - p.count(2)) % 3 == 0 else 0.0
    return float((l0 == n // 2 + 1) * 60.0 - diff * 1.2 + is_balanced + (parity == 1) * 25.0)
```
"""
        else:
            return """Here is the mutated function:
```python
def priority(p: tuple, n: int) -> float:
    # 变异算子：引入中间层汉明切片与仿射同余偏置
    l0 = sum(1 for x in p if x != 0)
    parity = sum(p) % 3
    bonus = 60.0 if l0 == (n // 2 + 1) else 0.0
    return float(bonus + (parity == 2) * 30.0 + p[0] * 2.15)
```
"""
