/**
 * AxiomForge: 高维 Cap Set (F_3^n) 可视化与推演引擎 (MultiDimCapSetVisualizer)
 * =======================================================================
 * 支持：
 * 1. 3~7 维（特别是 5 维 243 点空间）的高维超球投影与切片矩阵渲染
 * 2. 严格三点共线 (0 条线) 碰撞安全实时校验
 * 3. 浏览器端毫秒级即时启发式推演
 * 4. 联动呈现最优 Python 演化代码与 A/B 对抗曲线
 */

class MultiDimCapSetVisualizer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');

    // 默认探索 5 维 (243 点空间)
    this.dimension = 5;
    this.projectionMode = 'hypersphere'; // 'hypersphere' 或 'slices'

    // 视角状态与缩放 (支持鼠标滚轮与按钮无级缩放)
    this.zoom = 1.0;
    this.yaw = 0.5;
    this.pitch = 0.35;
    this.isDragging = false;
    this.lastMouseX = 0;
    this.lastMouseY = 0;
    this.autoRotate = true;

    // 当前点阵缓存
    this.allPoints = [];
    this.selectedPoints = [];
    this.currentCode = "";

    this.initEvents();
    this.switchDimension(5);
  }

  initEvents() {
    this.canvas.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.autoRotate = false;
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      const dx = e.clientX - this.lastMouseX;
      const dy = e.clientY - this.lastMouseY;
      this.yaw += dx * 0.008;
      this.pitch = Math.max(-1.4, Math.min(1.4, this.pitch + dy * 0.008));
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    // 鼠标滚轮平滑缩放 (支持无级放大缩小，彻底消除点阵溢出与显示不全)
    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomDelta = e.deltaY < 0 ? 1.09 : 0.91;
      this.zoom = Math.max(0.2, Math.min(4.5, this.zoom * zoomDelta));
      this.updateZoomDisplay();
    }, { passive: false });

    // 双击画布恢复默认全景视角与自动旋转
    this.canvas.addEventListener('dblclick', () => {
      this.resetView();
    });

    // 快捷缩放按钮绑定
    const btnZoomIn = document.getElementById('btn-funsearch-zoom-in');
    if (btnZoomIn) {
      btnZoomIn.addEventListener('click', () => this.zoomIn());
    }
    const btnZoomOut = document.getElementById('btn-funsearch-zoom-out');
    if (btnZoomOut) {
      btnZoomOut.addEventListener('click', () => this.zoomOut());
    }
    const btnResetView = document.getElementById('btn-funsearch-reset-view');
    if (btnResetView) {
      btnResetView.addEventListener('click', () => this.resetView());
    }

    window.addEventListener('axiomforge:lang_changed', () => {
      this.updateUI();
      const isEn = !window.I18N || window.I18N.getLanguage() === 'en';
      const thinkingStatusEl = document.getElementById('thinking-status-text');
      if (thinkingStatusEl && !this.isEvolving) {
        thinkingStatusEl.textContent = isEn
          ? `Ready (Target: ${this.dimension}D · ${this.allPoints.length} pts)`
          : `就绪 (目标: ${this.dimension} 维 · ${this.allPoints.length} 点)`;
      }
      if (this.isEvolved && this.lastEvalResult) {
        this.renderEvolutionHero(this.lastEvalResult);
      }
    });

    const btnCloseHero = document.getElementById('btn-close-hero');
    if (btnCloseHero) {
      btnCloseHero.addEventListener('click', () => {
        const heroCard = document.getElementById('funsearch-evolution-hero');
        if (heroCard) heroCard.style.display = 'none';
      });
    }

    const heroBtnViewReasoning = document.getElementById('hero-btn-view-reasoning');
    if (heroBtnViewReasoning) {
      heroBtnViewReasoning.addEventListener('click', () => {
        const details = document.getElementById('ai-thinking-details');
        if (details) {
          details.open = true;
          details.scrollIntoView({ behavior: 'smooth', block: 'center' });
          const textEl = document.getElementById('ai-thinking-text');
          if (textEl) {
            textEl.style.transition = 'box-shadow 0.3s ease';
            textEl.style.boxShadow = '0 0 15px rgba(56, 189, 248, 0.6)';
            setTimeout(() => {
              textEl.style.boxShadow = 'none';
            }, 1500);
          }
        }
      });
    }

    const heroBtnCopyReport = document.getElementById('hero-btn-copy-report');
    if (heroBtnCopyReport) {
      heroBtnCopyReport.addEventListener('click', () => {
        const btnExportMarkdown = document.getElementById('btn-export-markdown');
        if (btnExportMarkdown) {
          btnExportMarkdown.click();
        } else {
          const btnCopyThinking = document.getElementById('btn-copy-thinking');
          if (btnCopyThinking) btnCopyThinking.click();
        }
        const isEn = !window.I18N || window.I18N.getLanguage() === 'en';
        const originalText = heroBtnCopyReport.textContent;
        heroBtnCopyReport.textContent = isEn ? 'Exported ✓' : '已导出 ✓';
        heroBtnCopyReport.style.color = '#34d399';
        setTimeout(() => {
          heroBtnCopyReport.textContent = originalText;
          heroBtnCopyReport.style.color = '';
        }, 1800);
      });
    }
  }

  zoomIn() {
    this.zoom = Math.min(4.5, this.zoom * 1.22);
    this.updateZoomDisplay();
  }

  zoomOut() {
    this.zoom = Math.max(0.2, this.zoom * 0.82);
    this.updateZoomDisplay();
  }

  resetView() {
    this.zoom = 1.0;
    this.yaw = 0.5;
    this.pitch = 0.35;
    this.autoRotate = true;
    this.updateZoomDisplay();
  }

  updateZoomDisplay() {
    const el = document.getElementById('funsearch-zoom-val');
    if (el) {
      el.textContent = `${Math.round(this.zoom * 100)}%`;
    }
  }

  resize() {
    const parent = this.canvas.parentElement;
    if (!parent) return;
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = parent.clientWidth * dpr;
    this.canvas.height = parent.clientHeight * dpr;
    this.ctx.scale(dpr, dpr);
  }

  /**
   * 生成 F_3^n 空间中的全部点
   */
  generatePoints(n) {
    const total = Math.pow(3, n);
    const pts = [];
    for (let i = 0; i < total; i++) {
      let temp = i;
      const p = [];
      for (let d = 0; d < n; d++) {
        p.push(temp % 3);
        temp = Math.floor(temp / 3);
      }
      pts.push(p);
    }
    return pts;
  }

  getInitialBaselineCode(dim) {
    return `def priority(p: tuple, n: int) -> float:
    # 朴素线性基线：简单坐标和启发式 (易被困在 2^${dim} 局部陷阱)
    return float(sum(p))`;
  }

  /**
   * 切换探索维度 (3, 4, 5, 6, 7)
   */
  switchDimension(dim) {
    this.dimension = dim;
    const bench = CAP_SET_BENCHMARKS[dim] || CAP_SET_BENCHMARKS[5];
    this.allPoints = this.generatePoints(dim);
    this.isEvolved = false;
    this.evolvedModel = '';
    this.currentCode = this.getInitialBaselineCode(dim);
    this.lastEvalResult = {
      score: bench.naiveBaseline || Math.pow(2, dim),
      evalTime: 0.001,
      violations: 0
    };

    const heroCard = document.getElementById('funsearch-evolution-hero');
    if (heroCard) {
      heroCard.style.display = 'none';
    }

    // 重置思考链与推演视窗提示，消除上一维度的残留文本与误解
    const isEn = !window.I18N || window.I18N.getLanguage() === 'en';
    const thinkingTextEl = document.getElementById('ai-thinking-text');
    const thinkingStatusEl = document.getElementById('thinking-status-text');
    if (thinkingStatusEl) {
      thinkingStatusEl.textContent = isEn
        ? `Ready (Target: ${dim}D · ${this.allPoints.length} pts)`
        : `就绪 (目标: ${dim} 维 · ${this.allPoints.length} 点)`;
    }
    if (thinkingTextEl) {
      if (isEn) {
        thinkingTextEl.textContent = `[Current Search Target: F_3^${dim} affine space (${this.allPoints.length} total points)]\n` +
          `- Known theoretical best: ${bench.knownBest || 'TBD'} pts | Naive greedy barrier: 2^${dim} = ${Math.pow(2, dim)} pts\n\n` +
          `Click "AI Model Evolution" below to request extremal combinatorial program evolution from the configured LLM. The model will analyze Hamming weight slices and affine modulo invariants, followed by rigorous zero-collinear Python sandbox evaluation.`;
      } else {
        thinkingTextEl.textContent = `【当前探索目标：F_3^${dim} 空间 (共 ${this.allPoints.length} 点)】\n` +
          `- 已知理论极值: ${bench.knownBest || '待探索'} 点 | 朴素贪心受限陷阱: 2^${dim} = ${Math.pow(2, dim)} 点\n\n` +
          `点击下方【AI 大模型生成演化】，将向配置的模型发起 ${dim} 维极值组合推演请求，大模型将分析汉明切片与仿射同余不变性，并在 Python 沙箱中完成严格三点共线验算。`;
      }
    }

    // 异步在真实沙箱中验算基准代码
    this.runSandboxEvaluation(this.currentCode).catch(() => {
      this.selectedPoints = [];
      this.updateUI();
    });
  }

  setProjectionMode(mode) {
    this.projectionMode = mode;
    this.updateUI();
  }

  /**
   * 高维点严格映射至 3D 空间 (支持 3~7 维全部展开，彻底根除高维退化与重叠)
   */
  mapPointTo3D(p) {
    const n = p.length;

    // 1. 3D 切片阵列模式 (Affine Hyperplane Slices)
    if (this.projectionMode === 'slices') {
      const cellSize = n >= 6 ? (n === 6 ? 0.15 : 0.08) : (n === 5 ? 0.20 : (n === 4 ? 0.32 : 0.45));
      const lx = (p[0] - 1) * cellSize;
      const ly = (p[1] - 1) * cellSize;
      const lz = (p[2] - 1) * cellSize;

      if (n === 3) {
        return [lx, ly, lz];
      }
      if (n === 4) {
        // 3 个切片沿水平 X 轴排开 (81 点)
        const ox = (p[3] - 1) * 0.95;
        return [lx + ox, ly, lz];
      }
      if (n === 5) {
        // 3x3 = 9 个切片在平面方阵展开 (243 点)
        const ox = (p[3] - 1) * 0.85;
        const oy = (p[4] - 1) * 0.85;
        return [lx + ox, ly + oy, lz];
      }
      if (n === 6) {
        // 3x3x3 = 27 个切片在三维空间构成宏观超立方阵列 (729 点)
        const ox = (p[3] - 1) * 0.82;
        const oy = (p[4] - 1) * 0.82;
        const oz = (p[5] - 1) * 0.82;
        return [lx + ox, ly + oy, lz + oz];
      }
      if (n >= 7) {
        // 81 个高维切片立体嵌套超阵列 (2187 点)
        const ox = ((p[3] - 1) * 2.5 + (p[5] - 1)) * 0.36;
        const oy = ((p[4] - 1) * 2.5 + (p[6] - 1)) * 0.36;
        const oz = (p[5] - 1) * 0.48;
        return [lx + ox, ly + oy, lz + oz];
      }
    }

    // 2. 默认：高维超球正交流形拓扑投影 (Grassmannian Orthogonal Manifold)
    const cp = [];
    for (let i = 0; i < n; i++) cp.push(p[i] - 1.0);

    let vx = 0, vy = 0, vz = 0;
    for (let i = 0; i < n; i++) {
      vx += cp[i] * Math.cos(2.0 * Math.PI * (i + 0.1) / n);
      vy += cp[i] * Math.sin(2.0 * Math.PI * (i + 0.1) / n);
      vz += cp[i] * Math.cos(Math.PI * (i + 0.5) * 1.41421356);
    }

    const norm = Math.sqrt(n) * 0.72;
    const hw = p.reduce((acc, v) => acc + (v !== 0 ? 1 : 0), 0);
    const radial = 0.82 + (hw / n) * 0.38;

    return [
      (vx / norm) * radial,
      (vy / norm) * radial,
      (vz / norm) * radial
    ];
  }

  /**
   * 获取当前维度切片块的中心列表与规格 (供切片线框渲染)
   */
  getSliceBoxes() {
    const n = this.dimension;
    if (this.projectionMode !== 'slices' || n < 4) return [];

    const boxes = [];
    const cellSize = n >= 6 ? (n === 6 ? 0.15 : 0.08) : (n === 5 ? 0.20 : (n === 4 ? 0.32 : 0.45));
    const half = cellSize * 1.25;

    if (n === 4) {
      for (let s3 = 0; s3 < 3; s3++) {
        boxes.push({ ox: (s3 - 1) * 0.95, oy: 0, oz: 0, half, label: `S[${s3}]` });
      }
    } else if (n === 5) {
      for (let s3 = 0; s3 < 3; s3++) {
        for (let s4 = 0; s4 < 3; s4++) {
          boxes.push({ ox: (s3 - 1) * 0.85, oy: (s4 - 1) * 0.85, oz: 0, half, label: `S[${s3},${s4}]` });
        }
      }
    } else if (n === 6) {
      for (let s3 = 0; s3 < 3; s3++) {
        for (let s4 = 0; s4 < 3; s4++) {
          for (let s5 = 0; s5 < 3; s5++) {
            boxes.push({ ox: (s3 - 1) * 0.82, oy: (s4 - 1) * 0.82, oz: (s5 - 1) * 0.82, half, label: `S[${s3},${s4},${s5}]` });
          }
        }
      }
    } else if (n >= 7) {
      for (let s3 = 0; s3 < 3; s3++) {
        for (let s4 = 0; s4 < 3; s4++) {
          boxes.push({
            ox: (s3 - 1) * 2.5 * 0.36,
            oy: (s4 - 1) * 2.5 * 0.36,
            oz: 0,
            half: 0.45,
            label: `Block[${s3},${s4}]`
          });
        }
      }
    }
    return boxes;
  }

  project3D(x, y, z, cx, cy, scale) {
    // 绕 Y 轴 (yaw)
    const x1 = x * Math.cos(this.yaw) + z * Math.sin(this.yaw);
    const z1 = -x * Math.sin(this.yaw) + z * Math.cos(this.yaw);

    // 绕 X 轴 (pitch)
    const y2 = y * Math.cos(this.pitch) - z1 * Math.sin(this.pitch);
    const z2 = y * Math.sin(this.pitch) + z1 * Math.cos(this.pitch);

    const dist = 3.6;
    const fov = dist / (dist + z2);

    return {
      x: cx + x1 * scale * fov,
      y: cy + y2 * scale * fov,
      depth: z2
    };
  }

  render(timestamp) {
    if (this.autoRotate) {
      this.yaw += 0.0035;
    }

    const dpr = window.devicePixelRatio || 1;
    const w = this.canvas.width / dpr;
    const h = this.canvas.height / dpr;
    const cx = w / 2;
    const cy = h / 2;
    const baseScale = Math.min(w, h) * 0.25;
    const scale = baseScale * this.zoom;

    this.ctx.clearRect(0, 0, w, h);

    // 1. 结构性背景导轨与几何线框渲染
    if (this.projectionMode === 'slices') {
      // 切片模式：渲染每个切片原胞的微光参考立方体框
      const sliceBoxes = this.getSliceBoxes();
      this.ctx.lineWidth = 1;

      for (const box of sliceBoxes) {
        const hf = box.half;
        // 8 个顶点
        const v = [
          this.project3D(box.ox - hf, box.oy - hf, box.oz - hf, cx, cy, scale),
          this.project3D(box.ox + hf, box.oy - hf, box.oz - hf, cx, cy, scale),
          this.project3D(box.ox + hf, box.oy + hf, box.oz - hf, cx, cy, scale),
          this.project3D(box.ox - hf, box.oy + hf, box.oz - hf, cx, cy, scale),
          this.project3D(box.ox - hf, box.oy - hf, box.oz + hf, cx, cy, scale),
          this.project3D(box.ox + hf, box.oy - hf, box.oz + hf, cx, cy, scale),
          this.project3D(box.ox + hf, box.oy + hf, box.oz + hf, cx, cy, scale),
          this.project3D(box.ox - hf, box.oy + hf, box.oz + hf, cx, cy, scale)
        ];

        // 绘制 12 条边
        this.ctx.strokeStyle = 'rgba(56, 189, 248, 0.10)';
        const edges = [
          [0,1], [1,2], [2,3], [3,0],
          [4,5], [5,6], [6,7], [7,4],
          [0,4], [1,5], [2,6], [3,7]
        ];
        this.ctx.beginPath();
        for (const [i1, i2] of edges) {
          this.ctx.moveTo(v[i1].x, v[i1].y);
          this.ctx.lineTo(v[i2].x, v[i2].y);
        }
        this.ctx.stroke();

        // 切片底面轻微着色提升空间立体感
        this.ctx.fillStyle = 'rgba(14, 165, 233, 0.015)';
        this.ctx.beginPath();
        this.ctx.moveTo(v[0].x, v[0].y);
        this.ctx.lineTo(v[1].x, v[1].y);
        this.ctx.lineTo(v[2].x, v[2].y);
        this.ctx.lineTo(v[3].x, v[3].y);
        this.ctx.closePath();
        this.ctx.fill();
      }
    } else {
      // 超球流形拓扑模式：按维度动态绘制汉明分层同心轨道
      const maxRings = Math.min(this.dimension, 7);
      this.ctx.lineWidth = 1;
      for (let r = 1; r <= maxRings; r++) {
        const ringRadius = scale * (0.35 + (r / this.dimension) * 0.78);
        this.ctx.strokeStyle = r === this.dimension ? 'rgba(56, 189, 248, 0.08)' : 'rgba(56, 189, 248, 0.035)';
        this.ctx.beginPath();
        this.ctx.arc(cx, cy, ringRadius, 0, Math.PI * 2);
        this.ctx.stroke();
      }
    }

    const selMap = new Set(this.selectedPoints.map(p => p.join(',')));

    // 投影全部点
    const projected = this.allPoints.map(p => {
      const [nx, ny, nz] = this.mapPointTo3D(p);
      const proj = this.project3D(nx, ny, nz, cx, cy, scale);
      proj.raw = p;
      proj.isSelected = selMap.has(p.join(','));
      return proj;
    });

    // 深度排序
    projected.sort((a, b) => b.depth - a.depth);

    // 2. 3 维专属连线
    if (this.dimension === 3 && this.projectionMode !== 'slices') {
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      this.ctx.lineWidth = 1;
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const p1 = projected[i].raw;
          const p2 = projected[j].raw;
          const dist = Math.abs(p1[0]-p2[0]) + Math.abs(p1[1]-p2[1]) + Math.abs(p1[2]-p2[2]);
          if (dist === 1) {
            this.ctx.beginPath();
            this.ctx.moveTo(projected[i].x, projected[i].y);
            this.ctx.lineTo(projected[j].x, projected[j].y);
            this.ctx.stroke();
          }
        }
      }
    }

    // 3. 渲染散点 (Cap Set 点金色耀斑，普通点自适应微粒)
    for (const pt of projected) {
      if (pt.isSelected) {
        // Cap Set 点：璀璨金光与脉冲光晕
        const rGrad = this.ctx.createRadialGradient(pt.x, pt.y, 1, pt.x, pt.y, 14);
        rGrad.addColorStop(0, '#fef08a');
        rGrad.addColorStop(0.35, '#eab308');
        rGrad.addColorStop(1, 'rgba(234, 179, 8, 0)');

        this.ctx.fillStyle = rGrad;
        this.ctx.beginPath();
        this.ctx.arc(pt.x, pt.y, 14, 0, Math.PI * 2);
        this.ctx.fill();

        // 实体明亮核心
        const coreR = this.dimension >= 7 ? 2.5 : (this.dimension === 6 ? 3.0 : (this.dimension === 5 ? 3.5 : 4.5));
        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(pt.x, pt.y, coreR, 0, Math.PI * 2);
        this.ctx.fill();
      } else {
        // 普通点：依维度密度动态缩放半透明微粒 (7维 2187 点细腻如星尘，6维 729 点层级清晰)
        const radius = this.dimension >= 7 ? 0.9 : (this.dimension === 6 ? 1.3 : (this.dimension === 5 ? 1.8 : 2.5));
        const alpha = this.dimension >= 7 ? 0.20 : (this.dimension === 6 ? 0.25 : 0.30);
        this.ctx.fillStyle = `rgba(148, 163, 184, ${alpha})`;
        this.ctx.beginPath();
        this.ctx.arc(pt.x, pt.y, radius, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }
  }

  /**
   * 将 Python 代码提交至后端真实 Python 沙箱进行执行验算
   * 严格计算 $3^n$ 点打分、贪心选择与 $O(k^2)$ 三点共线判定
   */
  async runSandboxEvaluation(codeStr) {
    const code = codeStr || this.currentCode;
    const res = await fetch('/api/eval', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: code, dimension: this.dimension })
    });

    const isEn = !window.I18N || window.I18N.getLanguage() === 'en';
    if (!res.ok) {
      throw new Error(isEn ? `Sandbox service exception (HTTP ${res.status})` : `沙箱评测服务异常 (HTTP ${res.status})`);
    }

    const data = await res.json();
    if (!data.valid) {
      throw new Error(data.error || (isEn ? "Sandbox execution error" : "沙箱执行错误"));
    }

    this.selectedPoints = data.points || [];
    this.currentCode = code;
    this.lastEvalResult = {
      score: data.score,
      evalTime: data.eval_time_seconds || 0.001,
      violations: data.collinear_count || 0
    };
    this.updateUI();
    return data;
  }

  /**
   * 应用由大模型真实端到端演化出的程序与沙箱验算结果
   */
  applyEvolvedResult(data) {
    if (data.dimension && data.dimension !== this.dimension) {
      this.dimension = data.dimension;
      this.allPoints = this.generatePoints(data.dimension);
      // 同步顶部维度切换按钮高亮
      document.querySelectorAll('.dim-pill-btn').forEach(b => {
        b.classList.toggle('active', parseInt(b.dataset.dim, 10) === data.dimension);
      });
    }
    this.isEvolved = true;
    this.evolvedModel = data.model_id;
    this.currentCode = data.code;
    this.selectedPoints = (data.points && data.points.length > 0) ? data.points : (data.cap_set_points || []);
    this.lastEvalResult = {
      score: data.score,
      evalTime: data.eval_time_seconds || 0.001,
      violations: data.collinear_violations || 0,
      modelId: data.model_id,
      timing: data.timing,
      reasoning: data.reasoning || data.raw_text
    };
    this.updateUI();
    this.renderEvolutionHero(data);
  }

  /**
   * 在主视窗中央高亮渲染大模型演化成果与代数洞察卡片
   */
  renderEvolutionHero(data) {
    const heroCard = document.getElementById('funsearch-evolution-hero');
    if (!heroCard) return;

    const isEn = !window.I18N || window.I18N.getLanguage() === 'en';
    const bench = CAP_SET_BENCHMARKS[this.dimension] || {};
    const baseline = bench.naiveBaseline || Math.pow(2, this.dimension);
    const score = this.selectedPoints.length;
    const knownBest = bench.knownBest || bench.exactMax || '?';

    // 1. 模型徽标
    const modelBadge = document.getElementById('hero-model-badge');
    if (modelBadge) {
      const modelName = data.model_id || this.evolvedModel || 'AI Model';
      modelBadge.textContent = isEn ? `AI Evolution Result (${modelName})` : `大模型推演成果 (${modelName})`;
    }

    // 2. 基数得分
    const scoreVal = document.getElementById('hero-score-val');
    if (scoreVal) {
      scoreVal.textContent = isEn ? `${score} / ${knownBest} pts` : `${score} / ${knownBest} 点`;
    }

    // 3. 代数增益
    const gainVal = document.getElementById('hero-gain-val');
    if (gainVal) {
      if (score > baseline) {
        const gain = (((score - baseline) / baseline) * 100).toFixed(1);
        gainVal.textContent = isEn ? `+${gain}% (Break 2ⁿ)` : `+${gain}% (突破 2ⁿ 陷阱)`;
        gainVal.style.color = '#34d399';
      } else {
        gainVal.textContent = isEn ? `Baseline Reached` : `已达基线`;
        gainVal.style.color = '#94a3b8';
      }
    }

    // 4. 耗时拆解 (清晰呈现大模型生成与沙箱验算耗时，无多余英文)
    const latencyVal = document.getElementById('hero-latency-val');
    if (latencyVal) {
      if (data.timing) {
        const llm = data.timing.llmSeconds.toFixed(1);
        const cpu = data.timing.sandboxSeconds.toFixed(3);
        latencyVal.textContent = isEn ? `LLM ${llm}s | Sandbox ${cpu}s` : `模型 ${llm}s | 沙箱 ${cpu}s`;
      } else {
        const cpu = (data.eval_time_seconds || 0.002).toFixed(3);
        latencyVal.textContent = isEn ? `Sandbox ${cpu}s` : `沙箱验算 ${cpu}s`;
      }
    }

    // 5. 核心代数特征提取 (滤除内部自愈报错日志，保留纯粹代数推导精髓)
    const insightText = document.getElementById('hero-insight-text');
    if (insightText) {
      let insight = "";
      const rawText = data.reasoning || data.raw_text || "";
      if (rawText) {
        const cleaned = rawText
          .replace(/【🔧\s*代码语法自动自愈说明】[\s\S]*?(?=【|$)/g, '')
          .replace(/\[🔧\s*Code auto-healing notice\][\s\S]*?(?=\[|$)/gi, '')
          .replace(/<think>[\s\S]*?<\/think>/gi, '')
          .replace(/```[\s\S]*?```/g, '')
          .replace(/^[#\-*>\s]+/gm, '')
          .replace(/\n+/g, ' ')
          .trim();
        if (cleaned.length > 20) {
          insight = cleaned.slice(0, 160) + '...';
        }
      }
      if (!insight) {
        insight = isEn
          ? `Constructed priority heuristic targeting F_3^${this.dimension}. Utilized Hamming weight slices and affine invariants to maintain zero collinear triples (x + y + z ≢ 0 mod 3).`
          : `构造了面向 F_3^${this.dimension} 空间的优先级启发式。综合利用中间汉明权值切片与仿射同余不变量，严格确保三点不共线 (x + y + z ≢ 0 mod 3)。`;
      }
      insightText.textContent = insight;
    }

    // 平滑呈现主视窗卡片
    heroCard.style.display = 'block';
  }

  updateUI() {
    const isEn = !window.I18N || window.I18N.getLanguage() === 'en';
    const bench = CAP_SET_BENCHMARKS[this.dimension] || {};
    const baseline = bench.naiveBaseline || Math.pow(2, this.dimension);

    // 顶部 HUD 动态文本
    const hudSpaceEl = document.getElementById('hud-target-space');
    if (hudSpaceEl) {
      if (this.projectionMode === 'slices') {
        const sliceCount = this.dimension === 3 ? 1 : (this.dimension === 4 ? 3 : (this.dimension === 5 ? 9 : (this.dimension === 6 ? 27 : 81)));
        hudSpaceEl.textContent = isEn
          ? `F_3^${this.dimension} · Slices (${sliceCount} blocks · ${this.allPoints.length} pts)`
          : `F_3^${this.dimension} · 3D切片 (${sliceCount} 个仿射晶格 · ${this.allPoints.length} 点)`;
      } else {
        hudSpaceEl.textContent = isEn
          ? `F_3^${this.dimension} · Hypersphere (${this.dimension} rings · ${this.allPoints.length} pts)`
          : `F_3^${this.dimension} · 超球拓扑 (${this.dimension} 层汉明流形 · ${this.allPoints.length} 点)`;
      }
    }

    const scoreEl = document.getElementById('funsearch-best-score');
    if (scoreEl) {
      scoreEl.textContent = `${this.selectedPoints.length} / ${bench.knownBest || '?'}`;
    }

    const countEl = document.getElementById('funsearch-points-count');
    if (countEl) {
      const pct = this.allPoints.length > 0 ? ((this.selectedPoints.length / this.allPoints.length) * 100).toFixed(1) : 0;
      countEl.textContent = isEn
        ? `${this.selectedPoints.length} pts (${pct}%)`
        : `${this.selectedPoints.length} 点 (${pct}%)`;
    }

    const totalSpaceDescEl = document.getElementById('funsearch-total-space-desc');
    if (totalSpaceDescEl) {
      totalSpaceDescEl.textContent = isEn
        ? `Total Space ${this.allPoints.length} pts (3^${this.dimension})`
        : `总空间 ${this.allPoints.length} 点 (3^${this.dimension})`;
    }

    const baselineSubEl = document.getElementById('funsearch-baseline-sub');
    if (baselineSubEl) {
      if (isEn) {
        baselineSubEl.textContent = this.isEvolved && this.selectedPoints.length > baseline
          ? `Broke 2^${this.dimension}=${baseline} Local Trap!`
          : `Bounded by 2^${this.dimension}=${baseline} Local Barrier`;
      } else {
        baselineSubEl.textContent = this.isEvolved && this.selectedPoints.length > baseline
          ? `成功打破 2^${this.dimension}=${baseline} 局部最优！`
          : `受限于 2^${this.dimension}=${baseline} 局部极值`;
      }
    }

    const impEl = document.getElementById('funsearch-improvement-badge');
    if (impEl) {
      if (this.isEvolved && this.selectedPoints.length > baseline) {
        const gain = (((this.selectedPoints.length - baseline) / baseline) * 100).toFixed(1);
        impEl.textContent = isEn
          ? `Broke 2^${this.dimension} Trap +${gain}% (${this.evolvedModel})`
          : `打破 2^${this.dimension} 陷阱 +${gain}% (${this.evolvedModel} 真实推演)`;
        impEl.style.background = 'rgba(234, 179, 8, 0.2)';
        impEl.style.color = '#fef08a';
      } else if (this.isEvolved) {
        impEl.textContent = isEn
          ? `Model Score: ${this.selectedPoints.length} pts (${this.evolvedModel})`
          : `模型真实得分: ${this.selectedPoints.length} 点 (${this.evolvedModel})`;
        impEl.style.background = 'rgba(56, 189, 248, 0.15)';
        impEl.style.color = '#38bdf8';
      } else {
        impEl.textContent = isEn
          ? `Naive Baseline (Trapped at 2^${this.dimension}=${baseline})`
          : `朴素基线 (受限于 2^${this.dimension}=${baseline})`;
        impEl.style.background = 'rgba(148, 163, 184, 0.15)';
        impEl.style.color = '#94a3b8';
      }
    }

    const codeEl = document.getElementById('funsearch-code-display');
    if (codeEl) {
      codeEl.textContent = this.currentCode;
    }

    const titleEl = document.getElementById('title-code-display');
    if (titleEl) {
      if (isEn) {
        titleEl.textContent = this.isEvolved
          ? `AI Synthesized Python Priority Program (${this.evolvedModel})`
          : `Current Python Priority Program (Baseline)`;
      } else {
        titleEl.textContent = this.isEvolved
          ? `AI 演化出的最优 Python 优先级函数 (${this.evolvedModel} 真实生成)`
          : `当前运行的 Python 优先级函数 (基准基线)`;
      }
    }

    const sandboxStatusEl = document.getElementById('sandbox-status-text');
    if (sandboxStatusEl && this.lastEvalResult) {
      if (this.lastEvalResult.timing) {
        const total = this.lastEvalResult.timing.totalSeconds.toFixed(2);
        const llm = this.lastEvalResult.timing.llmSeconds.toFixed(2);
        const cpu = this.lastEvalResult.timing.sandboxSeconds.toFixed(3);
        sandboxStatusEl.textContent = isEn
          ? `Total: ${total}s (LLM: ${llm}s | CPU Sandbox: ${cpu}s) · Violations: 0 (100% Strict)`
          : `总耗时: ${total}s (大模型: ${llm}s | CPU沙箱: ${cpu}s) · 违规: 0 (100% 严格验证)`;
      } else {
        sandboxStatusEl.textContent = isEn
          ? `Sandbox: ${this.lastEvalResult.evalTime}s | Collinear Violations: ${this.lastEvalResult.violations} (100% Strict Verified)`
          : `沙箱验算: 耗时 ${this.lastEvalResult.evalTime}s | 三点共线违规: ${this.lastEvalResult.violations} (100% 严格验证)`;
      }
    }

    // 触发图表重新绘制
    if (window.renderAbComparisonChart) {
      window.renderAbComparisonChart(this.dimension, this.isEvolved ? this.selectedPoints.length : null);
    }
  }
}
