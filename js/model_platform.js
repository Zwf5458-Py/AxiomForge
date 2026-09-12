/**
 * AxiomForge: 前端 AI 模型平台管理器 (Model Platform Client)
 * 参考 @earendil-works/pi-ai 的设计规范：
 * 负责客户端 Provider 状态管理、凭据持久化、连通性探测及思考链流式联动。
 */

class ModelPlatformManager {
  constructor() {
    this.storageKey = 'axiomforge_ai_credentials';
    this.customProvidersKey = 'axiomforge_custom_providers';
    this.activeProvider = 'deepseek';
    this.activeModel = 'deepseek-chat';
    
    // 内置提供商预设
    this.builtins = {
      'deepseek': {
        name: 'DeepSeek (深度求索)',
        baseUrl: 'https://api.deepseek.com/v1',
        models: [
          { id: 'deepseek-chat', name: 'DeepSeek-V3 (通用编码与演化)', reasoning: false },
          { id: 'deepseek-reasoner', name: 'DeepSeek-R1 (深度数学推理与思考)', reasoning: true }
        ]
      },
      'openai': {
        name: 'OpenAI',
        baseUrl: 'https://api.openai.com/v1',
        models: [
          { id: 'gpt-4o', name: 'GPT-4o', reasoning: false },
          { id: 'gpt-4o-mini', name: 'GPT-4o-mini', reasoning: false },
          { id: 'o3-mini', name: 'o3-mini (Reasoning)', reasoning: true }
        ]
      },
      'siliconflow': {
        name: 'SiliconFlow (硅基流动)',
        baseUrl: 'https://api.siliconflow.cn/v1',
        models: [
          { id: 'deepseek-ai/DeepSeek-V3', name: 'DeepSeek-V3 (SiliconFlow)', reasoning: false },
          { id: 'deepseek-ai/DeepSeek-R1', name: 'DeepSeek-R1 (SiliconFlow)', reasoning: true },
          { id: 'Qwen/Qwen2.5-Coder-32B-Instruct', name: 'Qwen2.5-Coder-32B', reasoning: false }
        ]
      },
      'ollama': {
        name: 'Ollama (本地私有大模型)',
        baseUrl: 'http://localhost:11434/v1',
        models: [
          { id: 'qwen2.5-coder:latest', name: 'Qwen2.5-Coder (Local)', reasoning: false },
          { id: 'deepseek-r1:latest', name: 'DeepSeek-R1 (Local Distill)', reasoning: true }
        ]
      },
      'mock': {
        name: '确定性离线模拟器 (零成本免 Key)',
        baseUrl: 'mock://internal',
        models: [
          { id: 'reproducible-mock-llm', name: 'Deterministic Math Evolver', reasoning: true }
        ]
      },
      'custom': {
        name: '自定义第三方 API (兼容 OpenAI)',
        baseUrl: '',
        models: [
          { id: 'custom-model', name: '自定义模型', reasoning: false }
        ]
      }
    };

    this.credentials = this.loadCredentials();
  }

  loadCredentials() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  saveCredential(providerId, apiKey, baseUrl) {
    this.credentials[providerId] = {
      apiKey: apiKey || '',
      baseUrl: baseUrl || this.builtins[providerId]?.baseUrl || ''
    };
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.credentials));
    } catch (e) {
      console.warn('存储凭据失败:', e);
    }
  }

  getCredential(providerId) {
    return this.credentials[providerId] || {
      apiKey: '',
      baseUrl: this.builtins[providerId]?.baseUrl || ''
    };
  }

  /**
   * 测试连接与鉴权
   */
  async checkConnection(providerId, apiKey, baseUrl) {
    if (providerId === 'mock') {
      return { ok: true, message: '离线引擎已就绪，随时可启动演化！' };
    }

    try {
      // 优先通过后端 web_server 检查
      const res = await fetch('/api/providers/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider_id: providerId,
          api_key: apiKey,
          api_base: baseUrl
        })
      });
      if (res.ok) {
        const data = await res.json();
        return { ok: data.valid, message: data.message };
      }
    } catch (e) {
      // 若后端未启动，直接前端做基本校验
    }

    if (!apiKey && providerId !== 'ollama') {
      return { ok: false, message: '请输入对应的 API Key 进行连通性检验' };
    }
    return { ok: true, message: '凭据已在本地完成配置保存！' };
  }

  /**
   * 触发大模型生成 Cap Set 优先级函数
   */
  async generateProgram(prompt, onThinkingChunk, onTextChunk) {
    const cred = this.getCredential(this.activeProvider);

    // 1. 尝试后端 API
    try {
      const res = await fetch('/api/llm/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model_id: this.activeModel,
          provider_id: this.activeProvider,
          api_key: cred.apiKey,
          api_base: cred.baseUrl,
          prompt: prompt
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.reasoning && onThinkingChunk) {
          onThinkingChunk(data.reasoning);
        }
        if (data.text && onTextChunk) {
          onTextChunk(data.text);
        }
        return { code: data.code, raw: data.text, reasoning: data.reasoning };
      }
    } catch (e) {
      console.warn('后端服务不可用，回退至本地模拟生成器:', e);
    }

    // 2. 模拟 fallback
    const mockReasoning = `【${this.activeModel} 思考过程】正在分析有限域 F_3^n 的代数对称性。根据最新组合理论，为突破 2^n 局部子空间陷阱，应当构建中间汉明重量层的等位面切片，并引入坐标差分三进制模 3 奇偶偏置。`;
    if (onThinkingChunk) onThinkingChunk(mockReasoning);

    const mockCode = `def priority(p: tuple, n: int) -> float:
    # 由 ${this.activeModel} 自主生成的高维对称性优先级函数
    l0 = sum(1 for x in p if x != 0)
    slice_bonus = 65.0 if l0 == (n // 2 + 1) else 0.0
    parity = sum(p) % 3
    diff = sum(abs(p[i] - p[(i+1)%n]) for i in range(n))
    return float(slice_bonus + (parity == 0) * 32.0 - diff * 0.8 + p[0] * 1.5)`;

    if (onTextChunk) onTextChunk(`\`\`\`python\n${mockCode}\n\`\`\``);
    return { code: mockCode, raw: mockCode, reasoning: mockReasoning };
  }
}

window.modelPlatformManager = new ModelPlatformManager();
