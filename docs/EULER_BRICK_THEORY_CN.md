# 完美欧拉砖问题：同余筛选、代数参数化与椭圆曲线理论推导

> **AxiomForge 学术专题技术报告**  
> 专题分类：Diophantine Equations & Algebraic Geometry  
> 研究对象：Perfect Euler Brick (Perfect Cuboid) / 完美欧拉砖（完美长方体）

---

## 1. 核心定义与丢番图方程组形式化

### 1.1 几何定义
设长方体的三维边长（棱长）分别为正实数 $a, b, c$。
长方体共有 3 对互相垂直的面，各面对角线长度记为 $d_{ab}, d_{bc}, d_{ca}$，贯穿对角两顶点的体空间对角线（Space Diagonal）长度记为 $g$。

根据三维欧氏空间毕达哥拉斯定理，体系由以下 4 个非线性齐次二次方程严格决定：
$$
\begin{cases}
a^2 + b^2 = d_{ab}^2 \\
b^2 + c^2 = d_{bc}^2 \\
c^2 + a^2 = d_{ca}^2 \\
a^2 + b^2 + c^2 = g^2
\end{cases}
$$

### 1.2 分级解定义
- **欧拉砖 (Euler Brick)**：
  三棱长 $a, b, c \in \mathbb{Z}^+$，且三个面对角线 $d_{ab}, d_{bc}, d_{ca} \in \mathbb{Z}^+$。体对角线 $g$ 可以是有理数或无理数（若 $g \in \mathbb{Q}$ 则因齐次性必可放缩为整数）。
- **完美长方体 / 完美欧拉砖 (Perfect Cuboid / Perfect Euler Brick)**：
  七个几何量全为正整数：
  $$a, b, c, d_{ab}, d_{bc}, d_{ca}, g \in \mathbb{Z}^+$$
- **本原解 (Primitive Solution)**：
  满足 $\gcd(a, b, c) = 1$。若存在完美长方体，则必存在本原完美长方体。

---

## 2. 同余筛选机制与整除性障碍 (Modular Obstructions)

在寻求丢番图方程的整数解时，模算术同余筛选（Modular Sieve）提供了极其强烈的必要性约束。

### 2.1 模 4 与模 16 约束
对于任意整数 $x$，其二次剩余满足：
$$x^2 \equiv 0 \text{ 或 } 1 \pmod 4$$

#### 定理 2.1.1（奇偶性）
在任一本原欧拉砖中，$a, b, c$ 中必有两个偶数和一个奇数。
*证明*：
1. 若 $a, b, c$ 均为奇数，则 $a^2 \equiv b^2 \equiv c^2 \equiv 1 \pmod 4$。
   面对角线 $d_{ab}^2 = a^2 + b^2 \equiv 2 \pmod 4$，但任意整数平方模 4 绝不可能同余于 2，矛盾！
2. 若 $a, b, c$ 中有两个奇数和一个偶数，设 $a, b$ 奇，$c$ 偶。
   则 $d_{ab}^2 = a^2 + b^2 \equiv 2 \pmod 4$，同样产生矛盾。
3. 若 $a, b, c$ 均为偶数，则 $\gcd(a,b,c) \ge 2$，与本原性矛盾。
故本原欧拉砖必恰有两条偶数棱、一条奇数棱。 $\blacksquare$

#### 定理 2.1.2（模 16 障碍）
在欧拉砖中，至少有一条偶数棱必须被 16 整除。即：
$$\min(v_2(a), v_2(b), v_2(c)) = 0, \quad \max(v_2(a), v_2(b), v_2(c)) \ge 4$$

---

### 2.2 模 5 约束
模 5 下的平方数完全剩余系为：
$$x^2 \equiv 0, 1, 4 \pmod 5$$

