"use client";

import React from "react";
import Image from "next/image";

export default function CommunityPage() {
  return (
    <div className="max-w-xl mx-auto px-6 pt-12 pb-40 space-y-12">
      {/* Hero Section: Community Pulse */}
      <section className="space-y-6">
        <header>
          <h2 className="text-3xl font-extrabold tracking-tight text-on-surface">Community Pulse</h2>
          <p className="text-on-surface-variant mt-1">Real-time financial mindfulness from your circle.</p>
        </header>

        {/* Bento Grid Activity Feed */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Social Win 1 */}
          <article className="bg-surface-container-lowest rounded-lg p-6 flex flex-col justify-between transition-all hover:translate-y-[-2px] shadow-sm border border-outline-variant/10">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-secondary-container text-on-secondary-container rounded-full">
                <span className="material-symbols-outlined">savings</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-secondary opacity-60">Success</span>
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">Alex cancelled a £60 impulse spend!</h3>
              <p className="text-sm text-on-surface-variant mt-2">Saved into &quot;Summer Trip&quot; pot.</p>
            </div>
          </article>
          {/* Social Win 2 */}
          <article className="bg-surface-container-lowest rounded-lg p-6 flex flex-col justify-between transition-all hover:translate-y-[-2px] shadow-sm border border-outline-variant/10">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-secondary-container text-on-secondary-container rounded-full">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>auto_stories</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-secondary opacity-60">Milestone</span>
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">Ben achieved a 30-day savings streak!</h3>
              <p className="text-sm text-on-surface-variant mt-2">Personal best since January.</p>
            </div>
          </article>
          {/* Activity Feed Item 3 (Spanning) */}
          <article className="md:col-span-2 bg-secondary-fixed rounded-lg p-6 flex items-center gap-6 shadow-sm border border-outline-variant/10 overflow-hidden relative">
            <div className="flex -space-x-3 pointer-events-none">
              <div className="w-10 h-10 rounded-full border-2 border-secondary-fixed bg-surface-container overflow-hidden relative">
                 <Image fill className="object-cover" alt="User 1" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCcdu2V4QX08xE5seYhrC2yBDLVpplA9wJRamIt8DczqPa-gW_wom5GURr2Jsm8slxpDYWoPmFLJo6WvxmxBAoDIhKUK7r9jf0asXomhwxYbFMp7IYV0eKlEjTyG9oxpJm1vBpAhnAAEZe_MTQGCvGpLcNPe_EQLN8jNIC47aQoSvV1yVBI0cfKhmljw3jLUiF37U-00gvXkl6AiS9_YrvgUcVUeuI9W87-Aih6q5E0Ts0xMCLry_znn9CopbSJY1W_XCmf0NfmLPQ" />
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-secondary-fixed bg-surface-container overflow-hidden relative">
                 <Image fill className="object-cover" alt="User 2" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAgZjOADiDJfdiVKtaH6KBTY2kJeAxc4dmbVE7kv471PkUH4BviyliEmRECFi0xp2_-bNUBqJ5eRTbX5C4pDyZp3vgNrprF7jM87vjkTthx2TxU1GxOsR18LMckPndmomFw2sfS_k-26uP0U33HyOVcU9XuWFEHCBY64fyqXiNjPEdJW5_znBaCFsvNd11rrcXIM9Wf9aaWl2PcRd3liYx5mEk-iBzj0TEc0g9hJo2Omwsssv5TLgwZUNWkHdI1EFGcp27s5Z4fDZQ" />
              </div>
            </div>
            <p className="text-on-secondary-fixed text-sm font-medium">
              <span className="font-bold">Mia &amp; 4 others</span> just joined the &quot;Coffee-Free Week&quot; council.
            </p>
            <button className="ml-auto bg-on-secondary-fixed text-secondary-fixed px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider active:scale-95 transition-transform">Join</button>
          </article>
        </div>
      </section>

      {/* Spending Overview Benchmarking */}
      <section className="space-y-8 bg-surface-container-low rounded-[2rem] p-8 border border-outline-variant/10">
        <header className="flex justify-between items-end">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">Spending Overview</h2>
            <p className="text-sm text-on-surface-variant">How you compare to peers in London.</p>
          </div>
          <div className="bg-surface-container-highest px-3 py-1 rounded-full text-[10px] font-bold text-outline uppercase tracking-widest">Weekly</div>
        </header>

        <div className="space-y-10">
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-tertiary">restaurant</span>
                <span className="font-bold text-on-surface">Eating Out</span>
              </div>
              <span className="font-headline font-extrabold text-lg">£142.00</span>
            </div>
            {/* Progress Bar with Benchmark */}
            <div className="relative pt-6 pb-2">
              <div className="h-3 w-full bg-surface-variant rounded-full overflow-hidden">
                <div className="h-full bg-linear-to-r from-primary to-primary-container rounded-full" style={{ width: "72%" }}></div>
              </div>
              <div className="absolute top-0 left-[58%] h-12 flex flex-col items-center">
                <div className="h-full border-l-2 border-dashed border-stone-400"></div>
                <div className="mt-1 text-[9px] font-bold text-outline uppercase tracking-tighter whitespace-nowrap bg-surface-container-low px-1">Peer Benchmark (£110)</div>
              </div>
            </div>
            <p className="text-[11px] text-on-surface-variant leading-relaxed">You&apos;re spending 22% more than peers in similar circumstances. Consider opting for one less takeaway this week.</p>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">directions_bus</span>
                <span className="font-bold text-on-surface">Transport</span>
              </div>
              <span className="font-headline font-extrabold text-lg">£45.20</span>
            </div>
            <div className="relative pt-6 pb-2">
              <div className="h-3 w-full bg-surface-variant rounded-full overflow-hidden">
                <div className="h-full bg-linear-to-r from-secondary to-secondary-fixed-dim rounded-full" style={{ width: "45%" }}></div>
              </div>
              <div className="absolute top-0 left-[65%] h-12 flex flex-col items-center">
                <div className="h-full border-l-2 border-dashed border-stone-400"></div>
                <div className="mt-1 text-[9px] font-bold text-outline uppercase tracking-tighter whitespace-nowrap bg-surface-container-low px-1">Peer Benchmark (£68)</div>
              </div>
            </div>
            <p className="text-[11px] text-on-surface-variant leading-relaxed">Excellent. You are well below the benchmark for your commute type.</p>
          </div>
        </div>
      </section>

      {/* Call to Action Card */}
      <section className="bg-primary-container rounded-xl p-8 text-on-primary-container relative overflow-hidden shadow-lg border border-primary/20">
        <div className="relative z-10">
          <h3 className="text-xl font-bold font-headline mb-2">Bloom Your Portfolio</h3>
          <p className="text-sm opacity-90 mb-6 max-w-[80%] leading-relaxed">Based on your peer comparison, you could redirect £32/week into your Growth fund.</p>
          <button className="bg-white text-primary px-6 py-3 rounded-full font-bold text-sm shadow-md active:scale-95 transition-transform hover:bg-white/90">Set New Target</button>
        </div>
        <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-primary/20 rounded-full blur-3xl"></div>
        <div className="absolute right-4 top-4 opacity-20 transform -rotate-12 translate-x-2 -translate-y-2">
          <span className="material-symbols-outlined text-6xl">local_florist</span>
        </div>
      </section>
    </div>
  );
}
