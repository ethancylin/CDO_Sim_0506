import random
import json
import math
import numpy as np
import scipy.stats as stats

# --- Constants ---
P_DEFAULT = 0.0158
RECOVERY_RATE = 0.40
NUM_FIRMS = 10
LGD = 1 - RECOVERY_RATE
LOSS_PER_DEFAULT = LGD / NUM_FIRMS # 0.06

TRANCHES_DEF = [
    {"name": "Equity", "lower": 0.00, "upper": 0.03, "color": "#ff6b8a"},
    {"name": "Mezzanine", "lower": 0.03, "upper": 0.06, "color": "#ffb74d"},
    {"name": "Senior", "lower": 0.06, "upper": 0.10, "color": "#5dd3ff"},
    {"name": "Super Senior", "lower": 0.10, "upper": 1.00, "color": "#9aa6c2"}
]

def calculate_tranche_results(distribution, tranches_def):
    results = []
    for t in tranches_def:
        size = t['upper'] - t['lower']
        expected_loss = 0
        pd_val = 0
        for d in distribution:
            tranche_loss = max(0, min(d['portfolio_loss'], t['upper']) - t['lower'])
            expected_loss += (tranche_loss / size) * d['probability']
            if d['portfolio_loss'] > t['lower']:
                pd_val += d['probability']
        
        results.append({
            "name": t['name'],
            "lower": t['lower'],
            "upper": t['upper'],
            "color": t['color'],
            "expected_loss": expected_loss,
            "probability_of_default": pd_val,
            "size": size
        })
    return results

# --- Methodology 1: Gaussian Copula (Numerical Integration) ---

def cond_default_prob(p, rho, m):
    k = stats.norm.ppf(p)
    num = k - math.sqrt(rho) * m
    denom = math.sqrt(1 - rho)
    if denom == 0:
        return 1.0 if num >= 0 else 0.0
    return stats.norm.cdf(num / denom)

def loss_pmf_copula(n_firms, p, rho, n_quad=100):
    pmf = [0.0] * (n_firms + 1)
    m_min, m_max = -6.0, 6.0
    dm = (m_max - m_min) / n_quad
    
    for i in range(n_quad):
        m = m_min + (i + 0.5) * dm
        w = stats.norm.pdf(m) * dm
        pd_cond = cond_default_prob(p, rho, m)
        for k in range(n_firms + 1):
            prob_k = math.comb(n_firms, k) * (pd_cond**k) * ((1 - pd_cond)**(n_firms - k))
            pmf[k] += w * prob_k
            
    total = sum(pmf)
    return [x / total for x in pmf]

# --- Methodology 2: Simple Independent Binomial ---

def loss_pmf_binomial(n_firms, p):
    pmf = []
    for k in range(n_firms + 1):
        prob_k = math.comb(n_firms, k) * (p**k) * ((1 - p)**(n_firms - k))
        pmf.append(prob_k)
    return pmf

# --- Methodology 3: Monte Carlo Simulation ---

def run_monte_carlo_scenario(n_firms, p, rho, n_sims=100000):
    k_thresh = stats.norm.ppf(p)
    
    # Generate factors
    m = np.random.normal(0, 1, n_sims)
    eps = np.random.normal(0, 1, (n_sims, n_firms))
    
    # Asset returns
    a = math.sqrt(rho) * m[:, np.newaxis] + math.sqrt(1 - rho) * eps
    
    # Defaults count per simulation
    defaults_counts = np.sum(a < k_thresh, axis=1)
    
    # PMF from simulation
    counts = np.bincount(defaults_counts, minlength=n_firms + 1)
    pmf = counts / n_sims
    
    # For MC page, we also want the convergence data for rho=0.4 (Senior Tranche)
    # We only return this for one specific scenario to keep JSON small
    convergence = []
    if abs(rho - 0.4) < 0.001:
        portfolio_losses = defaults_counts * LOSS_PER_DEFAULT
        # Senior tranche: 6% to 10%
        senior_losses = np.maximum(0, np.minimum(portfolio_losses, 0.10) - 0.06) / 0.04
        running_avg = np.cumsum(senior_losses) / np.arange(1, n_sims + 1)
        # Downsample convergence to 200 points for the UI
        indices = np.linspace(0, n_sims - 1, 200, dtype=int)
        convergence = [{"n": int(i+1), "el": float(running_avg[i])} for i in indices]
        
    return pmf.tolist(), convergence

def main():
    # Read firms
    try:
        with open('extracted_firms.txt', 'r', encoding='utf-8') as f:
            lines = f.readlines()
    except FileNotFoundError:
        lines = []

    firms = []
    for line in lines:
        parts = line.strip().split()
        if parts and parts[0].isdigit():
            name_parts = []
            for p in parts[1:]:
                if 'BBB,' in p or p in ['BBB', 'FIN', 'CONS', 'ENRG', 'TMT', 'INDU', 'HVOL']:
                    break
                name_parts.append(p)
            if name_parts:
                firms.append(" ".join(name_parts).rstrip(','))
    
    random.seed(42)
    np.random.seed(42)
    selected_firms = random.sample(firms, 10) if len(firms) >= 10 else ["Firm " + str(i) for i in range(1, 11)]
    
    rhos = [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]
    
    # 1. Copula Scenarios
    copula_methods = {}
    for r in rhos:
        pmf = loss_pmf_copula(NUM_FIRMS, P_DEFAULT, r)
        dist = [{"defaults": k, "probability": pmf[k], "portfolio_loss": k * LOSS_PER_DEFAULT} for k in range(NUM_FIRMS + 1)]
        copula_methods[f"{r:.1f}"] = {
            "distribution": dist,
            "tranches": calculate_tranche_results(dist, TRANCHES_DEF)
        }
    
    # 2. Binomial Results (Fixed rho=0)
    bin_pmf = loss_pmf_binomial(NUM_FIRMS, P_DEFAULT)
    bin_dist = [{"defaults": k, "probability": bin_pmf[k], "portfolio_loss": k * LOSS_PER_DEFAULT} for k in range(NUM_FIRMS + 1)]
    binomial_results = {
        "distribution": bin_dist,
        "tranches": calculate_tranche_results(bin_dist, TRANCHES_DEF)
    }
    
    # 3. Monte Carlo Scenarios
    mc_methods = {}
    convergence_data = []
    for r in rhos:
        pmf, conv = run_monte_carlo_scenario(NUM_FIRMS, P_DEFAULT, r)
        if conv:
            convergence_data = conv
        dist = [{"defaults": k, "probability": pmf[k], "portfolio_loss": k * LOSS_PER_DEFAULT} for k in range(NUM_FIRMS + 1)]
        mc_methods[f"{r:.1f}"] = {
            "distribution": dist,
            "tranches": calculate_tranche_results(dist, TRANCHES_DEF)
        }

    output = {
        "firms": selected_firms,
        "assumptions": {
            "default_rate": P_DEFAULT,
            "recovery_rate": RECOVERY_RATE,
            "loss_per_default": LOSS_PER_DEFAULT
        },
        "methods": {
            "copula": {"scenarios": copula_methods},
            "binomial": binomial_results,
            "monte_carlo": {
                "scenarios": mc_methods,
                "convergence": convergence_data
            }
        }
    }
    
    with open('cdo_results.json', 'w') as f:
        json.dump(output, f, indent=2)
    
    with open('cdo-artifact/src/cdo_results.json', 'w') as f:
        json.dump(output, f, indent=2)
    
    print(f"Calculation complete. Multi-method results generated.")

if __name__ == "__main__":
    main()
