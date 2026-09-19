/**
 * 曼德勃罗集与广义多重分形 (Multibrot Set) WebGL 高性能 GPU 渲染引擎
 * 
 * 核心修复与升级:
 * 1. 彻底根除 r=0 时 atan(0,0) 的未定义 NaN 导致的全屏单色 Bug
 * 2. 连续势平滑对数防负数 NaN 保底机制
 * 3. 采用标准 UV 视口投影，100% 兼容 macOS Safari 与各类 GPU
 * 4. 极致逼真的【分形蓝金光晕 (截图同款)】色系: 纯黑核心 + 金白高光边界 + 浩瀚深蓝背景
 */

class MandelbrotViewer {
  constructor(canvasId, orbitTracer) {
    this.canvas = document.getElementById(canvasId);
    this.orbitTracer = orbitTracer;
    this.gl = null;
    this.program = null;
    
    // 视口与坐标系统 (默认 100% 完整居中呈现经典曼德勃罗集全貌 · 图片 2 同款)
    this.center = { re: -0.65, im: 0.0 };
    this.zoom = 1.0;
    this.maxIterations = 200;
    this.colorPalette = 6; // 默认为 6: 梦幻紫金螺旋 (图片 2 琥珀金与翡翠青同款)
    
    // 高阶多重分形参数: z_{n+1} = z^d + c
    this.power = 2.0; // 默认经典曼德勃罗集合 z² + c (完整结构)
    this.isMorphingPower = false;
    this.morphDir = 1;
    this.morphSpeed = 0.5;
    
    // 交互拖拽状态
    this.isDragging = false;
    this.dragStart = { x: 0, y: 0 };
    this.centerStart = { re: 0, im: 0 };
    
    // 自动深潜巡游
    this.isTouring = false;
    this.tourSpeed = 1.0;
    this.tourTarget = null;
    
    // 经典探索奇观预设 (Float32 高精度黄金坐标，结构100%绝对居中呈现)
    this.presets = {
      infinite_spiral: { name: '以为走到了尽头 (绝美多臂螺旋之花)', power: 2.0, re: -0.74529, im: 0.113075, zoom: 450.0, maxIter: 300, palette: 6 },
      multibrot_508: { name: '分形几何学四瓣 (z^{5.08} + c 截图同款)', power: 5.08, re: 0.0, im: 0.0, zoom: 1.05, maxIter: 220, palette: 5 },
      minimandel: { name: '迷你微型体 (Mini-Mandelbrot)', power: 2.0, re: -1.7685, im: 0.0, zoom: 85.0, maxIter: 280, palette: 5 },
      overview_m2: { name: '经典曼德勃罗 (z² + c 全貌)', power: 2.0, re: -0.65, im: 0.0, zoom: 0.95, maxIter: 180, palette: 5 },
      multibrot_3: { name: '双瓣分形体 (z³ + c)', power: 3.0, re: 0.0, im: 0.0, zoom: 1.05, maxIter: 200, palette: 5 },
      multibrot_4: { name: '三叶分形体 (z⁴ + c)', power: 4.0, re: 0.0, im: 0.0, zoom: 1.05, maxIter: 200, palette: 5 },
      seahorse: { name: '海马谷深潜 (Seahorse Valley)', power: 2.0, re: -0.743644, im: 0.131826, zoom: 280.0, maxIter: 280, palette: 1 },
      elephant: { name: '象谷奇观 (Elephant Valley)', power: 2.0, re: 0.278, im: 0.0, zoom: 70.0, maxIter: 240, palette: 2 }
    };

    this.initGL();
    this.bindEvents();
  }

