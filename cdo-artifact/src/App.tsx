import { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  AreaChart, Area, LineChart, Line, Legend
} from 'recharts';
import { ShieldAlert, BarChart3, Binary, Cpu, TrendingUp, BookOpen, Calculator, Variable } from 'lucide-react';
import cdoData from './cdo_results.json';

// --- Types ---
type Method = 'copula' | 'binomial' | 'monte_carlo' | 'methodology';

// --- Components ---

const TopNav = ({ activeMethod, setActiveMethod }: { activeMethod: Method, setActiveMethod: (m: Method) => void }) => {
  const tabs: { id: Method; label: string; icon: any }[] = [
    { id: 'copula', label: 'Gaussian Copula', icon: BarChart3 },
    { id: 'binomial', label: 'Binomial Method', icon: Binary },
    { id: 'monte_carlo', label: 'Monte Carlo', icon: Cpu },
    { id: 'methodology', label: 'Methodology', icon: BookOpen },
  ];

  return (
    <div className="flex flex-wrap gap-2 border-b border-zinc-800/50 mb-12">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveMethod(tab.id)}
          className={`flex items-center gap-2 px-6 py-4 font-sans text-sm font-medium transition-all border-b-2 -mb-[2px] ${
            activeMethod === tab.id 
              ? 'border-sky-500 text-white bg-sky-500/5' 
              : 'border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
          }`}
        >
          <tab.icon className="w-4 h-4" />
          {tab.label}
        </button>
      ))}
    </div>
  );
};

const MarketAssumptions = ({ assumptions, rho }: { assumptions: any, rho?: string }) => (
  <div className="journal-panel p-8">
    <h2 className="font-sans text-xl font-bold mb-8 flex items-center gap-3">
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
      {rho !== undefined && (
        <div className="flex justify-between items-center pb-3 border-b border-zinc-800/50">
          <span className="text-zinc-500 text-xs uppercase tracking-widest">Correlation (ρ)</span>
          <span className="font-mono font-bold text-sky-400">{Number(rho).toFixed(2)}</span>
        </div>
      )}
      <div className="flex justify-between items-center">
        <span className="text-zinc-500 text-xs uppercase tracking-widest">Loss / Default</span>
        <span className="font-mono font-bold text-zinc-100">{(assumptions.loss_per_default * 100).toFixed(2)}%</span>
      </div>
    </div>
  </div>
);

const ReferencePortfolio = ({ firms }: { firms: string[] }) => (
  <div className="journal-panel p-8 h-full">
    <h2 className="font-sans text-xl font-bold mb-8">Reference Portfolio</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {firms.map((firm: string, i: number) => (
        <div key={i} className="px-5 py-3 bg-white/5 border border-zinc-800/30 text-sm flex items-center gap-4 group transition-colors hover:border-sky-500/30">
          <div className="font-mono text-[10px] text-zinc-600">
            {String(i + 1).padStart(2, '0')}
          </div>
          <span className="font-sans text-zinc-300 group-hover:text-zinc-100">{firm}</span>
        </div>
      ))}
    </div>
  </div>
);

