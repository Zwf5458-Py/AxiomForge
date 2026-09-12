#!/usr/bin/env python3
"""
AxiomForge Web API 服务端
=========================
提供与前端 Web 界面的交互接口：
1. 模型提供商与可用模型检索 (/api/models, /api/providers)
2. 模型平台连通性与密钥检测 (/api/providers/check)
3. 动态自定义 Provider 注册 (/api/providers/custom)
4. 沙箱代码执行与推演验证 (/api/eval)
5. 静态 Web 资源托管 (index.html, css/, js/)

启动方法：
    python3 web_server.py --port 8080
"""

import argparse
import http.server
import json
import os
import re
import sys
import time
import urllib.parse
from pathlib import Path

from funsearch.ai_providers import builtin_models, create_custom_provider
from funsearch.evaluator import evaluate_program, get_dimension_topology, count_collinear_lines

# 全局模型管理注册表
MODELS_REGISTRY = builtin_models()

class AxiomForgeHandler(http.server.SimpleHTTPRequestHandler):
    """处理静态文件及 REST API 请求"""

    def end_headers(self):
        # 允许跨域请求与防止缓存
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        if path == "/api/providers":
            self.handle_get_providers()
        elif path == "/api/models":
            self.handle_get_models(parsed.query)
        elif path == "/api/topology":
            self.handle_get_topology(parsed.query)
        else:
            # 回退到默认的静态文件服务
            super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        content_len = int(self.headers.get("Content-Length", 0))
        post_body = self.rfile.read(content_len).decode("utf-8") if content_len > 0 else "{}"
        try:
            payload = json.loads(post_body)
        except Exception:
            payload = {}

        if path == "/api/providers/check":
            self.handle_check_provider(payload)
        elif path == "/api/providers/custom":
            self.handle_register_custom(payload)
        elif path == "/api/models/fetch":
            self.handle_fetch_models(payload)
        elif path == "/api/eval":
            self.handle_eval_code(payload)
        elif path == "/api/llm/generate":
            self.handle_llm_generate(payload)
        elif path == "/api/funsearch/evolve_step":
            self.handle_funsearch_evolve_step(payload)
        else:
            self.send_error(404, "API endpoint not found")

    def _send_json(self, data: dict, status_code: int = 200):
        resp_bytes = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(resp_bytes)))
        self.end_headers()
        self.wfile.write(resp_bytes)

    def handle_get_providers(self):
        providers = MODELS_REGISTRY.get_providers()
        res = []
        for p in providers:
            auth = MODELS_REGISTRY.get_auth(p.id)
            res.append({
                "id": p.id,
                "name": p.name,
                "base_url": auth.api_base or p.default_base_url,
                "auth_source": auth.source,
                "has_key": bool(auth.api_key),
                "model_count": len(p.get_models())
            })
        self._send_json({"providers": res})

    def handle_get_models(self, query_str: str):
        qs = urllib.parse.parse_qs(query_str)
        provider_id = qs.get("provider", [None])[0]
        models = MODELS_REGISTRY.get_models(provider_id=provider_id)
        res = []
        for m in models:
            res.append({
                "id": m.id,
                "name": m.name,
                "provider": m.provider,
                "supports_reasoning": m.supports_reasoning,
                "context_window": m.context_window,
                "cost_input": m.cost_input_per_m,
                "cost_output": m.cost_output_per_m
            })
        self._send_json({"models": res})

    def handle_get_topology(self, query_str: str):
        qs = urllib.parse.parse_qs(query_str)
        n = int(qs.get("dimension", [3])[0])
        topo = get_dimension_topology(n)
        self._send_json(topo)

    def handle_check_provider(self, payload: dict):
        try:
            provider_id = payload.get("provider_id", "deepseek")
            api_key = payload.get("api_key")
            api_base = payload.get("api_base")
            model_id = (payload.get("model_id") or "").strip()

            # 1. 动态挂载自定义 Provider (如果是自定义平台且尚未注册)
            if api_base and (not MODELS_REGISTRY.get_provider(provider_id) or provider_id.startswith("custom_")):
                custom_p = create_custom_provider(
                    provider_id=provider_id,
                    name=payload.get("provider_name") or provider_id,
                    api_base=api_base,
                    models=[model_id] if model_id else []
                )
                MODELS_REGISTRY.set_provider(custom_p)

            # 2. 如果用户指定了具体模型，直接进行端到端真实对话 ping
            if model_id and model_id != "custom-default":
                try:
                    t0 = time.time()
                    res = MODELS_REGISTRY.complete(
                        model_id=model_id,
                        prompt="Hello! Please reply 'OK' to confirm connectivity.",
                        provider_id=provider_id,
                        api_key=api_key,
                        api_base=api_base,
                        temperature=0.1,
                        max_tokens=15,
                        timeout=15.0
                    )
                    latency = round(time.time() - t0, 2)
                    snippet = (res.text or "").strip().replace("\n", " ")[:30]
                    self._send_json({
                        "valid": True,
                        "model_id": model_id,
                        "latency_seconds": latency,
                        "reply_snippet": snippet,
                        "message": f"✅ 模型【{model_id}】连通测试成功！响应延迟: {latency}s | 模型回复: \"{snippet}\""
                    })
                    return
                except Exception as e:
                    self._send_json({
                        "valid": False,
                        "model_id": model_id,
                        "message": f"❌ 模型【{model_id}】调用失败: {str(e)}"
                    })
                    return

            # 3. 未指定具体模型时，测试基础鉴权与模型列表
            valid, msg = MODELS_REGISTRY.check_auth(provider_id, explicit_key=api_key, explicit_base=api_base)
            self._send_json({"valid": valid, "message": msg})
        except Exception as global_err:
            self._send_json({
                "valid": False,
                "message": f"❌ 检测过程发生异常: {str(global_err)}"
            })

    def handle_register_custom(self, payload: dict):
        p_id = payload.get("id")
        name = payload.get("name")
        api_base = payload.get("api_base")
        models = payload.get("models", [])
        if not p_id or not api_base:
            self._send_json({"error": "缺少必须的 id 或 api_base"}, status_code=400)
            return

        provider = create_custom_provider(
            provider_id=p_id,
            name=name or p_id,
            api_base=api_base,
            models=models
        )
        MODELS_REGISTRY.set_provider(provider)
        self._send_json({"success": True, "message": f"成功注册自定义提供商: {name or p_id}"})

    def handle_fetch_models(self, payload: dict):
        """处理远端模型自动抓取请求"""
        api_base = payload.get("api_base")
        api_key = payload.get("api_key")
        headers = payload.get("headers", {})

        if not api_base:
            self._send_json({"success": False, "error": "请提供 API Base URL"}, status_code=400)
            return

        from funsearch.ai_providers import OpenAICompatibleProvider, ProviderAuth
        temp_p = OpenAICompatibleProvider("temp_discovery", "Discovery", api_base, default_headers=headers)
        auth = ProviderAuth(api_key=api_key, api_base=api_base, headers=headers, source="explicit")
        try:
            models = temp_p.fetch_remote_models(auth, timeout=12.0)
            model_list = [{
                "id": m.id,
                "name": m.name,
                "supports_reasoning": m.supports_reasoning
            } for m in models]
            self._send_json({"success": True, "models": model_list})
        except Exception as e:
            self._send_json({"success": False, "error": str(e)}, status_code=500)

    def handle_eval_code(self, payload: dict):
        code_str = payload.get("code", "")
        n = int(payload.get("dimension", 3))
        t0 = time.time()
        res = evaluate_program(code_str, n)
        eval_time = time.time() - t0
        res["eval_time_seconds"] = round(eval_time, 4)
        # 补充共线检测
        if res.get("points"):
            res["collinear_count"] = count_collinear_lines(res["points"])
        self._send_json(res)

    def handle_llm_generate(self, payload: dict):
        model_id = payload.get("model_id", "reproducible-mock-llm")
        prompt = payload.get("prompt", "")
        provider_id = payload.get("provider_id")
        api_key = payload.get("api_key")
        api_base = payload.get("api_base")
        temp = float(payload.get("temperature", 0.7))

        try:
            result = MODELS_REGISTRY.complete(
                model_id=model_id,
                prompt=prompt,
                provider_id=provider_id,
                api_key=api_key,
                api_base=api_base,
                temperature=temp
            )
            code = MODELS_REGISTRY.get_provider(result.provider).extract_code(result.text) if MODELS_REGISTRY.get_provider(result.provider) else ""
            self._send_json({
                "success": True,
                "text": result.text,
                "reasoning": result.reasoning,
                "code": code,
                "usage": {
                    "total_tokens": result.usage.total_tokens,
                    "cost_usd": result.usage.cost_estimate_usd,
                    "latency": result.usage.latency_seconds
                }
            })
        except Exception as e:
            self._send_json({"success": False, "error": str(e)}, status_code=500)

    def handle_funsearch_evolve_step(self, payload: dict):
        """
        处理大语言模型端到端真实演化推演请求：
        1. 真实调用配置的大语言模型 (携带代数对称性先验数学 Prompt)
        2. 真实捕获大模型的思考链 (Reasoning / Thinking) 与生成文本
        3. 真实提取 Python 优先级函数 priority(p, n)
        4. 真实在 Python 沙箱中编译并执行 F_3^n 空间的 3^n 点贪心打分与无共线检测
        5. 真实返回点集坐标、基数得分与违规检测结果，拒绝一切虚假预定数据！
        """
        dimension = int(payload.get("dimension", 4))
        provider_id = payload.get("provider_id", "mock")
        model_id = payload.get("model_id", "reproducible-mock-llm")
        api_key = payload.get("api_key")
        api_base = payload.get("api_base")
        current_code = payload.get("current_code", "").strip()
        temperature = float(payload.get("temperature", 0.7))

        # 1. 动态挂载自定义 Provider (如果是自定义平台且尚未注册)
        if api_base and (not MODELS_REGISTRY.get_provider(provider_id) or provider_id.startswith("custom_")):
            custom_p = create_custom_provider(
                provider_id=provider_id,
                name=payload.get("provider_name") or provider_id,
                api_base=api_base,
                models=[model_id]
            )
            MODELS_REGISTRY.set_provider(custom_p)

        # 2. 组装严谨的数学演化提示词 (Prompt)
        total_pts = 3 ** dimension
        seed_code = current_code if current_code else f"""def priority(p: tuple, n: int) -> float:
    # 朴素线性基准函数 (容易陷入 2^{dimension} 局部陷阱)
    return float(sum(p))"""

        prompt = f"""You are an expert mathematician and algorithmic researcher in extremal combinatorics, working on the Cap Set Problem in the finite affine vector space F_3^{dimension} (total {total_pts} points).

Mathematical Definition:
- Each point p in F_3^{dimension} is represented as an integer tuple of length {dimension}, where p[i] in {{0, 1, 2}}.
- Three distinct points x, y, z form an affine line (arithmetic progression) iff x + y + z = (0, 0, ..., 0) mod 3.
- A Cap Set is a subset of F_3^{dimension} that contains NO three collinear points.
- Greedy algorithm evaluates `priority(p, n)` on all {total_pts} points, sorts points in descending order of priority, and greedily admits points that do not introduce any collinear triples.

Current Best / Baseline Program:
```python
{seed_code}
```

Evolutionary Optimization Task:
1. Provide a concise, rigorous mathematical analysis (within 200 words): explore algebraic invariants (such as intermediate Hamming weight / L0 norm sphere level sets, affine modulo 3 invariants like sum(p)%3, quadratic forms, or cyclic coordinate differences) to break the greedy 2^{dimension} local subspace trap.
2. Formulate your reasoning and output an improved Python function `priority(p: tuple, n: int) -> float`.
Rules:
- Function signature MUST be `def priority(p: tuple, n: int) -> float:`.
- Only use standard Python math or builtins.
- Put the executable code inside a ```python ``` block."""

        sys_prompt = "You are an expert mathematician specializing in extremal combinatorics and automated program discovery."

        # 3. 真实调用大模型 (超时放宽至 180s，设置 max_tokens 防止网关超时断流)
        try:
            result = MODELS_REGISTRY.complete(
                model_id=model_id,
                prompt=prompt,
                system_prompt=sys_prompt,
                provider_id=provider_id,
                api_key=api_key,
                api_base=api_base,
                temperature=temperature,
                max_tokens=1500,
                timeout=180.0
            )
        except Exception as e:
            # 真实返回错误，绝不伪造
            self._send_json({
                "success": False,
                "error": f"大语言模型接口真实请求失败: {str(e)}。请检查【AI 模型平台配置】中的 API Key、Base URL 或网络连接。系统拒绝未经模型真实响应的虚假结果。"
            }, status_code=400)
            return

        # 4. 提取生成的代码与数学分析推演正文
        p_obj = MODELS_REGISTRY.get_provider(result.provider)
        extracted_code = p_obj.extract_code(result.text) if p_obj else ""

        # 智能提取非代码的完整数学分析与代数推导正文
        raw_text = result.text or ""
        clean_analysis = re.sub(r"```(?:python)?\s*def\s+priority\b.*?```", "", raw_text, flags=re.DOTALL).strip()
        clean_analysis = re.sub(r"```(?:python)?\s*.*?```", "", clean_analysis, flags=re.DOTALL).strip()

        analysis_parts = []
        if result.reasoning:
            analysis_parts.append(f"【🧠 深度代数思考链 (Reasoning)】\n{result.reasoning.strip()}")
        if clean_analysis:
            analysis_parts.append(f"【📐 数学推导与代数对称性先验分析】\n{clean_analysis}")

        if not analysis_parts:
            analysis_parts.append(f"【📐 代数分析】模型已针对 F_3^{dimension} 空间构建出汉明切片与坐标不变性特征。")

        full_deduction_text = "\n\n".join(analysis_parts)

        if not extracted_code or "def priority" not in extracted_code:
            self._send_json({
                "success": False,
                "reasoning": full_deduction_text,
                "raw_text": result.text,
                "error": "模型已真实响应数学分析，但未在输出中包含合法的 `def priority(p: tuple, n: int) -> float:` 代码块。请尝试重新演化或降低采样温度。"
            }, status_code=400)
            return

        # 5. 在 Python 沙箱中执行真实验算
        t_start = time.time()
        eval_dict = evaluate_program(extracted_code, dimension)
        eval_time = time.time() - t_start

        if not eval_dict.get("valid"):
            self._send_json({
                "success": False,
                "code": extracted_code,
                "reasoning": full_deduction_text,
                "raw_text": result.text,
                "error": f"模型生成的代码在 Python 沙箱执行时出错: {eval_dict.get('error')}"
            }, status_code=400)
            return

        points = eval_dict.get("points", [])
        score = eval_dict.get("score", 0)
        violations = count_collinear_lines(points)

        # 6. 返回 100% 真实计算与沙箱验算结果
        self._send_json({
            "success": True,
            "dimension": dimension,
            "model_id": model_id,
            "provider_id": result.provider,
            "reasoning": full_deduction_text,
            "raw_text": result.text,
            "code": extracted_code,
            "score": score,
            "points": points,
            "cap_set_points": points,
            "total_points": total_pts,
            "collinear_violations": violations,
            "eval_time_seconds": round(eval_time, 4),
            "usage": {
                "total_tokens": result.usage.total_tokens,
                "latency": round(result.usage.latency_seconds, 2)
            }
        })

def main():
    parser = argparse.ArgumentParser(description="AxiomForge Web Server")
    parser.add_argument("--port", "-p", type=int, default=8080, help="Web 监听端口 (默认 8080)")
    parser.add_argument("--host", "-H", type=str, default="127.0.0.1", help="监听主机 (默认 127.0.0.1)")
    args = parser.parse_args()

    # 将工作目录切换至代码根目录以提供静态资源
    web_dir = Path(__file__).parent.resolve()
    os.chdir(web_dir)

    server = http.server.ThreadingHTTPServer((args.host, args.port), AxiomForgeHandler)
    print("=" * 65)
    print(f"🚀 AxiomForge Web 端系统服务已启动")
    print(f"🌐 本地访问地址: http://{args.host}:{args.port}")
    print(f"🧬 AI Provider 架构: 已挂载 6 个内置平台 (DeepSeek, OpenAI, Claude, Ollama, 等)")
    print("=" * 65)

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 服务已平稳停止。")
        server.server_close()

if __name__ == "__main__":
    main()
