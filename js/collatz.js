/**
 * AxiomForge - Collatz Conjecture (Hailstone Dynamics & Inverse Tree) Visualizer
 * 考拉兹冰雹猜想 · 离散算术动力学与逆向分形拓扑树推演引擎
 */

class CollatzVisualizer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    // 运行状态
    this.mode = 'trajectory'; // 'trajectory' | 'tree'
    this.scaleType = 'log'; // 'log' | 'linear'
    this.seed = 27; // 默认经典起始种子 (111 步，峰值 9232)
    this.sequence = [];
    this.stats = {
      totalSteps: 0,
      peakValue: 0,
      peakStep: 0,
      oddSteps: 0,
      evenSteps: 0,
      expansionRatio: 1
    };

    // 动画状态
    this.animStep = 0;
    this.isPlaying = true;
    this.playSpeed = 1.0;
    this.lastTime = 0;
    this.progressAccumulator = 0;

    // 拓扑树状态
    this.treeDepth = 10;
    this.treeNodes = [];
    this.treeLinks = [];
    this.treeZoom = 1.0;
    this.treePanX = 0;
    this.treePanY = 0;
    this.isDragging = false;
    this.dragStartX = 0;
    this.dragStartY = 0;
    this.hoveredNode = null;

    // 粒子效果
    this.pulsePhase = 0;

    // 初始化序列与事件
    this.computeSequence(this.seed);
    this.buildInverseTree(this.treeDepth);
    this.setupInteractions();
    this.resize();
  }

  /**
   * 计算指定正整数的考拉兹冰雹序列
   */
  computeSequence(n) {
    let val = Math.max(1, Math.floor(Number(n) || 1));
    this.seed = val;
    const seq = [val];
    let peak = val;
    let peakIdx = 0;
    let oddCount = 0;

    while (val !== 1 && seq.length < 5000) {
      if (val % 2 === 0) {
        val = val / 2;
      } else {
        oddCount++;
        val = 3 * val + 1;
      }
      seq.push(val);
      if (val > peak) {
        peak = val;
        peakIdx = seq.length - 1;
      }
    }

    this.sequence = seq;
    const totalSteps = seq.length - 1;
    this.stats = {
      totalSteps,
      peakValue: peak,
      peakStep: peakIdx,
      oddSteps: oddCount,
      evenSteps: totalSteps - oddCount,
      expansionRatio: peak / this.seed
    };

    this.animStep = 0;
    this.updateDashboardUI();
  }

  /**
   * 构建从 1 出发的逆向考拉兹分形拓扑树
   */
  buildInverseTree(maxDepth) {
    this.treeNodes = [];
    this.treeLinks = [];
    const visited = new Set([1]);

    const root = {
      id: 1,
      val: 1,
      depth: 0,
      x: 0,
      y: 0,
      parent: null,
      type: 'root'
    };
    this.treeNodes.push(root);

    let currentLayer = [root];

    for (let d = 1; d <= maxDepth; d++) {
      const nextLayer = [];
      const layerSize = currentLayer.length;

      currentLayer.forEach((node, idx) => {
        // 偶数主分支：2 * n
        const evenVal = node.val * 2;
        if (!visited.has(evenVal)) {
          visited.add(evenVal);
          const evenNode = {
            id: evenVal,
            val: evenVal,
            depth: d,
            parent: node,
            type: 'even',
            angleOffset: -0.28
          };
          this.treeNodes.push(evenNode);
          this.treeLinks.push({ source: node, target: evenNode, type: 'even' });
          nextLayer.push(evenNode);
        }

        // 奇数分叉分支：(n - 1) / 3 (当 n % 6 == 4 且 n > 4)
        if (node.val % 6 === 4 && node.val > 4) {
          const oddVal = Math.floor((node.val - 1) / 3);
          if (oddVal % 2 !== 0 && !visited.has(oddVal)) {
            visited.add(oddVal);
            const oddNode = {
              id: oddVal,
              val: oddVal,
              depth: d,
              parent: node,
              type: 'odd',
              angleOffset: 0.42
            };
            this.treeNodes.push(oddNode);
            this.treeLinks.push({ source: node, target: oddNode, type: 'odd' });
            nextLayer.push(oddNode);
          }
        }
      });

      currentLayer = nextLayer;
      if (currentLayer.length === 0) break;
    }

    // 树状几何布局（径向扇形展开算法）
    this.layoutTreeGeometry();
  }

  layoutTreeGeometry() {
    if (this.treeNodes.length === 0) return;
    const root = this.treeNodes[0];
    root.x = 0;
    root.y = 180;
    root.angle = -Math.PI / 2; // 向上生长

    const assignPos = (node, angle, spread, length) => {
      const children = this.treeLinks.filter(l => l.source === node).map(l => l.target);
      if (children.length === 0) return;

      if (children.length === 1) {
        const c = children[0];
        const nextAngle = angle + (c.type === 'even' ? -0.05 : 0.2);
        c.angle = nextAngle;
        c.x = node.x + Math.cos(nextAngle) * length;
        c.y = node.y + Math.sin(nextAngle) * length;
        assignPos(c, nextAngle, spread * 0.92, length * 0.88);
      } else {
        const evenC = children.find(c => c.type === 'even');
        const oddC = children.find(c => c.type === 'odd');

        if (evenC) {
          const eAngle = angle - spread * 0.45;
          evenC.angle = eAngle;
          evenC.x = node.x + Math.cos(eAngle) * length;
          evenC.y = node.y + Math.sin(eAngle) * length;
          assignPos(evenC, eAngle, spread * 0.78, length * 0.86);
        }
        if (oddC) {
          const oAngle = angle + spread * 0.55;
          oddC.angle = oAngle;
          oddC.x = node.x + Math.cos(oAngle) * length * 0.95;
          oddC.y = node.y + Math.sin(oAngle) * length * 0.95;
          assignPos(oddC, oAngle, spread * 0.78, length * 0.86);
        }
      }
    };

    assignPos(root, -Math.PI / 2, 0.75, 62);
  }

  /**
   * 区间极值冰雹搜索 (寻找最大停机时间)
   */
  findExtremalSeed(start, end) {
    const s = Math.max(1, Math.min(start, end));
    const e = Math.min(s + 5000, Math.max(start, end)); // 防止冻结界面，单次最多搜索 5000 个数
    let bestSeed = s;
    let maxSteps = 0;

    for (let i = s; i <= e; i++) {
      let v = i;
      let steps = 0;
      while (v !== 1 && steps < 3000) {
        v = (v % 2 === 0) ? (v / 2) : (3 * v + 1);
        steps++;
      }
      if (steps > maxSteps) {
        maxSteps = steps;
        bestSeed = i;
      }
    }

    this.computeSequence(bestSeed);
    return { seed: bestSeed, steps: maxSteps };
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

  setupInteractions() {
    if (!this.canvas) return;

    this.canvas.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.dragStartX = e.clientX;
      this.dragStartY = e.clientY;
    });

    window.addEventListener('mousemove', (e) => {
      if (this.isDragging && this.mode === 'tree') {
        const dx = e.clientX - this.dragStartX;
        const dy = e.clientY - this.dragStartY;
        this.treePanX += dx;
        this.treePanY += dy;
        this.dragStartX = e.clientX;
        this.dragStartY = e.clientY;
      }

      if (this.mode === 'tree') {
        this.detectHoveredNode(e);
      }
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    this.canvas.addEventListener('wheel', (e) => {
      if (this.mode === 'tree') {
        e.preventDefault();
        const factor = e.deltaY < 0 ? 1.12 : 0.89;
        this.treeZoom = Math.max(0.2, Math.min(5.0, this.treeZoom * factor));
      }
    }, { passive: false });
  }

  detectHoveredNode(e) {
    const rect = this.canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const centerX = this.width / 2 + this.treePanX;
    const centerY = this.height / 2 + this.treePanY;

    let found = null;
    for (const node of this.treeNodes) {
      const sx = centerX + node.x * this.treeZoom;
      const sy = centerY + node.y * this.treeZoom;
      const dist = Math.hypot(mx - sx, my - sy);
      if (dist < 12 * Math.max(0.8, this.treeZoom)) {
        found = node;
        break;
      }
    }
    this.hoveredNode = found;
  }

  resetTreeCenter() {
    this.treeZoom = 1.0;
    this.treePanX = 0;
    this.treePanY = 40;
  }

  update(timestamp) {
    if (!this.lastTime) this.lastTime = timestamp;
    const dt = (timestamp - this.lastTime) / 1000;
    this.lastTime = timestamp;

    this.pulsePhase = (this.pulsePhase + dt * 3.0) % (Math.PI * 2);

    if (this.mode === 'trajectory' && this.isPlaying && this.sequence.length > 1) {
      this.progressAccumulator += dt * 25 * this.playSpeed;
      if (this.progressAccumulator >= 1) {
        const stepInc = Math.floor(this.progressAccumulator);
        this.animStep = Math.min(this.sequence.length - 1, this.animStep + stepInc);
        this.progressAccumulator -= stepInc;
      }
    }

    this.render();
  }

  render() {
    const ctx = this.ctx;
    if (!ctx) return;
    const w = this.width;
    const h = this.height;

    // 清空背景
    ctx.clearRect(0, 0, w, h);

    if (this.mode === 'trajectory') {
      this.renderTrajectory(ctx, w, h);
    } else {
      this.renderTree(ctx, w, h);
    }
  }

  renderTrajectory(ctx, w, h) {
    const padding = { top: 60, right: 60, bottom: 65, left: 80 };
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;

    if (chartW <= 0 || chartH <= 0 || this.sequence.length === 0) return;

    // 标尺计算 (X 为步数，Y 为值)
    const maxSteps = Math.max(1, this.sequence.length - 1);
    const maxY = this.stats.peakValue;
    const useLog = (this.scaleType === 'log');

    const getX = (step) => padding.left + (step / maxSteps) * chartW;
    const getY = (val) => {
      if (useLog) {
        const logMin = 0; // log10(1) = 0
        const logMax = Math.max(0.5, Math.log10(Math.max(1, maxY)));
        const logVal = Math.log10(Math.max(1, val));
        return padding.top + chartH - (logVal / logMax) * chartH;
      } else {
        return padding.top + chartH - (val / maxY) * chartH;
      }
    };

    // 绘制微弱网格与坐标轴
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '10px Inter, system-ui, sans-serif';

    // 水平网格线 (对数或线性)
    const yTicks = useLog ? [1, 10, 100, 1000, 10000, 100000, 1000000, 10000000] : [0, maxY * 0.25, maxY * 0.5, maxY * 0.75, maxY];
    yTicks.forEach(tick => {
      if (tick <= maxY * 1.2 && tick >= 1) {
        const y = getY(tick);
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(padding.left + chartW, y);
        ctx.stroke();
        ctx.fillText(tick.toLocaleString(), padding.left - 45, y + 3);
      }
    });

    // 绘制冰雹背景微弱渐变
    const bgGrad = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
    bgGrad.addColorStop(0, 'rgba(59, 130, 246, 0.08)');
    bgGrad.addColorStop(1, 'rgba(16, 185, 129, 0.01)');

    const maxVisibleStep = Math.min(this.sequence.length - 1, Math.max(0, this.animStep));

    ctx.beginPath();
    ctx.moveTo(getX(0), getY(this.sequence[0]));
    for (let i = 1; i <= maxVisibleStep; i++) {
      ctx.lineTo(getX(i), getY(this.sequence[i]));
    }
    ctx.lineTo(getX(maxVisibleStep), padding.top + chartH);
    ctx.lineTo(getX(0), padding.top + chartH);
    ctx.closePath();
    ctx.fillStyle = bgGrad;
    ctx.fill();

    // 绘制折线轨迹 (奇数飞跃呈金色，偶数下坠呈冰蓝色)
    for (let i = 0; i < maxVisibleStep; i++) {
      const x1 = getX(i);
      const y1 = getY(this.sequence[i]);
      const x2 = getX(i + 1);
      const y2 = getY(this.sequence[i + 1]);
      const isRising = this.sequence[i + 1] > this.sequence[i];

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.lineWidth = 2.2;
      ctx.strokeStyle = isRising ? 'rgba(245, 158, 11, 0.95)' : 'rgba(56, 189, 248, 0.85)';
      ctx.shadowColor = isRising ? 'rgba(245, 158, 11, 0.6)' : 'rgba(56, 189, 248, 0.4)';
      ctx.shadowBlur = 8;
      ctx.stroke();
    }
    ctx.shadowBlur = 0;

    // 标出最高峰值 (Peak Indicator)
    if (this.stats.peakStep <= maxVisibleStep) {
      const px = getX(this.stats.peakStep);
      const py = getY(this.stats.peakValue);

      ctx.beginPath();
      ctx.arc(px, py, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#f59e0b';
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.shadowBlur = 0;

      // 文本标签
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.fillText(`Peak: ${this.stats.peakValue.toLocaleString()} (Step ${this.stats.peakStep})`, px - 35, py - 12);
    }

    // 绘制当前飞行粒子游标
    if (this.sequence.length > 0) {
      const curX = getX(maxVisibleStep);
      const curY = getY(this.sequence[maxVisibleStep]);
      const curVal = this.sequence[maxVisibleStep];

      // 发光脉冲圈
      const pulseR = 8 + Math.sin(this.pulsePhase) * 3;
      ctx.beginPath();
      ctx.arc(curX, curY, pulseR, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // 实体光核
      ctx.beginPath();
      ctx.arc(curX, curY, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 14;
      ctx.fill();
      ctx.shadowBlur = 0;

      // 悬浮当前值标签
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      const labelText = `n = ${curVal.toLocaleString()} (Step ${maxVisibleStep}/${maxSteps})`;
      ctx.font = '11px Inter, monospace';
      const tw = ctx.measureText(labelText).width;
      ctx.fillRect(curX - tw / 2 - 8, curY + 12, tw + 16, 22);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
      ctx.strokeRect(curX - tw / 2 - 8, curY + 12, tw + 16, 22);
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(labelText, curX - tw / 2, curY + 27);
    }
  }

  renderTree(ctx, w, h) {
    const centerX = w / 2 + this.treePanX;
    const centerY = h / 2 + this.treePanY;
    const zoom = this.treeZoom;

    // 绘制连线
    for (const link of this.treeLinks) {
      const sx = centerX + link.source.x * zoom;
      const sy = centerY + link.source.y * zoom;
      const tx = centerX + link.target.x * zoom;
      const ty = centerY + link.target.y * zoom;

      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(tx, ty);
      ctx.lineWidth = Math.max(1, (1.8 - link.target.depth * 0.08) * Math.min(1.5, zoom));
      ctx.strokeStyle = link.type === 'odd' ? 'rgba(245, 158, 11, 0.75)' : 'rgba(56, 189, 248, 0.55)';
      ctx.stroke();
    }

    // 绘制节点
    for (const node of this.treeNodes) {
      const nx = centerX + node.x * zoom;
      const ny = centerY + node.y * zoom;

      // 仅在视口范围内绘制
      if (nx < -50 || nx > w + 50 || ny < -50 || ny > h + 50) continue;

      const isRoot = (node.val === 1);
      const isOddBranch = (node.type === 'odd');
      const radius = isRoot ? 6.5 : Math.max(2.5, (4.5 - node.depth * 0.15) * Math.min(1.4, zoom));

      ctx.beginPath();
      ctx.arc(nx, ny, radius, 0, Math.PI * 2);
      if (isRoot) {
        ctx.fillStyle = '#ef4444';
      } else if (isOddBranch) {
        ctx.fillStyle = '#f59e0b';
      } else {
        ctx.fillStyle = '#38bdf8';
      }
      ctx.fill();

      // LOD: 当缩放较大时绘制节点数值
      if (zoom > 0.85 && node.depth <= 8) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.font = `${Math.floor(10 * Math.min(1.2, zoom))}px Inter, monospace`;
        ctx.fillText(node.val, nx + radius + 3, ny + 3);
      }
    }

    // 绘制鼠标悬停节点 Tooltip
    if (this.hoveredNode) {
      const node = this.hoveredNode;
      const hx = centerX + node.x * zoom;
      const hy = centerY + node.y * zoom;

      ctx.beginPath();
      ctx.arc(hx, hy, 8 * Math.max(1, zoom), 0, Math.PI * 2);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      const tipText = `Val: ${node.val} | Depth: ${node.depth} (${node.type === 'odd' ? 'Odd: (n-1)/3' : 'Even: 2n'})`;
      ctx.font = '11px Inter, sans-serif';
      const tw = ctx.measureText(tipText).width;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.fillRect(hx - tw / 2 - 8, hy - 32, tw + 16, 24);
      ctx.strokeStyle = '#38bdf8';
      ctx.strokeRect(hx - tw / 2 - 8, hy - 32, tw + 16, 24);
      ctx.fillStyle = '#ffffff';
      ctx.fillText(tipText, hx - tw / 2, hy - 16);
    }
  }

  updateDashboardUI() {
    const elSeed = document.getElementById('stat-collatz-seed');
    const elSteps = document.getElementById('stat-collatz-steps');
    const elPeak = document.getElementById('stat-collatz-peak');
    const elRatio = document.getElementById('stat-collatz-ratio');
    const elOddRatio = document.getElementById('stat-collatz-odd-ratio');

    if (elSeed) elSeed.textContent = this.seed.toLocaleString();
    if (elSteps) elSteps.textContent = this.stats.totalSteps.toLocaleString();
    if (elPeak) elPeak.textContent = this.stats.peakValue.toLocaleString();
    if (elRatio) elRatio.textContent = this.stats.expansionRatio.toFixed(2) + 'x';
    if (elOddRatio && this.stats.totalSteps > 0) {
      const pct = (this.stats.oddSteps / this.stats.totalSteps * 100).toFixed(1);
      elOddRatio.textContent = `${pct}% (${this.stats.oddSteps}/${this.stats.evenSteps})`;
    }

    // 更新 HUD
    const hudSeed = document.getElementById('hud-collatz-seed');
    const hudSteps = document.getElementById('hud-collatz-steps');
    const hudPeak = document.getElementById('hud-collatz-peak');
    if (hudSeed) hudSeed.textContent = this.seed.toLocaleString();
    if (hudSteps) hudSteps.textContent = this.stats.totalSteps.toLocaleString();
    if (hudPeak) hudPeak.textContent = this.stats.peakValue.toLocaleString();
  }
}

window.CollatzVisualizer = CollatzVisualizer;