const TrancheWaterfall = ({ tranches }: { tranches: any[] }) => {
  return (
    <div className="flex flex-col gap-1 h-[450px]">
      {tranches.map((t, i) => {
        const fillPercent = (t.expected_loss / t.size) * 100;
        return (
          <div 
            key={i} 
            className="relative border border-zinc-800 bg-zinc-900/30 flex items-center justify-center overflow-hidden transition-all duration-500"
            style={{ 
                height: `${i === 3 ? 60 : 13}%`,
                borderColor: `${t.color}30`
            }}
          >
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
              <span className="block font-sans text-sm font-bold text-zinc-100">
                {(t.lower * 100).toFixed(0)}-{(t.upper * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const TailRiskChart = ({ distribution }: { distribution: any[] }) => {
  const data = useMemo(() => {
    let cumulative = 0;
    const reversed = [...distribution].reverse();
    return reversed.map((d: any) => {
      cumulative += d.probability;
      return {
        defaults: d.defaults,
        survival: cumulative * 100
      };
    }).reverse();
  }, [distribution]);

  return (
    <div className="journal-panel p-10 h-[400px] overflow-hidden">
      <h3 className="font-sans text-xl font-bold mb-6 text-zinc-300 flex items-center gap-3">
        <TrendingUp className="w-5 h-5 text-sky-400" />
        Tail Risk Curve
      </h3>
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSurvival" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#5dd3ff" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#5dd3ff" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#243056" vertical={false} opacity={0.2} />
            <XAxis 
              dataKey="defaults" 
              stroke="#52525b" 
              fontSize={10} 
              fontFamily="JetBrains Mono" 
              tickFormatter={(val) => `${val} Def.`}
            />
            <YAxis stroke="#52525b" fontSize={10} fontFamily="JetBrains Mono" tickFormatter={(val) => `${val}%`} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0a0e1a', borderColor: '#243056', borderRadius: '4px' }}
              itemStyle={{ color: '#5dd3ff', fontFamily: 'JetBrains Mono', fontSize: '12px' }}
              labelStyle={{ color: '#fff', fontFamily: 'sans-serif', fontSize: '14px', marginBottom: '4px' }}
              formatter={(value: any) => [`${Number(value).toFixed(2)}%`, 'Prob. ≥ k Defaults']}
            />
            <Area type="monotone" dataKey="survival" stroke="#5dd3ff" fillOpacity={1} fill="url(#colorSurvival)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const CorrelationSensitivityChart = ({ scenarios }: { scenarios: any }) => {
  const data = useMemo(() => {
    return Object.keys(scenarios).map(rho => {
      const scenario = scenarios[rho];
      const entry: any = { rho: Number(rho) };
      scenario.tranches.forEach((t: any) => {
        entry[t.name] = t.expected_loss * 100;
      });
      return entry;
    });
  }, [scenarios]);

  return (
    <div className="journal-panel p-10 h-[500px]">
      <h3 className="font-sans text-xl font-bold mb-6 text-zinc-300">Tranche Expected Loss vs Correlation</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#243056" vertical={false} opacity={0.2} />
          <XAxis dataKey="rho" stroke="#52525b" fontSize={10} fontFamily="JetBrains Mono" label={{ value: 'Correlation (ρ)', position: 'insideBottom', offset: -10, fill: '#52525b', fontSize: 10 }} />
          <YAxis stroke="#52525b" fontSize={10} fontFamily="JetBrains Mono" tickFormatter={(val) => `${val}%`} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#0a0e1a', borderColor: '#243056', borderRadius: '4px' }}
            itemStyle={{ fontSize: '12px', fontFamily: 'JetBrains Mono' }}
          />
          <Legend wrapperStyle={{ fontFamily: 'JetBrains Mono', fontSize: '10px', paddingTop: '20px' }} />
          <Line type="monotone" dataKey="Equity" stroke="#ff6b8a" dot={{ r: 3 }} />
          <Line type="monotone" dataKey="Mezzanine" stroke="#ffb74d" dot={{ r: 3 }} />
          <Line type="monotone" dataKey="Senior" stroke="#5dd3ff" dot={{ r: 3 }} />
          <Line type="monotone" dataKey="Super Senior" stroke="#9aa6c2" dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

const MCConvergenceChart = ({ convergence, analyticalEL }: { convergence: any[], analyticalEL: number }) => (
  <div className="journal-panel p-10 h-[500px]">
    <h3 className="font-sans text-xl font-bold mb-6 text-zinc-300">Senior Tranche Expected Loss Convergence (ρ=0.4)</h3>
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={convergence}>
        <CartesianGrid strokeDasharray="3 3" stroke="#243056" vertical={false} opacity={0.2} />
        <XAxis dataKey="n" stroke="#52525b" fontSize={10} fontFamily="JetBrains Mono" scale="log" domain={['auto', 'auto']} />
        <YAxis stroke="#52525b" fontSize={10} fontFamily="JetBrains Mono" domain={['auto', 'auto']} />
        <Tooltip 
            contentStyle={{ backgroundColor: '#0a0e1a', borderColor: '#243056', borderRadius: '4px' }}
            itemStyle={{ color: '#ffb74d', fontFamily: 'JetBrains Mono', fontSize: '12px' }}
        />
        <Line type="monotone" dataKey="el" stroke="#ffb74d" dot={false} strokeWidth={1} name="MC Running Avg" />
        <Line type="monotone" dataKey={() => analyticalEL} stroke="#5dd3ff" strokeDasharray="5 5" dot={false} name="Analytical Target" />
        <Legend wrapperStyle={{ fontFamily: 'JetBrains Mono', fontSize: '10px', paddingTop: '20px' }} />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

const MethodologyPage = () => (
  <div className="space-y-12 pb-24">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="journal-panel p-8 space-y-6">
        <h3 className="text-xl font-bold flex items-center gap-3">
          <Calculator className="w-5 h-5 text-sky-400" />
          The One-Factor Gaussian Copula
        </h3>
        <p className="text-zinc-400 text-sm leading-relaxed">
          The structural model assumes asset returns for each firm are driven by a common market factor and an idiosyncratic shock:
        </p>
        <div className="p-6 bg-zinc-950/50 border border-zinc-800 font-mono text-center text-sky-400">
          A<sub>i</sub> = √ρ M + √(1-ρ) ε<sub>i</sub>
        </div>
        <p className="text-zinc-400 text-sm leading-relaxed">
          Conditional on M, the probability of default is:
        </p>
        <div className="p-6 bg-zinc-950/50 border border-zinc-800 font-mono text-center text-zinc-300">
          p(m) = Φ[ (Φ⁻¹(p) - √ρ m) / √(1-ρ) ]
        </div>
      </div>

      <div className="journal-panel p-8 space-y-6">
        <h3 className="text-xl font-bold flex items-center gap-3">
          <Variable className="w-5 h-5 text-emerald-400" />
          Tranche Structuring
        </h3>
        <p className="text-zinc-400 text-sm leading-relaxed">
          The portfolio loss for <i>k</i> defaults is defined by the Loss Given Default (LGD) and weighting:
        </p>
        <div className="p-6 bg-zinc-950/50 border border-zinc-800 font-mono text-center text-emerald-400">
          Loss(k) = k × (1-R) / N
        </div>
        <p className="text-zinc-400 text-sm leading-relaxed">
          Expected Loss (EL) for a tranche with attachment <i>A</i> and detachment <i>D</i>:
        </p>
        <div className="p-6 bg-zinc-950/50 border border-zinc-800 font-mono text-center text-zinc-300">
          EL = Σ P(k) × [max(min(Loss(k), D) - A, 0) / (D - A)]
        </div>
      </div>
    </div>

    <div className="journal-panel p-10 space-y-8">
      <h3 className="text-2xl font-bold">Model Comparison</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-4">
          <h4 className="font-mono text-xs uppercase tracking-widest text-sky-400">Gaussian Copula</h4>
          <p className="text-zinc-400 text-xs leading-relaxed">
            Uses numerical integration (quadrature) to solve the probability integral. Fast and accurate, but limited to relatively simple factor structures.
          </p>
        </div>
        <div className="space-y-4 border-l border-zinc-800 pl-8">
          <h4 className="font-mono text-xs uppercase tracking-widest text-emerald-400">Binomial Method</h4>
          <p className="text-zinc-400 text-xs leading-relaxed">
            The baseline "independence" case. Useful for establishing the impact of diversification without the complexity of correlation.
          </p>
        </div>
        <div className="space-y-4 border-l border-zinc-800 pl-8">
          <h4 className="font-mono text-xs uppercase tracking-widest text-rose-400">Monte Carlo</h4>
          <p className="text-zinc-400 text-xs leading-relaxed">
            Simulates thousands of paths to estimate the distribution. Extremely flexible for complex payoffs, but subject to sampling noise.
          </p>
        </div>
      </div>
    </div>
  </div>
);

export default function App() {
  const { firms, assumptions, methods } = cdoData as any;
  const [activeMethod, setActiveMethod] = useState<Method>('copula');
  const [selectedRho, setSelectedRho] = useState<string>("0.4");

  const currentData = useMemo(() => {
    if (activeMethod === 'binomial') return methods.binomial;
    if (activeMethod === 'methodology') return null;
    return methods[activeMethod].scenarios[selectedRho];
  }, [activeMethod, selectedRho, methods]);

  const chartData = useMemo(() => {
    if (!currentData) return [];
    return currentData.distribution.slice(0, 7).map((d: any) => ({
      ...d,
      probPercent: d.probability * 100
    }));
  }, [currentData]);

  return (
    <div className="min-h-screen p-8 selection:bg-sky-500/30 font-sans">
      <div className="max-w-6xl mx-auto space-y-16">

        {/* Header */}
        <div className="space-y-6 border-b border-zinc-800/50 pb-12">
          <div className="flex items-center gap-4">
            <div className="h-[1px] w-12 bg-sky-500/50"></div>
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-sky-400">Quantitative Finance</span>
          </div>
          <h1 className="text-6xl font-black text-white tracking-tight">
            Synthetic CDO Laboratory
          </h1>
          <p className="text-xl text-zinc-400 font-medium max-w-3xl leading-relaxed">
            Multi-method default modeling for structured credit derivatives.
          </p>
        </div>

        <TopNav activeMethod={activeMethod} setActiveMethod={setActiveMethod} />

        {activeMethod === 'methodology' ? (
          <MethodologyPage />
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <MarketAssumptions assumptions={assumptions} rho={activeMethod !== 'binomial' ? selectedRho : undefined} />
              <div className="lg:col-span-2">
                <ReferencePortfolio firms={firms} />
              </div>
            </div>

            {/* Method Specific Controls */}
            {activeMethod !== 'binomial' && (
              <div className="journal-panel p-10 space-y-8">
                  <div className="flex justify-between items-baseline">
                      <div className="space-y-2">
                          <h3 className="text-3xl font-bold text-white">Risk Sensitivity</h3>
                          <p className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-500">Asset Correlation Laboratory</p>
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
                          min="0.0" 
                          max="1.0" 
                          step="0.1" 
                          value={selectedRho} 
                          onChange={(e) => setSelectedRho(Number(e.target.value).toFixed(1))}
                          className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
                      />
                      <div className="flex justify-between font-mono text-[10px] text-zinc-500 mt-6 tracking-widest uppercase">
                          <span>0.0 Indep.</span>
                          <span>0.5 Mod.</span>
                          <span>1.0 Systemic</span>
                      </div>
                    </div>
                    <div className="lg:col-span-4 border-l border-zinc-800/50 pl-10 hidden lg:block text-zinc-400 text-sm leading-relaxed">
                      Adjusting ρ increases tail probability. In high correlation regimes, multiple simultaneous defaults become more likely.
                    </div>
                  </div>
              </div>
            )}

            {/* Analysis Grid */}
            <div className="space-y-10">
              <div className="flex items-baseline gap-6 border-b border-zinc-800/50 pb-6">
                <h2 className="text-4xl font-bold text-white">Risk Waterfall</h2>
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-500">Capital Structure Loss Analysis</span>
              </div>

              <div className="grid grid-cols-12 gap-10">
                <div className="col-span-12 lg:col-span-3">
                  <div className="journal-panel p-6">
                     <h3 className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-6">Tranche Map</h3>
                     <TrancheWaterfall tranches={currentData.tranches} />
                  </div>
                </div>

                <div className="col-span-12 lg:col-span-9 space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {currentData.tranches.map((t: any, i: number) => (
                      <div key={i} className="journal-panel p-8 group transition-all hover:border-sky-500/40">
                        <div className="absolute top-0 left-0 w-1 h-full opacity-50" style={{ backgroundColor: t.color }}></div>
                        <div className="flex justify-between items-start mb-10">
                          <h3 className="text-2xl font-bold text-white">{t.name}</h3>
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
                  
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                      <div className="journal-panel p-10 h-[400px]">
                        <h3 className="text-xl font-bold mb-6 text-zinc-300">Loss PMF</h3>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#243056" vertical={false} opacity={0.2} />
                            <XAxis dataKey="defaults" stroke="#52525b" fontSize={10} fontFamily="JetBrains Mono" />
                            <YAxis stroke="#52525b" fontSize={10} fontFamily="JetBrains Mono" tickFormatter={(val) => `${val}%`} />
                            <Tooltip 
                               contentStyle={{ backgroundColor: '#0a0e1a', borderColor: '#243056', borderRadius: '4px' }}
                               itemStyle={{ color: '#5dd3ff', fontFamily: 'JetBrains Mono', fontSize: '12px' }}
                            />
                            <Bar dataKey="probPercent" fill="#5dd3ff" fillOpacity={0.8}>
                              {chartData.map((_: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : index === 1 ? '#f43f5e' : '#9f1239'} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      <TailRiskChart distribution={currentData.distribution} />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-10">
                <div className="flex items-baseline gap-6 border-b border-zinc-800/50 pb-6">
                    <h2 className="text-4xl font-bold text-white">Methodology Insights</h2>
                    <span className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-500">Method-Specific Analytics</span>
                </div>

                {activeMethod === 'copula' && <CorrelationSensitivityChart scenarios={methods.copula.scenarios} />}
                {activeMethod === 'monte_carlo' && <MCConvergenceChart convergence={methods.monte_carlo.convergence} analyticalEL={methods.copula.scenarios['0.4'].tranches[2].expected_loss} />}
                {activeMethod === 'binomial' && (
                    <div className="journal-panel p-10 bg-emerald-500/5 border-emerald-500/20">
                        <p className="text-xl font-bold text-emerald-400 mb-4">Independence Benchmark</p>
                        <p className="text-zinc-400 leading-relaxed text-sm">
                            Assuming zero correlation establishes the baseline impact of diversification. The structural protection of the Senior and Super Senior tranches is maximal here, as the probability of multiple defaults decays exponentially.
                        </p>
                    </div>
                )}
            </div>
          </>
        )}

        <div className="journal-panel p-8 flex items-center gap-8 mb-24">
            <div className="w-16 h-16 bg-white/5 border border-zinc-800 flex items-center justify-center shrink-0">
               <ShieldAlert className="w-8 h-8 text-sky-500/30" />
            </div>
            <div className="space-y-2">
              <p className="text-lg font-bold text-white">Educational Disclaimer</p>
              <p className="text-zinc-400 text-sm">
                This laboratory is designed for pedagogical exploration of model risk in structured derivatives.
              </p>
            </div>
        </div>

      </div>
    </div>
  );
}
