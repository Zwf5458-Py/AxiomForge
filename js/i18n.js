/**
 * AxiomForge 国际化 (i18n) 引擎与双语字典
 * 默认语言：English ('en')，支持即时切换为 简体中文 ('zh')
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'axiomforge_lang';
  const DEFAULT_LANG = 'en';

  const DICTIONARY = {
    en: {
      // 品牌与标题
      brand_title: 'AxiomForge · AI Math Discovery',
      brand_subtitle: 'Autonomous Program Evolution · Extremal Combinatorics · Complex Dynamics',
      
      // 模式切换选项卡
      tab_koch: 'Koch Snowflake · Self-Similarity',
      tab_mandelbrot: 'Mandelbrot · Complex Dynamics',
      tab_funsearch: 'Cap Set · Program Evolution',
      tab_collatz: 'Collatz · Hailstone Dynamics',
      tab_eulerbrick: 'Euler Brick · Perfect Cuboid',

      // 顶部导航按钮
      btn_model_settings: 'AI Model Platform',
      btn_model_settings_title: 'Configure AI Model Providers (DeepSeek / OpenAI / Ollama / Custom)',
      btn_fullscreen_title: 'Toggle Fullscreen',
      btn_lang_title: 'Switch Language / 切换语言',
      btn_logo_picker_title: 'Switch Brand Logo / 切换品牌 LOGO',
      lang_name: 'English',

      // 模块 1：科赫雪花
      koch_stat_order: 'Order: ',
      koch_stat_order_val: 'Order 3',
      koch_hud_action_tag: 'Controls',
      koch_hud_action_desc: 'Wheel to Zoom | Drag to Pan | Auto Budding Evolution',
      btn_koch_zoom_out: 'Zoom Out',
      btn_koch_reset: 'Reset Center',
      btn_koch_zoom_in: 'Zoom In',
      koch_sidebar_ctrl_title: 'Growth & Evolution Controls',
      koch_label_order: 'Iteration Order',
      btn_koch_pause: 'Pause Evolution',
      btn_koch_play: 'Play Evolution',
      koch_sidebar_dashboard_title: 'Dynamic Mathematical Dashboard',
      koch_stat_segments_label: 'Total Segments (×4)',
      koch_stat_perimeter_label: 'Total Perimeter (4/3 Diverges)',
      koch_stat_area_label: 'Enclosed Area (Converges to 8/5)',
      koch_stat_dimension_label: 'Hausdorff Dimension',
      koch_stat_dim_sub: 'D = log(4) / log(3) ≈ 1.262',
      koch_stat_perimeter_sub: 'P_n → ∞ (Tends to infinity)',
      koch_diff_prefix: 'Diff from limit 8/5(1.6): ',
      koch_limit_target: 'Limit 1.6000',
      koch_theory_title: 'Key Mathematical Insights:',
      koch_theory_1: '• Construction: Equilateral triangle → Trisection → Add smaller triangle outwards on each middle segment.',
      koch_theory_2: '• Perimeter: Each step side × 1/3, segments × 4. Ratio 4/3 > 1; under infinite steps, **perimeter diverges to infinity**.',
      koch_theory_3: '• Area: Added area converges via geometric series ratio 4/9. Strictly approaches **8/5 (1.6x) of initial area**.',
      koch_theory_4: '• Philosophical Takeaway: **"Infinite perimeter, finite bounded area"**.',
      koch_theme_title: 'Visual Themes',
      koch_theme_cyan: 'Cyan Glow',
      koch_theme_aurora: 'Cosmic Aurora',
      koch_theme_wireframe: 'Wireframe',

      // 模块 2：曼德勃罗集
      mb_hud_status_tag: 'Dynamics State',
      mb_hud_status_ready: 'Ready (Move mouse to sample)',
      mb_hud_orbit_tag: 'Orbit State',
      mb_hud_orbit_desc: 'Hover cursor to trace complex orbit',
      mb_watermark_title: 'Fractal Geometry',
      btn_mb_zoom_out: 'Zoom Out',
      btn_mb_reset: 'Reset View',
      btn_mb_zoom_in: 'Zoom In',
      mb_section_power_title: 'Higher-Order Morphing (z ↦ zᵈ + c)',
      mb_label_power: 'Power Exponent (d)',
      btn_power_morph_start: 'Start Morphing Animation',
      btn_power_morph_pause: 'Pause Morphing Animation',
      mb_section_prec_title: 'Compute Precision & Deep Dive',
      mb_label_iter: 'GPU Iteration Depth',
      btn_mb_tour_start: 'Auto Deep-Dive Cruise',
      btn_mb_tour_pause: 'Pause Cruise',
      mb_preset_spiral: '✨ Infinite Spiral (Multi-arm)',
      mb_preset_seahorse: 'Seahorse Valley',
      mb_preset_elephant: 'Elephant Valley',
      mb_preset_mini: 'Mini-Mandelbrot',
      mb_section_metrics_title: 'Real-Time Dynamics Metrics',
      mb_stat_zoom_label: 'Viewport Magnification',
      mb_stat_zoom_sub: '100% Full Panoramic View',
      mb_stat_iter_label: 'GPU Parallel Iterations',
      mb_stat_iter_sub: 'Smooth 60 FPS Rendering',
      mb_chk_orbit: 'Enable Complex Orbit Tracer (Hover to inspect trajectory)',
      mb_theory_title: 'Mathematical Mechanism (God\'s Fingerprint):',
      mb_theory_1: '• Iteration: z_{n+1} = z^d + c (starting at z_0 = 0)',
      mb_theory_2: '• At exponent d = 5.08, symmetric petals equal d - 1 ≈ 4 main lobes, blossoming like an organic entity!',
      mb_theory_3: '• Set Definition: If sequence remains bounded |z| ≤ 2, then c ∈ M (black interior).',
      mb_theory_4: '• Smooth Shading: If sequence escapes, record escape step count and apply continuous smooth potential.',
      mb_theory_5: '• Not hand-designed, but purely computed!',
      mb_section_palette_title: 'Color Palettes',
      mb_palette_gold: 'Fractal Blue-Gold',
      mb_palette_purple: 'Dreamy Violet',
      mb_palette_neon: 'Cyber Neon',
      mb_palette_ice: 'Deep Space Ice',
      mb_palette_magma: 'Fiery Magma',
      mb_palette_aurora: 'Emerald Aurora',
      mb_palette_darkgold: 'Luxury Dark Gold',

      // 模块 3：FunSearch 帽集探索
      funsearch_toolbar_dim: 'Search Space:',
      funsearch_dim_3: '3D (27 pts)',
      funsearch_dim_4: '4D (81 pts)',
      funsearch_dim_5: '⭐ 5D (243 pts · Focus)',
      funsearch_dim_6: '6D (729 pts)',
      funsearch_dim_7: '7D (2187 pts)',
      funsearch_toolbar_proj: 'Projection:',
      funsearch_proj_sphere: 'Hypersphere Topology',
      funsearch_proj_slices: '3D Array Slices',
      funsearch_target_space_label: 'Target Space: ',
      funsearch_pow_tag: 'Algebraic Verification',
      funsearch_collinear_stat: '100% Collinear Free (0 lines)',
      funsearch_trap_break: 'Break 2ⁿ Local Trap',
      funsearch_ctrl_tip_tag: 'Controls',
      funsearch_ctrl_tip_desc: 'Wheel to Zoom | Drag to Rotate | DblClick to Reset',
      btn_fast_deduction: 'Verify in Sandbox',
      btn_fast_deduction_title: 'Quickly evaluate deterministic heuristic in Python sandbox',
      btn_ai_evolve: 'AI Model Evolution',
      btn_ai_evolve_title: 'Query configured LLM to synthesize and evolve priority programs',
      btn_reset_benchmark: 'Reset Benchmark',
      btn_reset_benchmark_title: 'Restore known best / breakthrough point set',
      funsearch_sidebar_pow_title: 'High-Dimensional Space & Algebraic Verification',
      funsearch_card_max_score: 'Max Cap Set Cardinality',
      funsearch_card_points_count: 'Cap Set Size',
      funsearch_ab_chart_title: 'A/B Evolutionary Convergence (Breaking 2ⁿ Trap)',
      funsearch_ab_legend_naive: 'Control Group (Naive Search)',
      funsearch_ab_legend_sym: 'Experimental Group (Symmetry Prior)',
      funsearch_ai_section_title: 'LLM Reasoning & Evolution Engine',
      funsearch_active_model_label: 'Active Model:',
      funsearch_deduction_title: '🧠 LLM Algebraic Reasoning (',
      funsearch_status_ready: 'Ready',
      funsearch_status_running: 'Reasoning...',
      funsearch_status_evaluating: 'Evaluating in Sandbox...',
      btn_skip_typing: '⚡ Expand',
      btn_copy_thinking: '📋 Copy Reasoning',
      btn_export_markdown: '📥 Export Report',
      btn_copy_code: '📋 Copy Code',
      funsearch_code_title: 'Current Python Priority Heuristic Function',
      funsearch_default_thinking: 'Click "AI Model Evolution" to dispatch a verified request to the configured LLM. The model will reason algebraically, output priority code, and be validated in the Python sandbox with zero-collinear checking. We strictly prohibit fake pre-determined results.',
      funsearch_sandbox_ready: 'Sandbox Engine: Ready (O(k²) fast non-collinear collision check)',
      funsearch_verifying: 'Verifying in sandbox...',
      funsearch_copied: 'Copied ✓',
      funsearch_no_content: 'No reasoning content to copy yet',
      funsearch_export_filename_prefix: 'AxiomForge_CapSet_',

      // 模态弹窗：AI 模型设置
      modal_title: 'AI Model Provider Studio',
      modal_subtitle: 'Full support for dynamic model fetch, custom endpoints, and encrypted local key storage',
      label_provider: 'Select Provider',
      btn_add_provider: '+ Add Custom Provider',
      btn_delete_provider: '🗑️ Delete Provider',
      label_platform_name: 'Platform Display Name',
      placeholder_platform_name: 'e.g. DST Gateway / Company Cluster',
      label_base_url: 'API Endpoint (Base URL)',
      btn_fetch_models: 'Fetch Models',
      tip_base_url: 'Supports any OpenAI / Claude compatible Base URL. Enter endpoint & key, then click "Fetch Models".',
      label_api_key: 'API Key',
      tip_api_key: 'Credentials are encrypted and saved solely in your browser LocalStorage. Never uploaded.',
      label_model_select: 'Model Selection',
      btn_manual_model: 'Enter Model Manually',
      btn_dropdown_model: 'Choose from List',
      btn_test_auth: 'Check Auth',
      btn_cancel: 'Cancel',
      btn_save: 'Save & Apply',
      auth_checking: 'Testing connection...',
      auth_success: '✓ Connected successfully! Found {count} available models.',
      auth_error: '✗ Connection failed: ',
      toast_provider_saved: 'Provider configuration saved successfully!',
      toast_provider_deleted: 'Custom provider deleted.',
      prompt_new_provider_name: 'Enter a name for the new custom provider:',

      // 品牌 LOGO 选择器
      logo_modal_title: 'Select Project Logo · AxiomForge',
      logo_modal_subtitle: 'Choose an icon design that best captures the mathematical spirit of AxiomForge.',
      logo_opt1_title: 'Option A · Hyper-Torus Core',
      logo_opt1_badge: 'High-Dim Topology',
      logo_opt1_desc: 'High-dimensional torus manifold with Cap Set affine points in neon cyan & violet gradient. Pure mathematical rigor.',
      logo_opt2_title: 'Option B · Axiomatic Forge',
      logo_opt2_badge: 'Evolutionary Energy',
      logo_opt2_desc: 'Interlocking geometric facets of "A" and "F" forged on a golden anvil with sparks. Dynamic and authoritative.',
      logo_opt3_title: 'Option C · Fractal Spark (AF Core)',
      logo_opt3_badge: 'Official Brand · AF Core',
      logo_opt3_desc: 'Self-similar Koch snowflake lattice & neural synapses with geometric AF monogram in deep cosmic core. Aurora green & ocean azure.',
      logo_btn_apply: 'Select This Logo',
      logo_btn_active: '✓ Active Logo',
      logo_btn_download: 'Download SVG',

      // 演化四阶段
      stage_1: 'Phase 1: Loading Hyperplane Constraints & L0 Slices...',
      stage_2: 'Phase 2: Exploring Non-Collinear Symmetries & Modulo Rules...',
      stage_3: 'Phase 3: Synthesizing Python Priority Heuristic Function...',
      stage_4: 'Phase 4: Python Sandbox Verification & Collision Checking...',

      // 曼德勃罗 HUD 与指标
      mb_orbit_escaped_title: 'Escaping Point (Diverges to ∞ ∉ M)',
      mb_orbit_escaped_step: 'Escaped at step {step} |z|>4',
      mb_orbit_bounded_title: 'Bounded Point (Mandelbrot Set ∈ M)',
      mb_orbit_bounded_step: 'Remains bounded after {step} steps',
      mb_iter_unit: 'iters',
      mb_stat_passes_label: 'GPU Parallel Passes',
      mb_watermark_default: 'Fractal Geometry',
      mb_watermark_spiral: 'Infinite Spiral (Flower of Dynamics)',

      // 科赫雪花 HUD 与指标
      koch_hud_order_progress: 'Order {order} (Growth: {growth}%)',
      koch_hud_area_diff: 'Diff to theoretical limit 8/5 (1.6): {diff}',

      // 模型配置中心弹窗
      model_group_builtin: 'Official Built-in Providers',
      model_group_custom: 'Custom Providers',
      model_opt_empty: 'No models retrieved (Click auto-fetch or input manually)',
      model_opt_reasoning: '🧠 (Reasoning Chain)',
      model_opt_configured: '⭐ {model} (Currently Configured)',
      model_confirm_delete: 'Are you sure you want to delete custom provider [{name}]?',
      model_alert_no_base_url: 'Please enter the API Endpoint (Base URL) first.',
      model_fetch_success: '🎉 Auto-fetch successful! Synced {count} available models and saved. Please select below.',
      model_fetch_fail: 'Auto-fetch failed: {err} (You can enter model name manually below)',
      btn_toggle_select_mode: 'Switch to Dropdown Selection',
      btn_toggle_manual_mode: 'Enter Model Name Manually',
      btn_testing_response: 'Testing model response...',
      model_testing_signal: '⏳ Sending probe signal to [{model}], testing end-to-end latency...',
      model_test_fail: '❌ Probe failed: {err}',
      model_test_success: '✅ Model [{model}] connected! Latency: {latency}s | Response: "{snippet}"',
      model_default_custom_name: 'Custom Provider',

      // Cap Set 数学发现
      funsearch_stat_points: '{count} pts ({pct}%)',
      funsearch_points_unit: 'pts',
      funsearch_target_space: 'Target: {dim}D · {count} pts',
      funsearch_space_label: 'F_3^{dim} Space ({count} pts)',
      funsearch_total_space: 'Total Space: {count} pts (3^{dim})',
      funsearch_break_trap: 'Broken 2^{dim}={baseline} Local Trap!',
      funsearch_trapped: 'Trapped at 2^{dim}={baseline} Local Trap',
      funsearch_break_gain: 'Break 2^{dim} trap +{gain}% ({model})',
      funsearch_real_score: 'Score: {count} pts ({model})',
      funsearch_naive_baseline: 'Naive Baseline (Trapped at 2^{dim}={baseline})',
      funsearch_ai_priority_title: 'Optimal Priority Function Evolved ({model})',
      funsearch_baseline_priority_title: 'Active Priority Function (Baseline)',
      funsearch_sandbox_result: 'Sandbox: {time}s | Collinear violations: {violations} (100% Verified)',
      funsearch_target_desc: '【Exploration Target: F_3^{dim} Space ({count} Points)】\n- Theoretical Max: {known} pts | Naive Trap: 2^{dim} = {baseline} pts\n\nClick [Evolve via AI Model] below to dispatch a combinatorial reasoning request. The model will analyze Hamming slices and modular invariants, with strict collinearity verification in a Python sandbox.',
      funsearch_err_failed: '❌ Model generation unsuccessful: {err}\n\n{guidance}',
      funsearch_err_guidance: '【Academic Rigor Note】: The system refuses to display pre-baked results without authentic model computation and sandbox verification.\nFor an instant offline experience, switch to the Reproducible Mock engine in Model Platform settings.',

      // 主窗口推演成果浮层看板
      hero_metric_score: 'Cap Set Cardinality',
      hero_metric_gain: 'Algebraic Gain',
      hero_metric_latency: 'Latency Breakdown',
      hero_insight_title: '🧠 Key Algebraic Insight Discovered:',
      hero_btn_view_reasoning: '🔍 View Full Reasoning Chain',
      hero_btn_copy_report: '📋 Copy Markdown Report',
      hero_title_prefix: 'AI Model Evolution Result',
      hero_latency_detail: 'LLM {llm}s + CPU {sandbox}s (Total {total}s)',

      // Module 4: Collatz Conjecture (Hailstone Dynamics & Inverse Tree)
      collatz_stat_seed: 'Seed n₀: ',
      collatz_stat_steps: 'Total Steps: ',
      collatz_stat_peak: 'Peak Flight: ',
      collatz_hud_action_tag: 'Dynamics',
      collatz_hud_action_desc: 'Log/Linear Scale | Particle Flow | Tree Drag/Zoom',
      collatz_ctrl_title: 'Hailstone Dynamics & Seed Controls',
      collatz_mode_label: 'Visualization Mode',
      collatz_mode_traj: 'Hailstone Trajectory Flow (2D Curve)',
      collatz_mode_tree: 'Inverse Fractal Tree (Topological Network)',
      collatz_scale_label: 'Coordinate Scale',
      collatz_scale_log: 'Logarithmic Scale (Log₁₀)',
      collatz_scale_linear: 'Linear Scale',
      collatz_seed_label: 'Initial Seed (n₀)',
      btn_collatz_random: 'Random Seed',
      btn_collatz_compute: 'Simulate Flow',
      collatz_classic_title: 'Hall of Fame Extreme Seeds',
      collatz_explorer_title: 'Extremal Stopping Time Explorer',
      collatz_explorer_desc: 'Search given integer interval for longest-surviving hailstone seeds',
      collatz_range_start_label: 'Start (N₁):',
      collatz_range_end_label: 'End (N₂):',
      btn_collatz_find_extreme: 'Find Range Champion',
      collatz_tree_depth_label: 'Tree Branching Depth',
      collatz_speed_label: 'Animation Speed',
      btn_collatz_play: 'Play Flow',
      btn_collatz_pause: 'Pause Flow',
      btn_collatz_reset: 'Reset Center',
      btn_collatz_step: 'Step Next',
      collatz_dash_title: 'Discrete Dynamics Dashboard',
      collatz_dash_seed: 'Initial Seed (n₀)',
      collatz_dash_stopping_time: 'Stopping Time (aₖ < n₀)',
      collatz_dash_total_steps: 'Total Steps (→ 1)',
      collatz_dash_peak: 'Peak Flight Altitude',
      collatz_dash_ratio: 'Max Expansion (Peak/n₀)',
      collatz_dash_odd_even: 'Odd / Even Steps',
      collatz_theory_title: 'Mathematical Background & Tao (2019)',
      collatz_theory_desc: 'Transformation: n/2 if even, 3n+1 if odd. Erdős noted "mathematics is not yet ready for such problems". In 2019, Fields medalist Terence Tao proved almost all orbits attain bounded values via logarithmic PDE methods. The inverse tree exhibits complete graph connectivity without cycles.',

      // 模块 5：完美欧拉砖 (Euler Brick)
      eulerbrick_stat_type: 'Cuboid Type: ',
      eulerbrick_stat_space_diag: 'Space Diag g: ',
      eulerbrick_stat_residual: 'Residual Δ: ',
      btn_eulerbrick_autorotate: 'Pause Auto-Rotate',
      btn_eulerbrick_playrotate: 'Auto Rotate 3D',
      btn_eulerbrick_reset_view: 'Reset Camera',
      btn_eulerbrick_toggle_diag: 'Diagonals: ON',
      eulerbrick_ctrl_title: 'Cuboid Edges & Dimension Controls',
      eulerbrick_edge_a: 'Edge a (Width · X)',
      eulerbrick_edge_b: 'Edge b (Height · Y)',
      eulerbrick_edge_c: 'Edge c (Depth · Z)',
      eulerbrick_hall_title: 'Euler Brick Hall of Fame',
      eulerbrick_explorer_title: 'Local Minimal Residual Explorer',
      eulerbrick_explorer_desc: 'Probe neighborhood for minimal space diagonal residual Δ = |g - round(g)|',
      eulerbrick_radius_label: 'Radius ±R:',
      btn_eulerbrick_search: 'Search Minimal Δ Brick',
      eulerbrick_metrics_title: '7-Tuple Diophantine Metrics',
      eulerbrick_mod_title: 'Modular Arithmetic Constraints',
      eulerbrick_theory_title: 'Perfect Euler Brick & Elliptic Curves',
      eulerbrick_theory_desc: 'An Euler Brick requires integer edges and face diagonals: a²+b²=d₁², b²+c²=d₂², c²+a²=d₃². If the space diagonal g=√(a²+b²+c²) is also an integer, it becomes a Perfect Cuboid. Spohn & Bremner proved this corresponds to rational points on specific families of elliptic curves y² = x(x-α)(x-β). No perfect cuboid has been discovered up to edges exceeding 10¹².'
    },

    zh: {
      // 品牌与标题
      brand_title: 'AxiomForge · AI 数学发现',
      brand_subtitle: '自主程序演化 · 极值组合 · 复杂动力学',

      // 模式切换选项卡
      tab_koch: '科赫雪花 · 几何自相似',
      tab_mandelbrot: '曼德勃罗 · 复杂动力学',
      tab_funsearch: '极值帽集 · 启发式演化',
      tab_collatz: '考拉兹猜想 · 冰雹动力学与拓扑树',
      tab_eulerbrick: '完美欧拉砖 · 空间几何极限',

      // 顶部导航按钮
      btn_model_settings: 'AI 模型平台配置',
      btn_model_settings_title: '配置大模型平台 (DeepSeek / OpenAI / Ollama / 自定义)',
      btn_fullscreen_title: '全屏沉浸模式',
      btn_lang_title: '切换语言 / Switch Language',
      btn_logo_picker_title: '切换品牌 LOGO / Switch Brand Logo',
      lang_name: '中文',

      // 模块 1：科赫雪花
      koch_stat_order: '演化状态：',
      koch_stat_order_val: '第 3 阶',
      koch_hud_action_tag: '操作',
      koch_hud_action_desc: '滚轮缩放 | 拖拽漫游 | 自动连续萌芽演化',
      btn_koch_zoom_out: '中心缩小',
      btn_koch_reset: '中心全貌',
      btn_koch_zoom_in: '中心放大',
      koch_sidebar_ctrl_title: '生长与演化控制',
      koch_label_order: '迭代阶数 (Order)',
      btn_koch_pause: '暂停演化',
      btn_koch_play: '播放演化',
      koch_sidebar_dashboard_title: '数学推导动态仪表盘',
      koch_stat_segments_label: '线段总数 (×4 递增)',
      koch_stat_perimeter_label: '总周长 (4/3 发散)',
      koch_stat_area_label: '包围面积 (收敛至 8/5 倍)',
      koch_stat_dimension_label: '豪斯多夫分形维数',
      koch_stat_dim_sub: 'D = log(4) / log(3) ≈ 1.262',
      koch_stat_perimeter_sub: 'P_n → ∞ (趋于无穷)',
      koch_diff_prefix: '距理论极限 8/5(1.6) 差: ',
      koch_limit_target: '极限 1.6000',
      koch_theory_title: '核心数学结论：',
      koch_theory_1: '• 构造：正三角形 → 每边三等分 → 中间向外补等边三角形。',
      koch_theory_2: '• 周长：每次边长 × 1/3，边数 × 4，周长公比为 4/3 > 1，无限迭代下**周长发散至无穷大**。',
      koch_theory_3: '• 面积：新增小三角形面积按公比 4/9 几何级数收敛，总面积有限，严格趋向于**初始三角形的 8/5 倍**。',
      koch_theory_4: '• 哲理：**“无限周长，包围有限面积”**。',
      koch_theme_title: '视觉与色彩主题',
      koch_theme_cyan: '青蓝光晕',
      koch_theme_aurora: '星空极光',
      koch_theme_wireframe: '几何线框',

      // 模块 2：曼德勃罗集
      mb_hud_status_tag: '动力学判定',
      mb_hud_status_ready: '探测就绪 (移动鼠标取样)',
      mb_hud_orbit_tag: '轨道状态',
      mb_hud_orbit_desc: '移动鼠标观察复数轨道',
      mb_watermark_title: '分形几何学',
      btn_mb_zoom_out: '中心缩小',
      btn_mb_reset: '中心全景',
      btn_mb_zoom_in: '中心放大',
      mb_section_power_title: '分形高阶幂次演化 (z ↦ zᵈ + c)',
      mb_label_power: '分形指数幂次 (Power d)',
      btn_power_morph_start: '开启开花形变动画',
      btn_power_morph_pause: '暂停形变演化',
      mb_section_prec_title: '计算精度与深潜巡航',
      mb_label_iter: 'GPU 迭代精度',
      btn_mb_tour_start: '自动深潜巡航',
      btn_mb_tour_pause: '暂停巡航',
      mb_preset_spiral: '✨ 以为走到了尽头 (绝美多臂螺旋)',
      mb_preset_seahorse: '海马谷 (Seahorse)',
      mb_preset_elephant: '象谷 (Elephant)',
      mb_preset_mini: '迷你微型体',
      mb_section_metrics_title: '实时动力学指标',
      mb_stat_zoom_label: '当前视口放大倍率',
      mb_stat_zoom_sub: '100% 完整全貌展现',
      mb_stat_iter_label: 'GPU 并行迭代',
      mb_stat_iter_sub: '60 FPS 丝滑渲染',
      mb_chk_orbit: '启用复数轨道探测器 (鼠标悬停跟踪轨迹)',
      mb_theory_title: '核心数学机理（上帝指纹）：',
      mb_theory_1: '• 迭代方程：z_{n+1} = z^d + c (从 z_0 = 0 开始)',
      mb_theory_2: '• 当幂次 d = 5.08 时，对称花瓣数量为 d - 1 ≈ 4 个主瓣，如同生命有机体绽放！',
      mb_theory_3: '• 集合定义：若数列模长始终 |z| ≤ 2 有界，则 c ∈ M（黑色内部）。',
      mb_theory_4: '• 上色依据：若数列发散脱离，记录逃逸前步数并进行平滑连续势着色。',
      mb_theory_5: '• 不是设计出来的，是算出来的！',
      mb_section_palette_title: '色彩艺术方案',
      mb_palette_gold: '分形蓝金(截图同款)',
      mb_palette_purple: '梦幻紫金(螺旋同款)',
      mb_palette_neon: '赛博霓虹',
      mb_palette_ice: '深空冰蓝',
      mb_palette_magma: '炽烈熔岩',
      mb_palette_aurora: '翡翠极光',
      mb_palette_darkgold: '奢华黑金',

      // 模块 3：FunSearch 帽集探索
      funsearch_toolbar_dim: '探索空间:',
      funsearch_dim_3: '3 维 (27点)',
      funsearch_dim_4: '4 维 (81点)',
      funsearch_dim_5: '⭐ 5 维 (243点 · 重点)',
      funsearch_dim_6: '6 维 (729点)',
      funsearch_dim_7: '7 维 (2187点)',
      funsearch_toolbar_proj: '高维投影:',
      funsearch_proj_sphere: '超球拓扑投影',
      funsearch_proj_slices: '3D 切片阵列',
      funsearch_target_space_label: '目标空间：',
      funsearch_pow_tag: '代数严密验算',
      funsearch_collinear_stat: '100% 严格无共线 (0 条线)',
      funsearch_trap_break: '突破局部陷阱',
      funsearch_ctrl_tip_tag: '视窗操作',
      funsearch_ctrl_tip_desc: '滚轮平滑缩放 | 拖拽自由旋转 | 双击全貌复位',
      btn_fast_deduction: '启动即时推演',
      btn_fast_deduction_title: '在前端快速运行确定性对称性启发式推演',
      btn_ai_evolve: 'AI 大模型生成演化',
      btn_ai_evolve_title: '调用配置的大语言模型平台进行程序变异生成',
      btn_reset_benchmark: '重置基准点',
      btn_reset_benchmark_title: '恢复为已知最佳/突破点集',
      funsearch_sidebar_pow_title: '高维空间与代数严格验算',
      funsearch_card_max_score: '有效帽集最大基数',
      funsearch_card_points_count: '空间点集规模',
      funsearch_ab_chart_title: 'A/B 对抗演化收敛曲线 (突破 2ⁿ 局部陷阱)',
      funsearch_ab_legend_naive: '对照组 (朴素盲目演化)',
      funsearch_ab_legend_sym: '实验组 (对称性先验突破)',
      funsearch_ai_section_title: '大语言模型演化与思考过程',
      funsearch_active_model_label: '当前驱动模型:',
      funsearch_deduction_title: '🧠 大模型代数推演全景 (',
      funsearch_status_ready: '就绪',
      funsearch_status_running: '深度推演中...',
      funsearch_status_evaluating: '沙箱严密验算中...',
      btn_skip_typing: '⚡ 展开',
      btn_copy_thinking: '📋 复制推导',
      btn_export_markdown: '📥 导出报告',
      btn_copy_code: '📋 复制代码',
      funsearch_code_title: '当前运行的 Python 优先级函数',
      funsearch_default_thinking: '点击“AI 大模型生成演化”将向当前配置的模型发起真实请求，由模型实时推理并生成代数分析与代码，并在 Python 沙箱中完成严格三点共线验算。系统坚决杜绝任何未经模型真实推演的预定结果。',
      funsearch_sandbox_ready: '沙箱验算引擎: 就绪 (O(k²) 极速无共线碰撞判定)',
      funsearch_verifying: '正在验算...',
      funsearch_copied: '已复制 ✓',
      funsearch_no_content: '暂无推演内容可复制',
      funsearch_export_filename_prefix: 'AxiomForge_帽集报告_',

      // 模态弹窗：AI 模型设置
      modal_title: 'AI 模型平台与自定义配置',
      modal_subtitle: '完整支持动态模型抓取、自定义端点、多平台命名与密钥隔离',
      label_provider: '选择或切换平台 (Provider)',
      btn_add_provider: '+ 添加新平台',
      btn_delete_provider: '🗑️ 删除平台',
      label_platform_name: '平台显示名称 (Platform Name)',
      placeholder_platform_name: '例如：DST 聚合中转 / 公司内部私有集群',
      label_base_url: '接口端点 (Base URL)',
      btn_fetch_models: '自动拉取模型',
      tip_base_url: '支持任意 OpenAI / Claude 兼容的 Base URL。输入端点和 Key 后点击“自动拉取模型”即可同步全部可用模型。',
      label_api_key: 'API 密钥 (API Key)',
      tip_api_key: '凭据仅安全保存在本地（Local Storage），绝不向任何第三方服务上报。',
      label_model_select: '模型选择 (Model)',
      btn_manual_model: '手动输入模型名',
      btn_dropdown_model: '从列表选择模型',
      btn_test_auth: '测试连接 (Check Auth)',
      btn_cancel: '取消',
      btn_save: '保存并应用配置',
      auth_checking: '正在向端点发送测试请求...',
      auth_success: '✓ 鉴权成功！已连通，成功探测到 {count} 个模型。',
      auth_error: '✗ 连接或鉴权失败: ',
      toast_provider_saved: '平台配置已保存并生效！',
      toast_provider_deleted: '自定义平台已删除。',
      prompt_new_provider_name: '请输入新自定义平台的显示名称：',

      // 品牌 LOGO 选择器
      logo_modal_title: '选择项目 LOGO · AxiomForge',
      logo_modal_subtitle: '挑选最契合 AxiomForge 数学灵魂与 AI 演化美学的品牌标识。',
      logo_opt1_title: '方案 A · 超球代数同余核',
      logo_opt1_badge: '高维拓扑',
      logo_opt1_desc: '高维环面流形投影与有限域 Cap Set 仿射点阵，青蓝至紫罗兰渐变，彰显深邃公理之美。',
      logo_opt2_title: '方案 B · 公理熔炉 · 几何锻造',
      logo_opt2_badge: '演化能量',
      logo_opt2_desc: '“A”与“F”精密咬合的坚硬折面与金色砧台，象征代码与公理的炽热演化锻造。',
      logo_opt3_title: '方案 C · 分形递归 · 智慧星芒 (AF 核心)',
      logo_opt3_badge: '官方选定 · AF 核心',
      logo_opt3_desc: '自相似科赫分形多层晶格与 AI 突触网络，中心嵌合几何 AF 公理熔炉字标，极光翡翠与海天青交融。',
      logo_btn_apply: '选用此方案',
      logo_btn_active: '✓ 当前选用',
      logo_btn_download: '下载矢量 SVG',

      // 演化四阶段
      stage_1: '阶段一：装载超平面约束与 L0 汉明切片...',
      stage_2: '阶段二：探索非共线对称性与同余偏置...',
      stage_3: '阶段三：大模型合成 Python 优先级启发式函数...',
      stage_4: '阶段四：Python 沙箱极速碰撞校验与贪心选择...',

      // 曼德勃罗 HUD 与指标
      mb_orbit_escaped_title: '逃逸点 (飞向无穷 ∉ 集合)',
      mb_orbit_escaped_step: '迭代 {step} 步脱离 |z|>4',
      mb_orbit_bounded_title: '有界点 (属于曼德勃罗集 ∈ M)',
      mb_orbit_bounded_step: '迭代 {step} 步始终有界收敛/闭合',
      mb_iter_unit: '次',
      mb_stat_passes_label: 'GPU 并行迭代',
      mb_watermark_default: '分形几何学',
      mb_watermark_spiral: '以为已经走到了尽头',

      // 科赫雪花 HUD 与指标
      koch_hud_order_progress: '第 {order} 阶 (生长进度 {growth}%)',
      koch_hud_area_diff: '距理论极限 8/5(1.6) 差: {diff}',

      // 模型配置中心弹窗
      model_group_builtin: '官方内置平台',
      model_group_custom: '用户自定义平台',
      model_opt_empty: '未检索到模型 (请点击自动拉取或手动输入)',
      model_opt_reasoning: '🧠 (Reasoning 思考链)',
      model_opt_configured: '⭐ {model} (当前配置模型)',
      model_confirm_delete: '确定要删除自定义平台 [{name}] 吗？',
      model_alert_no_base_url: '请先输入接口端点 (Base URL)',
      model_fetch_success: '🎉 自动拉取成功！已同步 {count} 个可用模型并已永久保存，请在下方选择。',
      model_fetch_fail: '自动拉取失败: {err} (您可点击下方“手动输入模型名”直接填写)',
      btn_toggle_select_mode: '切换为下拉选择',
      btn_toggle_manual_mode: '手动输入模型名',
      btn_testing_response: '正在测试模型响应...',
      model_testing_signal: '⏳ 正在向模型【{model}】发送测试信号，测试实际端到端响应延迟...',
      model_test_fail: '❌ 检测失败: {err}',
      model_test_success: '✅ 模型【{model}】连通测试成功！响应延迟: {latency}s | 回复: "{snippet}"',
      model_default_custom_name: '新自定义平台',

      // Cap Set 数学发现
      funsearch_stat_points: '{count} 点 ({pct}%)',
      funsearch_points_unit: '点',
      funsearch_target_space: '目标: {dim} 维 · {count} 点',
      funsearch_space_label: 'F_3^{dim} 空间 ({count} 点)',
      funsearch_total_space: '总空间 {count} 点 (3^{dim})',
      funsearch_break_trap: '成功打破 2^{dim}={baseline} 局部最优！',
      funsearch_trapped: '受限于 2^{dim}={baseline} 局部极值',
      funsearch_break_gain: '打破 2^{dim} 陷阱 +{gain}% ({model} 真实推演)',
      funsearch_real_score: '模型真实得分: {count} 点 ({model})',
      funsearch_naive_baseline: '朴素基线 (受限于 2^{dim}={baseline})',
      funsearch_ai_priority_title: 'AI 演化出的最优 Python 优先级函数 ({model} 真实生成)',
      funsearch_baseline_priority_title: '当前运行的 Python 优先级函数 (基准基线)',
      funsearch_sandbox_result: '沙箱验算: 耗时 {time}s | 三点共线违规: {violations} (100% 严格验证)',
      funsearch_target_desc: '【当前探索目标：F_3^{dim} 空间 (共 {count} 点)】\n- 已知理论极值: {known} 点 | 朴素贪心受限陷阱: 2^{dim} = {baseline} 点\n\n点击下方【AI 大模型生成演化】，将向配置的模型发起 {dim} 维极值组合推演请求，大模型将分析汉明切片与仿射同余不变性，并在 Python 沙箱中完成严格三点共线验算。',
      funsearch_err_failed: '❌ 模型推演未成功: {err}\n\n{guidance}',
      funsearch_err_guidance: '【学术严谨性声明】：系统坚决拒绝在未获得模型真实计算与沙箱验算的前提下给出虚假预定结果。\n若需离线测试体验，请点击右上角【AI 模型平台配置】选择 Reproducible Mock 确定性离线引擎。',

      // 主窗口推演成果浮层看板
      hero_metric_score: '有效帽集基数',
      hero_metric_gain: '代数突破增益',
      hero_metric_latency: '推演验算耗时',
      hero_insight_title: '🧠 大模型提炼的核心代数特征:',
      hero_btn_view_reasoning: '🔍 展开完整推导思考链',
      hero_btn_copy_report: '📋 复制推演报告',
      hero_title_prefix: '大模型推演成果',
      hero_latency_detail: '模型 {llm}s + 沙箱 {sandbox}s (总计 {total}s)',

      // 模块 4：考拉兹猜想
      collatz_stat_seed: '种子 n₀: ',
      collatz_stat_steps: '停机总步数: ',
      collatz_stat_peak: '最高飞行海拔: ',
      collatz_hud_action_tag: '离散动力学',
      collatz_hud_action_desc: '对数/线性刻度 | 粒子轨迹流 | 拓扑树拖拽缩放',
      collatz_ctrl_title: '冰雹动力学与种子控制',
      collatz_mode_label: '推演可视化模式',
      collatz_mode_traj: '冰雹起伏轨迹流 (2D 动力学折线)',
      collatz_mode_tree: '逆向分形拓扑树 (宇宙连接网络)',
      collatz_scale_label: '坐标刻度模式',
      collatz_scale_log: '对数刻度 (Log₁₀ 消除暴冲)',
      collatz_scale_linear: '线性绝对刻度',
      collatz_seed_label: '初始正整数种子 (n₀)',
      btn_collatz_random: '随机种子',
      btn_collatz_compute: '开始推演',
      collatz_classic_title: '名人堂经典极限冰雹种子',
      collatz_explorer_title: '极值停机时间探索器',
      collatz_explorer_desc: '在给定数值区间内，一键搜寻存活步数最长、反弹最顽强的极值种子',
      collatz_range_start_label: '起始 (N₁):',
      collatz_range_end_label: '截止 (N₂):',
      btn_collatz_find_extreme: '一键搜寻区间冠军',
      collatz_tree_depth_label: '拓扑树展开深度',
      collatz_speed_label: '动画流速控制',
      btn_collatz_play: '开始流动',
      btn_collatz_pause: '暂停流动',
      btn_collatz_reset: '重置居中',
      btn_collatz_step: '单步演算',
      collatz_dash_title: '离散动力学学术仪表盘',
      collatz_dash_seed: '初始种子 (n₀)',
      collatz_dash_stopping_time: '停机时间 (首次跌破初值)',
      collatz_dash_total_steps: '收敛总步数 (归一至 1)',
      collatz_dash_peak: '最高飞行海拔 (极大值)',
      collatz_dash_ratio: '极大膨胀倍率 (峰值 / n₀)',
      collatz_dash_odd_even: '奇数步 / 偶数步占比',
      collatz_theory_title: '数学原理与陶哲轩 2019 前沿',
      collatz_theory_desc: '变换规则：偶数除以 2，奇数乘 3 加 1。保罗·埃尔德什曾言“现代数学尚未成熟到足以解决此类问题”。2019年菲尔兹奖得主陶哲轩运用对数偏微分方程证明了几乎所有轨道均能跌至任意小的值。从 1 逆向生长的拓扑树展示了正整数被完全汇入主干的无环连通图。',

      // 模块 5：完美欧拉砖 (Euler Brick)
      eulerbrick_stat_type: '长方体形态: ',
      eulerbrick_stat_space_diag: '体对角线 g: ',
      eulerbrick_stat_residual: '残差量 Δ: ',
      btn_eulerbrick_autorotate: '暂停 3D 旋转',
      btn_eulerbrick_playrotate: '自动 3D 旋转',
      btn_eulerbrick_reset_view: '重置视角',
      btn_eulerbrick_toggle_diag: '对角线显示: 开',
      eulerbrick_ctrl_title: '长方体棱长与几何微调',
      eulerbrick_edge_a: '棱长 a (宽度 · X轴)',
      eulerbrick_edge_b: '棱长 b (高度 · Y轴)',
      eulerbrick_edge_c: '棱长 c (深度 · Z轴)',
      eulerbrick_hall_title: '欧拉砖名人堂经典族',
      eulerbrick_explorer_title: '局部极小残差智能探索器',
      eulerbrick_explorer_desc: '在给定参数邻域内探测使体对角线最接近整数的极值长方体 Δ = |g - round(g)|',
      eulerbrick_radius_label: '搜索半径 ±R:',
      btn_eulerbrick_search: '搜索极小残差砖',
      eulerbrick_metrics_title: '七元组丢番图数论指标',
      eulerbrick_mod_title: '同余筛选与整除障碍',
      eulerbrick_theory_title: '完美欧拉砖与椭圆曲线参数化',
      eulerbrick_theory_desc: '欧拉砖要求长方体的三条棱与三个面对角线均为正整数。若体对角线 g 亦为正整数，则称为“完美欧拉砖（完美长方体）”。Spohn 与 Bremner 证明其等价于特定椭圆曲线族 y² = x(x-α)(x-β) 上的有理点分布。超级计算机已搜索至棱长超过 10¹²，至今未发现任何完美解。'
    }
  };


  class I18nManager {
    constructor() {
      const saved = localStorage.getItem(STORAGE_KEY);
      this.currentLang = (saved === 'zh' || saved === 'en') ? saved : DEFAULT_LANG;
      this.dict = DICTIONARY;
    }

    getLanguage() {
      return this.currentLang;
    }

    setLanguage(lang) {
      if (lang !== 'en' && lang !== 'zh') {
        lang = DEFAULT_LANG;
      }
      this.currentLang = lang;
      localStorage.setItem(STORAGE_KEY, lang);
      this.applyToDOM();
      window.dispatchEvent(new CustomEvent('axiomforge:lang_changed', { detail: { lang } }));
    }

    toggleLanguage() {
      const target = this.currentLang === 'en' ? 'zh' : 'en';
      this.setLanguage(target);
      return target;
    }

    t(key, params = {}, fallback = '') {
      if (typeof params === 'string') {
        fallback = params;
        params = {};
      }
      const pack = this.dict[this.currentLang] || this.dict[DEFAULT_LANG];
      let str = (pack && pack[key] !== undefined) ? pack[key] : '';
      if (!str) {
        const defaultPack = this.dict[DEFAULT_LANG];
        str = (defaultPack && defaultPack[key] !== undefined) ? defaultPack[key] : (fallback || key);
      }
      if (params && typeof params === 'object') {
        Object.keys(params).forEach(k => {
          str = str.replaceAll(`{${k}}`, params[k]);
        });
      }
      return str;
    }

    applyToDOM() {
      document.documentElement.lang = this.currentLang === 'zh' ? 'zh-CN' : 'en';

      // 1. data-i18n 替换 innerText
      const elements = document.querySelectorAll('[data-i18n]');
      elements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        const translated = this.t(key);
        if (translated) {
          el.textContent = translated;
        }
      });

      // 2. data-i18n-title 替换 title 属性
      const titleElements = document.querySelectorAll('[data-i18n-title]');
      titleElements.forEach(el => {
        const key = el.getAttribute('data-i18n-title');
        const translated = this.t(key);
        if (translated) {
          el.setAttribute('title', translated);
        }
      });

      // 3. data-i18n-placeholder 替换 placeholder
      const phElements = document.querySelectorAll('[data-i18n-placeholder]');
      phElements.forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        const translated = this.t(key);
        if (translated) {
          el.setAttribute('placeholder', translated);
        }
      });

      // 4. 更新语言切换按钮上的文字指示
      const langIndicator = document.getElementById('lang-indicator');
      if (langIndicator) {
        langIndicator.textContent = this.currentLang === 'en' ? 'English' : '中文';
      }
    }

    init() {
      this.applyToDOM();
    }
  }

  window.I18N = new I18nManager();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.I18N.init();
    });
  } else {
    window.I18N.init();
  }
})();
