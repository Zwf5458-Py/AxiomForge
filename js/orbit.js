/**
 * 广义复平面动力学轨道探测器 (Multibrot Orbit Tracer)
 * 实时追踪与可视化:
 * z_{n+1} = z^d + c (z_0 = 0, z_1 = c)
 * 验证轨道在复平面上是有界收敛/周期闭合，还是逃逸飞向无穷！
 */

class MandelbrotOrbitTracer {
  constructor(overlayCanvasId) {
    this.canvas = document.getElementById(overlayCanvasId);
    this.ctx = this.canvas.getContext('2d');
    this.enabled = true;
    this.maxSteps = 40;
    this.currentC = { re: 0.0, im: 0.0 };
    this.orbitPoints = [];
    this.escaped = false;
    this.escapeStep = -1;
  }

  resize(width, height) {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    this.canvas.width = Math.max(300, width * dpr);
    this.canvas.height = Math.max(300, height * dpr);
    this.ctx.scale(dpr, dpr);
    this.width = width;
    this.height = height;
  }

  /**
   * 迭代计算复数轨迹 (支持任意实数幂次 power)
   */
  computeOrbit(cRe, cIm, maxSteps = 40, power = 5.08) {
    this.currentC = { re: cRe, im: cIm };
    this.orbitPoints = [];
    this.escaped = false;
    this.escapeStep = -1;

    // z_0 = 0
    this.orbitPoints.push({ re: 0.0, im: 0.0 });
    // z_1 = c
    let zr = cRe;
    let zi = cIm;
    this.orbitPoints.push({ re: zr, im: zi });

    for (let i = 2; i <= maxSteps; i++) {
      let nextZr, nextZi;

      if (power === 2.0) {
        nextZr = zr * zr - zi * zi + cRe;
        nextZi = 2.0 * zr * zi + cIm;
      } else {
        const r2 = zr * zr + zi * zi;
        if (r2 < 0.000001) {
          nextZr = cRe;
          nextZi = cIm;
        } else {
          const r = Math.sqrt(r2);
          const theta = Math.atan2(zi, zr);
          const rPow = Math.pow(r, power);
          nextZr = rPow * Math.cos(power * theta) + cRe;
          nextZi = rPow * Math.sin(power * theta) + cIm;
        }
      }

      zr = nextZr;
      zi = nextZi;
      this.orbitPoints.push({ re: zr, im: zi });

      // 逃逸判定: 模长平方 > 16.0
      if (zr * zr + zi * zi > 16.0) {
        this.escaped = true;
        this.escapeStep = i;
        break;
      }
    }

    return {
      points: this.orbitPoints,
      escaped: this.escaped,
      escapeStep: this.escapeStep
    };
  }

  /**
   * 复平面坐标映射至屏幕像素 (与 WebGL 完全对齐)
   */
  complexToScreen(re, im, viewCenter, viewZoom) {
    const aspect = this.width / this.height;
    const viewSpan = 3.6 / viewZoom;
    const spanX = aspect >= 1.0 ? viewSpan * aspect : viewSpan;
    const spanY = aspect >= 1.0 ? viewSpan : viewSpan / aspect;

    const px = ((re - viewCenter.re) / spanX + 0.5) * this.width;
    const py = (0.5 - (im - viewCenter.im) / spanY) * this.height;
    return { x: px, y: py };
  }

  render(viewCenter, viewZoom) {
    this.ctx.clearRect(0, 0, this.width, this.height);
    if (!this.enabled || this.orbitPoints.length === 0) return;

    this.ctx.beginPath();
    for (let i = 0; i < this.orbitPoints.length; i++) {
      const pt = this.orbitPoints[i];
      const screenPos = this.complexToScreen(pt.re, pt.im, viewCenter, viewZoom);
      if (i === 0) {
        this.ctx.moveTo(screenPos.x, screenPos.y);
      } else {
        this.ctx.lineTo(screenPos.x, screenPos.y);
      }
    }

    this.ctx.strokeStyle = this.escaped ? 'rgba(244, 63, 94, 0.85)' : 'rgba(56, 189, 248, 0.85)';
    this.ctx.lineWidth = 1.5;
    this.ctx.setLineDash([4, 2]);
    this.ctx.stroke();
    this.ctx.setLineDash([]);

    for (let i = 0; i < this.orbitPoints.length; i++) {
      const pt = this.orbitPoints[i];
      const screenPos = this.complexToScreen(pt.re, pt.im, viewCenter, viewZoom);

      this.ctx.beginPath();
      const radius = (i === 0 || i === 1) ? 4.5 : 2.5;
      this.ctx.arc(screenPos.x, screenPos.y, radius, 0, Math.PI * 2);

      if (i === 0) {
        this.ctx.fillStyle = '#10b981'; // z0 = 0 原点
      } else if (i === 1) {
        this.ctx.fillStyle = '#f59e0b'; // z1 = c 采样点
      } else if (i === this.orbitPoints.length - 1 && this.escaped) {
        this.ctx.fillStyle = '#f43f5e'; // 逃逸点
      } else {
        this.ctx.fillStyle = this.escaped ? '#fb7185' : '#38bdf8';
      }
      this.ctx.fill();
    }
  }

  toggle(enabled) {
    this.enabled = enabled;
    if (!enabled) {
      this.ctx.clearRect(0, 0, this.width, this.height);
    }
  }
}

window.MandelbrotOrbitTracer = MandelbrotOrbitTracer;
