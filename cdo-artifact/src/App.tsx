import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ShieldAlert, TrendingDown, Percent, Activity, Info } from 'lucide-react';
import cdoData from './cdo_results.json';

const TrancheWaterfall = ({ tranches }: { tranches: any[] }) => {
  return (
    <div className="flex flex-col gap-1 h-[450px]">
      {tranches.map((t, i) => {
        // Expected Loss is provided per tranche in the JSON.
        // Size is detachment - attachment.
        const fillPercent = (t.expected_loss / t.size) * 100;
        return (
          <div 
            key={i} 
            className="relative border border-zinc-800 bg-zinc-900/30 flex items-center justify-center overflow-hidden transition-all duration-500"
            style={{ 
                height: `${i === 3 ? 60 : 13}%`, // Scale Super Senior (i=3) larger for visibility
                borderColor: `${t.color}30`
            }}
          >
            {/* Loss Fill - Top Down */}
            <div 
              className="absolute top-0 left-0 w-full transition-all duration-700 ease-out"
              style={{ 
                height: `${fillPercent}%`,
                backgroundColor: t.color,
                opacity: 0.25 
              }}
            />
            <div className="relative z-10 text-center">
              <span className="block font-mono text-[10px] uppercase tracking-tighter opacity-50" style={{ color: t.color }}>
                {t.name}
              </span>
              <span className="block font-serif text-sm font-bold text-zinc-100">
                {(t.lower * 100).toFixed(0)}-{(t.upper * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default function App() {
  const { firms, scenarios, assumptions } = cdoData as any;
  const [selectedRho, setSelectedRho] = useState<string>("0.0");

  const currentScenario = scenarios[selectedRho];
  const distribution = currentScenario.distribution;
  const tranches = currentScenario.tranches;

  const chartData = useMemo(() => {
    return distribution.slice(0, 7).map((d: any) => ({
      ...d,
      probPercent: d.probability * 100
    }));
  }, [distribution]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8 font-sans selection:bg-primary/30">
      <div className="max-w-6xl mx-auto space-y-12">

        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-sky-400">
            <Activity className="w-8 h-8" />
            <span className="text-sm font-bold tracking-widest uppercase opacity-70">Quantitative Analysis</span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter mb-2 bg-gradient-to-br from-white to-zinc-500 bg-clip-text text-transparent">
            5-Year CDO Analysis
          </h1>
          <p className="text-zinc-400 text-xl max-w-2xl leading-relaxed font-light">
            One-Factor Gaussian Copula simulation for a synthetic Collateralized Debt Obligation comprised of 10 S&P entities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Params Card */}
          <div className="col-span-1 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 backdrop-blur-sm">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
              <Activity className="w-5 h-5 text-zinc-400" />
              Parameters
            </h2>
            <div className="space-y-5">
              <div className="flex justify-between items-center pb-3 border-b border-zinc-800/50">
                <span className="text-zinc-500 text-sm">Default Rate (5y)</span>
                <span className="font-mono font-bold text-emerald-400">{(assumptions.default_rate * 100).toFixed(2)}%</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-zinc-800/50">
                <span className="text-zinc-500 text-sm">Recovery Rate</span>
                <span className="font-mono font-bold text-blue-400">{(assumptions.recovery_rate * 100).toFixed(0)}%</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-zinc-800/50">
                <span className="text-zinc-500 text-sm">LGD</span>
                <span className="font-mono font-bold text-zinc-300">{((1 - assumptions.recovery_rate) * 100).toFixed(0)}%</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-zinc-800/50">
                <span className="text-zinc-500 text-sm">Correlation (ρ)</span>
                <span className="font-mono font-bold text-sky-400">{Number(selectedRho).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 text-sm">Loss Per Default</span>
                <span className="font-mono font-bold text-zinc-100">{(assumptions.loss_per_default * 100).toFixed(2)}%</span>
              </div>
            </div>
          </div>

          {/* Firms List */}
          <div className="col-span-1 md:col-span-2 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 backdrop-blur-sm">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 text-zinc-400" />
              Reference Portfolio
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {firms.map((firm: string, i: number) => (
                <div key={i} className="px-5 py-3 bg-zinc-800/30 rounded-xl border border-zinc-800/50 text-sm flex items-center gap-4 group hover:border-zinc-700 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-zinc-800 text-zinc-400 flex items-center justify-center text-xs font-bold group-hover:bg-zinc-700 group-hover:text-zinc-200 transition-colors">
                    {i + 1}
                  </div>
                  <span className="font-medium text-zinc-300 group-hover:text-zinc-100">{firm}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Interactive Lab Control */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 backdrop-blur-sm space-y-6">
            <div className="flex justify-between items-start">
                <div className="space-y-1">
                    <h3 className="text-2xl font-black flex items-center gap-3">
                        <Activity className="w-6 h-6 text-sky-400" />
                        Gaussian Copula: Systemic Risk Analysis
                    </h3>
                    <p className="text-zinc-500 text-sm font-mono tracking-tight uppercase">Interactive Stress Testing Laboratory</p>
                </div>
                <span className="px-3 py-1 bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded-full text-xs font-bold font-mono uppercase tracking-wider">Option A</span>
            </div>
            <p className="text-zinc-400 text-sm max-w-4xl leading-relaxed">
                Adjust the asset correlation (ρ) to see how systemic dependence reshapes the loss distribution. As ρ increases, the probability of zero defaults and the probability of many defaults both rise. This "hollows out" the center, increasing risk for the Senior tranche while making the Equity tranche paradoxically "safer" from total wipeout compared to the independent case.
            </p>
            <div className="pt-6 pb-2 border-t border-zinc-800/50">
                <div className="flex justify-between items-center mb-6">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Asset Correlation Scenario (ρ)</label>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black text-sky-400 font-mono leading-none">{Number(selectedRho).toFixed(1)}</span>
                        <span className="text-zinc-600 text-xs font-mono">/ 1.0</span>
                    </div>
                </div>
                <input 
                    type="range" 
                    min="-1.0" 
                    max="1.0" 
                    step="0.2" 
                    value={selectedRho} 
                    onChange={(e) => setSelectedRho(Number(e.target.value).toFixed(1))}
                    className="w-full h-3 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
                />
                <div className="flex justify-between text-[10px] font-mono text-zinc-600 mt-4 tracking-wider uppercase">
                    <span className={Number(selectedRho) < -0.1 ? "text-sky-400/70" : ""}>-1.0 Anticorrelated</span>
                    <span className={Math.abs(Number(selectedRho)) < 0.1 ? "text-emerald-400/70" : ""}>0.0 Independent</span>
                    <span className={Number(selectedRho) > 0.1 ? "text-rose-400/70" : ""}>1.0 Systemic Crisis</span>
                </div>
            </div>
        </div>

        {/* Tranche Analysis */}
        <div className="space-y-6">
          <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <Percent className="w-8 h-8 text-zinc-400" />
            Tranche Risk Profiles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tranches.map((t: any, i: number) => (
              <div key={i} className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 relative overflow-hidden group hover:border-zinc-700 transition-all">
                <div className="absolute top-0 left-0 w-full h-1.5 opacity-70" style={{ backgroundColor: t.color }}></div>
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="text-2xl font-black">{t.name}</h3>
                    <p className="text-zinc-500 font-mono text-sm">{(t.lower * 100).toFixed(0)}% - {(t.upper * 100).toFixed(0)}%</p>
                  </div>
                  <div className="px-3 py-1 rounded-md text-xs font-bold border tracking-wider uppercase" style={{ color: t.color, borderColor: `${t.color}40`, backgroundColor: `${t.color}10` }}>
                    Size: {(t.size * 100).toFixed(0)}%
                  </div>
                </div>

                <div className="space-y-8">
                  <div>
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Prob. of Default</p>
                    <p className="text-4xl font-black font-mono">{(t.probability_of_default * 100).toFixed(3)}%</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Expected Loss</p>
                    <p className="text-4xl font-black font-mono">{(t.expected_loss * 100).toFixed(3)}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 border border-zinc-800 bg-zinc-900/30 rounded-2xl flex gap-5 items-start">
            <div className="p-3 bg-zinc-800 rounded-xl">
              <Info className="w-6 h-6 text-zinc-400" />
            </div>
            <div>
              <h3 className="text-zinc-100 font-bold mb-2">Simultaneous Wipeout Analysis (ρ = {Number(selectedRho).toFixed(1)})</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">
                {Math.abs(Number(selectedRho)) < 0.1 ? (
                  <>Under the independent default assumption with a 6.00% loss per event, both the <strong>Equity</strong> and <strong>Mezzanine</strong> tranches are fully exposed to the first default. A single default triggers a complete principal loss for both.</>
                ) : Number(selectedRho) > 0.4 ? (
                  <>In this high correlation regime, the "tail" of the distribution is heavily weighted. While the probability of <em>any</em> default might be lower than the independent case, the conditional probability of multiple defaults given one failure is much higher, severely threatening the <strong>Senior</strong> tranche.</>
                ) : (
                  <>At moderate or negative correlation, defaults are more idiosyncratic. The Senior tranche remains structurally protected by the diversification effect, as the probability of the multiple defaults required to reach the 6% attachment point remains low.</>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Visualizations */}
        <div className="space-y-6 pb-12">
          <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <TrendingDown className="w-8 h-8 text-zinc-400" />
            Default Distribution {Number(selectedRho) !== 0 && <span className="text-sky-400 italic text-xl ml-2 font-light">Correlated Case</span>}
          </h2>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 h-[450px] backdrop-blur-sm">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis
                  dataKey="defaults"
                  tickFormatter={(val) => `${val} Default${val !== 1 ? 's' : ''}`}
                  stroke="#52525b"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis
                  stroke="#52525b"
                  tickFormatter={(val) => `${val}%`}
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: '#27272a', opacity: 0.4 }}
                  contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '12px' }}
                  itemStyle={{ color: '#f4f4f5' }}
                  formatter={(value: any) => [`${Number(value).toFixed(4)}%`, 'Probability']}
                  labelFormatter={(label) => `${label} Firm(s) Defaulting`}
                />
                <Bar dataKey="probPercent" radius={[6, 6, 0, 0]}>
                  {
                    chartData.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : index === 1 ? '#f43f5e' : '#9f1239'} />
                    ))
                  }
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Methodology Explanation */}
        <div className="space-y-6 pb-12">
          <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <Info className="w-8 h-8 text-zinc-400" />
            How This CDO Was Constructed
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Step 1: Portfolio Construction */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm font-black">1</div>
                <h3 className="text-lg font-bold">Portfolio Construction & Assumptions</h3>
              </div>
              <p className="text-zinc-400 text-sm leading-relaxed">
                The CDO collateral pool uses <strong className="text-zinc-200">10 equally weighted firms</strong> randomly selected from the S&P CDX.NA.IG.BBB.46-V1 index. Because all firms share the same 10% weight:
              </p>
              <ul className="mt-3 space-y-2 text-sm text-zinc-400">
                <li className="flex gap-2"><span className="text-emerald-400 font-bold mt-0.5">→</span><span>Each firm represents <strong className="text-zinc-200">10%</strong> of the portfolio notional.</span></li>
                <li className="flex gap-2"><span className="text-emerald-400 font-bold mt-0.5">→</span><span>Recovery Rate = <strong className="text-zinc-200">40%</strong>, so Loss Given Default (LGD) = <strong className="text-zinc-200">60%</strong>.</span></li>
                <li className="flex gap-2"><span className="text-emerald-400 font-bold mt-0.5">→</span><span>One firm default generates a loss of <strong className="text-zinc-200">10% × 60% = 6.00%</strong> to the entire portfolio.</span></li>
              </ul>
            </div>

            {/* Step 2: Gaussian Copula Model */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm font-black">2</div>
                <h3 className="text-lg font-bold">One-Factor Gaussian Copula</h3>
              </div>
              <p className="text-zinc-400 text-sm leading-relaxed">
                We model default dependence using the standard Vasicek/Li framework. Each firm's asset return <em>A<sub>i</sub></em> is driven by a common systemic factor <em>M</em> and an idiosyncratic shock ε<sub>i</sub>:
              </p>
              <div className="mt-4 p-4 bg-zinc-800/50 rounded-xl font-mono text-xs text-center text-zinc-300">
                A<sub>i</sub> = √(ρ)M + √(1−|ρ|)ε<sub>i</sub>
              </div>
              <p className="mt-3 text-zinc-400 text-sm leading-relaxed">
                The probability of <em>k</em> defaults is found by numerically integrating the conditional binomial distribution across the normal distribution of the systemic factor <em>M</em>.
              </p>
            </div>

            {/* Step 3: Tranche Waterfall */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-sm font-black">3</div>
                <h3 className="text-lg font-bold">Tranche Structure & Expected Loss</h3>
              </div>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Losses flow from the bottom up. The Expected Loss (EL) for each tranche is computed as the probability-weighted average of tranche losses across all 11 correlation scenarios:
              </p>
              <div className="mt-4 p-4 bg-zinc-800/50 rounded-xl font-mono text-sm text-center text-zinc-300">
                EL = Σ P(k) × max(0, min(L_k, upper) − lower) / size
              </div>
              <p className="mt-3 text-zinc-400 text-sm leading-relaxed">
                where <em>L_k</em> is portfolio loss under scenario <em>k</em>, and <em>size</em> = detachment − attachment point.
              </p>
            </div>

            {/* Step 4: PD per tranche */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center text-sm font-black">4</div>
                <h3 className="text-lg font-bold">Probability of Default per Tranche</h3>
              </div>
              <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                A tranche is "in default" the moment portfolio loss exceeds its attachment point. The 6% loss-per-default creates a unique stepped dynamic:
              </p>
              <ul className="space-y-3 text-sm">
                <li className="flex gap-3 items-start">
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-red-900/40 text-red-400 border border-red-800/50 shrink-0">Equity 0–3%</span>
                  <span className="text-zinc-400">Triggered by ≥ 1 default (loss &gt; 0%). PD = P(k ≥ 1) = 1 − P(k=0)</span>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-900/40 text-amber-400 border border-amber-800/50 shrink-0">Mezz 3–6%</span>
                  <span className="text-zinc-400">Triggered by ≥ 1 default too (loss jumps straight to 6%, skipping 3–6% range). PD = P(k ≥ 1)</span>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-900/40 text-blue-400 border border-blue-800/50 shrink-0">Senior 6–10%</span>
                  <span className="text-zinc-400">Triggered only by ≥ 2 defaults (loss = 12% &gt; 6%). PD = P(k ≥ 2) = 1 − P(k=0) − P(k=1)</span>
                </li>
              </ul>
            </div>

          </div>

          {/* Reference Link */}
          <div className="flex items-center gap-4 p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
            <div className="p-3 bg-zinc-800 rounded-xl shrink-0">
              <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-zinc-200 mb-1">Reference Index Document</p>
              <p className="text-sm text-zinc-500 mb-2">The reference entities in this CDO are drawn from the S&P CDX.NA.IG.BBB.46-V1 index annex (effective 20 March 2026).</p>
              <a
                href="https://www.spglobal.com/spdji/en/documents/index-news-and-announcements/CDX.NA.IG.BBB.46-V1%20Index%20Annex.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors font-mono underline underline-offset-4"
              >
                CDX.NA.IG.BBB.46-V1 Index Annex (PDF)
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
