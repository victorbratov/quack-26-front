"use client";

import React from "react";

export default function HarvestPage() {
  return (
    <div className="mx-auto max-w-xl px-6">
      <header className="mb-12 text-center">
        <h1 className="font-headline text-4xl font-extrabold tracking-tight text-on-surface">The Harvest Review</h1>
        <p className="mt-2 text-on-surface-variant">Your weekly growth in focus.</p>
      </header>

      {/* Hero Visualization: Lotus Vessel */}
      <section className="mb-12 flex flex-col items-center">
        <div className="relative mb-8 flex h-96 w-64 items-end overflow-hidden rounded-full bg-surface-container shadow-inner">
           {/* Filling Liquid Level Animation */}
          <div className="lotus-vessel absolute bottom-0 h-[78%] w-full bg-linear-to-t from-primary/70 to-secondary/40 transition-all duration-2000 ease-out"></div>
          {/* Glass Shape Overlay with highlight */}
          <div className="lotus-vessel absolute inset-0 border-[8px] border-white/40 shadow-[inset_0_20px_40px_rgba(255,255,255,0.2)]"></div>
          
          <div className="relative z-10 flex h-full w-full flex-col items-center justify-center p-8 text-center">
            <span className="font-headline text-6xl font-extrabold text-white tracking-tighter">78</span>
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/60">Vitality Map</span>
            <div className="mt-6 flex flex-col items-center gap-1">
                <span className="material-symbols-outlined text-white/50 text-2xl">eco</span>
                <p className="text-[11px] font-medium text-white/80 max-w-[80%]">
                    Optimal growth achieved in 3/5 categories this week.
                </p>
            </div>
          </div>
        </div>

        <p className="max-w-[80%] pb-6 text-center text-on-surface-variant italic">
          &quot;This move aligns with your long-term wellness and financial stability markers.&quot;
        </p>

        <button className="flex items-center gap-3 rounded-full bg-surface-container-low px-8 py-4 text-xs font-bold uppercase tracking-widest text-primary shadow-sm hover:shadow-md transition-all active:scale-95">
          Download PDF Report{" "}
          <span className="material-symbols-outlined text-lg">download</span>
        </button>
      </section>

      {/* Breakdown Grid */}
      <section className="grid grid-cols-2 gap-4">
        {[
          { label: "Stability", value: "92%", color: "bg-primary", icon: "shield" },
          { label: "Growth", value: "64%", color: "bg-secondary", icon: "trending_up" },
          { label: "Community", value: "70%", color: "bg-tertiary", icon: "groups" },
          { label: "Wellness", value: "85%", color: "bg-secondary-fixed-dim", icon: "spa" },
        ].map((stat) => (
          <div key={stat.label} className="flex flex-col rounded-lg bg-surface-container-low p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between text-on-surface-variant">
              <span className="material-symbols-outlined">{stat.icon}</span>
              <span className="text-[10px] font-bold uppercase tracking-widest">{stat.label}</span>
            </div>
            <div className="mt-auto flex items-end justify-between">
              <span className="font-headline text-2xl font-extrabold">{stat.value}</span>
              <div className="mb-1 h-1 w-12 overflow-hidden rounded-full bg-surface-variant">
                <div className={`${stat.color} h-full`} style={{ width: stat.value }}></div>
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
