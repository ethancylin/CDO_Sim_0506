# Speaker Note: One-Factor Gaussian Copula for CDO Pricing

## Slide 1: Introduction and Portfolio Construction
*   **Focus:** Define the asset pool and parameters.
*   **Key Concept:** Homogeneous portfolio assumption simplifies the math while preserving core systemic risk dynamics.

**Speaker Script:**
"Good [morning/afternoon]. Today we'll deconstruct the pricing mechanics of a synthetic Collateralized Debt Obligation, or CDO, using the industry-standard One-Factor Gaussian Copula model, originally pioneered by David Li.

Let's begin with portfolio construction. We are evaluating a stylized, homogeneous pool of 10 investment-grade corporate entities drawn from the CDX.NA.IG.BBB index.

For mathematical tractability in this demonstration, we assume equal weighting—each firm represents exactly 10% of the total notional. We fix the 5-year cumulative probability of default, $p$, at 1.58%, and assume a constant Recovery Rate ($R$) of 40%.

Therefore, Loss Given Default (LGD), defined as $(1 - R)$, is 60%. Because each firm is 10% of the pool, a single default results in a fixed portfolio loss of exactly 6.00% ($0.10 \times 0.60$)."

## Slide 2: The One-Factor Gaussian Copula Framework
*   **Focus:** The structural model of default and the systemic factor.
*   **Key Concept:** Linking firm asset values to a latent market variable to induce correlation.

**Speaker Script:**
"The central challenge in CDO pricing is modeling default dependence—firms do not default in isolation during a crisis. We use a latent variable approach.

We define a normalized asset return, $A_i$, for each firm $i$. Default occurs if $A_i$ falls below a threshold $K$. Since we want the marginal probability of default to be $p$, and $A_i$ is standard normal, $K$ is simply the inverse CDF, or $\Phi^{-1}(p)$.

To introduce correlation, we decompose $A_i$ into two orthogonal standard normal components: a systemic market factor $M$, and an idiosyncratic firm-specific shock $\epsilon_i$.

The equation is:
$$A_i = \sqrt{\rho} M + \sqrt{1-\rho} \epsilon_i$$

Here, $\rho$ (rho) is the asset correlation coefficient. The beauty of this One-Factor model is that, conditional on a realized state of the market $M=m$, the asset returns $A_i$, and therefore the default events, become mutually independent."

## Slide 3: Conditional Probability of Default
*   **Focus:** Calculating PD given the market state.
*   **Key Concept:** The core algebraic transformation in the code.

**Speaker Script:**
"Let's look at the conditional probability. Given a specific market realization $m$, what is the probability that firm $i$ defaults?

We substitute our threshold:
$$P(A_i \le K | M=m) = P(\sqrt{\rho} m + \sqrt{1-\rho} \epsilon_i \le K)$$

Rearranging for the idiosyncratic shock $\epsilon_i$, we get:
$$P\left(\epsilon_i \le \frac{K - \sqrt{\rho} m}{\sqrt{1-\rho}}\right)$$

Since $\epsilon_i$ is standard normal, this conditional probability, which we'll call $p(m)$, is evaluated using the standard normal CDF ($\Phi$).

If you look at our Python implementation in `calculate_cdo.py`, specifically the `cond_default_prob` function, this exact derivation is the engine. We calculate `num = k - math.sqrt(rho) * m` and `denom = math.sqrt(1 - rho)`, returning `stats.norm.cdf(num / denom)`."

## Slide 4: The Loss Distribution (PMF) via Numerical Integration
*   **Focus:** Moving from conditional independence to the unconditional portfolio distribution.
*   **Key Concept:** Gaussian Quadrature and the Binomial expansion.

**Speaker Script:**
"Because defaults are conditionally independent given $M$, the number of defaults $k$ in our 10-firm portfolio follows a Binomial distribution with probability $p(m)$.

However, we need the unconditional distribution. We find this by integrating over the standard normal density of the market factor $M$, denoted $\phi(m)$.

$$P(\text{Defaults} = k) = \int_{-\infty}^{\infty} \binom{N}{k} p(m)^k (1-p(m))^{N-k} \phi(m) dm$$

In practice, analytical integration is impossible. Our codebase uses numerical integration—specifically a midpoint quadrature method with 100 slices across the domain of $M$ (from -6 to +6 standard deviations). For each slice, we compute the Binomial probabilities and weight them by the standard normal PDF of that slice, summing them to build the complete Probability Mass Function (PMF) of portfolio defaults."

## Slide 5: Tranche Impairment and Expected Loss (EL)
*   **Focus:** Mapping portfolio loss to tranche structures.
*   **Key Concept:** The non-linear payoff of CDO tranches.

**Speaker Script:**
"Finally, we map this loss distribution to the capital structure. We define four tranches by their attachment and detachment points:
1.  Equity: 0% to 3%
2.  Mezzanine: 3% to 6%
3.  Senior: 6% to 10%
4.  Super Senior: 10% to 100%

Remember, each default causes a 6% portfolio loss. Therefore, the very first default instantly wipes out the Equity tranche (capped at 3%) and the Mezzanine tranche (hit from 3% to 6%). The Senior tranche (6% to 10%) only begins to suffer impairment upon a second default.

For any given number of defaults $k$, resulting in portfolio loss $L_k$, the loss to a specific tranche $[A, D]$ is:
$$\max(\min(L_k, D) - A, 0)$$

Expected Loss (EL) is then the sumproduct of these tranche losses and the unconditional probabilities we derived via quadrature, normalized by the tranche size.

By shifting $\rho$ in our interactive laboratory, we observe the 'tail risk' phenomenon: higher correlation flattens the PMF, pushing probability mass into the multi-default scenarios, dramatically increasing the Expected Loss of the Senior and Super Senior layers while providing slight relief to the Equity tranche.

Are there any questions on the mathematical formulation or the numerical integration approach?"