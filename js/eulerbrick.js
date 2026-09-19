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

    // 几何指标计算缓存
    this.metrics = {};
    this.modularCheck = {};

    this.computeMetrics();
    this.setupInteractions();
    this.resize();
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
   * 计算当前长方体的 7 大几何长度指标、整数性与同余状态
   */
  computeMetrics() {
    const a = Math.max(1, Math.round(Number(this.a) || 1));
    const b = Math.max(1, Math.round(Number(this.b) || 1));
    const c = Math.max(1, Math.round(Number(this.c) || 1));
    this.a = a;
    this.b = b;
    this.c = c;

    // 面对角线
    const sq_ab = a * a + b * b;
    const res_ab = this.isSquare(sq_ab);
    const d_ab = res_ab.isSquare ? res_ab.root : Math.sqrt(sq_ab);

    const sq_ac = a * a + c * c;
    const res_ac = this.isSquare(sq_ac);
    const d_ac = res_ac.isSquare ? res_ac.root : Math.sqrt(sq_ac);

    const sq_bc = b * b + c * c;
    const res_bc = this.isSquare(sq_bc);
    const d_bc = res_bc.isSquare ? res_bc.root : Math.sqrt(sq_bc);

    // 体对角线
    const sq_g = a * a + b * b + c * c;
    const res_g = this.isSquare(sq_g);
    const g = res_g.isSquare ? res_g.root : Math.sqrt(sq_g);
    const round_g = Math.round(g);
    const residual_g = Math.abs(g - round_g);

    const isEuler = res_ab.isSquare && res_ac.isSquare && res_bc.isSquare;
    const isPerfect = isEuler && res_g.isSquare;

    const intCount = 3 + (res_ab.isSquare ? 1 : 0) + (res_ac.isSquare ? 1 : 0) + (res_bc.isSquare ? 1 : 0) + (res_g.isSquare ? 1 : 0);

    // 同余必要条件判定
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
      d_ac, is_ac_int: res_ac.isSquare,
      d_bc, is_bc_int: res_bc.isSquare,
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
   * 加载历史经典欧拉砖预设
   */
  loadPreset(name) {
    if (name === 'halcke') {
      // 1719 最小欧拉砖
      this.a = 44;
      this.b = 117;
      this.c = 240;
    } else if (name === 'second') {
      // 经典次小欧拉砖
      this.a = 85;
      this.b = 132;
      this.c = 720;
    } else if (name === 'saunderson') {
      // Saunderson 参数构造砖
      this.a = 240;
      this.b = 252;
      this.c = 275;
    } else if (name === 'near_miss') {
      // 极小残差伪完美长方体
      this.a = 271;
      this.b = 264;
      this.c = 480;
    }
    this.computeMetrics();
    this.resetView();
  }

  /**
   * 启发式搜索邻近极小残差长方体
   */
  searchLocalMinimalResidual(range = 25) {
    const baseA = this.a;
    const baseB = this.b;
    const baseC = this.c;
    let bestResidual = 1.0;
    let bestTrip = [baseA, baseB, baseC];

    for (let da = -range; da <= range; da++) {
      const na = Math.max(1, baseA + da);
      for (let db = -range; db <= range; db++) {
        const nb = Math.max(1, baseB + db);
        for (let dc = -range; dc <= range; dc++) {
          const nc = Math.max(1, baseC + dc);
          const sq = na * na + nb * nb + nc * nc;
          const g = Math.sqrt(sq);
          const res = Math.abs(g - Math.round(g));
          if (res < bestResidual) {
            bestResidual = res;
            bestTrip = [na, nb, nc];
          }
        }
      }
    }

    this.a = bestTrip[0];
    this.b = bestTrip[1];
    this.c = bestTrip[2];
    this.computeMetrics();
    return { a: this.a, b: this.b, c: this.c, residual: bestResidual };
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
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.scale(dpr, dpr);
    this.width = rect.width;
    this.height = rect.height;
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
    // 归一化缩放 (确保长方体在视口中大小自适应)
    const scale = (Math.min(this.width, this.height) * 0.42 * this.zoom) / maxDimension;
    let px = x * scale;
    let py = y * scale;
    let pz = z * scale;

    // 绕 Y 轴旋转 (方位角偏航)
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
    const w = this.width;
    const h = this.height;

    ctx.clearRect(0, 0, w, h);

    const a = this.a;
    const b = this.b;
    const c = this.c;
    const maxDim = Math.max(a, b, c, 1);

    // 8 个顶点几何坐标 (以长方体几何几何中心为原点)
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

    // 绘制 3D 空间微弱辅助网格底盘
    this.renderFloorGrid(ctx, maxDim);

    // 绘制长方体 12 条棱边线框 (Wireframe)
    const edges = [
      [0, 1], [1, 2], [2, 3], [3, 0], // 后表面
      [4, 5], [5, 6], [6, 7], [7, 4], // 前表面
      [0, 4], [1, 5], [2, 6], [3, 7]  // 连接纵向棱
    ];

    if (this.showWireframe) {
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
      ctx.lineWidth = 1.6;
      edges.forEach(([i, j]) => {
        ctx.beginPath();
        ctx.moveTo(v[i].x, v[i].y);
        ctx.lineTo(v[j].x, v[j].y);
        ctx.stroke();
      });
    }

    // 绘制面对角线 (Face Diagonals)
    if (this.showFaceDiagonals) {
      // 1. 底面/顶面对角线 d_ab (点 0-2, 或点 4-6)
      this.drawDiagonal(ctx, v[0], v[2], this.metrics.is_ab_int, `d_ab=${this.metrics.d_ab.toFixed(2)}`);
      // 2. 侧面对角线 d_bc (点 1-6, 或点 0-7)
      this.drawDiagonal(ctx, v[1], v[6], this.metrics.is_bc_int, `d_bc=${this.metrics.d_bc.toFixed(2)}`);
      // 3. 正面对角线 d_ac (点 4-2, 或点 5-3)
      this.drawDiagonal(ctx, v[4], v[2], this.metrics.is_ac_int, `d_ac=${this.metrics.d_ac.toFixed(2)}`);
    }

    // 绘制体对角线 (Space Body Diagonal g: 0 号点到 6 号点)
    if (this.showBodyDiagonal) {
      const gColor = this.metrics.is_g_int ? '#10b981' : '#f43f5e';
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(v[0].x, v[0].y);
      ctx.lineTo(v[6].x, v[6].y);
      ctx.lineWidth = 2.4;
      ctx.strokeStyle = gColor;
      ctx.shadowColor = gColor;
      ctx.shadowBlur = 12;
      ctx.stroke();
      ctx.restore();

      // 体对角线中点浮动数值标签
      const mx = (v[0].x + v[6].x) / 2;
      const my = (v[0].y + v[6].y) / 2;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
      const gLabel = `Space Diagonal g = ${this.metrics.g.toFixed(3)} ${this.metrics.is_g_int ? '✓ INT' : `(Δ=${this.metrics.residual_g.toFixed(3)})`}`;
      ctx.font = 'bold 11px Inter, monospace';
      const tw = ctx.measureText(gLabel).width;
      ctx.fillRect(mx - tw / 2 - 6, my - 18, tw + 12, 22);
      ctx.strokeStyle = gColor;
      ctx.strokeRect(mx - tw / 2 - 6, my - 18, tw + 12, 22);
      ctx.fillStyle = gColor;
      ctx.fillText(gLabel, mx - tw / 2, my - 3);
    }

    // 绘制 8 个顶点圆珠
    v.forEach((pt, idx) => {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // 标注 3 条主棱长尺寸文字
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px Inter, monospace';
    // a 轴 (0-1)
    const midA = { x: (v[0].x + v[1].x) / 2, y: (v[0].y + v[1].y) / 2 };
    ctx.fillText(`a = ${a}`, midA.x - 12, midA.y + 14);
    // b 轴 (1-2)
    const midB = { x: (v[1].x + v[2].x) / 2, y: (v[1].y + v[2].y) / 2 };
    ctx.fillText(`b = ${b}`, midB.x + 8, midB.y);
    // c 轴 (1-5)
    const midC = { x: (v[1].x + v[5].x) / 2, y: (v[1].y + v[5].y) / 2 };
    ctx.fillText(`c = ${c}`, midC.x + 8, midC.y + 10);
  }

  drawDiagonal(ctx, p1, p2, isInt, label) {
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
    const floorY = -this.b / 2 - maxDim * 0.2;
    const gridSpan = maxDim * 1.5;
    const lines = 6;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
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
  }

  updateUI() {
    // 侧边栏数值与滑块同步
    const inputA = document.getElementById('input-euler-a');
    const inputB = document.getElementById('input-euler-b');
    const inputC = document.getElementById('input-euler-c');
    if (inputA && document.activeElement !== inputA) inputA.value = this.a;
    if (inputB && document.activeElement !== inputB) inputB.value = this.b;
    if (inputC && document.activeElement !== inputC) inputC.value = this.c;

    // 7/7 整数状态更新
    const elScore = document.getElementById('euler-int-score');
    if (elScore) elScore.textContent = `${this.metrics.intCount} / 7`;

    const setStatus = (id, isInt, val, label) => {
      const el = document.getElementById(id);
      if (!el) return;
      const valStr = isInt ? Math.round(val) : val.toFixed(2);
      el.textContent = `${label}: ${valStr} (${isInt ? '✓ INT' : '✗ Real'})`;
      el.className = isInt ? 'status-pill-pass' : 'status-pill-fail';
    };

    setStatus('euler-status-ab', this.metrics.is_ab_int, this.metrics.d_ab, 'd_ab');
    setStatus('euler-status-ac', this.metrics.is_ac_int, this.metrics.d_ac, 'd_ac');
    setStatus('euler-status-bc', this.metrics.is_bc_int, this.metrics.d_bc, 'd_bc');
    setStatus('euler-status-g', this.metrics.is_g_int, this.metrics.g, 'g (Body)');

    // 残差展示
    const elRes = document.getElementById('euler-residual-val');
    if (elRes) {
      elRes.textContent = this.metrics.residual_g.toFixed(4);
      elRes.style.color = this.metrics.residual_g < 0.05 ? '#10b981' : (this.metrics.residual_g < 0.2 ? '#f59e0b' : '#f43f5e');
    }

    // 同余检验结果
    const elMod4 = document.getElementById('euler-mod-4');
    const elMod16 = document.getElementById('euler-mod-16');
    const elMod5 = document.getElementById('euler-mod-5');
    const elMod11 = document.getElementById('euler-mod-11');
    if (elMod4) elMod4.className = this.modularCheck.passMod4 ? 'mod-tag-pass' : 'mod-tag-fail';
    if (elMod16) elMod16.className = this.modularCheck.passMod16 ? 'mod-tag-pass' : 'mod-tag-fail';
    if (elMod5) elMod5.className = this.modularCheck.passMod5 ? 'mod-tag-pass' : 'mod-tag-fail';
    if (elMod11) elMod11.className = this.modularCheck.passMod11 ? 'mod-tag-pass' : 'mod-tag-fail';

    // HUD 药丸更新
    const hudTriad = document.getElementById('hud-euler-triad');
    const hudStatus = document.getElementById('hud-euler-status');
    const hudRes = document.getElementById('hud-euler-res');
    if (hudTriad) hudTriad.textContent = `(${this.a}, ${this.b}, ${this.c})`;
    if (hudStatus) {
      if (this.metrics.isPerfect) {
        hudStatus.textContent = 'PERFECT CUBOID!';
        hudStatus.style.color = '#10b981';
      } else if (this.metrics.isEuler) {
        hudStatus.textContent = 'Euler Brick (6/7)';
        hudStatus.style.color = '#f59e0b';
      } else {
        hudStatus.textContent = `Ordinary (${this.metrics.intCount}/7)`;
        hudStatus.style.color = '#94a3b8';
      }
    }
    if (hudRes) hudRes.textContent = `Δg: ${this.metrics.residual_g.toFixed(3)}`;
  }
}

window.EulerBrickVisualizer = EulerBrickVisualizer;
