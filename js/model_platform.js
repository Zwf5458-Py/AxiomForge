/**
 * AxiomForge: 前端 AI 模型平台管理器 (Model Platform Client)
 * 深度复刻 @earendil-works/pi-ai 的动态模型发现与多自定义平台管理：
 * 1. 动态抓取远程端点可用模型列表 (GET /v1/models)
 * 2. 自由创建、重命名、配置多个自定义第三方平台
 * 3. 智能凭据解析与免 403 连通性检测
 */

class ModelPlatformManager {
  constructor() {
    this.storageKey = 'axiomforge_ai_credentials';
    this.customPlatformsKey = 'axiomforge_custom_platforms';
    this.activeProvider = 'deepseek';
    this.activeModel = 'deepseek-chat';

    // 内置官方提供商预设
    this.builtins = {
      'deepseek': {
        name: 'DeepSeek (深度求索)',
        baseUrl: 'https://api.deepseek.com/v1',
        isBuiltin: true,
        models: [
          { id: 'deepseek-chat', name: 'DeepSeek-V3 (通用编码与演化)', reasoning: false },
          { id: 'deepseek-reasoner', name: 'DeepSeek-R1 (深度数学推理与思考)', reasoning: true }
        ]
      },
      'openai': {
        name: 'OpenAI',
        baseUrl: 'https://api.openai.com/v1',
        isBuiltin: true,
        models: [
          { id: 'gpt-4o', name: 'GPT-4o', reasoning: false },
          { id: 'gpt-4o-mini', name: 'GPT-4o-mini', reasoning: false },
          { id: 'o3-mini', name: 'o3-mini (Reasoning)', reasoning: true }
        ]
      },
      'siliconflow': {
        name: 'SiliconFlow (硅基流动)',
        baseUrl: 'https://api.siliconflow.cn/v1',
        isBuiltin: true,
        models: [
          { id: 'deepseek-ai/DeepSeek-V3', name: 'DeepSeek-V3 (SiliconFlow)', reasoning: false },
          { id: 'deepseek-ai/DeepSeek-R1', name: 'DeepSeek-R1 (SiliconFlow)', reasoning: true },
          { id: 'Qwen/Qwen2.5-Coder-32B-Instruct', name: 'Qwen2.5-Coder-32B', reasoning: false }
        ]
      },
      'ollama': {
        name: 'Ollama (本地私有大模型)',
        baseUrl: 'http://localhost:11434/v1',
        isBuiltin: true,
        models: [
          { id: 'qwen2.5-coder:latest', name: 'Qwen2.5-Coder (Local)', reasoning: false },
          { id: 'deepseek-r1:latest', name: 'DeepSeek-R1 (Local Distill)', reasoning: true }
        ]
      },
      'mock': {
        name: '确定性离线模拟器 (零成本免 Key)',
        baseUrl: 'mock://internal',
        isBuiltin: true,
        models: [
          { id: 'reproducible-mock-llm', name: 'Deterministic Math Evolver', reasoning: true }
        ]
      }
    };

    this.credentials = this.loadCredentials();
    this.customPlatforms = this.loadCustomPlatforms();

    // 如果还没有任何自定义平台，默认提供一个示例平台
    if (Object.keys(this.customPlatforms).length === 0) {
      this.customPlatforms['custom_default'] = {
        id: 'custom_default',
        name: '自定义第三方平台 (OpenAI 兼容)',
        baseUrl: 'https://dst.225458.xyz/v1',
        apiKey: '',
        isBuiltin: false,
        models: [
          { id: 'deepseek-chat', name: 'deepseek-chat', reasoning: false },
          { id: 'deepseek-reasoner', name: 'deepseek-reasoner', reasoning: true }
        ]
      };
      this.saveCustomPlatforms();
    }
  }