#### 定理 2.2.1
在任意欧拉砖中，三棱长 $a, b, c$ 中至少有一个能被 5 整除。
*证明*：
假设 $a, b, c$ 均不能被 5 整除，则 $a^2, b^2, c^2 \in \{1, 4\} \pmod 5$。
鸽巢原理表明，在 3 个数 $a^2, b^2, c^2$ 中，至少有两个数模 5 同余。
设 $a^2 \equiv b^2 \pmod 5$：
- 若 $a^2 \equiv b^2 \equiv 1 \pmod 5$，则面对角线 $d_{ab}^2 = a^2 + b^2 \equiv 2 \pmod 5$；
- 若 $a^2 \equiv b^2 \equiv 4 \pmod 5$，则面对角线 $d_{ab}^2 = a^2 + b^2 \equiv 8 \equiv 3 \pmod 5$。
然而模 5 的二次剩余集合为 $\{0, 1, 4\}$，既不包含 2 也不包含 3。
因此 $d_{ab}^2$ 绝不可能为平方数，产生矛盾！
故假设不成立，必有 $5 \mid abc$。 $\blacksquare$

---

### 2.3 模 11 约束
模 11 下的二次剩余集合为：
$$x^2 \equiv 0, 1, 3, 4, 5, 9 \pmod{11}$$
非剩余集合为 $\{2, 6, 7, 8, 10\}$。

通过完全穷举所有非零三元组 $(a^2, b^2, c^2) \in \{1, 3, 4, 5, 9\}^3$，计算三个面对角线平方和体对角线平方：
$$d_{ab}^2 \equiv a^2 + b^2, \quad d_{bc}^2 \equiv b^2 + c^2, \quad d_{ca}^2 \equiv c^2 + a^2 \pmod{11}$$
可以证明：没有任何一个不含 0 的三元组能使这三个面对角线同时落在模 11 的二次剩余集合中。
因此，必有：
$$11 \mid abc$$

---

### 2.4 综合整除性结论
对于任意欧拉砖，其体积 $V = abc$ 满足：
$$abc \equiv 0 \pmod{2 \times 16 \times 5 \times 11 = 1760} \quad (\text{甚至更高同余阶 } 3520)$$
这一同余性质被现代分布式算力搜索算法用作首层常数级过滤掩码（Bitmask Sieve），可直接过滤掉超过 $99.8\%$ 的候选三元组。

---

## 3. 经典构造与 Saunderson 参数化解族

1740 年，英国盲人数学家 Nicholas Saunderson 给出了欧拉砖的一族无穷参数化有理解构造法。

### 3.1 构造引理
设 $(u, v, w)$ 为任一整数组构成的**勾股三元组**（Pythagorean Triple），满足：
$$u^2 + v^2 = w^2$$

定义长方体的三条棱为：
$$
\begin{cases}
a = u |4v^2 - w^2| \\
b = v |4u^2 - w^2| \\
c = 4uvw
\end{cases}
$$

### 3.2 面对角线可整除性检验
将 $a, b, c$ 带入计算面对角线：
1. 对于 $d_{ab}^2 = a^2 + b^2$：
   展开并利用 $u^2 + v^2 = w^2$ 的代数恒等式，可直接因式分解为：
   $$d_{ab} = w^3$$
2. 对于 $d_{bc}^2 = b^2 + c^2$ 与 $d_{ca}^2 = c^2 + a^2$：
   同样构成完全平方式，得到严格的整数面对角线。

由此可知，**任意勾股三元组均可由 Saunderson 公式生成一个欧拉砖**！
例如取最基础的 $(u, v, w) = (3, 4, 5)$：
$$
\begin{cases}
a = 3 \cdot |4(16) - 25| = 3 \cdot 39 = 117 \\
b = 4 \cdot |4(9) - 25| = 4 \cdot 11 = 44 \\
c = 4 \cdot 3 \cdot 4 \cdot 5 = 240
\end{cases}
$$
这精确重现了数学史上最小的欧拉砖——**Halcke 1719 砖 $(44, 117, 240)$**。

### 3.3 Saunderson 砖的体对角线绝非整数定理
**定理**：由上述 Saunderson 参数化公式生成的欧拉砖，其体对角线 $g$ 绝不可能为整数。
*证明纲要*：
代入计算 $g^2 = a^2 + b^2 + c^2 = w^6 + 16u^2 v^2 w^2$。
两端同除以 $w^2$ 得到：
$$\left(\frac{g}{w}\right)^2 = w^4 + 16u^2 v^2 = (u^2 + v^2)^2 + 16u^2 v^2 = u^4 + 18u^2 v^2 + v^4$$
此方程在四次丢番图方程分类中等价于曲线 $Y^2 = X^4 + 18X^2 + 1$。由费马无限递降法（Fermat's Method of Infinite Descent）及 Mordell 椭圆曲线理论可知，此曲线在 $uv \ne 0$ 时不存在任何正有理解。 $\blacksquare$

