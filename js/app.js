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
      btnPlayKoch.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg> 播放演化';
      btnPlayKoch.classList.remove('btn-active');
      kochEngine.setOrder(order);
    });
  }

  if (btnPlayKoch) {
    btnPlayKoch.addEventListener('click', () => {
      kochEngine.isPlaying = !kochEngine.isPlaying;
      if (kochEngine.isPlaying) {
        btnPlayKoch.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg> 暂停演化';
        btnPlayKoch.classList.add('btn-active');
      } else {
        btnPlayKoch.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg> 播放演化';
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
        btnPowerMorph.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg> 开启开花形变动画';
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
        btnPowerMorph.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg> 暂停形变演化';
        btnPowerMorph.classList.add('btn-active');
      } else {
        btnPowerMorph.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg> 开启开花形变动画';
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
        btnPowerMorph.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg> 开启开花形变动画';
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
        btnTour.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg> 暂停巡航';
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

  // 快捷推演操作
  const btnFastDeduction = document.getElementById('btn-fast-deduction');
  if (btnFastDeduction) {
    btnFastDeduction.addEventListener('click', () => {
      btnFastDeduction.disabled = true;
      btnFastDeduction.innerHTML = '<span class="pulse-indicator"></span> 推演计算中...';
      setTimeout(() => {
        funsearchEngine.runFastLocalDeduction();
        btnFastDeduction.disabled = false;
        btnFastDeduction.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg> 启动即时推演';
      }, 50);
    });
  }

  const btnResetBenchmark = document.getElementById('btn-reset-benchmark');
  if (btnResetBenchmark) {
    btnResetBenchmark.addEventListener('click', () => {
      funsearchEngine.switchDimension(funsearchEngine.dimension);
    });
  }

  // AI 大模型在线代码演化
  const btnAiEvolve = document.getElementById('btn-ai-evolve');
  const aiThinkingDetails = document.getElementById('ai-thinking-details');
  const aiThinkingText = document.getElementById('ai-thinking-text');
  const thinkingStatusText = document.getElementById('thinking-status-text');

  if (btnAiEvolve) {
    btnAiEvolve.addEventListener('click', async () => {
      btnAiEvolve.disabled = true;
      btnAiEvolve.innerHTML = '<span class="pulse-indicator" style="background:#38bdf8;"></span> AI 深度推理中...';
      if (aiThinkingDetails) aiThinkingDetails.open = true;
      if (thinkingStatusText) thinkingStatusText.textContent = "正在生成代数思考链...";
      if (aiThinkingText) aiThinkingText.textContent = "";

      const prompt = `Task: Evolve a priority function for Cap Set search in F_3^${funsearchEngine.dimension} space. Points count: ${Math.pow(3, funsearchEngine.dimension)}. Maximize non-collinear subset size.`;

      try {
        const result = await window.modelPlatformManager.generateProgram(
          prompt,
          (chunk) => {
            if (aiThinkingText) aiThinkingText.textContent = chunk;
          },
          (textChunk) => {}
        );
        if (thinkingStatusText) thinkingStatusText.textContent = "推理完成";
        if (result.code) {
          funsearchEngine.currentCode = result.code;
          funsearchEngine.updateUI();
          funsearchEngine.runFastLocalDeduction();
        }
      } catch (err) {
        if (aiThinkingText) aiThinkingText.textContent = `生成失败: ${err.message}`;
      } finally {
        btnAiEvolve.disabled = false;
        btnAiEvolve.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"></path><path d="M12 6v6l4 2"></path></svg> AI 大模型生成演化';
      }
    });
  }

  // ==============================================
  // 6. A/B 演化对抗收敛图表绘制 (Canvas)
  // ==============================================
  window.renderAbComparisonChart = function(dim) {
    const canvas = document.getElementById('ab-chart-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const bench = CAP_SET_BENCHMARKS[dim] || CAP_SET_BENCHMARKS[5];
    const history = bench.abHistory || {
      generations: Array.from({ length: 30 }, (_, i) => i + 1),
      naiveScores: Array(30).fill(bench.naiveBaseline || 8),
      symmetryScores: Array(30).fill(bench.axiomForgeBest || 9)
    };

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
    ctx.fillText(`${Math.round(minScore)}`, 4, h - padBottom);
    ctx.fillText(`Gen 1`, padLeft, h - 6);
    ctx.fillText(`Gen ${history.generations.length}`, w - 40, h - 6);

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
  // 7. AI 模型平台设置弹窗逻辑 (参考 pi-ai 交互)
  // ==============================================
  const btnOpenModal = document.getElementById('btn-model-settings');
  const modal = document.getElementById('modal-model-settings');
  const btnCloseModal = document.getElementById('btn-close-modal');
  const btnCancelModal = document.getElementById('btn-cancel-settings');
  const btnSaveModal = document.getElementById('btn-save-settings');
  const btnTestAuth = document.getElementById('btn-test-auth');
  const selectProvider = document.getElementById('select-provider');
  const selectModel = document.getElementById('select-model');
  const inputApiKey = document.getElementById('input-api-key');
  const inputBaseUrl = document.getElementById('input-base-url');
  const checkResultBox = document.getElementById('check-auth-result');
  const activeModelBadge = document.getElementById('active-model-badge');

  function updateModelDropdown(providerId) {
    selectModel.innerHTML = '';
    const pInfo = window.modelPlatformManager.builtins[providerId];
    if (pInfo && pInfo.models) {
      pInfo.models.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m.id;
        opt.textContent = `${m.name} ${m.reasoning ? '🧠 (Reasoning)' : ''}`;
        selectModel.appendChild(opt);
      });
    }
  }

  function loadProviderIntoForm(providerId) {
    const cred = window.modelPlatformManager.getCredential(providerId);
    const pInfo = window.modelPlatformManager.builtins[providerId];
    inputApiKey.value = cred.apiKey || '';
    inputBaseUrl.value = cred.baseUrl || (pInfo ? pInfo.baseUrl : '');
    updateModelDropdown(providerId);
    if (checkResultBox) checkResultBox.style.display = 'none';
  }

  if (btnOpenModal && modal) {
    btnOpenModal.addEventListener('click', () => {
      modal.style.display = 'flex';
      selectProvider.value = window.modelPlatformManager.activeProvider;
      loadProviderIntoForm(selectProvider.value);
    });
  }

  function closeModal() {
    if (modal) modal.style.display = 'none';
  }
  if (btnCloseModal) btnCloseModal.addEventListener('click', closeModal);
  if (btnCancelModal) btnCancelModal.addEventListener('click', closeModal);

  if (selectProvider) {
    selectProvider.addEventListener('change', (e) => {
      loadProviderIntoForm(e.target.value);
    });
  }

  const btnToggleKey = document.getElementById('btn-toggle-key');
  if (btnToggleKey && inputApiKey) {
    btnToggleKey.addEventListener('click', () => {
      inputApiKey.type = inputApiKey.type === 'password' ? 'text' : 'password';
    });
  }

  if (btnTestAuth) {
    btnTestAuth.addEventListener('click', async () => {
      btnTestAuth.disabled = true;
      btnTestAuth.innerHTML = '<span class="pulse-indicator"></span> 正在测试...';
      const pid = selectProvider.value;
      const key = inputApiKey.value.trim();
      const base = inputBaseUrl.value.trim();

      const result = await window.modelPlatformManager.checkConnection(pid, key, base);
      btnTestAuth.disabled = false;
      btnTestAuth.innerHTML = '<span class="pulse-indicator" style="background: #38bdf8;"></span> 测试连接 (Check Auth)';

      if (checkResultBox) {
        checkResultBox.style.display = 'block';
        checkResultBox.className = `status-box ${result.ok ? 'success' : 'error'}`;
        checkResultBox.textContent = result.message;
      }
    });
  }

  if (btnSaveModal) {
    btnSaveModal.addEventListener('click', () => {
      const pid = selectProvider.value;
      const key = inputApiKey.value.trim();
      const base = inputBaseUrl.value.trim();
      const model = selectModel.value;

      window.modelPlatformManager.saveCredential(pid, key, base);
      window.modelPlatformManager.activeProvider = pid;
      window.modelPlatformManager.activeModel = model;

      if (activeModelBadge) {
        activeModelBadge.textContent = model;
      }
      closeModal();
    });
  }
});
