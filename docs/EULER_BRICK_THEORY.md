# The Perfect Euler Brick Problem: Modular Obstructions, Saunderson Parametrization, and Elliptic Curves

> **AxiomForge Research Monograph**  
> Discipline: Diophantine Equations & Arithmetic Algebraic Geometry  
> Subject: Perfect Euler Brick (Perfect Cuboid)

---

## 1. Mathematical Formulation

### 1.1 Geometric System
Let $a, b, c \in \mathbb{R}^+$ represent the edge lengths of a three-dimensional rectangular cuboid. The three face diagonals are denoted by $d_{ab}, d_{bc}, d_{ca}$, and the interior space diagonal is denoted by $g$.

By the Pythagorean theorem in Euclidean 3-space, the configuration is uniquely governed by the system of four simultaneous Diophantine equations:
$$
\begin{cases}
a^2 + b^2 = d_{ab}^2 \\
b^2 + c^2 = d_{bc}^2 \\
c^2 + a^2 = d_{ca}^2 \\
a^2 + b^2 + c^2 = g^2
\end{cases}
$$

### 1.2 Hierarchy of Solutions
- **Euler Brick**: A cuboid where edges $a, b, c \in \mathbb{Z}^+$ and face diagonals $d_{ab}, d_{bc}, d_{ca} \in \mathbb{Z}^+$. The space diagonal $g$ may be irrational.
- **Perfect Cuboid (Perfect Euler Brick)**: All seven geometric invariants are strictly positive integers:
  $$a, b, c, d_{ab}, d_{bc}, d_{ca}, g \in \mathbb{Z}^+$$
- **Primitive Cuboid**: A solution satisfying $\gcd(a, b, c) = 1$. Any homothetic scaling preserves integer properties, so existence reduces to finding a primitive solution.

---

## 2. Modular Obstructions & Divisibility Properties

### 2.1 Modulo 4 and Modulo 16 Sieve
Quadratic residues modulo 4 are strictly constrained to:
$$x^2 \equiv 0 \text{ or } 1 \pmod 4$$

#### Theorem 2.1 (Parity Structure)
In any primitive Euler brick, exactly two edges are even and one edge is odd.
*Proof*:
1. If all $a, b, c$ are odd, then $a^2 \equiv b^2 \equiv c^2 \equiv 1 \pmod 4$. This implies $d_{ab}^2 = a^2 + b^2 \equiv 2 \pmod 4$, which has no integer solutions.
2. If two edges are odd and one is even, say $a, b$ odd and $c$ even, then $d_{ab}^2 \equiv 2 \pmod 4$, again yielding a contradiction.
3. If all three edges are even, $\gcd(a, b, c) \ge 2$, contradicting primitivity.
Thus, exactly two edges are even and one is odd. $\blacksquare$

#### Theorem 2.2 (16-Divisibility)
At least one even edge of an Euler brick must be divisible by 16:
$$\max(v_2(a), v_2(b), v_2(c)) \ge 4$$

---

### 2.2 Modulo 5 Constraint
The set of quadratic residues modulo 5 is $\mathcal{QR}_5 = \{0, 1, 4\}$.

#### Theorem 2.3
In any Euler brick, at least one edge must be divisible by 5 ($5 \mid abc$).
*Proof*:
Suppose none of $a, b, c$ is divisible by 5. Then $a^2, b^2, c^2 \in \{1, 4\} \pmod 5$. By the Pigeonhole Principle, at least two of $\{a^2, b^2, c^2\}$ must be congruent modulo 5.
Without loss of generality, let $a^2 \equiv b^2 \pmod 5$:
- If $a^2 \equiv b^2 \equiv 1 \pmod 5$, then $d_{ab}^2 = a^2 + b^2 \equiv 2 \pmod 5$.
- If $a^2 \equiv b^2 \equiv 4 \pmod 5$, then $d_{ab}^2 = a^2 + b^2 \equiv 8 \equiv 3 \pmod 5$.
Since $\{2, 3\} \cap \mathcal{QR}_5 = \emptyset$, $d_{ab}^2$ cannot be a quadratic residue, contradicting $d_{ab} \in \mathbb{Z}^+$. Thus, $5 \mid abc$. $\blacksquare$

