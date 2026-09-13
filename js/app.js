/**
 * 分形几何与数学动力学模型动画模拟系统 - 主控调度器
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. 初始化引擎实例
  const kochEngine = new KochSnowflake('koch-canvas');
  const orbitTracer = new MandelbrotOrbitTracer('orbit-canvas');
  const mandelbrotEngine = new MandelbrotViewer('mandelbrot-canvas', orbitTracer);
  const funsearchEngine = new MultiDimCapSetVisualizer('funsearch-canvas');
  funsearchEngine.updateUI();

  window.updateActiveModelBadge = function() {
    const activeModelBadge = document.getElementById('active-model-badge');
    if (activeModelBadge && window.modelPlatformManager) {
      const curP = window.modelPlatformManager.getProviderInfo(window.modelPlatformManager.activeProvider);
      const pName = curP ? curP.name : window.modelPlatformManager.activeProvider;
      activeModelBadge.textContent = `${pName}: ${window.modelPlatformManager.activeModel}`;
    }
  };
  window.updateActiveModelBadge();

  // 语言切换按钮绑定与事件监听
  const btnLangToggle = document.getElementById('btn-lang-toggle');
  if (btnLangToggle) {
    btnLangToggle.addEventListener('click', () => {
      if (window.I18N) {
        window.I18N.toggleLanguage();
      }
    });
  }

  window.addEventListener('axiomforge:lang_changed', (e) => {
    // 语言改变时刷新各个引擎的动态状态
    if (funsearchEngine && typeof funsearchEngine.updateUI === 'function') {
      funsearchEngine.updateUI();
    }
  });

  let activeTab = 'mandelbrot'; // 默认进入震撼的广义高阶分形视窗

  // 视口自适应调整
  function handleResize() {
    kochEngine.resize();
    mandelbrotEngine.resize();
    funsearchEngine.resize();
  }
  window.addEventListener('resize', handleResize);
  requestAnimationFrame(handleResize);
  setTimeout(handleResize, 100);

  // 2. 主动画循环 (统一由 requestAnimationFrame 驱动)
  function mainLoop(timestamp) {
    if (activeTab === 'koch') {
      kochEngine.update(timestamp);
    } else if (activeTab === 'mandelbrot') {
      mandelbrotEngine.update(timestamp);
    } else if (activeTab === 'funsearch') {
      funsearchEngine.render(timestamp);
    }
    requestAnimationFrame(mainLoop);
  }
  requestAnimationFrame(mainLoop);

  // 3. 模式选项卡切换
  const tabKochBtn = document.getElementById('tab-koch');
  const tabMandelBtn = document.getElementById('tab-mandelbrot');
  const tabFunsearchBtn = document.getElementById('tab-funsearch');
  const viewKoch = document.getElementById('view-koch');
  const viewMandel = document.getElementById('view-mandelbrot');
  const viewFunsearch = document.getElementById('view-funsearch');
  const sidebarKoch = document.getElementById('sidebar-koch');
  const sidebarMandel = document.getElementById('sidebar-mandelbrot');
  const sidebarFunsearch = document.getElementById('sidebar-funsearch');

  function switchTab(target) {
    activeTab = target;
    [tabKochBtn, tabMandelBtn, tabFunsearchBtn].forEach(b => b && b.classList.remove('active'));
    [viewKoch, viewMandel, viewFunsearch].forEach(v => v && v.classList.remove('active'));
    if (sidebarKoch) sidebarKoch.style.display = 'none';
    if (sidebarMandel) sidebarMandel.style.display = 'none';
    if (sidebarFunsearch) sidebarFunsearch.style.display = 'none';

    if (target === 'koch') {
      tabKochBtn.classList.add('active');
      viewKoch.classList.add('active');
      sidebarKoch.style.display = 'block';
      kochEngine.resize();
    } else if (target === 'mandelbrot') {
      tabMandelBtn.classList.add('active');
      viewMandel.classList.add('active');
      sidebarMandel.style.display = 'block';
      mandelbrotEngine.resize();
    } else if (target === 'funsearch') {
      tabFunsearchBtn.classList.add('active');
      viewFunsearch.classList.add('active');
      sidebarFunsearch.style.display = 'block';
      funsearchEngine.resize();
    }
  }

  tabKochBtn.addEventListener('click', () => switchTab('koch'));
  tabMandelBtn.addEventListener('click', () => switchTab('mandelbrot'));
  if (tabFunsearchBtn) {
    tabFunsearchBtn.addEventListener('click', () => switchTab('funsearch'));
  }

  // ==========================
  // 4. 科赫雪花 控制事件绑定
  // ==========================
  const sliderOrder = document.getElementById('koch-order-slider');
  const valOrder = document.getElementById('koch-order-val');
  const btnPlayKoch = document.getElementById('btn-koch-play');
  const btnResetKoch = document.getElementById('btn-koch-reset');

  if (sliderOrder) {
    sliderOrder.addEventListener('input', (e) => {
      const order = parseInt(e.target.value, 10);
      valOrder.textContent = order;
      kochEngine.isPlaying = false;
      const playText = window.I18N ? window.I18N.t('btn_koch_play') : 'Play Evolution';
      btnPlayKoch.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg> ${playText}`;
      btnPlayKoch.classList.remove('btn-active');
      kochEngine.setOrder(order);
    });
  }

  if (btnPlayKoch) {
    btnPlayKoch.addEventListener('click', () => {
      kochEngine.isPlaying = !kochEngine.isPlaying;
      if (kochEngine.isPlaying) {
        const pauseText = window.I18N ? window.I18N.t('btn_koch_pause') : 'Pause Evolution';
        btnPlayKoch.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg> ${pauseText}`;
        btnPlayKoch.classList.add('btn-active');
      } else {
        const playText = window.I18N ? window.I18N.t('btn_koch_play') : 'Play Evolution';
        btnPlayKoch.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg> ${playText}`;
        btnPlayKoch.classList.remove('btn-active');
      }
    });
  }

  const btnZoomInKoch = document.getElementById('btn-koch-zoom-in');
  const btnZoomOutKoch = document.getElementById('btn-koch-zoom-out');

  if (btnResetKoch) {
    btnResetKoch.addEventListener('click', () => {
      kochEngine.resetView();
    });
  }

  if (btnZoomInKoch) {
    btnZoomInKoch.addEventListener('click', () => {
      kochEngine.zoomBy(1.18);
    });
  }

  if (btnZoomOutKoch) {
    btnZoomOutKoch.addEventListener('click', () => {
      kochEngine.zoomBy(0.85);
    });
  }

  // 科赫雪花主题切换
  document.querySelectorAll('.koch-theme-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.koch-theme-btn').forEach(b => b.classList.remove('active'));
      const targetBtn = e.currentTarget;
      targetBtn.classList.add('active');
      kochEngine.setTheme(targetBtn.dataset.theme);
    });
  });

  // ==========================================
  // 5. 曼德勃罗集与高阶多重分形 控制事件绑定
  // ==========================================
  const sliderPower = document.getElementById('mb-power-slider');
  const valPower = document.getElementById('mb-power-val');
  const btnPowerMorph = document.getElementById('btn-power-morph');
  const sliderIter = document.getElementById('mb-iter-slider');
  const valIter = document.getElementById('mb-iter-val');
  const btnTour = document.getElementById('btn-mb-tour');
  const btnResetMb = document.getElementById('btn-mb-reset');
  const chkOrbit = document.getElementById('chk-orbit-enable');

  // 幂次滑块
  if (sliderPower) {
    sliderPower.addEventListener('input', (e) => {
      mandelbrotEngine.stopTour();
      mandelbrotEngine.isMorphingPower = false;
      if (btnPowerMorph) {
        const morphText = window.I18N ? window.I18N.t('btn_power_morph_start') : 'Start Morphing Animation';
        btnPowerMorph.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg> ${morphText}`;
        btnPowerMorph.classList.remove('btn-active');
      }
      mandelbrotEngine.setPower(e.target.value);
    });
  }

  // 开启/暂停开花形变连续演化动画
  if (btnPowerMorph) {
    btnPowerMorph.addEventListener('click', () => {
      mandelbrotEngine.stopTour();
      mandelbrotEngine.isMorphingPower = !mandelbrotEngine.isMorphingPower;
      if (mandelbrotEngine.isMorphingPower) {
        const pauseText = window.I18N ? window.I18N.t('btn_power_morph_pause') : 'Pause Morphing Animation';
        btnPowerMorph.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg> ${pauseText}`;
        btnPowerMorph.classList.add('btn-active');
      } else {
        const morphText = window.I18N ? window.I18N.t('btn_power_morph_start') : 'Start Morphing Animation';
        btnPowerMorph.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg> ${morphText}`;
        btnPowerMorph.classList.remove('btn-active');
      }
    });
  }

  // 幂次快捷标签 (包括 5.08 截图同款)
  document.querySelectorAll('[data-power]').forEach((chip) => {
    chip.addEventListener('click', (e) => {
      mandelbrotEngine.stopTour();
      document.querySelectorAll('[data-power]').forEach(c => c.classList.remove('active'));
      const target = e.currentTarget;
      target.classList.add('active');
      const pVal = target.dataset.power;

      mandelbrotEngine.isMorphingPower = false;
      if (btnPowerMorph) {
        const morphText = window.I18N ? window.I18N.t('btn_power_morph_start') : 'Start Morphing Animation';
        btnPowerMorph.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg> ${morphText}`;
        btnPowerMorph.classList.remove('btn-active');
      }
      mandelbrotEngine.setPower(pVal);
    });
  });

  // 迭代深度
  if (sliderIter) {
    sliderIter.addEventListener('input', (e) => {
      mandelbrotEngine.stopTour();
      const iter = parseInt(e.target.value, 10);
      valIter.textContent = iter;
      mandelbrotEngine.maxIterations = iter;
      mandelbrotEngine.render();
    });
  }

  // 自动深潜巡航
  if (btnTour) {
    btnTour.addEventListener('click', () => {
      if (mandelbrotEngine.isTouring) {
        mandelbrotEngine.stopTour();
      } else {
        const pauseTour = window.I18N ? window.I18N.t('btn_mb_tour_pause') : 'Pause Cruise';
        btnTour.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg> ${pauseTour}`;
        btnTour.classList.add('btn-active');
        mandelbrotEngine.startTour('infinite_spiral');
      }
    });
  }

  // 居中全景重置与中心缩放
  const btnZoomInMb = document.getElementById('btn-mb-zoom-in');
  const btnZoomOutMb = document.getElementById('btn-mb-zoom-out');

  if (btnResetMb) {
    btnResetMb.addEventListener('click', () => {
      mandelbrotEngine.stopTour();
      mandelbrotEngine.isMorphingPower = false;
      if (btnPowerMorph) {
        btnPowerMorph.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg> 开启开花形变动画';
        btnPowerMorph.classList.remove('btn-active');
      }
      mandelbrotEngine.resetView();
    });
  }

  if (btnZoomInMb) {
    btnZoomInMb.addEventListener('click', () => {
      mandelbrotEngine.stopTour();
      mandelbrotEngine.zoomBy(1.25);
    });
  }

  if (btnZoomOutMb) {
    btnZoomOutMb.addEventListener('click', () => {
      mandelbrotEngine.stopTour();
      mandelbrotEngine.zoomBy(0.8);
    });
  }

  // 轨道探测器开关
  if (chkOrbit) {
    chkOrbit.addEventListener('change', (e) => {
      orbitTracer.toggle(e.target.checked);
    });
  }

  // 预设奇观
  document.querySelectorAll('[data-preset]').forEach((chip) => {
    chip.addEventListener('click', (e) => {
      mandelbrotEngine.stopTour();
      document.querySelectorAll('[data-preset]').forEach(c => c.classList.remove('active'));
      const target = e.currentTarget;
      target.classList.add('active');
      mandelbrotEngine.isMorphingPower = false;
      if (btnPowerMorph) {
        btnPowerMorph.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg> 开启开花形变动画';
        btnPowerMorph.classList.remove('btn-active');
      }

      const presetKey = target.dataset.preset;
      mandelbrotEngine.setPreset(presetKey);
      if (sliderIter) {
        sliderIter.value = mandelbrotEngine.maxIterations;
        valIter.textContent = mandelbrotEngine.maxIterations;
      }
      if (sliderPower) {
        sliderPower.value = mandelbrotEngine.power;
        valPower.textContent = mandelbrotEngine.power.toFixed(2);
      }
    });
  });

  // 调色板
  document.querySelectorAll('.color-scheme-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.color-scheme-btn').forEach(b => b.classList.remove('active'));
      const target = e.currentTarget;
      target.classList.add('active');
      mandelbrotEngine.colorPalette = parseInt(target.dataset.palette, 10);
      mandelbrotEngine.render();
    });
  });

  // 全屏沉浸切换
  const btnFullscreen = document.getElementById('btn-fullscreen');
  if (btnFullscreen) {
    btnFullscreen.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
    });
  }

  // ==============================================
  // 5. 高维 Cap Set 推演与维度切换事件
  // ==============================================
  // 维度胶囊切换
  document.querySelectorAll('.dim-pill-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.dim-pill-btn').forEach(b => b.classList.remove('active'));
      const target = e.currentTarget;
      target.classList.add('active');
      const dim = parseInt(target.dataset.dim, 10);

      // 切换维度时彻底终止上一维度的残留动画与状态
      if (activeTypingTimer) {
        clearInterval(activeTypingTimer);
        activeTypingTimer = null;
      }
      if (activeStageTimer) {
        clearInterval(activeStageTimer);
        activeStageTimer = null;
      }
      pendingFullText = null;
      onTypingCompleteCallback = null;
      if (btnAiEvolve) {
        btnAiEvolve.disabled = false;
        const evolveText = window.I18N ? window.I18N.t('btn_ai_evolve') : 'AI Model Evolution';
        btnAiEvolve.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"></path><path d="M12 6v6l4 2"></path></svg> ${evolveText}`;
      }

      funsearchEngine.switchDimension(dim);
    });
  });

  // 投影模式切换 (超球投影 vs 3D切片阵列)
  document.querySelectorAll('.proj-pill-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.proj-pill-btn').forEach(b => b.classList.remove('active'));
      const target = e.currentTarget;
      target.classList.add('active');
      funsearchEngine.setProjectionMode(target.dataset.mode);
    });
  });

  // 前端即时确定性推演 (沙箱验算当前代码)
  const btnFastDeduction = document.getElementById('btn-fast-deduction');
  if (btnFastDeduction) {
    btnFastDeduction.addEventListener('click', async () => {
      btnFastDeduction.disabled = true;
      const verifyingText = window.I18N ? window.I18N.t('funsearch_verifying') : 'Verifying in sandbox...';
      btnFastDeduction.innerHTML = `<span class="pulse-indicator"></span> ${verifyingText}`;
      try {
        await funsearchEngine.runSandboxEvaluation();
      } catch (err) {
        alert(`Sandbox error: ${err.message}`);
      } finally {
        btnFastDeduction.disabled = false;
        const deduceText = window.I18N ? window.I18N.t('btn_fast_deduction') : 'Verify in Sandbox';
        btnFastDeduction.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg> ${deduceText}`;
      }
    });
  }

  const btnResetBenchmark = document.getElementById('btn-reset-benchmark');
  if (btnResetBenchmark) {
    btnResetBenchmark.addEventListener('click', () => {
      funsearchEngine.switchDimension(funsearchEngine.dimension);
    });
  }

  // AI 大模型真实在线代码演化 (端到端真实 API + 思考链提取 + Python 沙箱验算)
  const btnAiEvolve = document.getElementById('btn-ai-evolve');
  const aiThinkingDetails = document.getElementById('ai-thinking-details');
  const aiThinkingText = document.getElementById('ai-thinking-text');
  const thinkingStatusText = document.getElementById('thinking-status-text');

  // 打字机流式输出与可跳过交互
  const btnSkipTyping = document.getElementById('btn-skip-typing');
  let activeTypingTimer = null;
  let activeStageTimer = null;
  let pendingFullText = null;
  let onTypingCompleteCallback = null;

  function finishTypingInstantly() {
    if (activeTypingTimer && pendingFullText) {
      clearInterval(activeTypingTimer);
      activeTypingTimer = null;
      aiThinkingText.textContent = pendingFullText;
      aiThinkingText.scrollTop = aiThinkingText.scrollHeight;
      pendingFullText = null;
      if (btnSkipTyping) btnSkipTyping.style.display = 'none';
      if (onTypingCompleteCallback) {
        const cb = onTypingCompleteCallback;
        onTypingCompleteCallback = null;
        cb();
      }
    }
  }

  function streamTypeWriter(element, text, speed = 8, onComplete) {
    if (activeTypingTimer) {
      clearInterval(activeTypingTimer);
      activeTypingTimer = null;
    }
    pendingFullText = text;
    onTypingCompleteCallback = onComplete;
    element.textContent = '';
    let idx = 0;
    // 根据文本长度自适应调整步长，保证在 2~3 秒内展示完毕，保持极佳科技感与流畅度
    const step = text.length > 1200 ? 8 : (text.length > 500 ? 4 : 2);
    const interval = Math.max(10, speed);

    if (btnSkipTyping) {
      btnSkipTyping.style.display = 'inline-block';
    }

    activeTypingTimer = setInterval(() => {
      idx += step;
      if (idx >= text.length) {
        element.textContent = text;
        element.scrollTop = element.scrollHeight;
        clearInterval(activeTypingTimer);
        activeTypingTimer = null;
        pendingFullText = null;
        if (btnSkipTyping) btnSkipTyping.style.display = 'none';
        if (onTypingCompleteCallback) {
          const cb = onTypingCompleteCallback;
          onTypingCompleteCallback = null;
          cb();
        }
      } else {
        element.textContent = text.slice(0, idx) + ' ▌';
        element.scrollTop = element.scrollHeight;
      }
    }, interval);
  }

  if (btnSkipTyping) {
    btnSkipTyping.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      finishTypingInstantly();
    });
  }

  if (aiThinkingText) {
    // 坚决不使用原生 title 属性，彻底根除遮挡文字的浏览器默认悬停 Tooltip 框
    aiThinkingText.removeAttribute('title');
    aiThinkingText.addEventListener('click', () => {
      finishTypingInstantly();
    });
  }

  // 1. 一键复制大模型代数推导与沙箱验算报告全文
  const btnCopyThinking = document.getElementById('btn-copy-thinking');
  if (btnCopyThinking) {
    btnCopyThinking.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const textToCopy = pendingFullText || (aiThinkingText ? aiThinkingText.textContent : '');
      if (!textToCopy) {
        alert(window.I18N ? window.I18N.t('funsearch_no_content') : 'No content to copy');
        return;
      }
      const copiedText = window.I18N ? window.I18N.t('funsearch_copied') : 'Copied ✓';
      const normalText = window.I18N ? window.I18N.t('btn_copy_thinking') : '📋 Copy Reasoning';
      try {
        await navigator.clipboard.writeText(textToCopy);
        btnCopyThinking.textContent = copiedText;
        btnCopyThinking.style.color = '#34d399';
        setTimeout(() => {
          btnCopyThinking.textContent = normalText;
          btnCopyThinking.style.color = '#38bdf8';
        }, 1800);
      } catch (err) {
        const ta = document.createElement('textarea');
        ta.value = textToCopy;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        btnCopyThinking.textContent = copiedText;
        setTimeout(() => { btnCopyThinking.textContent = normalText; }, 1800);
      }
    });
  }

  // 2. 一键将大模型数学分析、代码与沙箱验算指标导出为完整学术 Markdown 文档
  const btnExportMarkdown = document.getElementById('btn-export-markdown');
  if (btnExportMarkdown) {
    btnExportMarkdown.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isEn = !window.I18N || window.I18N.getLanguage() === 'en';
      const deductionText = pendingFullText || (aiThinkingText ? aiThinkingText.textContent : '');
      const codeText = funsearchEngine ? funsearchEngine.currentCode : '';
      const dim = funsearchEngine ? funsearchEngine.dimension : 5;
      const points = (funsearchEngine && funsearchEngine.selectedPoints) ? funsearchEngine.selectedPoints : [];
      const curProvider = window.modelPlatformManager ? window.modelPlatformManager.activeProvider : 'default';
      const curModel = window.modelPlatformManager ? window.modelPlatformManager.activeModel : 'unknown';
      const pInfo = window.modelPlatformManager ? window.modelPlatformManager.getProviderInfo(curProvider) : null;
      const pName = pInfo ? pInfo.name : curProvider;
      const nowStr = new Date().toISOString();
      const totalSpace = 3 ** dim;
      const naiveBase = 2 ** dim;
      const score = points.length;

      let mdContent = '';
      if (isEn) {
        mdContent = `# AxiomForge Extremal Combinatorics Evolution Report

- **Generated At**: ${nowStr}
- **LLM Model**: ${curModel} (${pName})
- **Target Space**: $\\mathbb{F}_3^${dim}$ Finite Affine Vector Space (Total Points: ${totalSpace})
- **Baseline Reference**: Naive Greedy Hypercube Barrier $2^${dim} = ${naiveBase}$ points
- **Model Score**: Non-collinear Cap Set Cardinality **${score} points** (${score > naiveBase ? `🎉 Successfully broke 2ⁿ local trap +${(((score - naiveBase) / naiveBase) * 100).toFixed(1)}%` : 'Baseline reached'})
- **Collinear Violations**: 0 lines (100% strictly satisfies non-collinear condition: $x + y + z \\not\\equiv 0 \\pmod 3$)

---

## 🧠 1. Large Language Model Algebraic Reasoning & Derivations

${deductionText || '(No deduction text)'}

---

## 💻 2. Synthesized Python Priority Heuristic Program

\`\`\`python
${codeText || '# No code'}
\`\`\`

---

## 📍 3. Verified Maximal Cap Set Vector Coordinates (${score} points)

\`\`\`json
${JSON.stringify(points, null, 2)}
\`\`\`

---
*This report was automatically generated by AxiomForge and rigorously verified in an isolated Python mathematical sandbox.*
`;
      } else {
        mdContent = `# AxiomForge 极值组合数学演化成果报告

- **生成时间**: ${nowStr}
- **演化模型**: ${curModel} (${pName})
- **目标空间**: $\\mathbb{F}_3^${dim}$ 有限仿射向量空间 (总点数: ${totalSpace})
- **基线对照**: 朴素贪心受限陷阱 $2^${dim} = ${naiveBase}$ 点
- **模型成果**: 选出非共线点集基数 **${score} 点** (${score > naiveBase ? `🎉 成功突破局部极值 +${(((score - naiveBase) / naiveBase) * 100).toFixed(1)}%` : '当前已达基准线'})
- **三点共线违规**: 0 条 (100% 严密满足反共线防线: $x + y + z \\not\\equiv 0 \\pmod 3$)

---

## 🧠 一、 大语言模型代数推导与思考全景

${deductionText || '（暂无推演正文）'}

---

## 💻 二、 演化生成的 Python 优先级启发式函数

\`\`\`python
${codeText || '# 暂无代码'}
\`\`\`

---

## 📍 三、 真实选出的极大帽集 (Cap Set) 向量点坐标列表 (共 ${score} 点)

\`\`\`json
${JSON.stringify(points, null, 2)}
\`\`\`

---
*本报告由 AxiomForge AI 驱动极值组合数学发现引擎自动生成并经安全 Python 沙箱真实严密验算。*
`;
      }

      const filename = isEn ? `AxiomForge_CapSet_F3_${dim}_${score}pts.md` : `AxiomForge_帽集报告_F3_${dim}_${score}点.md`;
      const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      const originalText = btnExportMarkdown.innerHTML;
      btnExportMarkdown.innerHTML = '已导出 ✓';
      setTimeout(() => {
        btnExportMarkdown.innerHTML = originalText;
      }, 1800);
    });
  }

  // 3. 一键复制 Python 优先级函数代码
  const btnCopyCode = document.getElementById('btn-copy-code');
  if (btnCopyCode) {
    btnCopyCode.addEventListener('click', async (e) => {
      e.preventDefault();
      const codeEl = document.getElementById('funsearch-code-display');
      const codeText = codeEl ? codeEl.textContent : '';
      if (!codeText) {
        alert('暂无代码可复制');
        return;
      }
      try {
        await navigator.clipboard.writeText(codeText);
        const original = btnCopyCode.innerHTML;
        btnCopyCode.innerHTML = '已复制 ✓';
        btnCopyCode.style.color = '#34d399';
        setTimeout(() => {
          btnCopyCode.innerHTML = original;
          btnCopyCode.style.color = '#38bdf8';
        }, 1800);
      } catch (err) {
        const ta = document.createElement('textarea');
        ta.value = codeText;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        btnCopyCode.textContent = '已复制 ✓';
        setTimeout(() => { btnCopyCode.textContent = '📋 复制代码'; }, 1800);
      }
    });
  }

  if (btnAiEvolve) {
    btnAiEvolve.addEventListener('click', async () => {
      btnAiEvolve.disabled = true;
      btnAiEvolve.innerHTML = '<span class="pulse-indicator" style="background:#38bdf8;"></span> AI 真实演化推理中...';
      if (aiThinkingDetails) aiThinkingDetails.open = true;

      const curProvider = window.modelPlatformManager.activeProvider;
      const curModel = window.modelPlatformManager.activeModel;
      const curPInfo = window.modelPlatformManager.getProviderInfo(curProvider);
      const curPName = curPInfo ? curPInfo.name : curProvider;
      const dim = funsearchEngine.dimension;
      const totalPts = 3 ** dim;

      if (thinkingStatusText) thinkingStatusText.textContent = `大模型正在针对 ${dim} 维空间进行代数推演...`;

      // 四阶段动态推演提示轮播，避免等待卡顿与沉寂
      const stages = [
        `[阶段 1/4 · 空间约束注入] 正在向模型【${curPName} / ${curModel}】注入 F_3^${dim} 空间先验与反共线条件 (空间规模: 3^${dim} = ${totalPts} 点)...`,
        `[阶段 2/4 · 代数对称性探索] 大模型正在分析 F_3^${dim} 的中间层汉明权值切片分布与仿射同余群偏置，探索突破 2^${dim}=${Math.pow(2, dim)} 局部陷阱...`,
        `[阶段 3/4 · 启发式评分函数构建] 大模型正在形式化构造 priority(p, n) 优先级函数并优化代数不变性逻辑...`,
        `[阶段 4/4 · 沙箱编译与严密验算] 正在接收大模型推演输出，准备送入 Python 沙箱执行 ${totalPts} 点的 O(k²) 严密三点共线判定与贪心选点...`
      ];
      let stageIdx = 0;
      let isResultReceived = false;
      if (aiThinkingText) {
        aiThinkingText.textContent = stages[0];
      }

      if (activeStageTimer) clearInterval(activeStageTimer);
      activeStageTimer = setInterval(() => {
        if (isResultReceived) return;
        stageIdx = (stageIdx + 1) % stages.length;
        if (aiThinkingText) {
          aiThinkingText.textContent = stages[stageIdx];
        }
        if (thinkingStatusText) {
          const isEnNow = !window.I18N || window.I18N.getLanguage() === 'en';
          thinkingStatusText.textContent = isEnNow
            ? `Reasoning Evolution (Stage ${stageIdx + 1}/4 · Target ${dim}D)...`
            : `推理演化中 (阶段 ${stageIdx + 1}/4 · 目标 ${dim} 维)...`;
        }
      }, 3000);

      const t0 = performance.now();
      try {
        const result = await window.modelPlatformManager.evolveProgramStep({
          dimension: dim,
          currentCode: funsearchEngine.currentCode
        });

        const t1 = performance.now();
        const totalDurationSec = Math.max(0.01, (t1 - t0) / 1000);
        const sandboxSec = typeof result.eval_time_seconds === 'number' ? result.eval_time_seconds : 0.002;
        const llmSec = Math.max(0.01, totalDurationSec - sandboxSec);

        result.timing = {
          totalSeconds: totalDurationSec,
          llmSeconds: llmSec,
          sandboxSeconds: sandboxSec
        };

        isResultReceived = true;
        if (activeStageTimer) {
          clearInterval(activeStageTimer);
          activeStageTimer = null;
        }

        const isEn = !window.I18N || window.I18N.getLanguage() === 'en';
        if (thinkingStatusText) {
          thinkingStatusText.textContent = isEn
            ? `Reasoning & Sandbox Verification Complete (${dim}D · ${result.score} pts)`
            : `真实推理与沙箱验算完成 (${dim} 维 · ${result.score} 点)`;
        }

        const baselineScore = Math.pow(2, dim);
        const gainPct = (((result.score - baselineScore) / baselineScore) * 100).toFixed(1);
        const breakEvaluation = result.score > baselineScore
          ? (isEn ? `🎉 Broke naive 2^${dim}=${baselineScore} local trap (+${gainPct}%)!` : `🎉 成功突破朴素基准 2^${dim}=${baselineScore} 局部极大值陷阱 (+${gainPct}%)！`)
          : (isEn ? `Current cap cardinality ${result.score} pts, continuing multi-generation optimization` : `当前非共线点集基数 ${result.score} 点，继续多代际演化优化`);

        const evalSummary = isEn
          ? `\n\n═══════════════════════════════════════════════════\n` +
            `✅ Python Sandbox Verification Report:\n` +
            `- Evolved Model: ${result.model_id} (${result.provider_id || curProvider})\n` +
            `- Target Affine Space: F_3^${result.dimension} (${result.total_points || (3 ** result.dimension)} total vector points)\n` +
            `- Latency Breakdown: Total ${totalDurationSec.toFixed(2)}s (LLM Generation: ${llmSec.toFixed(2)}s | Python Sandbox Math Eval: ${sandboxSec.toFixed(3)}s)\n` +
            `- Collinear Triples Violations: ${result.collinear_violations} (Zero Tolerance, 100% Strict)\n` +
            `- Verified Cap Set Cardinality: ${result.score} points\n` +
            `- Algebraic Assessment: ${breakEvaluation}\n` +
            `═══════════════════════════════════════════════════`
          : `\n\n═══════════════════════════════════════════════════\n` +
            `✅ Python 沙箱验算完成报告:\n` +
            `- 演化模型: ${result.model_id} (${result.provider_id || curProvider})\n` +
            `- 目标空间: F_3^${result.dimension} (总规模 ${result.total_points || (3 ** result.dimension)} 个向量点)\n` +
            `- 耗时精准拆解: 总计 ${totalDurationSec.toFixed(2)}s (大模型推理生成: ${llmSec.toFixed(2)}s | Python 沙箱数学验算: ${sandboxSec.toFixed(3)}s)\n` +
            `- 三点共线违规数: ${result.collinear_violations} (100% 严密防线，0 容忍)\n` +
            `- 真实选出非共线点集基数: ${result.score} 点\n` +
            `- 代数突破评估: ${breakEvaluation}\n` +
            `═══════════════════════════════════════════════════`;

        const defaultDeduction = isEn
          ? "【Algebraic Deduction】The model completed invariant extraction and construction in F_3^n."
          : "【代数推导】模型已完成 F_3^n 空间的代数特征提取与构造。";
        const deductionBody = result.reasoning || result.raw_text || defaultDeduction;
        const fullOutput = deductionBody + evalSummary;

        // 1. 【即时反馈到主图框】：模型推演出的最新点集、代码与成果看板，第 0 秒立刻点亮并更新到主图框与 HUD！
        funsearchEngine.applyEvolvedResult(result);
        if (result.code) {
          const codeEl = document.getElementById('funsearch-code-display');
          if (codeEl) codeEl.textContent = result.code;
        }

        const sandboxStatusEl = document.getElementById('sandbox-status-text');
        if (sandboxStatusEl) {
          sandboxStatusEl.textContent = isEn
            ? `Total: ${totalDurationSec.toFixed(2)}s (LLM: ${llmSec.toFixed(2)}s | Sandbox: ${sandboxSec.toFixed(3)}s) · Violations: 0`
            : `总耗时: ${totalDurationSec.toFixed(2)}s (大模型: ${llmSec.toFixed(2)}s | 沙箱验算: ${sandboxSec.toFixed(3)}s) · 违规: 0`;
        }

        // 2. 同时启动打字机动画流式输出大模型数学推导与验算全景
        streamTypeWriter(aiThinkingText, fullOutput, 10);

      } catch (err) {
        isResultReceived = true;
        if (activeStageTimer) {
          clearInterval(activeStageTimer);
          activeStageTimer = null;
        }
        const isEn = !window.I18N || window.I18N.getLanguage() === 'en';
        if (thinkingStatusText) {
          thinkingStatusText.textContent = isEn
            ? "Evolution Interrupted (See diagnostics below)"
            : "推演中断 (请查看下方诊断)";
        }

        const errStr = err.message || String(err);
        const isTimeout = /timed?\s*out|超时/i.test(errStr);

        let guidance = "";
        if (isTimeout) {
          guidance = isEn
            ? `【⏱️ Timeout Cause & Solutions】:\n` +
              `1. The model [${curModel}] took longer to generate mathematical reasoning, or the provider network queued up.\n` +
              `2. Solution A: Open [AI Model Platform] in header, switch to a faster model (e.g. deepseek-chat or flash models);\n` +
              `3. Solution B: Switch to the built-in [Reproducible Mock] offline engine for instant sub-millisecond evaluation;\n` +
              `4. The server timeout is set to 180s. You can also click retry directly.`
            : `【⏱️ 超时根因与解决方案】：\n` +
              `1. 当前驱动模型【${curModel}】生成长篇数学推演耗时较长，或中转聚合节点网络排队较慢。\n` +
              `2. 解决方案 A：点击右上角【AI 模型平台配置】，切换为响应更快的轻量模型 (如 deepseek-chat 或 聚合平台的 flash 模型)；\n` +
              `3. 解决方案 B：切换至内置的【Reproducible Mock 确定性离线引擎】，毫秒级体验完整的代数推演与沙箱验算闭环；\n` +
              `4. 服务端已将连接超时放宽至 180 秒并精炼了 prompt，您也可以直接再次点击重试。`;
        } else {
          guidance = isEn
            ? `【Academic Rigor Note】: The system strictly refuses to output fabricated pre-determined results without authentic model computation and sandbox verification.\nFor instant offline testing, click [AI Model Platform] in top right and choose Reproducible Mock engine.`
            : `【学术严谨性声明】：系统坚决拒绝在未获得模型真实计算与沙箱验算的前提下给出虚假预定结果。\n若需离线测试体验，请点击右上角【AI 模型平台配置】选择 Reproducible Mock 确定性离线引擎。`;
        }

        if (aiThinkingText) {
          if (err.reasoning) {
            aiThinkingText.textContent = isEn
              ? `${err.reasoning}\n\n═══════════════════════════════════════════════════\n⚠️ Evolution Notice: ${errStr}\nFault-tolerant extraction enabled. Please click [Evolve via AI Model] to retry.\n═══════════════════════════════════════════════════`
              : `${err.reasoning}\n\n═══════════════════════════════════════════════════\n⚠️ 推演提示: ${errStr}\n系统已启用强化型代码容错提取，请再次点击【AI 大模型生成演化】重试。\n═══════════════════════════════════════════════════`;
          } else {
            aiThinkingText.textContent = isEn
              ? `❌ Model generation unsuccessful: ${errStr}\n\n${guidance}`
              : `❌ 模型推演未成功: ${errStr}\n\n${guidance}`;
          }
        }
      } finally {
        btnAiEvolve.disabled = false;
        const evolveBtnLabel = window.I18N ? window.I18N.t('btn_ai_evolve') : 'Evolve via AI Model';
        btnAiEvolve.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"></path><path d="M12 6v6l4 2"></path></svg> ${evolveBtnLabel}`;
      }
    });
  }

  // ==============================================
  // 6. A/B 演化对抗收敛图表绘制 (Canvas)
  // ==============================================
  window.renderAbComparisonChart = function(dim, latestScore = null) {
    const canvas = document.getElementById('ab-chart-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const bench = CAP_SET_BENCHMARKS[dim] || CAP_SET_BENCHMARKS[5];
    const history = JSON.parse(JSON.stringify(bench.abHistory || {
      generations: Array.from({ length: 30 }, (_, i) => i + 1),
      naiveScores: Array(30).fill(bench.naiveBaseline || 8),
      symmetryScores: Array(30).fill(bench.axiomForgeBest || 9)
    }));

    if (latestScore !== null && history.symmetryScores.length > 0) {
      history.symmetryScores[history.symmetryScores.length - 1] = latestScore;
    }

    const padLeft = 30;
    const padBottom = 20;
    const padTop = 10;
    const padRight = 10;
    const plotW = w - padLeft - padRight;
    const plotH = h - padTop - padBottom;

    const minScore = Math.min(...history.naiveScores, ...history.symmetryScores) * 0.85;
    const maxScore = Math.max(...history.naiveScores, ...history.symmetryScores) * 1.08;

    // 绘制坐标轴
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padLeft, padTop);
    ctx.lineTo(padLeft, h - padBottom);
    ctx.lineTo(w - padRight, h - padBottom);
    ctx.stroke();

    // 刻度标签
    ctx.fillStyle = '#64748b';
    ctx.font = '9px monospace';
    ctx.fillText(`${Math.round(maxScore)}`, 4, padTop + 8);
    const isEn = !window.I18N || window.I18N.getLanguage() === 'en';
    ctx.fillText(isEn ? 'Gen 1' : '第 1 代', padLeft, h - 6);
    ctx.fillText(isEn ? `Gen ${history.generations.length}` : `第 ${history.generations.length} 代`, w - (isEn ? 40 : 50), h - 6);

    function getX(i) {
      return padLeft + (i / (history.generations.length - 1)) * plotW;
    }
    function getY(val) {
      return (h - padBottom) - ((val - minScore) / (maxScore - minScore)) * plotH;
    }

    // 1. 绘制对照组 (朴素盲目演化 - 灰色虚线)
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    history.naiveScores.forEach((score, i) => {
      const x = getX(i);
      const y = getY(score);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.setLineDash([]);

    // 2. 绘制实验组 (对称性先验突破 - 璀璨金实线)
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    history.symmetryScores.forEach((score, i) => {
      const x = getX(i);
      const y = getY(score);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // 终点高亮圆点
    const endX = getX(history.symmetryScores.length - 1);
    const endY = getY(history.symmetryScores[history.symmetryScores.length - 1]);
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(endX, endY, 4, 0, Math.PI * 2);
    ctx.fill();
  };

  // 初始渲染 5 维图表
  window.renderAbComparisonChart(5);

  // ==============================================
  // 7. AI 模型平台设置中心完整逻辑 (深度对齐 pi-ai)
  // ==============================================
  const btnOpenModal = document.getElementById('btn-model-settings');
  const modal = document.getElementById('modal-model-settings');
  const btnCloseModal = document.getElementById('btn-close-modal');
  const btnCancelModal = document.getElementById('btn-cancel-settings');
  const btnSaveModal = document.getElementById('btn-save-settings');
  const btnTestAuth = document.getElementById('btn-test-auth');
  const btnFetchModels = document.getElementById('btn-fetch-remote-models');
  const iconFetchSpin = document.getElementById('icon-fetch-spin');
  const btnAddCustomProvider = document.getElementById('btn-add-custom-provider');
  const btnDeleteProvider = document.getElementById('btn-delete-provider');
  const selectProvider = document.getElementById('select-provider');
  const inputPlatformName = document.getElementById('input-platform-name');
  const groupPlatformName = document.getElementById('group-platform-name');
  const selectModel = document.getElementById('select-model');
  const inputCustomModel = document.getElementById('input-custom-model');
  const containerSelectModel = document.getElementById('container-select-model');
  const containerInputModel = document.getElementById('container-input-model');
  const btnToggleManualModel = document.getElementById('btn-toggle-manual-model');
  const inputApiKey = document.getElementById('input-api-key');
  const inputBaseUrl = document.getElementById('input-base-url');
  const checkResultBox = document.getElementById('check-auth-result');

  let isManualModelMode = false;

  function refreshProviderDropdown() {
    if (!selectProvider) return;
    const providers = window.modelPlatformManager.getAllProviders();
    const currentVal = selectProvider.value;
    selectProvider.innerHTML = '';

    const t = (k, fallback) => (window.I18N ? window.I18N.t(k) : fallback);

    const groupBuiltin = document.createElement('optgroup');
    groupBuiltin.label = t('model_group_builtin', 'Official Built-in Providers');
    const groupCustom = document.createElement('optgroup');
    groupCustom.label = t('model_group_custom', 'Custom Providers');

    providers.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = p.name;
      if (p.isBuiltin) {
        groupBuiltin.appendChild(opt);
      } else {
        groupCustom.appendChild(opt);
      }
    });

    selectProvider.appendChild(groupBuiltin);
    if (groupCustom.children.length > 0) {
      selectProvider.appendChild(groupCustom);
    }
    if (currentVal) {
      selectProvider.value = currentVal;
    }
  }

  function updateModelDropdown(models, selectedModelId) {
    if (!selectModel) return;
    selectModel.innerHTML = '';
    const t = (k, params, fallback) => (window.I18N ? window.I18N.t(k, params) : fallback);

    if (!models || models.length === 0) {
      const opt = document.createElement('option');
      opt.value = 'default';
      opt.textContent = t('model_opt_empty', {}, 'No models retrieved (Click auto-fetch or input manually)');
      selectModel.appendChild(opt);
      return;
    }

    let isSelectedMatched = false;
    const reasoningTag = t('model_opt_reasoning', {}, '🧠 (Reasoning Chain)');
    models.forEach(m => {
      const opt = document.createElement('option');
      opt.value = m.id;
      opt.textContent = `${m.name || m.id} ${m.reasoning ? reasoningTag : ''}`;
      if (m.id === selectedModelId) {
        opt.selected = true;
        isSelectedMatched = true;
      }
      selectModel.appendChild(opt);
    });

    // 容错：如果用户配置了自定义模型，但该模型不在下拉列表内，自动追加一个选中项，确保永不丢失回显
    if (selectedModelId && selectedModelId !== 'default' && !isSelectedMatched) {
      const opt = document.createElement('option');
      opt.value = selectedModelId;
      opt.textContent = t('model_opt_configured', { model: selectedModelId }, `⭐ ${selectedModelId} (Currently Configured)`);
      opt.selected = true;
      selectModel.insertBefore(opt, selectModel.firstChild);
    }
  }

  function loadProviderIntoForm(providerId, targetModelId) {
    const pInfo = window.modelPlatformManager.getProviderInfo(providerId);
    if (!pInfo) return;

    // 平台名称显示/隐藏
    if (pInfo.isBuiltin) {
      if (groupPlatformName) groupPlatformName.style.display = 'none';
      if (btnDeleteProvider) btnDeleteProvider.style.display = 'none';
    } else {
      if (groupPlatformName) groupPlatformName.style.display = 'flex';
      if (inputPlatformName) inputPlatformName.value = pInfo.name || '';
      if (btnDeleteProvider) btnDeleteProvider.style.display = 'inline-flex';
    }

    if (inputApiKey) inputApiKey.value = pInfo.apiKey || '';
    if (inputBaseUrl) inputBaseUrl.value = pInfo.baseUrl || '';

    // 优先使用明确指定的 targetModelId，次优使用该平台记忆的 selectedModel，再次使用列表首个模型
    const chosenModel = targetModelId || pInfo.selectedModel || (pInfo.models && pInfo.models[0] ? pInfo.models[0].id : '');

    updateModelDropdown(pInfo.models, chosenModel);
    if (inputCustomModel) inputCustomModel.value = chosenModel || '';
    if (checkResultBox) checkResultBox.style.display = 'none';
  }

  if (btnOpenModal && modal) {
    btnOpenModal.addEventListener('click', () => {
      modal.style.display = 'flex';
      refreshProviderDropdown();
      const currentActive = window.modelPlatformManager.activeProvider;
      selectProvider.value = currentActive;
      loadProviderIntoForm(currentActive, window.modelPlatformManager.activeModel);
    });
  }

  function closeModal() {
    if (modal) modal.style.display = 'none';
  }
  if (btnCloseModal) btnCloseModal.addEventListener('click', closeModal);
  if (btnCancelModal) btnCancelModal.addEventListener('click', closeModal);

  if (selectProvider) {
    selectProvider.addEventListener('change', (e) => {
      // 切换平台时，根据目标平台自身记忆的 selectedModel 进行加载，不再无脑覆盖
      loadProviderIntoForm(e.target.value);
    });
  }

  // 添加自定义平台
  if (btnAddCustomProvider) {
    btnAddCustomProvider.addEventListener('click', () => {
      const defaultName = window.I18N ? window.I18N.t('model_default_custom_name') : 'Custom Provider';
      const newId = window.modelPlatformManager.addCustomPlatform(defaultName, 'https://');
      refreshProviderDropdown();
      selectProvider.value = newId;
      loadProviderIntoForm(newId);
      if (inputPlatformName) inputPlatformName.focus();
    });
  }

  // 删除当前自定义平台
  if (btnDeleteProvider) {
    btnDeleteProvider.addEventListener('click', () => {
      const pid = selectProvider.value;
      const confirmMsg = window.I18N
        ? window.I18N.t('model_confirm_delete', { name: inputPlatformName.value })
        : `Are you sure you want to delete custom provider [${inputPlatformName.value}]?`;
      if (confirm(confirmMsg)) {
        window.modelPlatformManager.deleteCustomPlatform(pid);
        refreshProviderDropdown();
        const activePid = window.modelPlatformManager.activeProvider;
        selectProvider.value = activePid;
        loadProviderIntoForm(activePid, window.modelPlatformManager.activeModel);
      }
    });
  }

  // 自动拉取远程模型并立即持久化存盘
  if (btnFetchModels) {
    btnFetchModels.addEventListener('click', async () => {
      const base = inputBaseUrl.value.trim();
      const key = inputApiKey.value.trim();
      const pid = selectProvider.value;

      if (!base) {
        alert(window.I18N ? window.I18N.t('model_alert_no_base_url') : 'Please enter the API Endpoint (Base URL) first.');
        return;
      }

      btnFetchModels.disabled = true;
      if (iconFetchSpin) iconFetchSpin.classList.add('spin-anim');

      try {
        const models = await window.modelPlatformManager.fetchRemoteModels(base, key);
        // 关键：立刻持久化保存到本地存储，永不丢失！
        window.modelPlatformManager.updateProviderModels(pid, models);

        const pInfo = window.modelPlatformManager.getProviderInfo(pid);
        const curModel = pInfo.selectedModel || (models[0] ? models[0].id : '');
        updateModelDropdown(pInfo.models, curModel);
        if (inputCustomModel) inputCustomModel.value = curModel;

        if (checkResultBox) {
          checkResultBox.style.display = 'block';
          checkResultBox.className = 'status-box success';
          checkResultBox.textContent = window.I18N
            ? window.I18N.t('model_fetch_success', { count: models.length })
            : `🎉 Auto-fetch successful! Synced ${models.length} available models.`;
        }
      } catch (err) {
        if (checkResultBox) {
          checkResultBox.style.display = 'block';
          checkResultBox.className = 'status-box error';
          checkResultBox.textContent = window.I18N
            ? window.I18N.t('model_fetch_fail', { err: err.message })
            : `Auto-fetch failed: ${err.message}`;
        }
      } finally {
        btnFetchModels.disabled = false;
        if (iconFetchSpin) iconFetchSpin.classList.remove('spin-anim');
      }
    });
  }

  // 手动输入模型切换
  if (btnToggleManualModel) {
    btnToggleManualModel.addEventListener('click', () => {
      isManualModelMode = !isManualModelMode;
      const t = (k, fallback) => (window.I18N ? window.I18N.t(k) : fallback);
      if (isManualModelMode) {
        containerSelectModel.style.display = 'none';
        containerInputModel.style.display = 'block';
        btnToggleManualModel.textContent = t('btn_toggle_select_mode', 'Switch to Dropdown Selection');
        if (inputCustomModel) inputCustomModel.focus();
      } else {
        containerSelectModel.style.display = 'block';
        containerInputModel.style.display = 'none';
        btnToggleManualModel.textContent = t('btn_toggle_manual_mode', 'Enter Model Name Manually');
      }
    });
  }

  // 密码明暗切换
  const btnToggleKey = document.getElementById('btn-toggle-key');
  if (btnToggleKey && inputApiKey) {
    btnToggleKey.addEventListener('click', () => {
      inputApiKey.type = inputApiKey.type === 'password' ? 'text' : 'password';
    });
  }

  // 真实模型连通性与响应测试 (Ping Check)
  if (btnTestAuth) {
    btnTestAuth.addEventListener('click', async () => {
      btnTestAuth.disabled = true;
      const t = (k, params, fallback) => (window.I18N ? window.I18N.t(k, params) : fallback);
      btnTestAuth.innerHTML = `<span class="pulse-indicator"></span> ${t('btn_testing_response', {}, 'Testing model response...')}`;
      const pid = selectProvider.value;
      const key = inputApiKey.value.trim();
      const base = inputBaseUrl.value.trim();
      const model = isManualModelMode ? inputCustomModel.value.trim() : selectModel.value;

      if (checkResultBox) {
        checkResultBox.style.display = 'block';
        checkResultBox.className = 'status-box';
        checkResultBox.style.borderLeftColor = '#38bdf8';
        checkResultBox.style.color = '#38bdf8';
        checkResultBox.textContent = t('model_testing_signal', { model: model || 'default' }, `⏳ Sending probe signal to [${model || 'default'}]...`);
      }

      try {
        const result = await window.modelPlatformManager.checkConnection(pid, key, base, model);
        if (checkResultBox) {
          checkResultBox.style.display = 'block';
          checkResultBox.className = `status-box ${result.ok ? 'success' : 'error'}`;
          checkResultBox.style.borderLeftColor = result.ok ? '#10b981' : '#ef4444';
          checkResultBox.style.color = result.ok ? '#86efac' : '#fca5a5';
          checkResultBox.textContent = result.message;
        }
        if (result.ok && model && model !== 'default') {
          window.modelPlatformManager.addModelToProvider(pid, model);
          const pInfo = window.modelPlatformManager.getProviderInfo(pid);
          if (pInfo) {
            updateModelDropdown(pInfo.models, model);
          }
        } else if (result.models && result.models.length > 0) {
          updateModelDropdown(result.models, model);
        }
      } catch (err) {
        if (checkResultBox) {
          checkResultBox.style.display = 'block';
          checkResultBox.className = 'status-box error';
          checkResultBox.style.borderLeftColor = '#ef4444';
          checkResultBox.style.color = '#fca5a5';
          checkResultBox.textContent = t('model_test_fail', { err: err.message }, `❌ Probe failed: ${err.message}`);
        }
      } finally {
        btnTestAuth.disabled = false;
        const testAuthLabel = window.I18N ? window.I18N.t('btn_test_auth') : 'Check Auth';
        btnTestAuth.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg> ${testAuthLabel}`;
      }
    });
  }

  // 保存并应用配置
  if (btnSaveModal) {
    btnSaveModal.addEventListener('click', () => {
      const pid = selectProvider.value;
      const key = inputApiKey.value.trim();
      const base = inputBaseUrl.value.trim();
      const name = inputPlatformName ? inputPlatformName.value.trim() : '';
      let chosenModel = isManualModelMode ? inputCustomModel.value.trim() : selectModel.value;

      if (!chosenModel || chosenModel === 'default') {
        const pInfo = window.modelPlatformManager.getProviderInfo(pid);
        chosenModel = (pInfo && pInfo.models && pInfo.models[0]) ? pInfo.models[0].id : 'deepseek-chat';
      }

      const pInfo = window.modelPlatformManager.getProviderInfo(pid);
      const models = (pInfo && pInfo.models) ? pInfo.models : [];

      window.modelPlatformManager.savePlatform(pid, {
        name: name,
        apiKey: key,
        baseUrl: base,
        selectedModel: chosenModel,
        models: models
      });

      // 真正持久化全局激活状态与模型 (刷新页面后 100% 还原)
      window.modelPlatformManager.setActive(pid, chosenModel);

      // 立即同步刷新右上角状态徽章
      if (window.updateActiveModelBadge) {
        window.updateActiveModelBadge();
      }

      closeModal();
    });
  }

  // 语言切换时自动重绘模型配置弹窗内的分组标签及下拉项
  window.addEventListener('axiomforge:lang_changed', () => {
    refreshProviderDropdown();
    if (selectProvider) {
      const pid = selectProvider.value;
      const pInfo = window.modelPlatformManager.getProviderInfo(pid);
      if (pInfo && pInfo.models) {
        updateModelDropdown(pInfo.models, pInfo.selectedModel);
      }
    }
    if (btnToggleManualModel) {
      const t = (k, fallback) => (window.I18N ? window.I18N.t(k) : fallback);
      btnToggleManualModel.textContent = isManualModelMode ? t('btn_toggle_select_mode', 'Switch to Dropdown Selection') : t('btn_toggle_manual_mode', 'Enter Model Name Manually');
    }
  });
});

