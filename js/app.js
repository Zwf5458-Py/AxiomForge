/**
 * 分形几何与数学动力学模型动画模拟系统 - 主控调度器
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. 初始化引擎实例
  const kochEngine = new KochSnowflake('koch-canvas');
  const orbitTracer = new MandelbrotOrbitTracer('orbit-canvas');
  const mandelbrotEngine = new MandelbrotViewer('mandelbrot-canvas', orbitTracer);
  const funsearchEngine = new CapSetVisualizer('funsearch-canvas');
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
});