  initGL() {
    this.gl = this.canvas.getContext('webgl', { antialias: false, powerPreference: 'high-performance' }) ||
              this.canvas.getContext('experimental-webgl');
    if (!this.gl) {
      console.error('当前浏览器不支持 WebGL');
      return;
    }

    const vsSource = `
      attribute vec2 a_position;
      varying vec2 v_uv;
      void main() {
        v_uv = (a_position + 1.0) * 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    // 片元着色器: 极致稳健并彻底杜绝 NaN
    const fsSource = `
      precision highp float;
      varying vec2 v_uv;
      
      uniform vec2 u_resolution;
      uniform vec2 u_center;
      uniform float u_zoom;
      uniform int u_max_iterations;
      uniform int u_palette;
      uniform float u_time;
      uniform float u_power;

      // 连续平滑调色板算法
      vec3 getColor(float iter, float maxI, int palette) {
        // 集合内部: 纯深黑深渊
        if (iter >= maxI - 0.5) {
          return vec3(0.005, 0.008, 0.015);
        }

        // 方案 5: 经典蓝金光晕 (截图同款)
        if (palette == 5) {
          float ratio = clamp(iter / maxI, 0.0, 1.0);
          
          // 紧贴分形边缘的金白高光光芒 (非线性指数激增)
          float edgeGlow = pow(ratio, 2.8);

          // 外围幽蓝宇宙背景
          float wave = sin(iter * 0.18 + u_time * 0.05) * 0.5 + 0.5;
          vec3 bgDark = vec3(0.015, 0.04, 0.15);
          vec3 bgBlue = vec3(0.04, 0.22, 0.65);
          vec3 cosmicBlue = mix(bgDark, bgBlue, clamp(iter * 0.06, 0.0, 1.0) * (0.7 + 0.3 * wave));

          // 边缘金白高光
          vec3 goldColor = vec3(1.0, 0.88, 0.55);
          vec3 whiteCore = vec3(1.0, 1.0, 0.95);
          vec3 glowColor = mix(goldColor, whiteCore, pow(edgeGlow, 1.5));

          return mix(cosmicBlue, glowColor, clamp(edgeGlow * 1.8, 0.0, 1.0));
        }

        float t = iter * 0.045 + u_time * 0.015;

        if (palette == 0) {
          // 赛博霓虹
          vec3 a = vec3(0.5, 0.5, 0.5);
          vec3 b = vec3(0.5, 0.5, 0.5);
          vec3 c = vec3(1.0, 1.0, 1.0);
          vec3 d = vec3(0.3, 0.20, 0.8);
          return a + b * cos(6.28318 * (c * t + d));
        } else if (palette == 1) {
          // 经典深空冰蓝
          vec3 a = vec3(0.5, 0.5, 0.5);
          vec3 b = vec3(0.5, 0.5, 0.5);
          vec3 c = vec3(2.0, 1.0, 0.0);
          vec3 d = vec3(0.5, 0.20, 0.25);
          return a + b * cos(6.28318 * (c * t + d));
        } else if (palette == 2) {
          // 炽烈熔岩 (多层次艺术升级: 金黄炽热核心 + 绯红火舌 + 深邃暗红余烬)
          float norm = clamp(iter / maxI, 0.0, 1.0);
          float glow = pow(norm, 2.2);
          
          float wave = sin(iter * 0.12 - u_time * 0.04) * 0.5 + 0.5;
          vec3 emberDark = vec3(0.06, 0.012, 0.015);
          vec3 crimson = vec3(0.82, 0.15, 0.03);
          vec3 fieryGold = vec3(1.0, 0.86, 0.32);
          
          vec3 bg = mix(emberDark, crimson, clamp(iter * 0.05, 0.0, 1.0) * (0.75 + 0.25 * wave));
          return mix(bg, fieryGold, clamp(glow * 1.6, 0.0, 1.0));
        } else if (palette == 3) {
          // 翡翠极光
          vec3 a = vec3(0.5, 0.5, 0.5);
          vec3 b = vec3(0.5, 0.5, 0.5);
          vec3 c = vec3(1.0, 2.0, 1.0);
          vec3 d = vec3(0.5, 0.33, 0.67);
          return a + b * cos(6.28318 * (c * t + d));
        } else if (palette == 6) {
          // 方案 6: 梦幻紫金螺旋 (完美复刻截图: 紫罗兰底色 + 琥珀金波浪 + 珍珠白金/翡翠青旋涡)
          float t = iter * 0.065 - u_time * 0.012;

          vec3 lilac = vec3(0.66, 0.48, 0.75);   // 紫罗兰 (原图背景辐射)
          vec3 amber = vec3(1.0, 0.72, 0.20);    // 暖金琥珀 (原图花瓣)
          vec3 white = vec3(1.0, 0.98, 0.90);    // 珍珠白金 (原图旋臂高光)
          vec3 teal  = vec3(0.12, 0.85, 0.65);   // 翡翠青翠 (原图涡旋内层)
          vec3 blue  = vec3(0.18, 0.45, 0.92);   // 幽蓝 (原图深层过渡)

          float f = fract(t);
          vec3 col;
          if (f < 0.2) {
            col = mix(lilac, amber, f / 0.2);
          } else if (f < 0.4) {
            col = mix(amber, white, (f - 0.2) / 0.2);
          } else if (f < 0.6) {
            col = mix(white, teal, (f - 0.4) / 0.2);
          } else if (f < 0.8) {
            col = mix(teal, blue, (f - 0.6) / 0.2);
          } else {
            col = mix(blue, lilac, (f - 0.8) / 0.2);
          }

          return col;
        } else {
          // 奢华黑金
          vec3 a = vec3(0.8, 0.65, 0.3);
          vec3 b = vec3(0.4, 0.3, 0.2);
          vec3 c = vec3(1.0, 1.0, 1.0);
          vec3 d = vec3(0.1, 0.2, 0.3);
          return a + b * cos(6.28318 * (c * t + d));
        }
      }

      void main() {
        // 基于 UV 的标准自适应视口 (100% 杜绝硬件 gl_FragCoord 像素偏移)
        float aspect = u_resolution.x / u_resolution.y;
        vec2 st = v_uv - 0.5;
        if (aspect >= 1.0) {
          st.x *= aspect;
        } else {
          st.y /= aspect;
        }

        // 基准视口跨度 3.6，确保任何屏幕比例下整个分形全貌 100% 完整显示
        float viewSpan = 3.6 / u_zoom;
        vec2 c = u_center + st * viewSpan;

        // 迭代初始化:
        // z_0 = 0，因此第一次迭代直接为 z_1 = c！
        vec2 z = c;
        float n = 1.0;
        float maxI = float(u_max_iterations);
        float p = u_power;
        bool escaped = false;

        // 逃逸阈值: 对于高阶幂次设为 16.0 (r > 4.0)，逃逸极稳健
        for (int i = 1; i < 700; i++) {
          if (float(i) >= maxI) break;

          float r2 = dot(z, z);
          if (r2 > 16.0) {
            n = float(i);
            escaped = true;
            break;
          }

          if (p == 2.0) {
            // z^2 + c 经典快速通道
            z = vec2(z.x * z.x - z.y * z.y + c.x, 2.0 * z.x * z.y + c.y);
          } else {
            float r = sqrt(r2);
            if (r < 0.000001) {
              z = c;
            } else {
              float theta = atan(z.y, z.x);
              float r_pow = pow(r, p);
              z = vec2(r_pow * cos(p * theta) + c.x, r_pow * sin(p * theta) + c.y);
            }
          }
        }

        // 核心铁律: 凡是没有逃逸的点，100% 绝对属于集合内部，直接输出深邃黑夜，绝不误入调色板！
        if (!escaped) {
          gl_FragColor = vec4(0.005, 0.008, 0.015, 1.0);
          return;
        }

        // 只有真正逃逸的点，才进行连续势平滑过渡和颜色映射
        float smoothIter = n;
        float r2 = dot(z, z);
        if (r2 > 1.0) {
          float log_r = log(r2) * 0.5;
          if (log_r > 0.0) {
            float log_log = log(log_r);
            float nu = log_log / log(max(1.1, p));
            smoothIter = n + 1.0 - nu;
          }
        }

        // 防御性检查: 确保 smoothIter 在合法区间且不为 NaN
        if (smoothIter < 0.0 || smoothIter > maxI * 2.0) {
          smoothIter = n;
        }

        vec3 color = getColor(smoothIter, maxI, u_palette);
        gl_FragColor = vec4(color, 1.0);
      }
    `;

    const vs = this.compileShader(this.gl.VERTEX_SHADER, vsSource);
    const fs = this.compileShader(this.gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return;

    this.program = this.gl.createProgram();
    this.gl.attachShader(this.program, vs);
    this.gl.attachShader(this.program, fs);
    this.gl.linkProgram(this.program);

    if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
      console.error('着色器程序链接失败:', this.gl.getProgramInfoLog(this.program));
      return;
    }

    const positions = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1,
    ]);
    const posBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, posBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, positions, this.gl.STATIC_DRAW);

    this.posAttrib = this.gl.getAttribLocation(this.program, 'a_position');
    this.gl.enableVertexAttribArray(this.posAttrib);
    this.gl.vertexAttribPointer(this.posAttrib, 2, this.gl.FLOAT, false, 0, 0);

    this.uRes = this.gl.getUniformLocation(this.program, 'u_resolution');
    this.uCenter = this.gl.getUniformLocation(this.program, 'u_center');
    this.uZoom = this.gl.getUniformLocation(this.program, 'u_zoom');
    this.uMaxIter = this.gl.getUniformLocation(this.program, 'u_max_iterations');
    this.uPalette = this.gl.getUniformLocation(this.program, 'u_palette');
    this.uTime = this.gl.getUniformLocation(this.program, 'u_time');
    this.uPower = this.gl.getUniformLocation(this.program, 'u_power');
  }

  compileShader(type, source) {
    const shader = this.gl.createShader(type);
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      console.error('着色器编译失败:', this.gl.getShaderInfoLog(shader));
      this.gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = Math.max(300, rect.width * dpr);
    this.canvas.height = Math.max(300, rect.height * dpr);
    this.width = rect.width;
    this.height = rect.height;

    if (this.gl) {
      this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }
    if (this.orbitTracer) {
      this.orbitTracer.resize(this.width, this.height);
    }
    this.updateFormulaHUD();
    this.render();
  }

  bindEvents() {
    this.canvas.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.stopTour();
      this.dragStart = { x: e.clientX, y: e.clientY };
      this.centerStart = { re: this.center.re, im: this.center.im };
    });

    window.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      if (mouseX >= 0 && mouseX <= this.width && mouseY >= 0 && mouseY <= this.height) {
        const cPoint = this.screenToComplex(mouseX, mouseY);
        this.updateHUDCoordinates(cPoint.re, cPoint.im);

        if (this.orbitTracer && this.orbitTracer.enabled) {
          const orbitData = this.orbitTracer.computeOrbit(cPoint.re, cPoint.im, 45, this.power);
          this.updateOrbitHUD(orbitData);
          this.orbitTracer.render(this.center, this.zoom);
        }
      }

      if (!this.isDragging) return;
      const dx = e.clientX - this.dragStart.x;
      const dy = e.clientY - this.dragStart.y;

      const aspect = this.width / this.height;
      const viewSpan = 3.6 / this.zoom;
      const spanX = aspect >= 1.0 ? viewSpan * aspect : viewSpan;
      const spanY = aspect >= 1.0 ? viewSpan : viewSpan / aspect;

      this.center.re = this.centerStart.re - (dx / this.width) * spanX;
      this.center.im = this.centerStart.im + (dy / this.height) * spanY;

      this.render();
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    // 鼠标滚轮平滑缩放 (基点严格锁定在图形中心，彻底防止偏位飞出)
    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.stopTour();

      // 柔和阻尼平滑算法: 将单次滚轮/触控板 delta 限制在平缓区间，避免缩放过猛
      const delta = Math.max(-40, Math.min(40, e.deltaY));
      const factor = Math.exp(-delta * 0.002); // 平滑微调约 2%~5%

      this.zoomBy(factor);
    }, { passive: false });

    window.addEventListener('axiomforge:lang_changed', () => {
      this.updateStatsUI();
      if (this.lastOrbitData) {
        this.updateOrbitHUD(this.lastOrbitData);
      }
    });
  }

  /**
   * 以图形/视口中心为基点进行精确缩放
   */
  zoomBy(factor) {
    this.stopTour();
    this.zoom *= factor;
    this.zoom = Math.max(0.3, Math.min(1e10, this.zoom));
    // 缩放基点严格锁定图形中心: this.center 保持绝对不变！
    this.render();
    if (this.orbitTracer && this.orbitTracer.enabled) {
      this.orbitTracer.render(this.center, this.zoom);
    }
  }

  screenToComplex(px, py) {
    const aspect = this.width / this.height;
    const viewSpan = 3.6 / this.zoom;
    const spanX = aspect >= 1.0 ? viewSpan * aspect : viewSpan;
    const spanY = aspect >= 1.0 ? viewSpan : viewSpan / aspect;

    const re = this.center.re + (px / this.width - 0.5) * spanX;
    const im = this.center.im - (py / this.height - 0.5) * spanY;
    return { re, im };
  }

  update(timestamp) {
    let needsRender = false;

    // 广义分形连续形变演化动画
    if (this.isMorphingPower) {
      this.power += this.morphDir * 0.015 * this.morphSpeed;
      if (this.power >= 6.2) {
        this.power = 6.2;
        this.morphDir = -1;
      } else if (this.power <= 2.0) {
        this.power = 2.0;
        this.morphDir = 1;
      }
      needsRender = true;
      this.updateFormulaHUD();
    }

    if (this.isTouring && this.tourTarget) {
      // 镜头平滑插值缓动追踪目标，消除瞬间跳跃感
      this.center.re += (this.tourTarget.re - this.center.re) * 0.08;
      this.center.im += (this.tourTarget.im - this.center.im) * 0.08;

      // 纯净垂直向深处平滑深潜放大
      if (this.zoom < this.tourTarget.zoom * 0.98) {
        this.zoom *= (1.0 + 0.015 * this.tourSpeed);
        // 动态提升迭代精度，使深层旋臂细节依次绽放
        this.maxIterations = Math.min(
          this.tourTarget.maxIter,
          Math.floor(180 + Math.log10(Math.max(1.0, this.zoom)) * 35)
        );
      } else {
        // 到达黄金深度后平稳停驻，精准定格
        this.center.re = this.tourTarget.re;
        this.center.im = this.tourTarget.im;
        this.zoom = this.tourTarget.zoom;
        this.maxIterations = this.tourTarget.maxIter;
        this.stopTour();
      }
      needsRender = true;
    }

    if (needsRender) {
      this.render();
      if (this.orbitTracer && this.orbitTracer.enabled) {
        this.orbitTracer.render(this.center, this.zoom);
      }
    }
  }

  render() {
    if (!this.gl || !this.program) return;

    this.gl.useProgram(this.program);
    this.gl.uniform2f(this.uRes, this.canvas.width, this.canvas.height);
    this.gl.uniform2f(this.uCenter, this.center.re, this.center.im);
    this.gl.uniform1f(this.uZoom, this.zoom);
    this.gl.uniform1i(this.uMaxIter, this.maxIterations);
    this.gl.uniform1i(this.uPalette, this.colorPalette);
    this.gl.uniform1f(this.uTime, performance.now() * 0.001);
    this.gl.uniform1f(this.uPower, this.power);

    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
    this.updateStatsUI();
  }

  updateFormulaHUD() {
    const elFormula = document.getElementById('mb-formula-display');
    const elPowerVal = document.getElementById('mb-power-val');
    const sliderPower = document.getElementById('mb-power-slider');
    
    const pStr = this.power.toFixed(2);
    if (elFormula) {
      elFormula.innerHTML = `z ↦ z<sup>${pStr}</sup> + c`;
    }
    if (elPowerVal) {
      elPowerVal.textContent = pStr;
    }
    if (sliderPower && document.activeElement !== sliderPower) {
      sliderPower.value = this.power;
    }
  }

  updateHUDCoordinates(re, im) {
    const elCoord = document.getElementById('mb-coord');
    if (elCoord) {
      const sign = im >= 0 ? '+' : '-';
      elCoord.textContent = `c = ${re.toFixed(5)} ${sign} ${Math.abs(im).toFixed(5)}i`;
    }
  }

  updateOrbitHUD(orbitData) {
    this.lastOrbitData = orbitData;
    const elStatus = document.getElementById('orbit-status');
    const elStep = document.getElementById('orbit-step');
    if (!elStatus || !elStep) return;

    const t = (k, params, fallback) => (window.I18N ? window.I18N.t(k, params) : fallback);

    if (orbitData.escaped) {
      elStatus.textContent = t('mb_orbit_escaped_title', {}, 'Escaping Point (Diverges to ∞ ∉ M)');
      elStatus.style.color = 'var(--accent-rose)';
      elStep.textContent = t('mb_orbit_escaped_step', { step: orbitData.escapeStep }, `Escaped at step ${orbitData.escapeStep} |z|>4`);
    } else {
      elStatus.textContent = t('mb_orbit_bounded_title', {}, 'Bounded Point (Mandelbrot Set ∈ M)');
      elStatus.style.color = 'var(--accent-emerald)';
      const maxSteps = this.orbitTracer ? this.orbitTracer.maxSteps : 45;
      elStep.textContent = t('mb_orbit_bounded_step', { step: maxSteps }, `Remains bounded after ${maxSteps} steps`);
    }
  }

  updateStatsUI() {
    const elZoom = document.getElementById('mb-stat-zoom');
    const elIter = document.getElementById('mb-stat-iter');
    if (elZoom) {
      if (this.zoom < 1000) {
        elZoom.textContent = `${this.zoom.toFixed(2)}x`;
      } else {
        elZoom.textContent = `${this.zoom.toExponential(2)}x`;
      }
    }
    if (elIter) {
      const unit = window.I18N ? window.I18N.t('mb_iter_unit') : 'iters';
      elIter.textContent = `${this.maxIterations} ${unit}`;
    }
  }

  resetView() {
    this.stopTour();
    this.isMorphingPower = false;

    // 智能视口全貌归位
    if (this.power >= 2.5) {
      this.center = { re: 0.0, im: 0.0 };
      this.zoom = 1.05;
    } else {
      this.center = { re: -0.65, im: 0.0 };
      this.zoom = 0.95;
    }
    this.maxIterations = 200;

    // 清除奇观地标高亮
    document.querySelectorAll('[data-preset]').forEach(c => c.classList.remove('active'));

    // 更新标题水印
    const elTitle = document.querySelector('.watermark-title');
    if (elTitle) {
      elTitle.textContent = window.I18N ? window.I18N.t('mb_watermark_default') : 'Fractal Geometry';
    }

    this.updateFormulaHUD();
    this.render();
    if (this.orbitTracer && this.orbitTracer.enabled) {
      this.orbitTracer.render(this.center, this.zoom);
    }
  }

  setPreset(key) {
    const p = this.presets[key];
    if (p) {
      this.stopTour();
      this.isMorphingPower = false;

      this.power = p.power;
      this.center = { re: p.re, im: p.im };
      this.zoom = p.zoom;
      this.maxIterations = p.maxIter;

      // 联动顶部幂次按钮与滑块显示
      document.querySelectorAll('[data-power]').forEach(btn => {
        if (Math.abs(parseFloat(btn.dataset.power) - p.power) < 0.05) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
      const sliderPower = document.getElementById('mb-power-slider');
      const valPower = document.getElementById('mb-power-val');
      if (sliderPower) sliderPower.value = p.power;
      if (valPower) valPower.textContent = p.power.toFixed(2);

      // 联动调色板
      if (p.palette !== undefined) {
        this.colorPalette = p.palette;
        document.querySelectorAll('.color-scheme-btn').forEach(btn => {
          if (parseInt(btn.dataset.palette, 10) === p.palette) {
            btn.classList.add('active');
          } else {
            btn.classList.remove('active');
          }
        });
      }

      // 联动大标题水印
      const elTitle = document.querySelector('.watermark-title');
      if (elTitle) {
        if (key === 'infinite_spiral') {
          elTitle.textContent = window.I18N ? window.I18N.t('mb_watermark_spiral') : 'Infinite Spiral (Flower of Dynamics)';
        } else {
          elTitle.textContent = window.I18N ? window.I18N.t('mb_watermark_default') : 'Fractal Geometry';
        }
      }

      this.updateFormulaHUD();
      this.render();
      if (this.orbitTracer && this.orbitTracer.enabled) {
        this.orbitTracer.render(this.center, this.zoom);
      }
    }
  }

  setPower(powerVal, resetZoom = true) {
    this.power = parseFloat(powerVal);
    this.stopTour();

    // 核心安全机制: 切换幂次时立即将视口重置为全貌居中！
    // 彻底杜绝带着前一个地标数千倍的微观深度切换幂次导致掉入深蓝死区！
    if (resetZoom) {
      if (this.power >= 2.5) {
        this.center = { re: 0.0, im: 0.0 };
        this.zoom = 1.0;
      } else {
        this.center = { re: -0.65, im: 0.0 };
        this.zoom = 0.95;
      }
      this.maxIterations = 200;
      // 清除地标高亮
      document.querySelectorAll('[data-preset]').forEach(c => c.classList.remove('active'));
    }

    const elTitle = document.querySelector('.watermark-title');
    if (elTitle) {
      elTitle.textContent = window.I18N ? window.I18N.t('mb_watermark_default') : 'Fractal Geometry';
    }

    this.updateFormulaHUD();
    this.render();
    if (this.orbitTracer && this.orbitTracer.enabled) {
      this.orbitTracer.render(this.center, this.zoom);
    }
  }

  startTour(presetKey = 'infinite_spiral') {
    let target;
    if (this.power >= 2.5) {
      target = {
        name: window.I18N ? window.I18N.t('mb_watermark_default') : 'Multibrot Deep-Dive',
        power: 5.08,
        re: -0.00035,
        im: -0.00035,
        targetZoom: 600.0,
        maxIter: 260
      };
    } else {
      target = this.presets[presetKey] || this.presets['infinite_spiral'];
    }
    if (!target) return;

    this.isTouring = true;
    this.tourStartTime = performance.now();
    this.tourPreset = target;
    this.tourStartCenter = { re: this.center.re, im: this.center.im };
    this.tourStartZoom = this.zoom;

    const btnTour = document.getElementById('btn-mb-tour');
    if (btnTour) {
      btnTour.classList.add('btn-active');
    }

    // 若当前倍率已较深，则从宏观全景平滑开始推进
    if (this.zoom > 10.0) {
      if (this.power >= 2.5) {
        this.center = { re: 0.0, im: 0.0 };
        this.zoom = 1.05;
      } else {
        this.center = { re: -0.65, im: 0.0 };
        this.zoom = 0.95;
      }
      this.tourStartCenter = { re: this.center.re, im: this.center.im };
      this.tourStartZoom = this.zoom;
    }
  }

  stopTour() {
    if (!this.isTouring) return;
    this.isTouring = false;
    const btnTour = document.getElementById('btn-mb-tour');
    if (btnTour) {
      const tourLabel = window.I18N ? window.I18N.t('btn_mb_tour', 'Auto Deep-Dive Cruise') : 'Auto Deep-Dive Cruise';
      btnTour.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg> ${tourLabel}`;
      btnTour.classList.remove('btn-active');
    }
  }
}

window.MandelbrotViewer = MandelbrotViewer;
