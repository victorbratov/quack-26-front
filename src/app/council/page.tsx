"use client";

import React from "react";
import Image from "next/image";

export default function CouncilPage() {
  return (
    <div className="pt-24 pb-32 px-6 max-w-md mx-auto">
      {/* Purchase Context */}
      <div className="mb-10 text-center space-y-2">
        <p className="text-on-surface-variant font-medium tracking-wide uppercase text-[10px]">Council Chamber Intervention</p>
        <h1 className="text-2xl font-headline font-extrabold text-on-surface leading-tight">You&apos;re about to spend £60 at Zara.</h1>
      </div>

      {/* Agent Panels Stack */}
      <div className="space-y-6">
        {/* Agent 1: Risk */}
        <div className="bg-surface-container-low rounded-lg p-6 shadow-sm relative overflow-hidden group border border-outline-variant/10">
          <div className="absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 bg-[#78909c]/10 rounded-full blur-2xl group-hover:bg-[#78909c]/20 transition-colors"></div>
          <div className="flex items-start gap-4 relative">
            <div className="w-12 h-12 rounded-full bg-[#78909c]/20 flex items-center justify-center text-[#455a64] flex-shrink-0">
              <span className="material-symbols-outlined text-2xl">shield</span>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-[#455a64] font-headline">Risk Analysis</p>
              <p className="text-on-surface-variant leading-relaxed text-sm">
                Analysis: You&apos;ve spent £140 on clothing this month. This purchase puts you £40 over your historical average.
              </p>
            </div>
          </div>
        </div>

        {/* Agent 2: Growth */}
        <div className="bg-surface-container-low rounded-lg p-6 shadow-sm relative overflow-hidden group border border-outline-variant/10">
          <div className="absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 bg-secondary/10 rounded-full blur-2xl group-hover:bg-secondary/20 transition-colors"></div>
          <div className="flex items-start gap-4 relative">
            <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-secondary flex-shrink-0">
              <span className="material-symbols-outlined text-2xl">nature</span>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-secondary font-headline">Growth Opportunity</p>
              <p className="text-on-surface-variant leading-relaxed text-sm">
                Opportunity Cost: Investing this £60 instead would keep your 2026 travel goal perfectly on track.
              </p>
            </div>
          </div>
        </div>

        {/* Agent 3: Lifestyle */}
        <div className="bg-surface-container-low rounded-lg p-6 shadow-sm relative overflow-hidden group border border-outline-variant/10">
          <div className="absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 bg-tertiary-fixed/30 rounded-full blur-2xl group-hover:bg-tertiary-fixed/50 transition-colors"></div>
          <div className="flex items-start gap-4 relative">
            <div className="w-12 h-12 rounded-full bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed-variant flex-shrink-0">
              <span className="material-symbols-outlined text-2xl">coffee</span>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-on-tertiary-fixed-variant font-headline">Well-being Check</p>
              <p className="text-on-surface-variant leading-relaxed text-sm">
                You&apos;ve worked four extra shifts this week. If this adds genuine happiness, buy it—but let&apos;s cut £60 from eating out next week to balance.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Consensus Box */}
      <div className="mt-10 p-6 bg-tertiary-container/10 rounded-xl border-2 border-tertiary/20 text-center space-y-1">
        <span className="text-[10px] font-bold tracking-widest uppercase text-tertiary">Final Verdict</span>
        <p className="text-lg font-headline font-extrabold text-tertiary leading-none">Stride Consensus: Reduce spending.</p>
      </div>

      {/* Override Action (Slider Simulation) */}
      <div className="mt-8">
        <div className="relative w-full h-16 bg-surface-container-highest rounded-full p-2 flex items-center group overflow-hidden border border-outline-variant/20">
          <div className="absolute inset-0 bg-tertiary-container/5 pointer-events-none"></div>
          <div className="absolute left-0 top-0 h-full w-24 bg-gradient-to-r from-tertiary/20 to-transparent"></div>
          <button 
            className="w-12 h-12 rounded-full bg-tertiary shadow-lg flex items-center justify-center text-white cursor-pointer z-10 transition-transform active:scale-95 hover:translate-x-1 duration-200"
            aria-label="Slide to override"
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
          <div className="flex-1 text-center pr-4">
            <span className="text-xs font-bold text-tertiary/80 uppercase tracking-widest pointer-events-none">Slide to override</span>
          </div>
        </div>
      </div>
    </div>
  );
}
