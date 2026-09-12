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
import sys
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
        provider_id = payload.get("provider_id", "deepseek")
        api_key = payload.get("api_key")
        api_base = payload.get("api_base")
        valid, msg = MODELS_REGISTRY.check_auth(provider_id, explicit_key=api_key, explicit_base=api_base)
        self._send_json({"valid": valid, "message": msg})

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
        res = evaluate_program(code_str, n)
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
