"""
安全回归测试：受限期执行环境与 Web 服务端暴露面防护
=====================================================
覆盖两类曾经真实存在的缺陷：

1. ``funsearch.evaluator.evaluate_program`` 曾以真实 ``__builtins__`` 执行代码，
   任何能访问 ``/api/eval`` 的一方即可获得本地任意代码执行能力。
2. ``web_server`` 曾发送通配 CORS 头，并通过默认静态文件服务托管 ``.git``、
   本地凭据存储与含个人信息的资助申请文档；目录列表亦可枚举整仓库。

运行：``python3 -m pytest tests/test_sandbox_security.py -v``
"""

import http.server
import json
import threading
import urllib.error
import urllib.request

import pytest

import web_server
from funsearch.evaluator import evaluate_program

# ---------------------------------------------------------------------------
# 一、受限期执行环境 (Restricted execution environment)
# ---------------------------------------------------------------------------

ESCAPE_ATTEMPTS = [
    # 函数体内导入 os —— 曾可读取环境、执行命令
    "def priority(p, n):\n    import os\n    return float(os.getuid())\n",
    # def 之后追加模块级导入
    "def priority(p, n):\n    return 0.0\nimport subprocess\n",
    # dunder 逃逸链
    "def priority(p, n):\n    return float(len(().__class__.__bases__[0].__subclasses__()))\n",
    # 直接引用 __builtins__
    "def priority(p, n):\n    return float(len(__builtins__))\n",
]


@pytest.mark.parametrize("code", ESCAPE_ATTEMPTS)
def test_sandbox_rejects_escape_attempts(code):
    """各种逃逸尝试都必须被拒绝，并返回明确的错误信息"""
    res = evaluate_program(code, 3)
    assert res["valid"] is False
    assert res["score"] == 0
    assert res["error"], "逃逸尝试必须返回错误信息，不能静默成功"


@pytest.mark.parametrize("snippet", ["import os", "open('/etc/passwd')", "__import__('os')", "globals()"])
def test_sandbox_blocks_filesystem_and_import(snippet):
    """文件系统访问与任意模块导入能力必须不可用"""
    code = f"def priority(p, n):\n    {snippet}\n    return 0.0\n"
    res = evaluate_program(code, 3)
    # 违规代码要么在静态检查阶段被拒，要么在运行期抛错；绝不能产出评分
    assert res["valid"] is False, f"{snippet} 不应被允许执行"
    assert res["score"] == 0


def test_sandbox_rejects_dangerous_builtins_before_execution():
    """危险内建函数必须在静态检查阶段被拒绝（求解器会逐点吞掉运行期异常）"""
    for snippet in ("open('/etc/passwd')", "__import__('os')", "eval('1')", "getattr(int, 'x')"):
        code = f"def priority(p, n):\n    {snippet}\n    return 0.0\n"
        res = evaluate_program(code, 3)
        assert res["valid"] is False
        assert "沙箱禁止" in (res["error"] or ""), f"{snippet} 应在静态检查阶段被拒绝: {res['error']}"


@pytest.mark.parametrize("code", [
    "def priority(p, n):\n    return sum(p)\n",
    "def priority(p, n):\n    return sum(x**2 for x in p) + math.sqrt(2)\n",
    "def priority(p, n):\n    return float(max(p) - min(p))\n",
    "def priority(p, n):\n    import math\n    return float(math.floor(sum(p) / 2))\n",
])
def test_sandbox_allows_legitimate_math(code):
    """正常数学启发式（含内建函数、math 模块）必须保持可用"""
    res = evaluate_program(code, 3)
    assert res["valid"] is True, res
    assert res["score"] > 0


def test_sandbox_does_not_pollute_shared_math_module():
    """求值代码不得污染进程内共享的 math 模块状态"""
    import math

    evaluate_program("def priority(p, n):\n    math.PWNED = 1\n    return 0.0\n", 3)
    assert not hasattr(math, "PWNED")


def test_syntax_error_is_still_reported():
    """语法错误仍须返回 valid=False 且错误信息包含 SyntaxError"""
    res = evaluate_program("def priority(p, n):\n    return sum(p) +++ \n", 2)
    assert res["valid"] is False
    assert "SyntaxError" in res["error"]


# ---------------------------------------------------------------------------
# 二、Web 服务端暴露面 (HTTP exposure surface)
# ---------------------------------------------------------------------------

@pytest.fixture()
def live_server():
    """在临时端口上启动真实的 AxiomForgeHandler"""
    server = http.server.ThreadingHTTPServer(("127.0.0.1", 0), web_server.AxiomForgeHandler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        yield f"http://127.0.0.1:{server.server_address[1]}"
    finally:
        server.shutdown()
        server.server_close()
        thread.join(timeout=5)


def _request(url, method="GET", headers=None):
    req = urllib.request.Request(url, method=method, headers=headers or {})
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            return resp.status, dict(resp.headers), resp.read()
    except urllib.error.HTTPError as e:
        return e.code, dict(e.headers), e.read()


@pytest.mark.parametrize("path", [
    "/.git/config",
    "/.gitignore",
    "/.axiomforge/credentials.json",
    "/docs/grants/openai_researcher_access_application.md",
    "/__pycache__/",
])
def test_sensitive_paths_are_not_served(live_server, path):
    """仓库元数据、本地凭据与资助申请文档不得被托管"""
    status, _, _ = _request(live_server + path)
    assert status == 404, f"{path} 不应对外托管"


def test_directory_listing_is_disabled(live_server):
    """未包含 index.html 的目录不得列出文件清单"""
    status, _, _ = _request(live_server + "/js/")
    assert status == 404


def test_wildcard_cors_is_removed(live_server):
    """任意来源不得获得 CORS 授权；本机来源仍可用于多端口调试"""
    _, foreign, _ = _request(live_server + "/api/providers", headers={"Origin": "https://evil.example.com"})
    assert "Access-Control-Allow-Origin" not in foreign

    _, local, _ = _request(live_server + "/api/providers", headers={"Origin": "http://localhost:5173"})
    assert local.get("Access-Control-Allow-Origin") == "http://localhost:5173"


@pytest.mark.parametrize("query", ["abc", "0", "99", "-1"])
def test_invalid_dimension_returns_400(live_server, query):
    """非法 dimension 须返回 400 JSON，而非中断连接或抛出未捕获异常"""
    status, _, body = _request(live_server + f"/api/topology?dimension={query}")
    assert status == 400
    assert "error" in json.loads(body)


def test_empty_dimension_falls_back_to_default(live_server):
    """空值回退到默认维度（3 维），不应报错"""
    status, _, body = _request(live_server + "/api/topology?dimension=")
    assert status == 200
    assert json.loads(body)["total_points"] == 27


def test_valid_api_endpoints_still_work(live_server):
    """加固不得破坏正常 API 行为"""
    status, _, body = _request(live_server + "/api/topology?dimension=4")
    assert status == 200
    assert json.loads(body)["total_points"] == 81

    status, _, body = _request(live_server + "/api/providers")
    assert status == 200
    assert "providers" in json.loads(body)


def test_unknown_api_endpoint_returns_json_404(live_server):
    status, _, body = _request(live_server + "/api/does-not-exist")
    assert status == 404
    assert "error" in json.loads(body)
