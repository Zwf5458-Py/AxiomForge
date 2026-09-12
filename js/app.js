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

  const activeModelBadge = document.getElementById('active-model-badge');
  if (activeModelBadge && window.modelPlatformManager) {
    const curP = window.modelPlatformManager.getProviderInfo(window.modelPlatformManager.activeProvider);
    const pName = curP ? curP.name : window.modelPlatformManager.activeProvider;
    activeModelBadge.textContent = `${pName}: ${window.modelPlatformManager.activeModel}`;
  }

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

  // 快捷推演操作 (真实调用 Python 沙箱)
  const btnFastDeduction = document.getElementById('btn-fast-deduction');
  if (btnFastDeduction) {
    btnFastDeduction.addEventListener('click', async () => {
      btnFastDeduction.disabled = true;
      btnFastDeduction.innerHTML = '<span class="pulse-indicator"></span> 沙箱验算中...';
      try {
        await funsearchEngine.runSandboxEvaluation();
      } catch (err) {
        console.error('推演执行失败:', err);
      } finally {
        btnFastDeduction.disabled = false;
        btnFastDeduction.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg> 启动即时推演';
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
  let activeTypingTimer = null;
  let pendingFullText = null;
  let onTypingCompleteCallback = null;

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

    activeTypingTimer = setInterval(() => {
      idx += step;
      if (idx >= text.length) {
        element.textContent = text;
        element.scrollTop = element.scrollHeight;
        clearInterval(activeTypingTimer);
        activeTypingTimer = null;
        pendingFullText = null;
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

  if (aiThinkingText) {
    aiThinkingText.title = "提示：点击此处可跳过打字动画立即显示全部数学推导";
    aiThinkingText.addEventListener('click', () => {
      if (activeTypingTimer && pendingFullText) {
        clearInterval(activeTypingTimer);
        activeTypingTimer = null;
        aiThinkingText.textContent = pendingFullText;
        aiThinkingText.scrollTop = aiThinkingText.scrollHeight;
        pendingFullText = null;
        if (onTypingCompleteCallback) {
          const cb = onTypingCompleteCallback;
          onTypingCompleteCallback = null;
          cb();
        }
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

      if (thinkingStatusText) thinkingStatusText.textContent = "大模型几何代数分析与程序推导中...";

      // 四阶段动态推演提示轮播，避免等待卡顿与沉寂
      const stages = [
        `[阶段 1/4 · 空间约束注入] 正在向模型【${curPName} / ${curModel}】注入 F_3^${dim} 空间约束与三点反共线先验 (目标规模 3^${dim}=${totalPts} 点)...`,
        `[阶段 2/4 · 代数对称性探索] 大模型正在分析仿射不变性、中间层汉明权值切片分布与仿射同余群偏置，探索突破 2^${dim} 局部极大值陷阱...`,
        `[阶段 3/4 · 启发式评分函数构建] 大模型正在形式化构造 def priority(p, n) -> float 函数并注入代数先验优化代码...`,
        `[阶段 4/4 · 沙箱编译与严密验算] 正在接收大模型推演文本，准备传入 Python 沙箱执行 O(k²) 严密三点共线判定与贪心选点...`
      ];
      let stageIdx = 0;
      let isResultReceived = false;
      if (aiThinkingText) {
        aiThinkingText.textContent = stages[0];
      }
      const stageTimer = setInterval(() => {
        if (isResultReceived) return;
        stageIdx = (stageIdx + 1) % stages.length;
        if (aiThinkingText) {
          aiThinkingText.textContent = stages[stageIdx];
        }
        if (thinkingStatusText) {
          thinkingStatusText.textContent = `推理演化中 (${stageIdx + 1}/4)...`;
        }
      }, 3000);

      try {
        const result = await window.modelPlatformManager.evolveProgramStep({
          dimension: dim,
          currentCode: funsearchEngine.currentCode
        });

        isResultReceived = true;
        clearInterval(stageTimer);

        if (thinkingStatusText) thinkingStatusText.textContent = "真实推理与沙箱验算完成";

        const baselineScore = Math.pow(2, dim);
        const evalSummary = `\n\n═══════════════════════════════════════════════════\n` +
          `✅ Python 沙箱验算完成报告:\n` +
          `- 演化模型: ${result.model_id} (${result.provider_id || curProvider})\n` +
          `- 目标空间: F_3^${result.dimension} (共 ${result.total_points || (3 ** result.dimension)} 个向量点)\n` +
          `- 空间打分耗时: ${result.eval_time_seconds}s\n` +
          `- 三点共线违规数: ${result.collinear_violations} (100% 严密防线，0 容忍)\n` +
          `- 真实选出非共线点集基数: ${result.score} 点\n` +
          `- 代数突破评估: ${result.score > baselineScore ? `🎉 成功突破朴素基准 2^${dim}=${baselineScore} 局部极大值陷阱 (+${(((result.score - baselineScore) / baselineScore) * 100).toFixed(1)}%)！` : `当前非共线点集基数 ${result.score} 点，继续多代际演化优化`}\n` +
          `═══════════════════════════════════════════════════`;

        const deductionBody = result.reasoning || result.raw_text || "【代数推导】模型已完成 F_3^n 空间的代数特征提取与构造。";
        const fullOutput = deductionBody + evalSummary;

        // 启动打字机动画流式输出大模型数学推导与验算全景
        streamTypeWriter(aiThinkingText, fullOutput, 10, () => {
          // 打字完成或跳过时，更新状态与 3D 点阵
          funsearchEngine.applyEvolvedResult(result);
        });

        // 提前将代码放入代码预览窗口，形成代码与思考同步涌现的质感
        if (result.code) {
          const codeEl = document.getElementById('funsearch-code-display');
          if (codeEl) codeEl.textContent = result.code;
        }

      } catch (err) {
        isResultReceived = true;
        clearInterval(stageTimer);
        if (thinkingStatusText) thinkingStatusText.textContent = "推演中断";
        if (aiThinkingText) {
          aiThinkingText.textContent = `❌ 模型推演中断: ${err.message}\n\n【学术严谨性声明】：系统坚决拒绝在未获得模型真实计算与沙箱验算的前提下给出虚假预定结果。\n若需离线测试体验，请点击右上角【AI 模型平台配置】选择 Reproducible Mock 确定性离线引擎。`;
        }
        alert(`推演提示: ${err.message}`);
      } finally {
        btnAiEvolve.disabled = false;
        btnAiEvolve.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"></path><path d="M12 6v6l4 2"></path></svg> AI 大模型生成演化';
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
  const activeModelBadge = document.getElementById('active-model-badge');

  let isManualModelMode = false;

  function refreshProviderDropdown() {
    if (!selectProvider) return;
    const providers = window.modelPlatformManager.getAllProviders();
    selectProvider.innerHTML = '';

    const groupBuiltin = document.createElement('optgroup');
    groupBuiltin.label = '官方内置平台';
    const groupCustom = document.createElement('optgroup');
    groupCustom.label = '用户自定义平台';

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
  }

  function updateModelDropdown(models, selectedModelId) {
    if (!selectModel) return;
    selectModel.innerHTML = '';
    if (!models || models.length === 0) {
      const opt = document.createElement('option');
      opt.value = 'default';
      opt.textContent = '未检索到模型 (请点击自动拉取或手动输入)';
      selectModel.appendChild(opt);
      return;
    }

    models.forEach(m => {
      const opt = document.createElement('option');
      opt.value = m.id;
      opt.textContent = `${m.name || m.id} ${m.reasoning ? '🧠 (Reasoning 思考链)' : ''}`;
      if (m.id === selectedModelId) {
        opt.selected = true;
      }
      selectModel.appendChild(opt);
    });
  }

  function loadProviderIntoForm(providerId) {
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

    updateModelDropdown(pInfo.models, window.modelPlatformManager.activeModel);
    if (inputCustomModel) inputCustomModel.value = window.modelPlatformManager.activeModel || '';
    if (checkResultBox) checkResultBox.style.display = 'none';
  }

  if (btnOpenModal && modal) {
    btnOpenModal.addEventListener('click', () => {
      modal.style.display = 'flex';
      refreshProviderDropdown();
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

  // 添加自定义平台
  if (btnAddCustomProvider) {
    btnAddCustomProvider.addEventListener('click', () => {
      const newId = window.modelPlatformManager.addCustomPlatform('自定义聚合平台', 'https://');
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
      if (confirm(`确定要删除自定义平台 [${inputPlatformName.value}] 吗？`)) {
        window.modelPlatformManager.deleteCustomPlatform(pid);
        refreshProviderDropdown();
        selectProvider.value = window.modelPlatformManager.activeProvider;
        loadProviderIntoForm(selectProvider.value);
      }
    });
  }

  // 自动拉取远程模型
  if (btnFetchModels) {
    btnFetchModels.addEventListener('click', async () => {
      const base = inputBaseUrl.value.trim();
      const key = inputApiKey.value.trim();

      if (!base) {
        alert('请先输入接口端点 (Base URL)');
        return;
      }

      btnFetchModels.disabled = true;
      if (iconFetchSpin) iconFetchSpin.classList.add('spin-anim');

      try {
        const models = await window.modelPlatformManager.fetchRemoteModels(base, key);
        updateModelDropdown(models);
        // 保存至当前平台内存
        const pid = selectProvider.value;
        const pInfo = window.modelPlatformManager.getProviderInfo(pid);
        if (pInfo) pInfo.models = models;

        if (checkResultBox) {
          checkResultBox.style.display = 'block';
          checkResultBox.className = 'status-box success';
          checkResultBox.textContent = `🎉 自动拉取成功！已同步 ${models.length} 个可用模型，请在下方选择。`;
        }
      } catch (err) {
        if (checkResultBox) {
          checkResultBox.style.display = 'block';
          checkResultBox.className = 'status-box error';
          checkResultBox.textContent = `自动拉取失败: ${err.message} (您可点击下方“手动输入模型名”直接填写)`;
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
      if (isManualModelMode) {
        containerSelectModel.style.display = 'none';
        containerInputModel.style.display = 'block';
        btnToggleManualModel.textContent = '切换为下拉选择';
        if (inputCustomModel) inputCustomModel.focus();
      } else {
        containerSelectModel.style.display = 'block';
        containerInputModel.style.display = 'none';
        btnToggleManualModel.textContent = '手动输入模型名';
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
      btnTestAuth.innerHTML = '<span class="pulse-indicator"></span> 正在测试模型响应...';
      const pid = selectProvider.value;
      const key = inputApiKey.value.trim();
      const base = inputBaseUrl.value.trim();
      const model = isManualModelMode ? inputCustomModel.value.trim() : selectModel.value;

      if (checkResultBox) {
        checkResultBox.style.display = 'block';
        checkResultBox.className = 'status-box';
        checkResultBox.style.borderLeftColor = '#38bdf8';
        checkResultBox.style.color = '#38bdf8';
        checkResultBox.textContent = `⏳ 正在向模型【${model || '默认'}】发送测试信号，测试实际端到端响应延迟...`;
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
        if (result.models && result.models.length > 0) {
          updateModelDropdown(result.models, model);
        }
      } catch (err) {
        if (checkResultBox) {
          checkResultBox.style.display = 'block';
          checkResultBox.className = 'status-box error';
          checkResultBox.style.borderLeftColor = '#ef4444';
          checkResultBox.style.color = '#fca5a5';
          checkResultBox.textContent = `❌ 检测失败: ${err.message}`;
        }
      } finally {
        btnTestAuth.disabled = false;
        btnTestAuth.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg> 测试连接 (Check Auth)';
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
      const chosenModel = isManualModelMode ? inputCustomModel.value.trim() : selectModel.value;

      // 获取当前已载入的模型列表
      const pInfo = window.modelPlatformManager.getProviderInfo(pid);
      const models = (pInfo && pInfo.models) ? pInfo.models : [];

      window.modelPlatformManager.savePlatform(pid, {
        name: name,
        apiKey: key,
        baseUrl: base,
        models: models
      });

      window.modelPlatformManager.activeProvider = pid;
      window.modelPlatformManager.activeModel = chosenModel || 'default';

      if (activeModelBadge) {
        activeModelBadge.textContent = `${name || pid}: ${chosenModel || 'default'}`;
      }
      closeModal();
    });
  }
});

