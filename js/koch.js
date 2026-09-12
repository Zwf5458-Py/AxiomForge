/**
 * 科赫雪花 (Koch Snowflake) 动画与数学模拟引擎
 * 
 * 核心特性:
 * 1. 递归分形几何生成，完美安全边距自适应，绝不裁剪边角
 * 2. 连续形变与等边三角形凸起萌芽动画 (Smooth Morphing)
 * 3. 严格实时的数学指标仪表盘 (线段数、周长发散度、面积收敛极限 8/5)
 * 4. 画布平移、缩放与一键适应全屏
 */

class KochSnowflake {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    
    // 视口与缩放
    this.scale = 1.0;
    this.panX = 0;
    this.panY = 0;
    this.isDragging = false;
    this.startX = 0;
    this.startY = 0;
    
    // 动画状态
    this.maxOrder = 5;
    this.currentOrder = 3;   // 默认展示完整清晰的第 3/4 阶雪花全貌
    this.growth = 0.0;
    this.isPlaying = true;
    this.playSpeed = 0.8;
    this.lastFrameTime = performance.now();
    
    // 视觉主题
    this.colorTheme = 'cyan-glow';
    
    this.initCanvas();
    this.bindEvents();
  }

  initCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.scale(dpr, dpr);
    this.width = rect.width;
    this.height = rect.height;
  }

  resize() {
    this.initCanvas();
    this.render();
  }

  bindEvents() {
    this.canvas.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.startX = e.clientX - this.panX;
      this.startY = e.clientY - this.panY;
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      this.panX = e.clientX - this.startX;
      this.panY = e.clientY - this.startY;
      this.render();
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    // 鼠标滚轮平滑缩放 (基点严格锁定在图形中心，绝不发生偏移)
    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = Math.max(-40, Math.min(40, e.deltaY));
      const factor = Math.exp(-delta * 0.002);
      this.zoomBy(factor);
    }, { passive: false });
  }

  /**
   * 以图形中心为基点缩放
   */
  zoomBy(factor) {
    this.scale *= factor;
    this.scale = Math.max(0.2, Math.min(40.0, this.scale));
    // 保持图形中心基点固定
    this.render();
  }

  resetView() {
    this.scale = 1.0;
    this.panX = 0;
    this.panY = 0;
    this.render();
  }

  getSnowflakeSegments(order, growth) {
    const cx = this.width / 2;
    const cy = this.height / 2 + 10;
    // 半径设为 0.31，预留 4/3 倍外凸三角形生长的足够安全外延，保证完整全貌不切边
    const radius = Math.min(this.width, this.height) * 0.31;
    
    // 正三角形的三个顶点
    const p0 = { x: cx, y: cy - radius };
    const p1 = { x: cx + radius * Math.sqrt(3) / 2, y: cy + radius / 2 };
    const p2 = { x: cx - radius * Math.sqrt(3) / 2, y: cy + radius / 2 };
    
    const initialEdges = [
      { a: p0, b: p1 },
      { a: p1, b: p2 },
      { a: p2, b: p0 }
    ];

    let segments = initialEdges;

    for (let i = 0; i < order; i++) {
      const nextSegments = [];
      const currentGrowth = (i === order - 1) ? growth : 1.0;
      
      for (const edge of segments) {
        nextSegments.push(...this.subdivideEdge(edge.a, edge.b, currentGrowth));
      }
      segments = nextSegments;
    }

    return segments;
  }

  subdivideEdge(p1, p2, growth) {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;

    const a = {
      x: p1.x + dx / 3,
      y: p1.y + dy / 3
    };
    const b = {
      x: p1.x + (2 * dx) / 3,
      y: p1.y + (2 * dy) / 3
    };

    const midX = (a.x + b.x) / 2;
    const midY = (a.y + b.y) / 2;
    const subDx = b.x - a.x;
    const subDy = b.y - a.y;

    const nx = subDy;
    const ny = -subDx;

    const heightFactor = (Math.sqrt(3) / 2) * growth;
    const peak = {
      x: midX + nx * heightFactor,
      y: midY + ny * heightFactor
    };

    return [
      { a: p1, b: a },
      { a: a, b: peak },
      { a: peak, b: b },
      { a: b, b: p2 }
    ];
  }

  update(timestamp) {
    if (!this.isPlaying) return;

    const delta = (timestamp - this.lastFrameTime) / 1000;
    this.lastFrameTime = timestamp;

    this.growth += delta * 0.6 * this.playSpeed;
    if (this.growth >= 1.0) {
      this.growth = 0.0;
      this.currentOrder++;
      if (this.currentOrder > this.maxOrder) {
        this.currentOrder = 0;
      }
    }

    this.render();
  }

  render() {
    this.ctx.save();
    this.ctx.clearRect(0, 0, this.width, this.height);

    this.ctx.translate(this.panX, this.panY);
    this.ctx.translate(this.width / 2, this.height / 2);
    this.ctx.scale(this.scale, this.scale);
    this.ctx.translate(-this.width / 2, -this.height / 2);

    const segments = (this.currentOrder === 0 && this.growth === 0) 
      ? this.getSnowflakeSegments(0, 0)
      : this.getSnowflakeSegments(Math.max(1, this.currentOrder + 1), this.growth);

    this.ctx.beginPath();
    if (segments.length > 0) {
      this.ctx.moveTo(segments[0].a.x, segments[0].a.y);
      for (let i = 0; i < segments.length; i++) {
        this.ctx.lineTo(segments[i].b.x, segments[i].b.y);
      }
    }
    this.ctx.closePath();

    if (this.colorTheme === 'cyan-glow') {
      const gradient = this.ctx.createRadialGradient(
        this.width / 2, this.height / 2, 20,
        this.width / 2, this.height / 2, this.width * 0.4
      );
      gradient.addColorStop(0, 'rgba(56, 189, 248, 0.22)');
      gradient.addColorStop(0.7, 'rgba(14, 165, 233, 0.08)');
      gradient.addColorStop(1, 'rgba(2, 132, 199, 0.02)');
      this.ctx.fillStyle = gradient;
      this.ctx.fill();

      this.ctx.strokeStyle = '#38bdf8';
      this.ctx.lineWidth = Math.max(1, 2 / this.scale);
      this.ctx.shadowColor = '#38bdf8';
      this.ctx.shadowBlur = 12;
      this.ctx.stroke();
    } else if (this.colorTheme === 'aurora') {
      const gradient = this.ctx.createLinearGradient(0, 0, this.width, this.height);
      gradient.addColorStop(0, 'rgba(168, 85, 247, 0.25)');
      gradient.addColorStop(0.5, 'rgba(56, 189, 248, 0.15)');
      gradient.addColorStop(1, 'rgba(16, 185, 129, 0.25)');
      this.ctx.fillStyle = gradient;
      this.ctx.fill();

      this.ctx.strokeStyle = '#a855f7';
      this.ctx.lineWidth = Math.max(1, 2 / this.scale);
      this.ctx.shadowColor = '#a855f7';
      this.ctx.shadowBlur = 14;
      this.ctx.stroke();
    } else {
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      this.ctx.fill();
      this.ctx.strokeStyle = '#f8fafc';
      this.ctx.lineWidth = Math.max(0.8, 1.5 / this.scale);
      this.ctx.shadowBlur = 0;
      this.ctx.stroke();
    }

    this.ctx.restore();
    this.updateStats();
  }

  updateStats() {
    const N = this.currentOrder;
    const effN = N + this.growth;
    
    const segmentCount = Math.round(3 * Math.pow(4, effN));
    const perimeterRatio = 3 * Math.pow(4 / 3, effN);
    const areaRatio = 1.0 + 0.6 * (1.0 - Math.pow(4 / 9, effN));
    
    const limitDiff = (1.600 - areaRatio).toFixed(5);
    const limitPercent = Math.min(100, (areaRatio / 1.600) * 100).toFixed(1);

    const elOrder = document.getElementById('stat-order');
    const elSegments = document.getElementById('stat-segments');
    const elPerimeter = document.getElementById('stat-perimeter');
    const elArea = document.getElementById('stat-area');
    const elAreaBar = document.getElementById('stat-area-bar');
    const elAreaDiff = document.getElementById('stat-area-diff');
    const elDim = document.getElementById('stat-dimension');
    const sliderOrder = document.getElementById('koch-order-slider');
    const valOrder = document.getElementById('koch-order-val');

    if (elOrder) elOrder.textContent = `第 ${N} 阶 (生长进度 ${(this.growth * 100).toFixed(0)}%)`;
    if (elSegments) elSegments.textContent = segmentCount.toLocaleString();
    if (elPerimeter) elPerimeter.textContent = perimeterRatio.toFixed(3) + ' × P₀';
    if (elArea) elArea.textContent = areaRatio.toFixed(4) + ' × A₀';
    if (elAreaBar) elAreaBar.style.width = `${limitPercent}%`;
    if (elAreaDiff) elAreaDiff.textContent = `距理论极限 8/5(1.6) 差: ${limitDiff}`;
    if (elDim) elDim.textContent = 'D ≈ 1.26186';
    if (sliderOrder && !this.isPlaying) sliderOrder.value = N;
    if (valOrder) valOrder.textContent = N;
  }

  setOrder(order) {
    this.currentOrder = Math.max(0, Math.min(this.maxOrder, order));
    this.growth = 0.0;
    this.render();
  }

  setTheme(theme) {
    this.colorTheme = theme;
    this.render();
  }
}

window.KochSnowflake = KochSnowflake;
