/**
 * AxiomForge - Perfect Euler Brick & Diophantine 3D Geometric Visualizer
 * 完美欧拉砖 · 空间几何与数论深渊 3D 交互推演引擎
 */

class EulerBrickVisualizer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    // 几何棱长尺寸 (默认 Halcke 1719 最小欧拉砖)
    this.a = 44;
    this.b = 117;
    this.c = 240;

    // 3D 变换状态 (弧度制欧拉角与视口平移缩放)
    this.rotX = 0.45;
    this.rotY = -0.65;
    this.rotZ = 0;
    this.zoom = 1.0;
    this.panX = 0;
    this.panY = 0;

    // 交互与动画控制
    this.isDragging = false;
    this.dragStartX = 0;
    this.dragStartY = 0;
    this.autoRotate = true;
    this.autoRotateSpeed = 0.006;
    this.lastTime = 0;

    // 对角线显隐控制
    this.showFaceDiagonals = true;
    this.showBodyDiagonal = true;
    this.showWireframe = true;

    // 画布像素尺寸保底
    this.width = 800;
    this.height = 600;

    // 几何指标计算缓存
    this.metrics = {};
    this.modularCheck = {};

    this.computeMetrics();
    this.setupInteractions();
    this.resize();
  }

  get isRotating() {
    return this.autoRotate;
  }

  set isRotating(val) {
    this.autoRotate = !!val;
  }

  get showDiagonals() {
    return this.showFaceDiagonals && this.showBodyDiagonal;
  }

  set showDiagonals(val) {
    this.showFaceDiagonals = !!val;
    this.showBodyDiagonal = !!val;
  }

  /**
   * 判定整数平方根
   */
  isSquare(n) {
    if (n < 0) return { isSquare: false, root: 0 };
    const r = Math.round(Math.sqrt(n));
    return { isSquare: (r * r === n), root: r };
  }

  /**
   * 设定棱长并同步更新
   */
  setEdges(a, b, c) {
    this.a = Math.max(1, Math.round(Number(a) || 1));
    this.b = Math.max(1, Math.round(Number(b) || 1));
    this.c = Math.max(1, Math.round(Number(c) || 1));
    this.computeMetrics();
    this.render();
  }

  /**
   * 计算当前长方体的 7 大几何长度指标、整数性与同余状态
   */
  computeMetrics() {
    const a = Math.max(1, Math.round(Number(this.a) || 1));
    const b = Math.max(1, Math.round(Number(this.b) || 1));
    const c = Math.max(1, Math.round(Number(this.c) || 1));
    this.a = a;
    this.b = b;
    this.c = c;

    // 面对角线 d_ab, d_bc, d_ca
    const sq_ab = a * a + b * b;
    const res_ab = this.isSquare(sq_ab);
    const d_ab = res_ab.isSquare ? res_ab.root : Math.sqrt(sq_ab);

    const sq_bc = b * b + c * c;
    const res_bc = this.isSquare(sq_bc);
    const d_bc = res_bc.isSquare ? res_bc.root : Math.sqrt(sq_bc);

    const sq_ca = c * c + a * a;
    const res_ca = this.isSquare(sq_ca);
    const d_ca = res_ca.isSquare ? res_ca.root : Math.sqrt(sq_ca);

    // 体对角线 g
    const sq_g = a * a + b * b + c * c;
    const res_g = this.isSquare(sq_g);
    const g = res_g.isSquare ? res_g.root : Math.sqrt(sq_g);
    const round_g = Math.round(g);
    const residual_g = Math.abs(g - round_g);

    const isEuler = res_ab.isSquare && res_bc.isSquare && res_ca.isSquare;
    const isPerfect = isEuler && res_g.isSquare;
    const intCount = 3 + (res_ab.isSquare ? 1 : 0) + (res_bc.isSquare ? 1 : 0) + (res_ca.isSquare ? 1 : 0) + (res_g.isSquare ? 1 : 0);

    // 同余必要条件判定 (Modular Constraints)
    const edges = [a, b, c];
    const evenCount = edges.filter(x => x % 2 === 0).length;
    const div4Count = edges.filter(x => x % 4 === 0).length;
    const passMod4 = (evenCount >= 2) && (div4Count >= 1);
    const passMod16 = edges.some(x => x % 16 === 0);
    const passMod5 = edges.some(x => x % 5 === 0);
    const passMod11 = edges.some(x => x % 11 === 0);
    const passAllMod = passMod4 && passMod16 && passMod5 && passMod11;

    this.metrics = {
      a, b, c,
      d_ab, is_ab_int: res_ab.isSquare,
      d_bc, is_bc_int: res_bc.isSquare,
      d_ca, is_ca_int: res_ca.isSquare,
      g, is_g_int: res_g.isSquare,
      residual_g,
      isEuler,
      isPerfect,
      intCount
    };

    this.modularCheck = {
      passMod4,
      passMod16,
      passMod5,
      passMod11,
      passAllMod
    };

    this.updateUI();
  }

  /**
   * 启发式搜索邻近极小残差长方体
   */
  searchMinimalResidual(radius = 50) {
    const range = Math.max(5, Math.min(200, Math.round(radius)));
    const baseA = this.a;
    const baseB = this.b;
    const baseC = this.c;
    let bestResidual = 1.0;
    let bestTrip = [baseA, baseB, baseC];
    let bestG = Math.sqrt(baseA * baseA + baseB * baseB + baseC * baseC);

    // 智能步进抽样搜索，兼顾速度与精度
    const step = range > 60 ? 2 : 1;
    for (let da = -range; da <= range; da += step) {
      const na = Math.max(1, baseA + da);
      for (let db = -range; db <= range; db += step) {
        const nb = Math.max(1, baseB + db);
        for (let dc = -range; dc <= range; dc += step) {
          const nc = Math.max(1, baseC + dc);
          const sq = na * na + nb * nb + nc * nc;
          const g = Math.sqrt(sq);
          const res = Math.abs(g - Math.round(g));
          if (res < bestResidual) {
            bestResidual = res;
            bestTrip = [na, nb, nc];
            bestG = g;
          }
        }
      }
    }

    return { a: bestTrip[0], b: bestTrip[1], c: bestTrip[2], residual: bestResidual, g: bestG };
  }

  setupInteractions() {
    if (!this.canvas) return;

    this.canvas.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      e.preventDefault();
      this.isDragging = true;
      this.dragStartX = e.clientX;
      this.dragStartY = e.clientY;
      this.canvas.style.cursor = 'grabbing';
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      const dx = e.clientX - this.dragStartX;
      const dy = e.clientY - this.dragStartY;
      this.dragStartX = e.clientX;
      this.dragStartY = e.clientY;

      if (e.shiftKey) {
        // Shift + 拖拽：平移
        this.panX += dx;
        this.panY += dy;
      } else {
        // 纯拖拽：3D 自由空间旋转
        this.rotY += dx * 0.008;
        this.rotX += dy * 0.008;
        // 限制俯仰角，防万向锁翻转
        this.rotX = Math.max(-Math.PI / 2 + 0.05, Math.min(Math.PI / 2 - 0.05, this.rotX));
      }
      this.render();
    });

    window.addEventListener('mouseup', () => {
      if (this.isDragging) {
        this.isDragging = false;
        this.canvas.style.cursor = 'grab';
      }
    });

    window.addEventListener('mouseleave', () => {
      this.isDragging = false;
      this.canvas.style.cursor = 'grab';
    });

    // 滚轮平滑缩放 (阻尼指数算法)
    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = Math.max(-50, Math.min(50, e.deltaY));
      const factor = Math.exp(-delta * 0.003);
      this.zoomBy(factor);
    }, { passive: false });
  }

  zoomBy(factor) {
    this.zoom *= factor;
    this.zoom = Math.max(0.3, Math.min(6.0, this.zoom));
    this.updateZoomBadge();
    this.render();
  }

  zoomIn() {
    this.zoomBy(1.25);
  }

  zoomOut() {
    this.zoomBy(0.8);
  }

  resetView() {
    this.rotX = 0.45;
    this.rotY = -0.65;
    this.rotZ = 0;
    this.zoom = 1.0;
    this.panX = 0;
    this.panY = 0;
    this.updateZoomBadge();
    this.render();
  }

  updateZoomBadge() {
    const badge = document.getElementById('eulerbrick-zoom-val');
    if (badge) {
      badge.textContent = `${Math.round(this.zoom * 100)}%`;
    }
  }

  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    const w = rect.width || this.canvas.parentElement?.clientWidth || window.innerWidth - 380;
    const h = rect.height || this.canvas.parentElement?.clientHeight || window.innerHeight - 56;
    if (w <= 0 || h <= 0) return;

    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = w * dpr;
    this.canvas.height = h * dpr;
    this.ctx.resetTransform?.();
    this.ctx.scale(dpr, dpr);
    this.width = w;
    this.height = h;
  }

  update(timestamp) {
    if (!this.lastTime) this.lastTime = timestamp;
    const dt = (timestamp - this.lastTime) / 1000;
    this.lastTime = timestamp;

    if (this.autoRotate && !this.isDragging) {
      this.rotY += this.autoRotateSpeed;
      if (this.rotY > Math.PI * 2) this.rotY -= Math.PI * 2;
    }

    this.render();
  }

  /**
   * 3D 仿射变换与透视投影
   */
  project(x, y, z, maxDimension) {
    // 归一化缩放 (确保长方体在视口中自适应居中)
    const scale = (Math.min(this.width, this.height) * 0.42 * this.zoom) / maxDimension;
    let px = x * scale;
    let py = y * scale;
    let pz = z * scale;

    // 绕 Y 轴旋转 (偏航角)
    const cosY = Math.cos(this.rotY);
    const sinY = Math.sin(this.rotY);
    const x1 = px * cosY + pz * sinY;
    const z1 = -px * sinY + pz * cosY;

    // 绕 X 轴旋转 (俯仰角)
    const cosX = Math.cos(this.rotX);
    const sinX = Math.sin(this.rotX);
    const y2 = py * cosX - z1 * sinX;
    const z2 = py * sinX + z1 * cosX;

    // 透视弱投影
    const cameraDist = 1200;
    const perspective = cameraDist / (cameraDist + z2);

    const screenX = this.width / 2 + this.panX + x1 * perspective;
    const screenY = this.height / 2 + this.panY - y2 * perspective;

    return { x: screenX, y: screenY, depth: z2 };
  }

  render() {
    const ctx = this.ctx;
    if (!ctx) return;
    const w = this.width || 800;
    const h = this.height || 600;

    ctx.clearRect(0, 0, w, h);

    const a = this.a;
    const b = this.b;
    const c = this.c;
    const maxDim = Math.max(a, b, c, 1);

    // 8 个顶点几何坐标 (以长方体几何中心为原点)
    const hx = a / 2, hy = b / 2, hz = c / 2;
    const rawVertices = [
      [-hx, -hy, -hz], // 0: 左下后
      [ hx, -hy, -hz], // 1: 右下后
      [ hx,  hy, -hz], // 2: 右上后
      [-hx,  hy, -hz], // 3: 左上后
      [-hx, -hy,  hz], // 4: 左下前
      [ hx, -hy,  hz], // 5: 右下前
      [ hx,  hy,  hz], // 6: 右上前
      [-hx,  hy,  hz]  // 7: 左上前
    ];

    const v = rawVertices.map(pt => this.project(pt[0], pt[1], pt[2], maxDim));

    // 绘制 3D 空间辅助网格底盘
    this.renderFloorGrid(ctx, maxDim);

    // 绘制面对角线剖面切面高亮 (半透明薄纱)
    if (this.showFaceDiagonals) {
      ctx.save();
      ctx.fillStyle = 'rgba(56, 189, 248, 0.04)';
      // 0-2-6-4 对角切面
      ctx.beginPath();
      ctx.moveTo(v[0].x, v[0].y);
      ctx.lineTo(v[2].x, v[2].y);
      ctx.lineTo(v[6].x, v[6].y);
      ctx.lineTo(v[4].x, v[4].y);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // 绘制长方体 12 条棱边线框 (Wireframe)
    const edges = [
      [0, 1], [1, 2], [2, 3], [3, 0], // 后表面
      [4, 5], [5, 6], [6, 7], [7, 4], // 前表面
      [0, 4], [1, 5], [2, 6], [3, 7]  // 连接纵向棱
    ];

    if (this.showWireframe) {
      ctx.save();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.55)';
      ctx.lineWidth = 1.8;
      edges.forEach(([i, j]) => {
        ctx.beginPath();
        ctx.moveTo(v[i].x, v[i].y);
        ctx.lineTo(v[j].x, v[j].y);
        ctx.stroke();
      });
      ctx.restore();
    }

    // 绘制面对角线 (Face Diagonals)
    if (this.showFaceDiagonals) {
      // 1. 底面/顶面对角线 d_ab (点 0-2)
      this.drawDiagonal(ctx, v[0], v[2], this.metrics.is_ab_int);
      // 2. 侧面对角线 d_bc (点 1-6)
      this.drawDiagonal(ctx, v[1], v[6], this.metrics.is_bc_int);
      // 3. 正面对角线 d_ca (点 4-2)
      this.drawDiagonal(ctx, v[4], v[2], this.metrics.is_ca_int);
    }

    // 绘制体对角线 (Space Body Diagonal g: 0 号点到 6 号点)
    if (this.showBodyDiagonal) {
      const gColor = this.metrics.is_g_int ? '#10b981' : '#f43f5e';
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(v[0].x, v[0].y);
      ctx.lineTo(v[6].x, v[6].y);
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = gColor;
      ctx.shadowColor = gColor;
      ctx.shadowBlur = 10;
      if (!this.metrics.is_g_int) ctx.setLineDash([6, 4]);
      ctx.stroke();
      ctx.restore();

      // 体对角线中点浮动数值标签
      const mx = (v[0].x + v[6].x) / 2;
      const my = (v[0].y + v[6].y) / 2;
      ctx.save();
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      const gLabel = `Space Diag g = ${this.metrics.g.toFixed(3)} ${this.metrics.is_g_int ? '✓ INT' : `(Δ=${this.metrics.residual_g.toFixed(3)})`}`;
      ctx.font = 'bold 11px JetBrains Mono, monospace';
      const tw = ctx.measureText(gLabel).width;
      ctx.fillRect(mx - tw / 2 - 8, my - 14, tw + 16, 22);
      ctx.strokeStyle = gColor;
      ctx.lineWidth = 1;
      ctx.strokeRect(mx - tw / 2 - 8, my - 14, tw + 16, 22);
      ctx.fillStyle = gColor;
      ctx.fillText(gLabel, mx - tw / 2, my + 1);
      ctx.restore();
    }

    // 绘制 8 个顶点圆珠
    v.forEach((pt) => {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // 标注 3 条主棱长尺寸文字
    ctx.save();
    ctx.fillStyle = '#38bdf8';
    ctx.font = '11px JetBrains Mono, monospace';
    // a 轴 (0-1)
    const midA = { x: (v[0].x + v[1].x) / 2, y: (v[0].y + v[1].y) / 2 };
    ctx.fillText(`a = ${a}`, midA.x - 14, midA.y + 14);
    // b 轴 (1-2)
    const midB = { x: (v[1].x + v[2].x) / 2, y: (v[1].y + v[2].y) / 2 };
    ctx.fillText(`b = ${b}`, midB.x + 8, midB.y);
    // c 轴 (1-5)
    const midC = { x: (v[1].x + v[5].x) / 2, y: (v[1].y + v[5].y) / 2 };
    ctx.fillText(`c = ${c}`, midC.x + 8, midC.y + 12);
    ctx.restore();
  }

  drawDiagonal(ctx, p1, p2, isInt) {
    const color = isInt ? 'rgba(245, 158, 11, 0.95)' : 'rgba(148, 163, 184, 0.4)';
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.lineWidth = isInt ? 1.8 : 1.0;
    if (!isInt) ctx.setLineDash([4, 4]);
    ctx.strokeStyle = color;
    if (isInt) {
      ctx.shadowColor = 'rgba(245, 158, 11, 0.6)';
      ctx.shadowBlur = 8;
    }
    ctx.stroke();
    ctx.restore();
  }

  renderFloorGrid(ctx, maxDim) {
    const floorY = -this.b / 2 - maxDim * 0.25;
    const gridSpan = maxDim * 1.6;
    const lines = 6;
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;

    for (let i = -lines; i <= lines; i++) {
      const offset = (i / lines) * gridSpan;
      const p1 = this.project(offset, floorY, -gridSpan, maxDim);
      const p2 = this.project(offset, floorY, gridSpan, maxDim);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();

      const q1 = this.project(-gridSpan, floorY, offset, maxDim);
      const q2 = this.project(gridSpan, floorY, offset, maxDim);
      ctx.beginPath();
      ctx.moveTo(q1.x, q1.y);
      ctx.lineTo(q2.x, q2.y);
      ctx.stroke();
    }
    ctx.restore();
  }

  updateUI() {
    // 1. 侧边栏数值与滑块同步
    const valA = document.getElementById('eulerbrick-val-a');
    const valB = document.getElementById('eulerbrick-val-b');
    const valC = document.getElementById('eulerbrick-val-c');
    if (valA) valA.textContent = this.a;
    if (valB) valB.textContent = this.b;
    if (valC) valC.textContent = this.c;

    const inputA = document.getElementById('eulerbrick-input-a');
    const inputB = document.getElementById('eulerbrick-input-b');
    const inputC = document.getElementById('eulerbrick-input-c');
    if (inputA && document.activeElement !== inputA) inputA.value = this.a;
    if (inputB && document.activeElement !== inputB) inputB.value = this.b;
    if (inputC && document.activeElement !== inputC) inputC.value = this.c;

    const sliderA = document.getElementById('eulerbrick-slider-a');
    const sliderB = document.getElementById('eulerbrick-slider-b');
    const sliderC = document.getElementById('eulerbrick-slider-c');
    if (sliderA) sliderA.value = Math.min(this.a, 1000);
    if (sliderB) sliderB.value = Math.min(this.b, 1000);
    if (sliderC) sliderC.value = Math.min(this.c, 1000);

    // 2. 7/7 整数状态卡片更新
    const setDiagMetric = (valId, statusId, val, isInt, residual = null) => {
      const elVal = document.getElementById(valId);
      const elStatus = document.getElementById(statusId);
      if (elVal) {
        elVal.textContent = val.toFixed(3);
        elVal.style.color = isInt ? '#38bdf8' : '#f59e0b';
      }
      if (elStatus) {
        if (isInt) {
          elStatus.textContent = '✓ Integer';
          elStatus.style.color = '#34d399';
        } else {
          elStatus.textContent = residual !== null ? `✗ Non-int (Δ=${residual.toFixed(4)})` : '✗ Non-integer';
          elStatus.style.color = '#f43f5e';
        }
      }
    };

    setDiagMetric('val-diag-ab', 'status-diag-ab', this.metrics.d_ab, this.metrics.is_ab_int);
    setDiagMetric('val-diag-bc', 'status-diag-bc', this.metrics.d_bc, this.metrics.is_bc_int);
    setDiagMetric('val-diag-ca', 'status-diag-ca', this.metrics.d_ca, this.metrics.is_ca_int);
    setDiagMetric('val-diag-g', 'status-diag-g', this.metrics.g, this.metrics.is_g_int, this.metrics.residual_g);

    // 3. 同余筛选约束检验
    const tag416 = document.getElementById('tag-mod-4-16');
    const desc416 = document.getElementById('desc-mod-4-16');
    const pass416 = this.modularCheck.passMod4 && this.modularCheck.passMod16;
    if (tag416) {
      tag416.className = `mod-pill-tag ${pass416 ? 'mod-tag-pass' : 'mod-tag-fail'}`;
    }
    if (desc416) {
      desc416.textContent = pass416 ? 'Two even, one div 16 (✓ Satisfied)' : 'Two even, one div 16 (✗ Violated)';
      desc416.style.color = pass416 ? '#34d399' : '#fb7185';
    }

    const tag5 = document.getElementById('tag-mod-5');
    const desc5 = document.getElementById('desc-mod-5');
    if (tag5) {
      tag5.className = `mod-pill-tag ${this.modularCheck.passMod5 ? 'mod-tag-pass' : 'mod-tag-fail'}`;
    }
    if (desc5) {
      desc5.textContent = this.modularCheck.passMod5 ? 'At least one div 5 (✓ Satisfied)' : 'At least one div 5 (✗ Violated)';
      desc5.style.color = this.modularCheck.passMod5 ? '#34d399' : '#fb7185';
    }

    const tag11 = document.getElementById('tag-mod-11');
    const desc11 = document.getElementById('desc-mod-11');
    if (tag11) {
      tag11.className = `mod-pill-tag ${this.modularCheck.passMod11 ? 'mod-tag-pass' : 'mod-tag-fail'}`;
    }
    if (desc11) {
      desc11.textContent = this.modularCheck.passMod11 ? 'At least one div 11 (✓ Satisfied)' : 'At least one div 11 (✗ Violated)';
      desc11.style.color = this.modularCheck.passMod11 ? '#34d399' : '#fb7185';
    }

    // 4. 视窗 HUD 浮动药丸更新
    const hudPulse = document.getElementById('hud-eulerbrick-status-pulse');
    const hudType = document.getElementById('hud-eulerbrick-type');
    const hudEdges = document.getElementById('hud-eulerbrick-edges');
    const hudDiag = document.getElementById('hud-eulerbrick-diag');
    const hudResidual = document.getElementById('hud-eulerbrick-residual');

    if (hudEdges) hudEdges.textContent = `${this.a}, ${this.b}, ${this.c}`;
    if (hudDiag) hudDiag.textContent = this.metrics.g.toFixed(3);
    if (hudResidual) hudResidual.textContent = this.metrics.residual_g.toFixed(4);

    if (hudType) {
      if (this.metrics.isPerfect) {
        hudType.textContent = 'PERFECT CUBOID (7/7)!';
        hudType.style.color = '#10b981';
        if (hudPulse) hudPulse.className = 'pulse-indicator status-pill-pass';
      } else if (this.metrics.isEuler) {
        hudType.textContent = 'Euler Brick (6/7)';
        hudType.style.color = '#38bdf8';
        if (hudPulse) hudPulse.className = 'pulse-indicator status-pill-pass';
      } else {
        hudType.textContent = `Ordinary Cuboid (${this.metrics.intCount}/7)`;
        hudType.style.color = '#94a3b8';
        if (hudPulse) hudPulse.className = 'pulse-indicator status-pill-fail';
      }
    }
  }
}

window.EulerBrickVisualizer = EulerBrickVisualizer;
