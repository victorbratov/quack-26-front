"use client";

import React, { useState } from "react";


type Phase = "INPUT" | "LOADING" | "RESULTS" | "HISTORY";

export default function CheckPage() {
  const [phase, setPhase] = useState<Phase>("INPUT");
  const [merchant, setMerchant] = useState("");
  const [amount, setAmount] = useState("");
  
  // Agent states for animation
  const [agentsLoaded, setAgentsLoaded] = useState(0);
  const [verdict, setVerdict] = useState<"ALLOW" | "REDUCE" | "BLOCK" | null>(null);

  const simulateDebate = () => {
    setPhase("LOADING");
    setAgentsLoaded(0);
    setVerdict(null);

    // Stagger agent reveals
    setTimeout(() => setAgentsLoaded(1), 800);
    setTimeout(() => setAgentsLoaded(2), 1600);
    setTimeout(() => setAgentsLoaded(3), 2400);
    
    // Final verdict
    setTimeout(() => {
      setPhase("RESULTS");
      const a = Number(amount);
      if (a > 100) setVerdict("BLOCK");
      else if (a > 30) setVerdict("REDUCE");
      else setVerdict("ALLOW");
    }, 3200);
  };

  const handleAction = () => {
    // In a real app this hits POST /api/v1/intents/{id}/action
    setPhase("INPUT");
    setMerchant("");
    setAmount("");
  };

  return (
    <div className="mx-auto max-w-lg px-6 pt-12 pb-32 space-y-8 min-h-screen bg-black text-on-background font-body relative overflow-hidden">
      
      {phase !== "HISTORY" && (
        <div className="flex justify-end mb-4">
          <button onClick={() => setPhase("HISTORY")} className="hover:text-primary transition-colors uppercase tracking-widest text-xs font-bold text-outline">
            History
          </button>
        </div>
      )}

      {phase === "INPUT" && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pt-8">
          <h1 className="text-4xl font-headline font-bold text-primary mb-12 leading-tight">BEFORE YOU<br/>SPEND</h1>
          
          <div className="space-y-6">
            <div>
              <input 
                type="text" 
                value={merchant}
                onChange={e => setMerchant(e.target.value)}
                placeholder="Where?"
                className="w-full bg-surface-container text-2xl p-6 rounded-3xl border border-outline-variant focus:border-primary focus:bg-surface-container-high transition-colors outline-none text-on-surface placeholder:text-outline"
              />
            </div>
            
            <div className="relative">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-5xl font-headline font-bold text-outline">£</span>
              <input 
                type="number" 
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-surface-container text-5xl font-headline font-bold p-6 pl-16 rounded-3xl border border-outline-variant focus:border-primary focus:bg-surface-container-high transition-colors outline-none text-primary"
              />
            </div>

            <button 
              onClick={simulateDebate}
              disabled={!merchant || !amount}
              className="w-full bg-primary text-black font-bold text-lg py-6 rounded-3xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed mt-8"
            >
              Check this spend
              <span className="material-symbols-outlined">analytics</span>
            </button>
          </div>

          <div className="mt-16 border-t border-outline-variant pt-8">
            <h3 className="text-xs uppercase tracking-widest font-bold text-outline mb-4">Recent</h3>
            <div className="flex gap-2">
              <button onClick={() => { setMerchant("Zara"); setAmount("60") }} className="px-4 py-2 rounded-full border border-outline-variant bg-surface text-sm hover:border-primary transition-colors">Zara £60</button>
              <button onClick={() => { setMerchant("Uber"); setAmount("15") }} className="px-4 py-2 rounded-full border border-outline-variant bg-surface text-sm hover:border-primary transition-colors">Uber £15</button>
            </div>
          </div>
        </div>
      )}

      {phase === "LOADING" && (
        <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-12 animate-in fade-in zoom-in-95 duration-500">
          <div className="relative w-32 h-32">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="material-symbols-outlined text-6xl text-primary animate-bounce">blur_on</span>
            </div>
          </div>
          
          <div className="space-y-4 w-full max-w-xs">
            {/* Agent 1 load */}
            <div className={`p-4 rounded-2xl border transition-all duration-700 ${agentsLoaded >= 1 ? 'border-primary bg-primary/10' : 'border-outline-variant opacity-50'}`}>
              <div className="flex items-center gap-3">
                <span className={`material-symbols-outlined ${agentsLoaded >= 1 ? 'text-primary' : 'text-outline animate-spin'}`}>{agentsLoaded >= 1 ? 'shield' : 'sync'}</span>
                <span className="font-bold text-sm">Risk Agent {agentsLoaded >= 1 ? 'ready' : 'analyzing'}</span>
              </div>
            </div>
            {/* Agent 2 load */}
            <div className={`p-4 rounded-2xl border transition-all duration-700 ${agentsLoaded >= 2 ? 'border-secondary bg-secondary/10' : 'border-outline-variant opacity-50'}`}>
              <div className="flex items-center gap-3">
                <span className={`material-symbols-outlined ${agentsLoaded >= 2 ? 'text-secondary' : 'text-outline animate-spin'}`}>{agentsLoaded >= 2 ? 'trending_up' : 'sync'}</span>
                <span className="font-bold text-sm">Growth Agent {agentsLoaded >= 2 ? 'ready' : 'analyzing'}</span>
              </div>
            </div>
            {/* Agent 3 load */}
            <div className={`p-4 rounded-2xl border transition-all duration-700 ${agentsLoaded >= 3 ? 'border-emerald-400 bg-emerald-400/10' : 'border-outline-variant opacity-50'}`}>
              <div className="flex items-center gap-3">
                <span className={`material-symbols-outlined ${agentsLoaded >= 3 ? 'text-emerald-400' : 'text-outline animate-spin'}`}>{agentsLoaded >= 3 ? 'auto_awesome' : 'sync'}</span>
                <span className="font-bold text-sm">Lifestyle Agent {agentsLoaded >= 3 ? 'ready' : 'analyzing'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {phase === "RESULTS" && (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 pt-4 pb-20">
          
          <div className="text-center mb-10">
            {verdict === "BLOCK" && (
              <div className="inline-block px-4 py-1 rounded-full bg-error/20 text-error font-bold tracking-widest uppercase text-xs mb-4">Warning</div>
            )}
            {verdict === "REDUCE" && (
              <div className="inline-block px-4 py-1 rounded-full bg-secondary/20 text-secondary font-bold tracking-widest uppercase text-xs mb-4">Alternative</div>
            )}
            {verdict === "ALLOW" && (
              <div className="inline-block px-4 py-1 rounded-full bg-emerald-400/20 text-emerald-400 font-bold tracking-widest uppercase text-xs mb-4">All Clear</div>
            )}
            
            <h1 className="text-5xl font-headline font-bold text-on-surface">
              {verdict === "BLOCK" ? "SKIP THIS ONE" : verdict === "REDUCE" ? `REDUCE TO £${(Number(amount)/2).toFixed(2)}` : "ALL CLEAR"}
            </h1>
            {verdict !== "ALLOW" && (
              <div className="mt-2 text-2xl text-outline line-through decoration-error decoration-2">£{amount}</div>
            )}
          </div>

          <div className="space-y-3 mb-10">
            {/* Risk Agent Card */}
            <div className="bg-surface p-5 rounded-3xl border border-outline-variant relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-error/10 rounded-bl-full"></div>
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-widest">
                  <span className="material-symbols-outlined text-on-surface">shield</span>
                  Risk Agent
                </div>
                <div className={`px-2 py-1 rounded md font-bold text-[10px] ${verdict === "ALLOW" ? "bg-emerald-400/20 text-emerald-400" : "bg-error/20 text-error"}`}>
                  {verdict === "ALLOW" ? "ALLOW" : "REDUCE"}
                </div>
              </div>
              <p className="text-on-surface font-medium text-lg leading-snug mb-4">&quot;Your £3,000 emergency fund protects against this. Proceed.&quot;</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1 bg-surface-container-high rounded-full overflow-hidden">
                  <div className={`h-full ${verdict === "ALLOW" ? "bg-emerald-400" : "bg-error"}`} style={{ width: verdict === "ALLOW" ? '20%' : '80%' }}></div>
                </div>
                <span className="text-xs text-outline">{verdict === "ALLOW" ? "20%" : "80%"}</span>
              </div>
            </div>

            {/* Growth Agent Card */}
            <div className="bg-surface p-5 rounded-3xl border border-outline-variant relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-secondary/10 rounded-bl-full"></div>
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-widest">
                  <span className="material-symbols-outlined text-secondary">trending_up</span>
                  Growth Agent
                </div>
                <div className={`px-2 py-1 rounded md font-bold text-[10px] ${verdict === "BLOCK" ? "bg-error/20 text-error" : "bg-secondary/20 text-secondary"}`}>
                  {verdict === "BLOCK" ? "BLOCK" : "REDUCE"}
                </div>
              </div>
              <p className="text-on-surface font-medium text-lg leading-snug mb-4">&quot;£{amount} today equals £{(Number(amount)*8).toFixed(0)} in 5 years invested.&quot;</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1 bg-surface-container-high rounded-full overflow-hidden">
                  <div className="h-full bg-secondary" style={{ width: '60%' }}></div>
                </div>
                <span className="text-xs text-outline">60%</span>
              </div>
            </div>

            {/* Lifestyle Agent Card */}
            <div className="bg-surface p-5 rounded-3xl border border-outline-variant relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-primary/10 rounded-bl-full"></div>
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-widest">
                  <span className="material-symbols-outlined text-primary">auto_awesome</span>
                  Lifestyle Agent
                </div>
                <div className="px-2 py-1 rounded md font-bold text-[10px] bg-emerald-400/20 text-emerald-400">ALLOW</div>
              </div>
              <p className="text-on-surface font-medium text-lg leading-snug mb-4">&quot;5-day streak. You&apos;ve earned some flexibility.&quot;</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1 bg-surface-container-high rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400" style={{ width: '80%' }}></div>
                </div>
                <span className="text-xs text-outline">80%</span>
              </div>
            </div>
          </div>

          <div className="p-5 bg-surface-container rounded-3xl space-y-3 mb-10 border border-outline-variant">
            <div className="flex justify-between items-center text-sm">
              <span className="text-outline">Balance after</span>
              <span className="font-bold text-on-surface">£760</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-outline">Goal delay</span>
              <span className="font-bold text-error">3 days</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-outline">Weekly budget left</span>
              <span className="font-bold text-secondary">£42</span>
            </div>
          </div>

          <div className="space-y-4">
            <button onClick={handleAction} className={`w-full font-bold text-lg py-5 rounded-full flex items-center justify-center gap-2 transition-all ${verdict === "ALLOW" ? "bg-emerald-400 text-black shadow-[0_0_20px_rgba(52,211,153,0.3)]" : "bg-primary text-black"}`}>
              <span className="material-symbols-outlined">check_circle</span>
              {verdict === "REDUCE" ? `Accept £${(Number(amount)/2).toFixed(2)}` : "Proceed with Purchase"}
            </button>
            <button onClick={handleAction} className="w-full border border-outline text-on-surface font-bold text-lg py-5 rounded-full hover:bg-surface-container transition-all">
              Cancel Purchase
            </button>
            {verdict !== "ALLOW" && (
              <button onClick={handleAction} className="w-full text-outline font-medium text-sm py-4 hover:text-on-surface transition-colors uppercase tracking-widest">
                Override — Spend £{amount}
              </button>
            )}
          </div>
        </div>
      )}

      {phase === "HISTORY" && (
        <div className="animate-in fade-in pt-8">
          <h1 className="text-3xl font-headline font-bold text-primary mb-2">History</h1>
          <p className="text-sm border-b border-outline-variant pb-6 mb-6">Saved <strong className="text-emerald-400">£240</strong> across 14 checks</p>
          
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-surface p-4 rounded-2xl flex justify-between items-center border border-outline-variant">
                <div>
                  <div className="font-bold text-on-surface">Zara</div>
                  <div className="text-xs text-outline">Mar {21 - i}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-error line-through text-sm">£60</div>
                  <div className="font-bold text-emerald-400">£30</div>
                </div>
              </div>
            ))}
          </div>
          
          <button onClick={() => setPhase("INPUT")} className="mt-8 px-6 py-3 rounded-full border border-outline text-sm font-bold uppercase tracking-widest hover:bg-surface-container transition-colors w-full">Back</button>
        </div>
      )}
    </div>
  );
}