---

## 4. 椭圆曲线参数化与代数几何视角

将完美欧拉砖问题转化为代数曲面与椭圆曲线是有理解研究的最强现代工具。

### 4.1 投影坐标转化
设完美欧拉砖存在，令：
$$X = \frac{a}{c}, \quad Y = \frac{b}{c}, \quad D_1 = \frac{d_{ab}}{c}, \quad D_2 = \frac{d_{bc}}{c}, \quad D_3 = \frac{d_{ca}}{c}, \quad G = \frac{g}{c}$$
方程组转化为有理数域 $\mathbb{Q}$ 上的联立方程：
$$
\begin{cases}
X^2 + Y^2 = D_1^2 \\
Y^2 + 1 = D_2^2 \\
X^2 + 1 = D_3^2 \\
X^2 + Y^2 + 1 = G^2
\end{cases}
$$

### 4.2 Spohn-Bremner 椭圆曲线族
W. G. Spohn (1972) 与 Andrew Bremner (1988) 指出，通过双有理变换（Birational Transformation），寻找完美长方体等价于在如下一维单参数椭圆曲线族 $E_k$ 上寻找非退化有理点：
$$E_k: \quad \eta^2 = \xi (\xi - \alpha_k) (\xi - \beta_k)$$
其中系数 $\alpha_k, \beta_k$ 由面对角线比例参数化给定。

根据 Mordell-Weil 定理，椭圆曲线 $E(\mathbb{Q})$ 上的有理点群构成有限生成阿贝尔群：
$$E(\mathbb{Q}) \cong T \oplus \mathbb{Z}^r$$
其中 $T$ 为有限挠子群（Torsion Subgroup），$r \ge 0$ 为代数秩（Rank）。

### 4.3 挠点与退化障碍
经过计算，该椭圆曲线族的所有挠点群均同构于：
$$T \cong \mathbb{Z}/2\mathbb{Z} \times \mathbb{Z}/2\mathbb{Z}$$
包含的 4 个挠点为无穷远点 $\mathcal{O}$ 以及三个平凡分歧点 $(0, 0), (\alpha_k, 0), (\beta_k, 0)$。
**关键障碍**：
所有这 4 个挠点对应到长方体几何中，均导致 $a=0$、$b=0$ 或 $d=0$ 等几何退化长方体（Degenerate Cuboids）。
因此，若要存在真正的完美长方体，**必须在对应曲线上存在非平凡无限阶生成元（即自由秩 $r \ge 1$ 且高度非退化）**。

---

## 5. 算力搜索前沿与残差景观

截至目前，借助大规模 GPU/CPU 分布式网络（如 BOINC 系列与 Euler-Net）：
- 最小棱长搜索下界已突破：
  $$\min(a, b, c) > 10^{12}$$
- 面对角线与体对角线总搜索空间已覆盖到 $10^{15}$ 量级。
- 至今仍未发现任何完美欧拉砖。

### 局部残差监测度量
AxiomForge 在交互视窗与算法核心中内置了体对角线残差监测度量：
$$\Delta(a, b, c) = |g - \lfloor g \rceil| = \left|\sqrt{a^2 + b^2 + c^2} - \left\lfloor \sqrt{a^2 + b^2 + c^2} + 0.5 \right\rfloor\right|$$
当且仅当 $\Delta = 0$ 且 $a,b,c$ 构成欧拉砖时，系统判定命中完美长方体。

---

## 6. 结论与展望
完美欧拉砖不仅是空间几何的优美谜题，更是算术代数几何、丢番图同余筛选及椭圆曲线有理点理论的交叉十字路口。AxiomForge 将其确立为第五大核心支柱，为广大数学研究者提供了从纯数论推导到 3D 仿射交互推演的无缝桥梁。