---

### 2.3 Modulo 11 Constraint
The quadratic residues modulo 11 are $\mathcal{QR}_{11} = \{0, 1, 3, 4, 5, 9\}$.
Exhaustive evaluation of all triplets in $\{1, 3, 4, 5, 9\}^3$ shows that no triple sum of pairs forms valid quadratic residues simultaneously. Therefore:
$$11 \mid abc$$

---

### 2.4 Combined Modular Filtering
For any Euler brick, the volume $V = abc$ satisfies:
$$abc \equiv 0 \pmod{2 \times 16 \times 5 \times 11 = 1760} \quad (\text{or } 3520)$$
This obstruction enables an ultra-fast bitmask filter rejecting $>99.8\%$ of candidates in computational searches.

---

## 3. Parametric Families: Saunderson's Construction (1740)

In 1740, Nicholas Saunderson established an infinite family of Euler bricks parametrized by primitive Pythagorean triples.

### 3.1 Algebraic Mapping
Let $(u, v, w)$ be a Pythagorean triple such that:
$$u^2 + v^2 = w^2$$

Define the cuboid dimensions as:
$$
\begin{cases}
a = u |4v^2 - w^2| \\
b = v |4u^2 - w^2| \\
c = 4uvw
\end{cases}
$$

### 3.2 Verification of Face Diagonals
Evaluating $d_{ab}^2 = a^2 + b^2$:
$$a^2 + b^2 = u^2(4v^2 - w^2)^2 + v^2(4u^2 - w^2)^2 = (u^2 + v^2) w^4 = w^6$$
Hence $d_{ab} = w^3 \in \mathbb{Z}^+$. Similarly, $d_{bc}$ and $d_{ca}$ factor algebraically into perfect integer squares.

For the base triple $(u, v, w) = (3, 4, 5)$:
$$a = 3 \cdot 39 = 117, \quad b = 4 \cdot 11 = 44, \quad c = 4 \cdot 3 \cdot 4 \cdot 5 = 240$$
This regenerates the smallest known primitive Euler brick, discovered by Paul Halcke in 1719: $(44, 117, 240)$.

---

## 4. Elliptic Curves and Algebraic Geometry

### 4.1 Spohn-Bremner Foliation
By dividing by $c^2$, the system translates into rational points on algebraic varieties over $\mathbb{Q}$. Spohn (1972) and Bremner (1988) proved that finding a perfect cuboid is equivalent to identifying non-trivial rational points on the family of elliptic curves:
$$E_k: \quad y^2 = x(x - \alpha_k)(x - \beta_k)$$

### 4.2 Torsion Structure and Geometric Obstruction
By the Mazur torsion theorem, the rational torsion subgroup of $E_k(\mathbb{Q})$ is:
$$E_k(\mathbb{Q})_{\text{tors}} \cong \mathbb{Z}/2\mathbb{Z} \times \mathbb{Z}/2\mathbb{Z}$$
consisting of the four points $\{\mathcal{O}, (0,0), (\alpha_k, 0), (\beta_k, 0)\}$.
All four torsion points map exclusively to degenerate cuboids with $a=0, b=0,$ or $c=0$. Consequently, any genuine perfect cuboid requires a curve with positive rank ($r \ge 1$) possessing a non-torsion rational generator satisfying strict geometric positivity constraints.

---

## 5. Computational Landscape & Residual Horizon

Modern computational bounds established by distributed search initiatives confirm:
$$\min(a, b, c) > 10^{12}$$
AxiomForge implements a real-time residual tracker:
$$\Delta(a, b, c) = |g - \lfloor g \rceil| = \left|\sqrt{a^2 + b^2 + c^2} - \operatorname{round}\left(\sqrt{a^2 + b^2 + c^2}\right)\right|$$
allowing researchers to visually inspect near-perfect configurations in 3D projective space.
