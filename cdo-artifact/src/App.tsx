import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ShieldAlert, TrendingDown, Percent, Activity } from 'lucide-react';

const FIRMS = [
  "Ally Financial Inc.",
  "AT&T Inc.",
  "Best Buy Co., Inc.",
  "Capital One Financial Corporation",
  "CVS Health Corporation",
  "Delta Air Lines, Inc.",
  "Ford Motor Company",
  "Intel Corporation",
  "McDONALD'S CORPORATION",
  "Verizon Communications Inc."
];

const DEFAULT_RATE = 0.0158; // 1.58% cumulative 5-year default rate
const RECOVERY_RATE = 0.40;
const FIRMS_COUNT = 10;
const LGD = 1 - RECOVERY_RATE;

// Math combinations
function combine(n: number, k: number): number {
  if (k === 0 || k === n) return 1;
  let result = 1;
  for (let i = 1; i <= k; i++) {
    result = (result * (n - i + 1)) / i;
  }
  return result;
}

// Binomial probability
function binomialProb(n: number, k: number, p: number): number {
  return combine(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
}

export default function App() {
  const calculations = useMemo(() => {
    const p = DEFAULT_RATE;
    interface DistributionItem {
      defaults: number;
      probability: number;
      probPercent: number;
      portfolioLoss: number;
      lossPercent: number;
    }
    const distribution: DistributionItem[] = [];
    let p_0 = 0;
    let p_1 = 0;
    
    for (let k = 0; k <= FIRMS_COUNT; k++) {
      const prob = binomialProb(FIRMS_COUNT, k, p);
      const loss = k * (LGD / FIRMS_COUNT); // 0.06 per default
      
      if (k === 0) p_0 = prob;
      if (k === 1) p_1 = prob;

      distribution.push({
        defaults: k,
        probability: prob,
        probPercent: prob * 100,
        portfolioLoss: loss,
        lossPercent: loss * 100
      });
    }

    const probAtLeast1 = 1 - p_0;
    const probAtLeast2 = 1 - p_0 - p_1;

    // Tranche definitions
    const tranches = [
      { name: "Equity", lower: 0.00, upper: 0.03, color: "#ef4444" },
      { name: "Mezzanine", lower: 0.03, upper: 0.06, color: "#f59e0b" },
      { name: "Senior", lower: 0.06, upper: 0.10, color: "#3b82f6" }
    ].map(t => {
      const size = t.upper - t.lower;
      let expectedLoss = 0;

      // Calculate Expected Loss
      distribution.forEach(d => {
        const trancheLoss = Math.max(0, Math.min(d.portfolioLoss, t.upper) - t.lower);
        expectedLoss += (trancheLoss / size) * d.probability;
      });

      // Calculate Default Probability (probability of taking ANY loss)
      // Eq (0-3%) takes loss if L > 0 (k >= 1)
      // Mezz (3-6%) takes loss if L > 3%. Since L=6% at k=1, Mezz takes loss if k >= 1
      // Sen (6-10%) takes loss if L > 6%. Since L=6% at k=1, Sen takes loss if k >= 2
      let pd = 0;
      if (t.name === "Equity") pd = probAtLeast1;
      else if (t.name === "Mezzanine") pd = probAtLeast1;
      else if (t.name === "Senior") pd = probAtLeast2;

      return {
        ...t,
        size,
        expectedLoss: expectedLoss,
        probabilityOfDefault: pd
      };
    });

    return { distribution, tranches };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="border-b border-border pb-6">
          <h1 className="text-4xl font-bold tracking-tight mb-2">5-Year CDO Analysis</h1>
          <p className="text-muted-foreground text-lg">
            Analyzing a customized Collateralized Debt Obligation comprised of 10 S&P index firms.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Params Card */}
          <div className="col-span-1 border border-border bg-card rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Model Assumptions
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-border/50">
                <span className="text-muted-foreground">Cumulative Default Rate</span>
                <span className="font-mono font-medium">1.58%</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-border/50">
                <span className="text-muted-foreground">Recovery Rate</span>
                <span className="font-mono font-medium">40%</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-border/50">
                <span className="text-muted-foreground">Loss Given Default (LGD)</span>
                <span className="font-mono font-medium">60%</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-border/50">
                <span className="text-muted-foreground">Default Correlation</span>
                <span className="font-mono font-medium">0.0 (Independent)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Loss Per Default</span>
                <span className="font-mono font-medium">6.00%</span>
              </div>
            </div>
            <div className="mt-6 p-4 bg-primary/10 rounded-lg text-sm text-primary/80 border border-primary/20">
              With 10 firms and a 40% recovery rate, every individual firm default generates a 6.00% loss to the overall portfolio.
            </div>
          </div>

          {/* Firms List */}
          <div className="col-span-1 md:col-span-2 border border-border bg-card rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-primary" />
              Reference Portfolio (10 Firms)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {FIRMS.map((firm, i) => (
                <div key={i} className="px-4 py-2 bg-secondary/50 rounded border border-border/50 text-sm flex items-center gap-3">
                  <div className="w-6 h-6 rounded bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </div>
                  {firm}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tranche Analysis */}
        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-4 mt-8 flex items-center gap-2">
            <Percent className="w-6 h-6" />
            Tranche Analysis
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {calculations.tranches.map((t, i) => (
              <div key={i} className="border border-border bg-card rounded-xl p-6 shadow-sm flex flex-col relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: t.color }}></div>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-bold">{t.name}</h3>
                    <p className="text-muted-foreground">{(t.lower * 100).toFixed(0)}% - {(t.upper * 100).toFixed(0)}%</p>
                  </div>
                  <div className="px-3 py-1 rounded-full text-sm font-semibold border" style={{ color: t.color, borderColor: `${t.color}40`, backgroundColor: `${t.color}10` }}>
                    Size: {(t.size * 100).toFixed(0)}%
                  </div>
                </div>
                
                <div className="space-y-6 flex-grow">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Probability of Default</p>
                    <p className="text-3xl font-mono">{(t.probabilityOfDefault * 100).toFixed(3)}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Expected Loss (% of Tranche)</p>
                    <p className="text-3xl font-mono">{(t.expectedLoss * 100).toFixed(3)}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-5 border border-amber-500/30 bg-amber-500/5 rounded-xl">
            <h3 className="text-amber-500 font-semibold mb-2">Mathematical Quirk: Simultaneous Wipeout</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              You might notice that both the <strong>Equity (0-3%)</strong> and <strong>Mezzanine (3-6%)</strong> tranches have the exact same Probability of Default (14.717%). 
              This is because a single firm default causes a 6% loss to the portfolio. Since 6% completely covers both the 0-3% and 3-6% ranges, 
              if even one firm defaults, both tranches are instantly and fully wiped out at the same time. The Senior tranche (6-10%) requires at least 2 defaults to take a loss.
            </p>
          </div>
        </div>

        {/* Visualizations */}
        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-4 mt-8 flex items-center gap-2">
            <TrendingDown className="w-6 h-6" />
            Default Probability Distribution
          </h2>
          <div className="border border-border bg-card rounded-xl p-6 shadow-sm h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={calculations.distribution.slice(0, 5)} // Only show 0-4 defaults for visual clarity since >4 is ~0%
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis 
                  dataKey="defaults" 
                  tickFormatter={(val) => `${val} Defaults`}
                  stroke="#888" 
                />
                <YAxis 
                  stroke="#888" 
                  tickFormatter={(val) => `${val}%`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1b1e', borderColor: '#333' }}
                  formatter={(value: any) => [`${Number(value).toFixed(4)}%`, 'Probability']}
                  labelFormatter={(label) => `${label} Firm(s) Defaulting`}
                />
                <Bar dataKey="probPercent" name="Probability">
                  {
                    calculations.distribution.slice(0, 5).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : index === 1 ? '#ef4444' : '#b91c1c'} />
                    ))
                  }
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
