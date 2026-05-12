import random
import json
import math
import scipy.stats as stats

# Cumulative 5-year default rate
P_DEFAULT = 0.0158
RECOVERY_RATE = 0.40
NUM_FIRMS = 10
LGD = 1 - RECOVERY_RATE
LOSS_PER_DEFAULT = LGD / NUM_FIRMS # 0.06

def combinations(n, k):
    return math.comb(n, k)

def cond_default_prob(p, rho, m):
    # Handle negative rho by using sgn(rho)*sqrt(|rho|)
    # This represents 'anticorrelation' with the market factor
    sign_rho = 1 if rho >= 0 else -1
    abs_rho = abs(rho)
    
    # Threshold in standard normal space
    k = stats.norm.ppf(p)
    
    # Conditional probability P(Default | M=m)
    # A_i = sqrt(rho)*M + sqrt(1-rho)*epsilon_i
    # Default if A_i <= k
    # P(epsilon_i <= (k - sqrt(rho)*m) / sqrt(1-rho))
    num = k - sign_rho * math.sqrt(abs_rho) * m
    denom = math.sqrt(1 - abs_rho)
    
    if denom == 0:
        return 1.0 if num >= 0 else 0.0
    return stats.norm.cdf(num / denom)

def loss_pmf_copula(n_firms, p, rho, n_quad=100):
    pmf = [0.0] * (n_firms + 1)
    # Integrate over M ~ N(0,1)
    m_min, m_max = -6.0, 6.0
    dm = (m_max - m_min) / n_quad
    
    for i in range(n_quad):
        m = m_min + (i + 0.5) * dm
        w = stats.norm.pdf(m) * dm
        pd_cond = cond_default_prob(p, rho, m)
        
        # Binomial distribution given conditional PD
        for k in range(n_firms + 1):
            prob_k = math.comb(n_firms, k) * (pd_cond**k) * ((1 - pd_cond)**(n_firms - k))
            pmf[k] += w * prob_k
            
    # Normalize to ensure total probability is 1
    total = sum(pmf)
    return [x / total for x in pmf]

def main():
    # Read firms
    with open('extracted_firms.txt', 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    # Filter lines that look like firm entries (start with a number)
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
    
    # Randomly pick 10
    random.seed(42)
    selected_firms = random.sample(firms, 10)
    
    # Scenarios
    rhos = [-1.0, -0.8, -0.6, -0.4, -0.2, 0.0, 0.2, 0.4, 0.6, 0.8, 1.0]
    
    tranches_def = [
        {"name": "Equity", "lower": 0.00, "upper": 0.03, "color": "#ff6b8a"},
        {"name": "Mezzanine", "lower": 0.03, "upper": 0.06, "color": "#ffb74d"},
        {"name": "Senior", "lower": 0.06, "upper": 0.10, "color": "#5dd3ff"},
        {"name": "Super Senior", "lower": 0.10, "upper": 1.00, "color": "#9aa6c2"}
    ]
    
    scenarios = {}
    for r in rhos:
        pmf = loss_pmf_copula(NUM_FIRMS, P_DEFAULT, r)
        
        distribution = []
        for k in range(NUM_FIRMS + 1):
            distribution.append({
                "defaults": k,
                "probability": pmf[k],
                "portfolio_loss": k * LOSS_PER_DEFAULT
            })
    
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
            
        scenarios[f"{r:.1f}"] = {
            "distribution": distribution,
            "tranches": results
        }
    
    output = {
        "firms": selected_firms,
        "scenarios": scenarios,
        "assumptions": {
            "default_rate": P_DEFAULT,
            "recovery_rate": RECOVERY_RATE,
            "loss_per_default": LOSS_PER_DEFAULT
        }
    }
    
    with open('cdo_results.json', 'w') as f:
        json.dump(output, f, indent=2)
    
    # Sync with artifact src
    with open('cdo-artifact/src/cdo_results.json', 'w') as f:
        json.dump(output, f, indent=2)
    
    print(f"Calculation complete. Scenarios generated for correlations: {rhos}")

if __name__ == "__main__":
    main()


if __name__ == "__main__":
    main()
