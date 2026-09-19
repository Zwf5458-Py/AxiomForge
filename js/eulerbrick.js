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

    // 交互聚焦高亮状态 ('a' | 'b' | 'c' | 'd_ab' | 'd_bc' | 'd_ca' | 'g' | null)
    this.highlightTarget = null;
    this.hasMoved = false;

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
   * 单独设定某一条棱长并即时触发完整数论指标重新推演与渲染
   */
  setEdge(edge, val) {
    const v = Math.max(1, Math.round(Number(val) || 1));
    if (edge === 'a') this.a = v;
    if (edge === 'b') this.b = v;
    if (edge === 'c') this.c = v;
    this.computeMetrics();
    this.render();
  }

  /**
   * 设置或切换聚焦高亮目标 ('a' | 'b' | 'c' | 'd_ab' | 'd_bc' | 'd_ca' | 'g' | null)
   */
  setHighlight(target) {
    if (this.highlightTarget === target) {
      // 再次点击同项目时取消高亮，恢复全景
      this.highlightTarget = null;
    } else {
      this.highlightTarget = target;
    }
    this.updateHighlightUI();
    this.render();
  }

  /**
   * 更新高亮状态在 DOM 卡片与棱长药丸上的激活样式
   */
  updateHighlightUI() {
    const target = this.highlightTarget;
    const cardMap = {
      'd_ab': 'card-diag-ab',
      'd_bc': 'card-diag-bc',
      'd_ca': 'card-diag-ca',
      'g': 'card-diag-g'
    };
    const pillMap = {
      'a': 'pill-edge-a',
      'b': 'pill-edge-b',
      'c': 'pill-edge-c'
    };

    // 丢番图指标卡片样式切换
    Object.entries(cardMap).forEach(([k, id]) => {
      const el = document.getElementById(id);
      if (el) {
        if (target === k) {
          el.classList.add('highlight-active');
        } else {
          el.classList.remove('highlight-active');
        }
      }
    });

    // 棱长微调药丸标签样式切换
    Object.entries(pillMap).forEach(([k, id]) => {
      const el = document.getElementById(id);
      if (el) {
        if (target === k) {
          el.classList.add('highlight-active');
        } else {
          el.classList.remove('highlight-active');
        }
      }
    });
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
      this.hasMoved = false;
      this.downX = e.clientX;
      this.downY = e.clientY;
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

      if (!this.hasMoved && Math.hypot(e.clientX - this.downX, e.clientY - this.downY) > 4) {
        this.hasMoved = true;
      }

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

    // 画布轻点空白处取消高亮
    this.canvas.addEventListener('click', () => {
      if (!this.hasMoved && this.highlightTarget) {
        this.setHighlight(null);
      }
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

    const hl = this.highlightTarget;

    // 1. 绘制面对角线剖面切面高亮 (半透明薄纱光晕)
    if (hl === 'd_ab') {
      // 聚焦高亮前表面 (顶点 4-5-6-7)
      ctx.save();
      ctx.fillStyle = 'rgba(56, 189, 248, 0.16)';
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(v[4].x, v[4].y);
      ctx.lineTo(v[5].x, v[5].y);
      ctx.lineTo(v[6].x, v[6].y);
      ctx.lineTo(v[7].x, v[7].y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    } else if (hl === 'd_bc') {
      // 聚焦高亮右侧面 (顶点 1-5-6-2)
      ctx.save();
      ctx.fillStyle = 'rgba(245, 158, 11, 0.16)';
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(v[1].x, v[1].y);
      ctx.lineTo(v[5].x, v[5].y);
      ctx.lineTo(v[6].x, v[6].y);
      ctx.lineTo(v[2].x, v[2].y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    } else if (hl === 'd_ca') {
      // 聚焦高亮底表面 (顶点 0-1-5-4)
      ctx.save();
      ctx.fillStyle = 'rgba(167, 139, 250, 0.16)';
      ctx.strokeStyle = 'rgba(167, 139, 250, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(v[0].x, v[0].y);
      ctx.lineTo(v[1].x, v[1].y);
      ctx.lineTo(v[5].x, v[5].y);
      ctx.lineTo(v[4].x, v[4].y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    } else if (hl === 'g' || (this.showFaceDiagonals && !hl)) {
      // 0-2-6-4 穿心对角切面
      ctx.save();
      if (hl === 'g') {
        ctx.fillStyle = this.metrics.is_g_int ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)';
        ctx.strokeStyle = this.metrics.is_g_int ? 'rgba(16, 185, 129, 0.6)' : 'rgba(244, 63, 94, 0.6)';
        ctx.lineWidth = 1.5;
      } else {
        ctx.fillStyle = 'rgba(56, 189, 248, 0.04)';
      }
      ctx.beginPath();
      ctx.moveTo(v[0].x, v[0].y);
      ctx.lineTo(v[2].x, v[2].y);
      ctx.lineTo(v[6].x, v[6].y);
      ctx.lineTo(v[4].x, v[4].y);
      ctx.closePath();
      ctx.fill();
      if (hl === 'g') ctx.stroke();
      ctx.restore();
    }

    // 2. 绘制长方体 12 条棱边线框 (Wireframe: 支持 3 轴单独加粗与淡化)
    if (this.showWireframe) {
      const edgesA = [[0, 1], [3, 2], [4, 5], [7, 6]]; // X 轴平行棱 (长为 a)
      const edgesB = [[0, 3], [1, 2], [4, 7], [5, 6]]; // Y 轴平行棱 (长为 b)
      const edgesC = [[0, 4], [1, 5], [2, 6], [3, 7]]; // Z 轴平行棱 (长为 c)

      const anyEdgeHl = (hl === 'a' || hl === 'b' || hl === 'c');
      const anyDiagHl = (hl === 'd_ab' || hl === 'd_bc' || hl === 'd_ca' || hl === 'g');

      const drawEdgeGroup = (groupEdges, isHl, isDim, activeColor) => {
        ctx.save();
        if (isHl) {
          ctx.strokeStyle = activeColor;
          ctx.lineWidth = 3.8;
          ctx.shadowColor = activeColor;
          ctx.shadowBlur = 16;
        } else if (isDim) {
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
          ctx.lineWidth = 1.0;
        } else {
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.55)';
          ctx.lineWidth = 1.8;
        }

        groupEdges.forEach(([i, j]) => {
          ctx.beginPath();
          ctx.moveTo(v[i].x, v[i].y);
          ctx.lineTo(v[j].x, v[j].y);
          ctx.stroke();
        });
        ctx.restore();
      };

      drawEdgeGroup(edgesA, hl === 'a', anyDiagHl || (anyEdgeHl && hl !== 'a'), '#38bdf8');
      drawEdgeGroup(edgesB, hl === 'b', anyDiagHl || (anyEdgeHl && hl !== 'b'), '#f59e0b');
      drawEdgeGroup(edgesC, hl === 'c', anyDiagHl || (anyEdgeHl && hl !== 'c'), '#a78bfa');
    }

    // 3. 绘制面对角线 (Face Diagonals)
    if (this.showFaceDiagonals || hl === 'd_ab' || hl === 'd_bc' || hl === 'd_ca') {
      const isAnyDiagHl = (hl === 'd_ab' || hl === 'd_bc' || hl === 'd_ca' || hl === 'g');
      const isAnyEdgeHl = (hl === 'a' || hl === 'b' || hl === 'c');

      // 1. 前表面对角线 d_ab (X-Y 面): 点 4 到 点 6
      this.drawDiagonal(
        ctx, v[4], v[6], this.metrics.is_ab_int,
        hl === 'd_ab',
        (isAnyDiagHl && hl !== 'd_ab') || isAnyEdgeHl,
        '#38bdf8'
      );
      // 2. 右侧面对角线 d_bc (Y-Z 面): 点 1 到 点 6
      this.drawDiagonal(
        ctx, v[1], v[6], this.metrics.is_bc_int,
        hl === 'd_bc',
        (isAnyDiagHl && hl !== 'd_bc') || isAnyEdgeHl,
        '#f59e0b'
      );
      // 3. 底表面对角线 d_ca (Z-X 面): 点 4 到 点 1
      this.drawDiagonal(
        ctx, v[4], v[1], this.metrics.is_ca_int,
        hl === 'd_ca',
        (isAnyDiagHl && hl !== 'd_ca') || isAnyEdgeHl,
        '#a78bfa'
      );
    }

    // 4. 绘制体对角线 (Space Body Diagonal g: 0 号点到 6 号点，穿透体心)
    if (this.showBodyDiagonal || hl === 'g') {
      const isHl = (hl === 'g');
      const isDim = (hl !== null && hl !== 'g');
      const baseGColor = this.metrics.is_g_int ? '#10b981' : '#f43f5e';
      const gColor = isDim ? (this.metrics.is_g_int ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)') : baseGColor;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(v[0].x, v[0].y);
      ctx.lineTo(v[6].x, v[6].y);
      ctx.lineWidth = isHl ? 4.8 : (isDim ? 1.0 : 2.5);
      ctx.strokeStyle = gColor;
      if (isHl) {
        ctx.shadowColor = baseGColor;
        ctx.shadowBlur = 24;
      } else if (!isDim) {
        ctx.shadowColor = baseGColor;
        ctx.shadowBlur = 10;
      }
      if (!this.metrics.is_g_int && !isHl) ctx.setLineDash([6, 4]);
      ctx.stroke();
      ctx.restore();

      // 体对角线中点浮动数值药丸标签 (高亮时或未淡化时显示)
      if (!isDim || isHl) {
        const mx = (v[0].x + v[6].x) / 2;
        const my = (v[0].y + v[6].y) / 2;
        const gLabel = `Space Diag g = ${this.metrics.g.toFixed(3)} ${this.metrics.is_g_int ? '✓ INT' : `(Δ=${this.metrics.residual_g.toFixed(4)})`}`;
        this.drawPill(
          ctx, mx, my - 12, gLabel, baseGColor,
          isHl ? '#ffffff' : baseGColor,
          isHl ? 'rgba(15, 23, 42, 0.98)' : 'rgba(15, 23, 42, 0.92)'
        );
      }
    }

    // 5. 绘制 8 个顶点圆珠
    v.forEach((pt) => {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // 6. 面对角线聚焦时的专用中点标签
    if (hl === 'd_ab') {
      const mid_ab = { x: (v[4].x + v[6].x) / 2, y: (v[4].y + v[6].y) / 2 };
      this.drawPill(
        ctx, mid_ab.x, mid_ab.y - 14,
        `Face Diag d_ab = ${this.metrics.d_ab.toFixed(3)} ${this.metrics.is_ab_int ? '✓ INT' : ''}`,
        '#38bdf8', '#ffffff', 'rgba(15, 23, 42, 0.98)'
      );
    } else if (hl === 'd_bc') {
      const mid_bc = { x: (v[1].x + v[6].x) / 2, y: (v[1].y + v[6].y) / 2 };
      this.drawPill(
        ctx, mid_bc.x + 16, mid_bc.y - 14,
        `Face Diag d_bc = ${this.metrics.d_bc.toFixed(3)} ${this.metrics.is_bc_int ? '✓ INT' : ''}`,
        '#f59e0b', '#ffffff', 'rgba(15, 23, 42, 0.98)'
      );
    } else if (hl === 'd_ca') {
      const mid_ca = { x: (v[4].x + v[1].x) / 2, y: (v[4].y + v[1].y) / 2 };
      this.drawPill(
        ctx, mid_ca.x, mid_ca.y + 18,
        `Face Diag d_ca = ${this.metrics.d_ca.toFixed(3)} ${this.metrics.is_ca_int ? '✓ INT' : ''}`,
        '#a78bfa', '#ffffff', 'rgba(15, 23, 42, 0.98)'
      );
    }

    // 7. 标注 3 条主棱长尺寸药丸
    const midA = { x: (v[4].x + v[5].x) / 2, y: (v[4].y + v[5].y) / 2 };
    const hlA = (hl === 'a');
    this.drawPill(
      ctx, midA.x, midA.y + 16, `a = ${a} (X)`, '#38bdf8',
      hlA ? '#ffffff' : 'rgba(56, 189, 248, 0.45)',
      hlA ? 'rgba(15, 23, 42, 0.98)' : 'rgba(15, 23, 42, 0.92)'
    );

    const midB = { x: (v[5].x + v[6].x) / 2, y: (v[5].y + v[6].y) / 2 };
    const hlB = (hl === 'b');
    this.drawPill(
      ctx, midB.x + 36, midB.y, `b = ${b} (Y)`, '#f59e0b',
      hlB ? '#ffffff' : 'rgba(245, 158, 11, 0.45)',
      hlB ? 'rgba(15, 23, 42, 0.98)' : 'rgba(15, 23, 42, 0.92)'
    );

    const midC = { x: (v[0].x + v[4].x) / 2, y: (v[0].y + v[4].y) / 2 };
    const hlC = (hl === 'c');
    this.drawPill(
      ctx, midC.x - 38, midC.y + 12, `c = ${c} (Z)`, '#a78bfa',
      hlC ? '#ffffff' : 'rgba(167, 139, 250, 0.45)',
      hlC ? 'rgba(15, 23, 42, 0.98)' : 'rgba(15, 23, 42, 0.92)'
    );
    ctx.restore();
  }

  drawPill(ctx, x, y, text, color, borderColor, bgColor = 'rgba(15, 23, 42, 0.92)') {
    ctx.save();
    ctx.font = 'bold 11px "JetBrains Mono", monospace';
    const tw = ctx.measureText(text).width;
    const th = 18;
    const px = 8;
    const w = tw + px * 2;
    const h = th;
    const rx = x - w / 2;
    const ry = y - h / 2;

    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(rx, ry, w, h, 6);
    } else {
      ctx.rect(rx, ry, w, h);
    }
    ctx.fillStyle = bgColor;
    ctx.fill();
    ctx.strokeStyle = borderColor || color;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y + 0.5);
    ctx.restore();
  }

  drawDiagonal(ctx, p1, p2, isInt, isHighlighted = false, isDimmed = false, customColor = null) {
    let color;
    let width = 1.8;
    let blur = 0;

    if (isHighlighted) {
      color = customColor || (isInt ? '#10b981' : '#f59e0b');
      width = 4.2;
      blur = 20;
    } else if (isDimmed) {
      color = isInt ? 'rgba(245, 158, 11, 0.12)' : 'rgba(148, 163, 184, 0.08)';
      width = 1.0;
    } else {
      color = isInt ? 'rgba(245, 158, 11, 0.95)' : 'rgba(148, 163, 184, 0.4)';
      width = isInt ? 1.8 : 1.0;
      blur = isInt ? 8 : 0;
    }

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.lineWidth = width;
    if (!isInt && !isHighlighted) ctx.setLineDash([4, 4]);
    ctx.strokeStyle = color;
    if (blur > 0) {
      ctx.shadowColor = color;
      ctx.shadowBlur = blur;
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
