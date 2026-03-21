"use client";

import React from "react";

export default function YieldPage() {
  const sources = [
    { name: "Regenerative Staking", yield: "3.2%", status: "Active", icon: "database" },
    { name: "Green Energy Bonds", yield: "5.8%", status: "Pending", icon: "electric_bolt" },
    { name: "Liquidity Provision", yield: "4.1%", status: "Active", icon: "water_drop" },
  ];

  return (
    <div className="mx-auto max-w-2xl px-6 pt-12 space-y-12">
      {/* Balance Summary */}
      <section className="bg-primary-container p-10 rounded-[2.5rem] text-on-primary-container shadow-2xl relative overflow-hidden">
        {/* Abstract Background Decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        
        <div className="relative space-y-6">
          <div className="flex justify-between items-center">
            <p className="text-xs font-black uppercase tracking-[0.2em] opacity-80">Total Value Locked</p>
            <span className="material-symbols-outlined opacity-80">account_balance_wallet</span>
          </div>
          
          <div className="space-y-1">
            <h1 className="text-6xl font-headline font-black tracking-tighter">
              $12,450<span className="text-3xl opacity-60">.40</span>
            </h1>
            <div className="flex items-center gap-2 text-emerald-300">
              <span className="material-symbols-outlined text-sm font-bold">trending_up</span>
              <span className="text-sm font-bold">+12.4% this month</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/10">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">APY Average</p>
              <p className="text-xl font-headline font-extrabold">4.21%</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Next Payout</p>
              <p className="text-xl font-headline font-extrabold">In 2 days</p>
            </div>
          </div>
        </div>
      </section>

      {/* Yield Sources */}
      <section className="space-y-6">
        <h2 className="text-2xl font-headline font-bold text-on-surface px-2">Active Streams</h2>
        <div className="grid gap-4">
          {sources.map((source) => (
            <div key={source.name} className="flex items-center justify-between p-6 bg-white rounded-3xl border border-surface-variant/20 shadow-sm transition-all hover:shadow-md hover:border-primary/20 group">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-secondary-container flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <span className="material-symbols-outlined text-on-secondary-container text-2xl">{source.icon}</span>
                </div>
                <div>
                  <h4 className="font-bold text-on-surface">{source.name}</h4>
                  <p className="text-xs text-on-surface-variant font-medium">{source.status} • Direct Impact</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-headline font-black text-primary">{source.yield}</p>
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter">Per Annum</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Reinvestment CTA */}
      <section className="bg-surface-container-high p-8 rounded-3xl flex flex-col items-center text-center space-y-4">
        <div className="p-3 bg-secondary-fixed rounded-full">
           <span className="material-symbols-outlined text-secondary">eco</span>
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-headline font-bold text-on-surface">Auto-Plant Yield</h3>
          <p className="text-sm text-on-surface-variant max-w-sm">
            Automatically convert 20% of your earnings into new carbon offset projects.
          </p>
        </div>
        <button className="bg-on-surface text-surface px-8 py-3 rounded-full font-bold text-sm hover:opacity-90 transition-opacity">
          Configure Reinvestment
        </button>
      </section>
    </div>
  );
}
