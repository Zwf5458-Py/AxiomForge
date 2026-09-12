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

    // 视角状态
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

  /**
   * 切换探索维度 (3, 4, 5, 6, 7)
   */
  switchDimension(dim) {
    this.dimension = dim;
    const bench = CAP_SET_BENCHMARKS[dim] || CAP_SET_BENCHMARKS[5];
    this.allPoints = this.generatePoints(dim);
    this.selectedPoints = bench.points || [];
    this.currentCode = bench.bestCode || "";
    this.updateUI();
  }

  setProjectionMode(mode) {
    this.projectionMode = mode;
  }

  /**
   * 高维点映射至 3D 归一化空间
   */
  mapPointTo3D(p) {
    const n = p.length;
    if (n === 3) {
      return [(p[0] - 1), (p[1] - 1), (p[2] - 1)];
    }

    if (this.projectionMode === 'slices' && n >= 4) {
      // 切片模式：前 3 维为局部 3D 坐标，后两维作为平移偏置
      const subX = (p[0] - 1) * 0.45;
      const subY = (p[1] - 1) * 0.45;
      const subZ = (p[2] - 1) * 0.45;
      const sliceX = ((p[3] || 1) - 1) * 1.1;
      const sliceY = ((p[4] || 1) - 1) * 1.1;
      return [subX + sliceX, subY + sliceY, subZ];
    }

    // 默认高维超球拓扑投影 (汉明重量分层球坐标)
    const hw = p.reduce((acc, v) => acc + (v !== 0 ? 1 : 0), 0);
    const radius = 0.35 + (hw / n) * 0.95;

    // 利用高维坐标生成伪球谐方位角
    let theta = 0;
    let phi = 0;
    for (let i = 0; i < n; i++) {
      theta += (p[i] / 3) * Math.PI * (2 / (i + 1));
      phi += (p[i] / 3) * Math.PI * ((i + 1) / n);
    }

    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta);
    const z = radius * Math.cos(phi);
    return [x, y, z];
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
    const scale = Math.min(w, h) * 0.38;

    this.ctx.clearRect(0, 0, w, h);

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

    // 1. 绘制背景微弱参考网格/连线
    if (this.dimension === 3) {
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
    } else {
      // 高维空间：绘制超球面同心汉明等位圈
      this.ctx.strokeStyle = 'rgba(56, 189, 248, 0.04)';
      this.ctx.beginPath();
      this.ctx.arc(cx, cy, scale * 0.7, 0, Math.PI * 2);
      this.ctx.stroke();
      this.ctx.beginPath();
      this.ctx.arc(cx, cy, scale * 1.05, 0, Math.PI * 2);
      this.ctx.stroke();
    }

    // 2. 渲染散点
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
        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(pt.x, pt.y, this.dimension >= 5 ? 3.5 : 4.5, 0, Math.PI * 2);
        this.ctx.fill();
      } else {
        // 普通点：依维度密度缩放半透明小微粒
        const radius = this.dimension >= 6 ? 1.2 : (this.dimension === 5 ? 1.8 : 2.5);
        this.ctx.fillStyle = 'rgba(148, 163, 184, 0.28)';
        this.ctx.beginPath();
        this.ctx.arc(pt.x, pt.y, radius, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }
  }

  /**
   * 浏览器端执行快速确定性启发式推演
   */
  runFastLocalDeduction() {
    const n = this.dimension;
    const allPts = this.allPoints;

    // 对称性启发式评分
    const scored = allPts.map(p => {
      const l0 = p.reduce((acc, v) => acc + (v !== 0 ? 1 : 0), 0);
      const sliceBonus = (l0 === Math.floor(n / 2) + 1) ? 60.0 : 0.0;
      const parity = (p.reduce((a, b) => a + b, 0)) % 3;
      let diff = 0;
      for (let i = 0; i < n; i++) {
        diff += Math.abs(p[i] - p[(i + 1) % n]);
      }
      const score = sliceBonus + (parity === 0 ? 30.0 : 0.0) - diff * 0.6 + p[0] * 2.5;
      return { p, score };
    });

    scored.sort((a, b) => b.score - a.score);

    // 贪心无共线筛选
    const selected = [];
    const forbidden = new Set();

    for (const item of scored) {
      const p = item.p;
      const pKey = p.join(',');
      if (forbidden.has(pKey)) continue;

      for (const exist of selected) {
        const needed = p.map((val, idx) => (-val - exist[idx] + 9) % 3).join(',');
        forbidden.add(needed);
      }
      selected.push(p);
    }

    this.selectedPoints = selected;
    this.updateUI();
  }

  updateUI() {
    const bench = CAP_SET_BENCHMARKS[this.dimension] || {};

    // 顶部 HUD 动态文本
    const hudSpaceEl = document.getElementById('hud-target-space');
    if (hudSpaceEl) {
      hudSpaceEl.textContent = `F_3^${this.dimension} 空间 (${this.allPoints.length} 点)`;
    }

    const scoreEl = document.getElementById('funsearch-best-score');
    if (scoreEl) {
      scoreEl.textContent = `${this.selectedPoints.length} / ${bench.knownBest || '?'}`;
    }

    const countEl = document.getElementById('funsearch-points-count');
    if (countEl) {
      const pct = ((this.selectedPoints.length / this.allPoints.length) * 100).toFixed(1);
      countEl.textContent = `${this.selectedPoints.length} 点 (${pct}%)`;
    }

    const impEl = document.getElementById('funsearch-improvement-badge');
    if (impEl && bench.improvementPercent) {
      impEl.textContent = `打破局部陷阱 +${bench.improvementPercent}%`;
    }

    const codeEl = document.getElementById('funsearch-code-display');
    if (codeEl) {
      codeEl.textContent = this.currentCode;
    }

    // 触发图表重新绘制
    if (window.renderAbComparisonChart) {
      window.renderAbComparisonChart(this.dimension);
    }
  }
}
