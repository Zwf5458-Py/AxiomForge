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
    this.activeSelectionKey = 'axiomforge_active_selection';

    // 内置官方提供商预设
    this.builtins = {
      'deepseek': {
        name: 'DeepSeek',
        baseUrl: 'https://api.deepseek.com/v1',
        isBuiltin: true,
        models: [
          { id: 'deepseek-chat', name: 'DeepSeek-V3 (General & Evolution)', reasoning: false },
          { id: 'deepseek-reasoner', name: 'DeepSeek-R1 (Deep Reasoning)', reasoning: true }
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
        name: 'SiliconFlow',
        baseUrl: 'https://api.siliconflow.cn/v1',
        isBuiltin: true,
        models: [
          { id: 'deepseek-ai/DeepSeek-V3', name: 'DeepSeek-V3 (SiliconFlow)', reasoning: false },
          { id: 'deepseek-ai/DeepSeek-R1', name: 'DeepSeek-R1 (SiliconFlow)', reasoning: true },
          { id: 'Qwen/Qwen2.5-Coder-32B-Instruct', name: 'Qwen2.5-Coder-32B', reasoning: false }
        ]
      },
      'ollama': {
        name: 'Ollama (Local LLM)',
        baseUrl: 'http://localhost:11434/v1',
        isBuiltin: true,
        models: [
          { id: 'qwen2.5-coder:latest', name: 'Qwen2.5-Coder (Local)', reasoning: false },
          { id: 'deepseek-r1:latest', name: 'DeepSeek-R1 (Local Distill)', reasoning: true }
        ]
      },
      'mock': {
        name: 'Deterministic Offline Simulator (No Key)',
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
        name: 'Custom Provider (OpenAI Compatible)',
        baseUrl: 'https://dst.225458.xyz/v1',
        apiKey: '',
        selectedModel: 'deepseek-chat',
        isBuiltin: false,
        models: [
          { id: 'deepseek-chat', name: 'deepseek-chat', reasoning: false },
          { id: 'deepseek-reasoner', name: 'deepseek-reasoner', reasoning: true }
        ]
      };
      this.saveCustomPlatforms();
    }

    // 智能恢复持久化的激活状态 (Active Provider & Active Model)
    const savedActive = this.loadActiveSelection();
    const candidateProvider = savedActive.provider;
    const providerExists = !!(this.builtins[candidateProvider] || this.customPlatforms[candidateProvider]);
    this.activeProvider = providerExists ? candidateProvider : 'deepseek';

    // 恢复激活模型
    const pInfo = this.getProviderInfo(this.activeProvider);
    if (savedActive.model && savedActive.model !== 'default') {
      this.activeModel = savedActive.model;
    } else if (pInfo && pInfo.selectedModel) {
      this.activeModel = pInfo.selectedModel;
    } else if (pInfo && pInfo.models && pInfo.models[0]) {
      this.activeModel = pInfo.models[0].id;
    } else {
      this.activeModel = 'deepseek-chat';
    }

    // 自动异步向本地后端同步注册自定义平台
    this.syncAllCustomPlatformsToBackend();
  }

  loadActiveSelection() {
    try {
      const raw = localStorage.getItem(this.activeSelectionKey);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  saveActiveSelection(providerId, modelId) {
    try {
      localStorage.setItem(this.activeSelectionKey, JSON.stringify({
        provider: providerId || this.activeProvider,
        model: modelId || this.activeModel
      }));
    } catch (e) {
      console.warn('保存激活状态失败:', e);
    }
  }

  setActive(providerId, modelId) {
    if (providerId) this.activeProvider = providerId;
    if (modelId) this.activeModel = modelId;
    this.saveActiveSelection(this.activeProvider, this.activeModel);
    this.saveProviderSelectedModel(this.activeProvider, this.activeModel);
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

      // 深度合并内置官方模型与用户针对该平台通过拉取/添加保存的模型列表
      const modelMap = new Map();
      (p.models || []).forEach(m => modelMap.set(m.id, { ...m }));
      (cred.customModels || []).forEach(m => modelMap.set(m.id, { ...m }));
      const mergedModels = Array.from(modelMap.values());

      return {
        id: providerId,
        name: p.name,
        isBuiltin: true,
        baseUrl: cred.baseUrl || p.baseUrl,
        apiKey: cred.apiKey || '',
        selectedModel: cred.selectedModel || (mergedModels[0] ? mergedModels[0].id : ''),
        models: mergedModels
      };
    }
    if (this.customPlatforms[providerId]) {
      const p = this.customPlatforms[providerId];
      return {
        ...p,
        selectedModel: p.selectedModel || (p.models && p.models[0] ? p.models[0].id : '')
      };
    }
    return null;
  }

  /**
   * 立即持久化保存指定平台的可用模型列表 (无论内置还是自定义，均立刻存入 LocalStorage)
   */
  updateProviderModels(providerId, models) {
    if (!Array.isArray(models) || models.length === 0) return;

    // 规范化模型对象
    const cleanModels = models.map(m => {
      const mId = typeof m === 'string' ? m : m.id;
      const lower = mId.toLowerCase();
      const isReasoning = typeof m.reasoning === 'boolean'
        ? m.reasoning
        : ['r1', 'reasoner', 'o1', 'o3', 'thinking', 'qwq'].some(k => lower.includes(k));
      return {
        id: mId,
        name: m.name || mId,
        reasoning: isReasoning,
        isCustom: !!m.isCustom
      };
    });

    if (this.builtins[providerId]) {
      if (!this.credentials[providerId]) {
        this.credentials[providerId] = {};
      }
      this.credentials[providerId].customModels = cleanModels;
      this.saveCredentials();
    } else if (this.customPlatforms[providerId]) {
      this.customPlatforms[providerId].models = cleanModels;
      this.saveCustomPlatforms();
      this.syncCustomPlatformToBackend(providerId);
    }
  }

  /**
   * 将用户选定或手动输入的模型名沉淀到当前平台的可用模型列表中
   */
  addModelToProvider(providerId, modelId) {
    if (!modelId || modelId === 'default') return;
    const pInfo = this.getProviderInfo(providerId);
    if (!pInfo) return;

    const exists = (pInfo.models || []).some(m => m.id === modelId);
    if (!exists) {
      const lower = modelId.toLowerCase();
      const isReasoning = ['r1', 'reasoner', 'o1', 'o3', 'thinking', 'qwq'].some(k => lower.includes(k));
      const newModelObj = { id: modelId, name: modelId, reasoning: isReasoning, isCustom: true };
      const nextModels = [newModelObj, ...(pInfo.models || [])];
      this.updateProviderModels(providerId, nextModels);
    }
    this.saveProviderSelectedModel(providerId, modelId);
  }

  /**
   * 独立记录每个平台上次选中的模型 (记住用户的选择偏好)
   */
  saveProviderSelectedModel(providerId, modelId) {
    if (!modelId || modelId === 'default') return;
    if (this.builtins[providerId]) {
      if (!this.credentials[providerId]) {
        this.credentials[providerId] = {};
      }
      this.credentials[providerId].selectedModel = modelId;
      this.saveCredentials();
    } else if (this.customPlatforms[providerId]) {
      this.customPlatforms[providerId].selectedModel = modelId;
      this.saveCustomPlatforms();
    }
  }

  /**
   * 保存或更新平台配置，并确保所选模型和拉取模型全部持久化
   */
  savePlatform(providerId, config) {
    const chosenModel = config.selectedModel || '';
    if (this.builtins[providerId]) {
      if (!this.credentials[providerId]) {
        this.credentials[providerId] = {};
      }
      this.credentials[providerId].apiKey = config.apiKey || '';
      this.credentials[providerId].baseUrl = config.baseUrl || this.builtins[providerId].baseUrl;
      if (chosenModel) {
        this.credentials[providerId].selectedModel = chosenModel;
      }
      if (config.models && config.models.length > 0) {
        this.credentials[providerId].customModels = config.models;
      }
      this.saveCredentials();
    } else {
      this.customPlatforms[providerId] = {
        id: providerId,
        name: config.name || '自定义平台',
        baseUrl: config.baseUrl || '',
        apiKey: config.apiKey || '',
        selectedModel: chosenModel || (config.models && config.models[0] ? config.models[0].id : ''),
        isBuiltin: false,
        models: config.models || []
      };
      this.saveCustomPlatforms();
      this.syncCustomPlatformToBackend(providerId);
    }

    if (chosenModel && chosenModel !== 'default') {
      this.addModelToProvider(providerId, chosenModel);
    }
  }

  /**
   * 同步单个自定义平台到本地 Python 后端
   */
  syncCustomPlatformToBackend(providerId) {
    const p = this.customPlatforms[providerId];
    if (!p || !p.baseUrl) return;
    fetch('/api/providers/custom', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: p.id,
        name: p.name,
        api_base: p.baseUrl,
        models: (p.models || []).map(m => m.id)
      })
    }).catch(() => {});
  }

  /**
   * 同步所有自定义平台到本地后端
   */
  syncAllCustomPlatformsToBackend() {
    for (const id of Object.keys(this.customPlatforms)) {
      this.syncCustomPlatformToBackend(id);
    }
  }

  /**
   * 新增一个自定义平台
   */
  addCustomPlatform(name = null, baseUrl = '') {
    const isEn = !window.I18N || window.I18N.getLanguage() === 'en';
    const defaultName = name || (isEn ? 'Custom Provider' : '新自定义平台');
    const id = 'custom_' + Date.now();
    this.customPlatforms[id] = {
      id: id,
      name: defaultName,
      baseUrl: baseUrl,
      apiKey: '',
      selectedModel: 'deepseek-chat',
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
        this.setActive('deepseek', 'deepseek-chat');
      }
    }
  }

  /**
   * 动态拉取远程模型清单 (对齐 pi-ai models.refresh())
   * 向 /v1/models 发送请求，提取所有模型并自动探测 reasoning 能力
   */
  async fetchRemoteModels(baseUrl, apiKey) {
    const isEn = !window.I18N || window.I18N.getLanguage() === 'en';
    if (!baseUrl) {
      throw new Error(isEn ? 'Please enter the API Endpoint (Base URL) first' : '请先输入接口端点 (Base URL)');
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
          return data.models.map(item => {
            const mId = typeof item === 'string' ? item : item.id;
            const lower = mId.toLowerCase();
            const isReasoning = typeof item.reasoning === 'boolean'
              ? item.reasoning
              : (item.supports_reasoning || ['r1', 'reasoner', 'o1', 'o3', 'thinking', 'qwq'].some(k => lower.includes(k)));
            return {
              id: mId,
              name: item.name || mId,
              reasoning: !!isReasoning
            };
          });
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
      const errText = await resp.text().catch(() => resp.statusText);
      throw new Error(`HTTP ${resp.status}: ${errText}`);
    }

    const json = await resp.json();
    const items = json.data || json.models || [];
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error(isEn ? 'No available models found in response data' : '未在返回数据中解析到可用模型');
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
   * 测试连接与鉴权 (双轨连通性测试：浏览器直通 + 后端中转双保险)
   */
  async checkConnection(providerId, apiKey, baseUrl, selectedModel) {
    const isEn = !window.I18N || window.I18N.getLanguage() === 'en';
    if (providerId === 'mock') {
      return {
        ok: true,
        message: isEn
          ? 'Deterministic offline simulation engine ready! Ready for evolution.'
          : '离线确定性模拟引擎就绪！随时可启动演化。'
      };
    }

    const pInfo = this.getProviderInfo(providerId);
    const pName = pInfo ? pInfo.name : providerId;

    // 1. 如果用户已选定了具体模型，优先进行双轨真实 ping 探测
    if (selectedModel && selectedModel !== 'custom-default') {
      // 轨道 A: 优先尝试浏览器原生 fetch 直接探测 (100% 免疫 Cloudflare 爬虫拦截，利用端点已开放的 CORS)
      if (baseUrl && baseUrl.startsWith('http')) {
        let chatUrl = baseUrl.replace(/\/+$/, '');
        if (!chatUrl.endsWith('/chat/completions')) {
          chatUrl = `${chatUrl}/chat/completions`;
        }
        try {
          const t0 = performance.now();
          const directHeaders = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          };
          if (apiKey) directHeaders['Authorization'] = `Bearer ${apiKey}`;

          const directResp = await fetch(chatUrl, {
            method: 'POST',
            headers: directHeaders,
            body: JSON.stringify({
              model: selectedModel,
              messages: [{ role: 'user', content: "Hello! Reply 'OK' to test connectivity." }],
              max_tokens: 15,
              temperature: 0.1
            })
          });

          const latencySec = ((performance.now() - t0) / 1000).toFixed(2);
          if (directResp.ok) {
            const data = await directResp.json();
            const reply = data.choices?.[0]?.message?.content || 'OK';
            const snippet = reply.trim().replace(/\n/g, ' ').substring(0, 30);
            return {
              ok: true,
              message: isEn
                ? `✅ Model [${selectedModel}] connection test successful! Latency: ${latencySec}s | Reply: "${snippet}"`
                : `✅ 模型【${selectedModel}】连通测试成功！响应延迟: ${latencySec}s | 回复: "${snippet}"`,
              latency: parseFloat(latencySec)
            };
          } else {
            // 详细提取服务端返回的错误信息
            const errJson = await directResp.json().catch(() => null);
            const errMsg = errJson?.error?.message || errJson?.error || directResp.statusText;
            return {
              ok: false,
              message: isEn
                ? `❌ Model [${selectedModel}] call failed: HTTP ${directResp.status} - ${typeof errMsg === 'object' ? JSON.stringify(errMsg) : errMsg}`
                : `❌ 模型【${selectedModel}】调用失败: HTTP ${directResp.status} - ${typeof errMsg === 'object' ? JSON.stringify(errMsg) : errMsg}`
            };
          }
        } catch (directErr) {
          console.warn('浏览器直连探测遇到跨域或网络中断，无缝降级走本地后端中转探测:', directErr);
        }
      }

      // 轨道 B: 降级走本地后端中转探测 (已伪装完整标准浏览器请求头)
      try {
        const res = await fetch('/api/providers/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            provider_id: providerId,
            provider_name: pName,
            api_key: apiKey,
            api_base: baseUrl,
            model_id: selectedModel
          })
        });
        if (res.ok) {
          const data = await res.json();
          return { ok: data.valid, message: data.message, latency: data.latency_seconds };
        } else {
          const errData = await res.json().catch(() => ({}));
          return {
            ok: false,
            message: errData.message || (isEn ? `Server check failed (HTTP ${res.status})` : `服务端检测失败 (HTTP ${res.status})`)
          };
        }
      } catch (e) {
        return {
          ok: false,
          message: isEn ? `Network connection failed: ${e.message}` : `网络连接失败: ${e.message}`
        };
      }
    }

    // 2. 若未选择具体模型，则通过拉取模型列表来验证平台连通性
    try {
      const models = await this.fetchRemoteModels(baseUrl, apiKey);
      if (models && models.length > 0) {
        return {
          ok: true,
          message: isEn
            ? `✅ Platform connection successful! Detected ${models.length} available models. Please select a model below and test.`
            : `✅ 平台连通成功！识别到 ${models.length} 个可用模型，请在下方选择模型后点击测试。`,
          models: models
        };
      }
    } catch (fetchErr) {
      return {
        ok: false,
        message: isEn ? `Connection failed: ${fetchErr.message}` : `连接失败: ${fetchErr.message}`
      };
    }

    return {
      ok: true,
      message: isEn ? 'Configuration ready!' : '配置已就绪！'
    };
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
    const isEn = !window.I18N || window.I18N.getLanguage() === 'en';

    // 非 Mock 引擎必须检查有效凭证，拒绝虚假结果
    if (this.activeProvider !== 'mock' && !credKey && !credBase) {
      const msg = isEn
        ? `Current provider [${providerName}] lacks an API Key or Base URL. Please configure authentic credentials in [AI Model Platform] or switch to Reproducible Mock offline engine. The system refuses to fabricate unverified results.`
        : `当前平台【${providerName}】未配置 API Key 或 Base URL。请点击右上角【AI 模型平台配置】填入真实凭据，或选用 Reproducible Mock 离线引擎。系统拒绝输出未经模型真实计算的虚假结果。`;
      throw new Error(msg);
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
      const failMsg = isEn ? `Server execution failed (HTTP ${res.status})` : `服务端推演验算失败 (HTTP ${res.status})`;
      const err = new Error(data.error || failMsg);
      err.reasoning = data.reasoning;
      err.raw_text = data.raw_text;
      throw err;
    }

    return data;
  }
}

window.modelPlatformManager = new ModelPlatformManager();
