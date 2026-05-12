import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ShieldAlert } from 'lucide-react';
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
            <div className="relative z-10 text-center px-2">
              <span className="block font-mono text-[9px] uppercase tracking-tighter opacity-50 mb-0.5" style={{ color: t.color }}>
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
    <div className="min-h-screen p-8 selection:bg-sky-500/30">
      <div className="max-w-6xl mx-auto space-y-16">

        {/* Header */}
        <div className="space-y-6 border-b border-zinc-800/50 pb-12">
          <div className="flex items-center gap-4">
            <div className="h-[1px] w-12 bg-sky-500/50"></div>
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-sky-400">Quantitative Analysis</span>
          </div>
          <h1 className="font-serif text-7xl italic text-white tracking-tight">
            5-Year CDO Analysis
          </h1>
          <p className="font-serif text-2xl text-zinc-400 italic max-w-3xl leading-relaxed">
            A One-Factor Gaussian Copula simulation for a synthetic Collateralized Debt Obligation comprised of ten investment-grade reference entities.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Params Card */}
          <div className="col-span-1 journal-panel p-8">
            <h2 className="font-serif text-2xl italic mb-8 flex items-center gap-3">
              Market Assumptions
            </h2>
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-3 border-b border-zinc-800/50">
                <span className="text-zinc-500 text-xs uppercase tracking-widest">Default Rate (5y)</span>
                <span className="font-mono font-bold text-emerald-400">{(assumptions.default_rate * 100).toFixed(2)}%</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-zinc-800/50">
                <span className="text-zinc-500 text-xs uppercase tracking-widest">Recovery Rate</span>
                <span className="font-mono font-bold text-blue-400">{(assumptions.recovery_rate * 100).toFixed(0)}%</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-zinc-800/50">
                <span className="text-zinc-500 text-xs uppercase tracking-widest">LGD</span>
                <span className="font-mono font-bold text-zinc-300">{((1 - assumptions.recovery_rate) * 100).toFixed(0)}%</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-zinc-800/50">
                <span className="text-zinc-500 text-xs uppercase tracking-widest">Correlation (ρ)</span>
                <span className="font-mono font-bold text-sky-400">{Number(selectedRho).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 text-xs uppercase tracking-widest">Loss / Default</span>
                <span className="font-mono font-bold text-zinc-100">{(assumptions.loss_per_default * 100).toFixed(2)}%</span>
              </div>
            </div>
          </div>

          {/* Firms List */}
          <div className="col-span-1 lg:col-span-2 journal-panel p-8">
            <h2 className="font-serif text-2xl italic mb-8">Reference Portfolio</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {firms.map((firm: string, i: number) => (
                <div key={i} className="px-5 py-3 bg-white/5 border border-zinc-800/30 text-sm flex items-center gap-4 group transition-colors hover:border-sky-500/30">
                  <div className="font-mono text-[10px] text-zinc-600">
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <span className="font-serif text-zinc-300 group-hover:text-zinc-100 italic">{firm}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Interactive Lab Control */}
        <div className="journal-panel p-10 space-y-8">
            <div className="flex justify-between items-baseline">
                <div className="space-y-2">
                    <h3 className="font-serif text-4xl italic text-white">Systemic Risk Stress Test</h3>
                    <p className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-500">Correlation Sensitivity Laboratory</p>
                </div>
                <div className="flex items-baseline gap-3">
                    <span className="font-mono text-5xl font-bold text-sky-400">{Number(selectedRho).toFixed(1)}</span>
                    <span className="font-mono text-zinc-600 text-sm">RHO</span>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-8">
                <input 
                    type="range" 
                    min="-1.0" 
                    max="1.0" 
                    step="0.2" 
                    value={selectedRho} 
                    onChange={(e) => setSelectedRho(Number(e.target.value).toFixed(1))}
                    className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
                />
                <div className="flex justify-between font-mono text-[10px] text-zinc-500 mt-6 tracking-widest uppercase">
                    <span className={Number(selectedRho) < -0.1 ? "text-sky-400" : ""}>-1.0 Anticorrelated</span>
                    <span className={Math.abs(Number(selectedRho)) < 0.1 ? "text-emerald-400" : ""}>0.0 Independent</span>
                    <span className={Number(selectedRho) > 0.1 ? "text-rose-400" : ""}>1.0 Systemic Crisis</span>
                </div>
              </div>
              <div className="lg:col-span-4 border-l border-zinc-800/50 pl-10 hidden lg:block">
                <p className="font-serif text-zinc-400 italic text-sm leading-relaxed">
                  Adjusting &rho; shifts the distribution of defaults. Higher correlation increases the likelihood of "tail" events where many firms default simultaneously.
                </p>
              </div>
            </div>
        </div>

        {/* Tranche Analysis */}
        <div className="space-y-10">
          <div className="flex items-baseline gap-6 border-b border-zinc-800/50 pb-6">
            <h2 className="font-serif text-5xl italic text-white">Capital Structure Risk</h2>
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-500">Loss Waterfall Analysis</span>
          </div>

          <div className="grid grid-cols-12 gap-10">
            {/* Sidebar Waterfall */}
            <div className="col-span-12 lg:col-span-3">
              <div className="sticky top-8 space-y-6">
                <div className="journal-panel p-6">
                   <h3 className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-6">Visual Waterfall</h3>
                   <TrancheWaterfall tranches={tranches} />
                </div>
                
                {/* Editorial Sidebar */}
                <div className="p-6 border-l-2 border-sky-500/20 space-y-4">
                  <h4 className="font-serif text-xl italic text-sky-400">Simultaneous Wipeout Analysis</h4>
                  <p className="font-serif text-sm text-zinc-400 leading-relaxed italic">
                    {Math.abs(Number(selectedRho)) < 0.1 ? (
                      <>Under independent default assumptions, a single default triggers a complete principal loss for both the <strong>Equity</strong> and <strong>Mezzanine</strong> tranches due to the 6% loss-per-event dynamic.</>
                    ) : Number(selectedRho) > 0.4 ? (
                      <>In this high correlation regime, the "tail" is heavily weighted. Conditional probability of multiple defaults is high, severely threatening the <strong>Senior</strong> and even <strong>Super Senior</strong> layers.</>
                    ) : (
                      <>At moderate correlation, defaults are more idiosyncratic. The Senior tranche remains structurally protected by the diversification effect, as multiple simultaneous defaults remain statistically rare.</>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Tranche Cards */}
            <div className="col-span-12 lg:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-6 content-start">
              {tranches.map((t: any, i: number) => (
                <div key={i} className="journal-panel p-8 group transition-all hover:border-sky-500/40">
                  <div className="absolute top-0 left-0 w-1 h-full opacity-50" style={{ backgroundColor: t.color }}></div>
                  <div className="flex justify-between items-start mb-10">
                    <div>
                      <h3 className="font-serif text-3xl italic text-white mb-1">{t.name}</h3>
                      <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">
                        {(t.lower * 100).toFixed(0)}% — {(t.upper * 100).toFixed(0)}% Attachment
                      </p>
                    </div>
                    <div className="font-mono text-[10px] px-2 py-1 border border-zinc-800/50 text-zinc-400 uppercase tracking-tighter">
                      Size: {(t.size * 100).toFixed(0)}%
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-1">
                      <p className="font-mono text-[10px] text-zinc-600 uppercase tracking-widest">Prob. Default</p>
                      <p className="font-mono text-3xl font-bold text-zinc-200">{(t.probability_of_default * 100).toFixed(2)}%</p>
                    </div>
                    <div className="space-y-1">
                      <p className="font-mono text-[10px] text-zinc-600 uppercase tracking-widest">Expected Loss</p>
                      <p className="font-mono text-3xl font-bold text-zinc-200">{(t.expected_loss * 100).toFixed(2)}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Visualizations */}
        <div className="space-y-10">
          <div className="flex items-baseline gap-6 border-b border-zinc-800/50 pb-6">
            <h2 className="font-serif text-5xl italic text-white">Loss Distribution</h2>
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-500">Gaussian Copula PDF</span>
          </div>
          
          <div className="journal-panel p-10 h-[500px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#243056" vertical={false} opacity={0.2} />
                <XAxis
                  dataKey="defaults"
                  tickFormatter={(val) => `${val} Def.`}
                  stroke="#52525b"
                  fontSize={10}
                  fontFamily="JetBrains Mono"
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis
                  stroke="#52525b"
                  tickFormatter={(val) => `${val}%`}
                  fontSize={10}
                  fontFamily="JetBrains Mono"
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(93, 211, 255, 0.05)' }}
                  contentStyle={{ backgroundColor: '#0a0e1a', borderColor: '#243056', borderRadius: '0px' }}
                  itemStyle={{ color: '#5dd3ff', fontFamily: 'JetBrains Mono', fontSize: '12px' }}
                  labelStyle={{ color: '#fff', fontFamily: 'Cormorant Garamond', fontSize: '16px', fontStyle: 'italic', marginBottom: '8px' }}
                  formatter={(value: any) => [`${Number(value).toFixed(4)}%`, 'Probability']}
                  labelFormatter={(label) => `${label} Firm(s) Defaulting`}
                />
                <Bar dataKey="probPercent" radius={[0, 0, 0, 0]}>
                  {
                    chartData.map((_: any, index: number) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={index === 0 ? '#10b981' : index === 1 ? '#f43f5e' : '#9f1239'} 
                        fillOpacity={0.8}
                      />
                    ))
                  }
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Methodology Explanation */}
        <div className="space-y-12 pb-24">
          <div className="flex items-baseline gap-6 border-b border-zinc-800/50 pb-6">
            <h2 className="font-serif text-5xl italic text-white">Methodology</h2>
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-500">Structural Design & Assumptions</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

            {/* Step 1: Portfolio Construction */}
            <div className="journal-panel p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="font-mono text-xl text-sky-500/50">01</div>
                <h3 className="font-serif text-2xl italic text-white">Portfolio Construction</h3>
              </div>
              <p className="font-serif text-zinc-400 leading-relaxed italic mb-6">
                The collateral pool is comprised of <strong className="text-zinc-200">10 equally weighted</strong> reference entities. With 10% weight per firm and a <strong className="text-zinc-200">40% recovery rate</strong>, each default generates a fixed portfolio loss:
              </p>
              <div className="p-6 bg-white/5 border border-zinc-800/50 font-mono text-sm text-center text-sky-400">
                10% Notional &times; 60% LGD = 6.00% Portfolio Loss
              </div>
            </div>

            {/* Step 2: Gaussian Copula Model */}
            <div className="journal-panel p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="font-mono text-xl text-sky-500/50">02</div>
                <h3 className="font-serif text-2xl italic text-white">Default Dependence</h3>
              </div>
              <p className="font-serif text-zinc-400 leading-relaxed italic mb-6">
                We employ a standard <strong className="text-zinc-200">One-Factor Gaussian Copula</strong> (Vasicek/Li) where asset returns <em>A<sub>i</sub></em> are driven by a common systemic factor <em>M</em> and idiosyncratic shocks &epsilon;<sub>i</sub>:
              </p>
              <div className="p-6 bg-white/5 border border-zinc-800/50 font-mono text-xs text-center text-zinc-300">
                A<sub>i</sub> = &radic;(&rho;)M + &radic;(1-|&rho;|)&epsilon;<sub>i</sub>
              </div>
            </div>

            {/* Step 3: Tranche Waterfall */}
            <div className="journal-panel p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="font-mono text-xl text-sky-500/50">03</div>
                <h3 className="font-serif text-2xl italic text-white">Expected Loss (EL)</h3>
              </div>
              <p className="font-serif text-zinc-400 leading-relaxed italic mb-6">
                EL is computed as the probability-weighted average of losses across the distribution. A tranche is impaired the moment portfolio loss exceeds its attachment point.
              </p>
              <div className="p-6 bg-white/5 border border-zinc-800/50 font-mono text-sm text-center text-zinc-300">
                EL = &Sigma; P(k) &times; TrancheLoss(k) / Size
              </div>
            </div>

            {/* Step 4: PD per tranche */}
            <div className="journal-panel p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="font-mono text-xl text-sky-500/50">04</div>
                <h3 className="font-serif text-2xl italic text-white">Impairment Thresholds</h3>
              </div>
              <ul className="space-y-4">
                <li className="flex gap-4 items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2"></div>
                  <div className="space-y-1">
                    <p className="font-mono text-[10px] text-zinc-500 uppercase">Equity & Mezzanine</p>
                    <p className="font-serif text-sm text-zinc-400 italic leading-snug">Wiped out by the <strong className="text-zinc-200">1st default</strong> (6% loss exceeds both 0% and 3% attachment points).</p>
                  </div>
                </li>
                <li className="flex gap-4 items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-2"></div>
                  <div className="space-y-1">
                    <p className="font-mono text-[10px] text-zinc-500 uppercase">Senior & Super Senior</p>
                    <p className="font-serif text-sm text-zinc-400 italic leading-snug">Impaired only starting at the <strong className="text-zinc-200">2nd default</strong> (12% loss exceeds the 6% and 10% attachment points).</p>
                  </div>
                </li>
              </ul>
            </div>

          </div>

          {/* Reference Link */}
          <div className="journal-panel p-8 flex flex-col md:flex-row items-center gap-8">
            <div className="w-16 h-16 bg-white/5 border border-zinc-800/50 flex items-center justify-center shrink-0">
               <ShieldAlert className="w-8 h-8 text-sky-500/30" />
            </div>
            <div className="space-y-2 text-center md:text-left">
              <p className="font-serif text-xl italic text-white">Reference Index Document</p>
              <p className="font-serif text-zinc-400 text-sm italic">The reference entities are drawn from the S&P CDX.NA.IG.BBB.46-V1 index annex.</p>
              <a
                href="https://www.spglobal.com/spdji/en/documents/index-news-and-announcements/CDX.NA.IG.BBB.46-V1%20Index%20Annex.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 font-mono text-[10px] text-sky-400 hover:text-sky-300 transition-colors uppercase tracking-widest border-b border-sky-400/30 pb-1 mt-2"
              >
                View Index Annex (PDF)
              </a>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
