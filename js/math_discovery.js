/**
 * AI 数学发现与 Cap Set 高维组合空间可视化系统 (FunSearch Visualizer)
 * =================================================================
 * 负责有限域 F_3^3 离散几何的三维投影渲染、三点共线实时碰撞检测、
 * 以及演化生成的 Python 优先级代码的动态联动。
 */

class CapSetVisualizer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    
    // 旋转视角状态
    this.yaw = 0.6;
    this.pitch = 0.4;
    this.isDragging = false;
    this.lastMouseX = 0;
    this.lastMouseY = 0;
    this.autoRotate = true;

    // F_3^3 的所有 27 个点及当前选中的 Cap Set 点
    this.allPoints = [];
    for (let x = 0; x < 3; x++) {
      for (let y = 0; y < 3; y++) {
        for (let z = 0; z < 3; z++) {
          this.allPoints.push([x, y, z]);
        }
      }
    }

    // 默认加载由 FunSearch 演化出的 9 点最优 Cap Set
    this.selectedPoints = [
      [1, 2, 1], [2, 1, 2], [1, 2, 0], [0, 2, 1],
      [1, 1, 2], [2, 1, 1], [2, 0, 2], [1, 0, 2], [2, 0, 1]
    ];

    this.currentCode = `def priority(p: tuple, n: int) -> float:
    # FunSearch 演化程序：汉明权重与二阶坐标交叉项
    c0 = p.count(0)
    c1 = p.count(1)
    c2 = p.count(2)
    score = c0 * -1.811 + c1 * 1.496 + c2 * 0.935
    for i in range(len(p) - 1):
        score += (p[i] ^ p[i+1]) * 1.785
    return float(score)`;

    this.initEvents();
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

  project3D(x, y, z, cx, cy, scale) {
    // 居中坐标归一化到 [-1, 1]
    const nx = (x - 1);
    const ny = (y - 1);
    const nz = (z - 1);

    // 绕 Y 轴 (yaw)
    const x1 = nx * Math.cos(this.yaw) + nz * Math.sin(this.yaw);
    const z1 = -nx * Math.sin(this.yaw) + nz * Math.cos(this.yaw);

    // 绕 X 轴 (pitch)
    const y2 = ny * Math.cos(this.pitch) - z1 * Math.sin(this.pitch);
    const z2 = ny * Math.sin(this.pitch) + z1 * Math.cos(this.pitch);

    // 弱透视投影
    const dist = 4.0;
    const fov = dist / (dist + z2);

    return {
      x: cx + x1 * scale * fov,
      y: cy + y2 * scale * fov,
      depth: z2,
      rawPoint: [x, y, z]
    };
  }

  render(timestamp) {
    if (this.autoRotate) {
      this.yaw += 0.005;
    }

    const dpr = window.devicePixelRatio || 1;
    const w = this.canvas.width / dpr;
    const h = this.canvas.height / dpr;
    const cx = w / 2;
    const cy = h / 2;
    const scale = Math.min(w, h) * 0.28;

    this.ctx.clearRect(0, 0, w, h);

    // 投影所有 27 个点
    const projected = this.allPoints.map(([x, y, z]) => this.project3D(x, y, z, cx, cy, scale));

    // 按深度排序（从远到近绘制）
    projected.sort((a, b) => b.depth - a.depth);

    // 绘制外层立方体骨架连接线（邻域为 1 的离散网格线）
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
    this.ctx.lineWidth = 1;

    for (let i = 0; i < projected.length; i++) {
      for (let j = i + 1; j < projected.length; j++) {
        const p1 = projected[i].rawPoint;
        const p2 = projected[j].rawPoint;
        const dist = Math.abs(p1[0]-p2[0]) + Math.abs(p1[1]-p2[1]) + Math.abs(p1[2]-p2[2]);
        if (dist === 1) {
          this.ctx.beginPath();
          this.ctx.moveTo(projected[i].x, projected[i].y);
          this.ctx.lineTo(projected[j].x, projected[j].y);
          this.ctx.stroke();
        }
      }
    }

    const selectedSet = new Set(this.selectedPoints.map(p => `${p[0]},${p[1]},${p[2]}`));

    // 绘制点
    for (const pt of projected) {
      const isSelected = selectedSet.has(`${pt.rawPoint[0]},${pt.rawPoint[1]},${pt.rawPoint[2]}`);

      if (isSelected) {
        // Cap Set 点：璀璨金色荧光光晕
        const grad = this.ctx.createRadialGradient(pt.x, pt.y, 1, pt.x, pt.y, 14);
        grad.addColorStop(0, '#fef08a');
        grad.addColorStop(0.4, '#eab308');
        grad.addColorStop(1, 'rgba(234, 179, 8, 0)');

        this.ctx.fillStyle = grad;
        this.ctx.beginPath();
        this.ctx.arc(pt.x, pt.y, 14, 0, Math.PI * 2);
        this.ctx.fill();

        // 实体核心
        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(pt.x, pt.y, 4.5, 0, Math.PI * 2);
        this.ctx.fill();
      } else {
        // 普通未选中点：冷灰半透明
        this.ctx.fillStyle = 'rgba(148, 163, 184, 0.35)';
        this.ctx.beginPath();
        this.ctx.arc(pt.x, pt.y, 2.5, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }
  }

  loadCapSetData(data) {
    if (data && Array.isArray(data.points)) {
      this.selectedPoints = data.points;
      if (data.best_code) {
        this.currentCode = data.best_code;
      }
      this.updateUI(data);
    }
  }

  updateUI(data) {
    const codeEl = document.getElementById('funsearch-code-display');
    if (codeEl) {
      codeEl.textContent = this.currentCode;
    }
    const scoreEl = document.getElementById('funsearch-best-score');
    if (scoreEl) {
      scoreEl.textContent = `${this.selectedPoints.length} / 9`;
    }
    const countEl = document.getElementById('funsearch-points-count');
    if (countEl) {
      countEl.textContent = `${this.selectedPoints.length} 点`;
    }
  }
}
