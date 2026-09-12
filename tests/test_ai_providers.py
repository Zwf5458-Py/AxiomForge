"""
AxiomForge: AI Providers 单元测试套件
验证多模型平台接入、鉴权解析、动态自定义 Provider 及流式输出。
"""

import os
import unittest
from funsearch.ai_providers import (
    Models,
    builtin_models,
    create_custom_provider,
    AuthResolver,
    CredentialStore,
    MockProvider,
    OpenAICompatibleProvider,
    BaseProvider
)
from funsearch.llm_client import LLMClient

class TestAIProviders(unittest.TestCase):
    def setUp(self):
        self.models = builtin_models()

    def test_builtin_models_registry(self):
        """测试内置模型集合正常加载"""
        providers = self.models.get_providers()
        provider_ids = [p.id for p in providers]
        self.assertIn("mock", provider_ids)
        self.assertIn("deepseek", provider_ids)
        self.assertIn("openai", provider_ids)
        self.assertIn("anthropic", provider_ids)
        self.assertIn("siliconflow", provider_ids)
        self.assertIn("ollama", provider_ids)

        # 检查具体模型
        ds_model = self.models.get_model("deepseek-reasoner")
        self.assertIsNotNone(ds_model)
        self.assertTrue(ds_model.supports_reasoning)

        o3_model = self.models.get_model("o3-mini")
        self.assertIsNotNone(o3_model)
        self.assertTrue(o3_model.supports_reasoning)

    def test_mock_provider_complete_and_stream(self):
        """测试 Mock 引擎的非流式与流式生成及思考链提取"""
        # 非流式
        res = self.models.complete(
            model_id="reproducible-mock-llm",
            prompt="Generate mutation priority function for Cap Set",
            provider_id="mock"
        )
        self.assertIn("def priority", res.text)
        self.assertIsNotNone(res.reasoning)
        self.assertEqual(res.provider, "mock")

        # 流式
        stream_events = list(self.models.stream(
            model_id="reproducible-mock-llm",
            prompt="Two Distinct High-Scoring Parent Programs crossover",
            provider_id="mock"
        ))
        event_types = [e.type for e in stream_events]
        self.assertIn("start", event_types)
        self.assertIn("thinking_start", event_types)
        self.assertIn("thinking_delta", event_types)
        self.assertIn("text_delta", event_types)
        self.assertIn("done", event_types)

        done_event = [e for e in stream_events if e.type == "done"][0]
        code = BaseProvider.extract_code(done_event.full_text)
        self.assertTrue(code.startswith("def priority"))

    def test_auth_resolution_priority(self):
        """测试三级鉴权自动解析：显式 > 环境变量 > 默认"""
        resolver = AuthResolver()

        # 1. 显式提供
        auth_explicit = resolver.resolve("deepseek", explicit_key="sk-test-explicit", explicit_base="https://custom.com/v1")
        self.assertEqual(auth_explicit.api_key, "sk-test-explicit")
        self.assertEqual(auth_explicit.api_base, "https://custom.com/v1")
        self.assertEqual(auth_explicit.source, "explicit")

        # 2. 环境变量提供
        os.environ["DEEPSEEK_API_KEY"] = "sk-from-env"
        auth_env = resolver.resolve("deepseek")
        self.assertEqual(auth_env.api_key, "sk-from-env")
        self.assertTrue(auth_env.source.startswith("env:"))
        del os.environ["DEEPSEEK_API_KEY"]

        # 3. 未配置
        auth_none = resolver.resolve("openai")
        if "OPENAI_API_KEY" not in os.environ:
            self.assertIsNone(auth_none.api_key)

    def test_create_custom_provider(self):
        """测试动态注册自定义第三方提供商 (Custom Provider)"""
        custom_p = create_custom_provider(
            provider_id="my_fast_llm",
            name="My Private Cluster",
            api_base="http://192.168.1.100:8000/v1",
            models=[{
                "id": "my-math-coder-70b",
                "name": "Custom Math 70B",
                "supports_reasoning": True
            }],
            default_headers={"X-Cluster": "alpha"}
        )
        self.models.set_provider(custom_p)

        retrieved = self.models.get_provider("my_fast_llm")
        self.assertIsNotNone(retrieved)
        model = self.models.get_model("my-math-coder-70b")
        self.assertIsNotNone(model)
        self.assertEqual(model.provider, "my_fast_llm")
    def test_fetch_remote_models_and_refresh(self):
        """测试动态拉取与刷新模型清单 (对齐 pi-ai models.refresh())"""
        # 1. 验证 mock provider 刷新
        models = self.models.refresh_provider_models("mock")
        self.assertTrue(len(models) > 0)
        self.assertEqual(models[0].id, "reproducible-mock-llm")

        # 2. 验证 BaseProvider 默认行为
        custom_p = create_custom_provider(
            provider_id="my_custom",
            name="Custom Platform",
            api_base="https://myapi.com/v1",
            models=[{"id": "m1", "name": "Model 1"}]
        )
        self.models.set_provider(custom_p)
        res_models = self.models.get_models(provider_id="my_custom")
        self.assertEqual(len(res_models), 1)
        self.assertEqual(res_models[0].id, "m1")

    def test_llm_client_backward_compatibility(self):
        """测试重构后的 LLMClient 与旧代码 100% 兼容无缝对接"""
        client = LLMClient(backend="mock", temperature=0.7)
        raw, code = client.complete("Test prompt")
        self.assertIn("def priority", code)
        self.assertTrue(code.startswith("def priority"))

if __name__ == "__main__":
    unittest.main()