  loadCredentials() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  saveCredentials() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.credentials));
    } catch (e) {
      console.warn('保存凭据失败:', e);
    }
  }

  loadCustomPlatforms() {
    try {
      const raw = localStorage.getItem(this.customPlatformsKey);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  saveCustomPlatforms() {
    try {
      localStorage.setItem(this.customPlatformsKey, JSON.stringify(this.customPlatforms));
    } catch (e) {
      console.warn('保存自定义平台失败:', e);
    }
  }

  /**
   * 获取所有可用平台列表（内置 + 自定义）
   */
  getAllProviders() {
    const list = [];
    for (const [id, item] of Object.entries(this.builtins)) {
      list.push({ id, name: item.name, isBuiltin: true, baseUrl: item.baseUrl });
    }
    for (const [id, item] of Object.entries(this.customPlatforms)) {
      list.push({ id, name: item.name, isBuiltin: false, baseUrl: item.baseUrl });
    }
    return list;
  }

  getProviderInfo(providerId) {
    if (this.builtins[providerId]) {
      const p = this.builtins[providerId];
      const cred = this.credentials[providerId] || {};
      return {
        id: providerId,
        name: p.name,
        isBuiltin: true,
        baseUrl: cred.baseUrl || p.baseUrl,
        apiKey: cred.apiKey || '',
        models: p.models || []
      };
    }
    if (this.customPlatforms[providerId]) {
      return this.customPlatforms[providerId];
    }
    return null;
  }

  /**
   * 保存或更新平台配置
   */
  savePlatform(providerId, config) {
    if (this.builtins[providerId]) {
      this.credentials[providerId] = {
        apiKey: config.apiKey || '',
        baseUrl: config.baseUrl || this.builtins[providerId].baseUrl
      };
      this.saveCredentials();
      if (config.models && config.models.length > 0) {
        this.builtins[providerId].models = config.models;
      }
    } else {
      this.customPlatforms[providerId] = {
        id: providerId,
        name: config.name || '自定义平台',
        baseUrl: config.baseUrl || '',
        apiKey: config.apiKey || '',
        isBuiltin: false,
        models: config.models || []
      };
      this.saveCustomPlatforms();
      // 同步注册至后端
      fetch('/api/providers/custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: providerId,
          name: config.name,
          api_base: config.baseUrl,
          models: config.models || []
        })
      }).catch(() => {});
    }
  }

  /**
   * 新增一个自定义平台
   */
  addCustomPlatform(name = '新自定义平台', baseUrl = '') {
    const id = 'custom_' + Date.now();
    this.customPlatforms[id] = {
      id: id,
      name: name,
      baseUrl: baseUrl,
      apiKey: '',
      isBuiltin: false,
      models: []
    };
    this.saveCustomPlatforms();
    return id;
  }

  /**
   * 删除一个自定义平台
   */
  deleteCustomPlatform(providerId) {
    if (this.customPlatforms[providerId]) {
      delete this.customPlatforms[providerId];
      this.saveCustomPlatforms();
      if (this.activeProvider === providerId) {
        this.activeProvider = 'deepseek';
        this.activeModel = 'deepseek-chat';
      }
    }
  }

  /**
   * 动态拉取远程模型清单 (对齐 pi-ai models.refresh())
   * 向 /v1/models 发送请求，提取所有模型并自动探测 reasoning 能力
   */
  async fetchRemoteModels(baseUrl, apiKey) {
    if (!baseUrl) {
      throw new Error('请先输入接口端点 (Base URL)');
    }

    // 1. 优先通过后端代理抓取（防止跨域 CORS 问题）
    try {
      const res = await fetch('/api/models/fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_base: baseUrl, api_key: apiKey })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.models) && data.models.length > 0) {
          return data.models;
        }
      }
    } catch (backendErr) {
      console.warn('后端抓取失败，尝试浏览器直接探测:', backendErr);
    }

    // 2. 浏览器直接 GET /v1/models
    let modelsUrl = baseUrl.replace(/\/+$/, '');
    if (modelsUrl.endsWith('/chat/completions')) {
      modelsUrl = modelsUrl.replace('/chat/completions', '/models');
    } else if (!modelsUrl.endsWith('/models')) {
      modelsUrl = `${modelsUrl}/models`;
    }

    const headers = { 'Accept': 'application/json' };
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    const resp = await fetch(modelsUrl, { method: 'GET', headers: headers });
    if (!resp.ok) {
      throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
    }

    const json = await resp.json();
    const items = json.data || json.models || [];
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error('未在返回数据中解析到可用模型');
    }

    return items.map(item => {
      const mId = typeof item === 'string' ? item : item.id;
      const lower = mId.toLowerCase();
      const isReasoning = ['r1', 'reasoner', 'o1', 'o3', 'thinking', 'qwq'].some(k => lower.includes(k));
      return {
        id: mId,
        name: mId,
        reasoning: isReasoning
      };
    });
  }

  /**
   * 测试连接与鉴权 (智能免 403 探测)
   */
  async checkConnection(providerId, apiKey, baseUrl, selectedModel) {
    if (providerId === 'mock') {
      return { ok: true, message: '离线确定性模拟引擎就绪！随时可启动演化。' };
    }

    try {
      // 1. 优先尝试自动拉取模型列表来作为鉴权成功的铁证
      const models = await this.fetchRemoteModels(baseUrl, apiKey);
      if (models && models.length > 0) {
        return {
          ok: true,
          message: `✅ 鉴权成功！成功探测并识别到 ${models.length} 个可用模型。`,
          models: models
        };
      }
    } catch (fetchErr) {
      // 若拉取模型失败，尝试向后端发送真实模型 ping
      try {
        const res = await fetch('/api/providers/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            provider_id: providerId,
            api_key: apiKey,
            api_base: baseUrl,
            model_id: selectedModel
          })
        });
        if (res.ok) {
          const data = await res.json();
          return { ok: data.valid, message: data.message };
        }
      } catch (e) {}
      return { ok: false, message: `连接失败: ${fetchErr.message}` };
    }

    return { ok: true, message: '配置已就绪！' };
  }

  /**
   * 触发大模型端到端真实程序演化与 Python 沙箱验算
   * 严禁任何未经真实模型推演的静态伪造！
   */
  async evolveProgramStep({ dimension = 4, currentCode = '' } = {}) {
    const pInfo = this.getProviderInfo(this.activeProvider);
    const credKey = pInfo ? pInfo.apiKey : '';
    const credBase = pInfo ? pInfo.baseUrl : '';
    const providerName = pInfo ? pInfo.name : this.activeProvider;

    // 非 Mock 引擎必须检查有效凭证，拒绝虚假结果
    if (this.activeProvider !== 'mock' && !credKey && !credBase) {
      throw new Error(`当前平台【${providerName}】未配置 API Key 或 Base URL。请点击右上角【AI 模型平台配置】填入真实凭据，或选用 Reproducible Mock 离线引擎。系统拒绝输出未经模型真实计算的虚假结果。`);
    }

    const res = await fetch('/api/funsearch/evolve_step', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dimension: dimension,
        model_id: this.activeModel,
        provider_id: this.activeProvider,
        provider_name: providerName,
        api_key: credKey,
        api_base: credBase,
        current_code: currentCode,
        temperature: 0.7
      })
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || `服务端推演验算失败 (HTTP ${res.status})`);
    }

    return data;
  }
}

window.modelPlatformManager = new ModelPlatformManager();
