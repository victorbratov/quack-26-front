"use client";

import React from "react";

export default function GrowthPage() {
  return (
    <div className="mx-auto max-w-xl px-6">
      <header className="mb-10 text-center">
        <h1 className="font-headline text-4xl font-extrabold tracking-tight text-on-surface">Growth Garden</h1>
        <p className="mt-2 text-on-surface-variant">Cultivating your long-term security.</p>
      </header>

      {/* Primary Goal Visualization */}
      <section className="relative mb-12 rounded-[3rem] bg-surface-container-low p-10 text-center shadow-sm">
        <div className="mb-6 flex justify-center">
          <div className="relative flex h-64 w-64 items-center justify-center rounded-full border-4 border-dashed border-primary/20 bg-white shadow-inner">
            <div className="flex flex-col items-center">
              <span className="material-symbols-outlined text-6xl text-primary mb-2">park</span>
              <span className="font-headline text-5xl font-extrabold text-on-surface">64%</span>
              <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">House Deposit</span>
            </div>
            {/* Pulsing Ring Animation */}
            <div className="absolute inset-0 animate-ping rounded-full bg-primary/5 opacity-50"></div>
          </div>
        </div>

        <div className="mb-8 space-y-2">
          <p className="text-2xl font-bold text-on-surface">£19,200 saved</p>
          <p className="text-sm text-on-surface-variant">£10,800 remaining until target</p>
        </div>

        <div className="h-4 w-full overflow-hidden rounded-full bg-surface-variant">
          <div className="h-full rounded-full bg-linear-to-r from-primary to-primary-container" style={{ width: "64%" }}></div>
        </div>
      </section>

      {/* Gardening Sub-goals Grid */}
      <section className="mb-12 grid grid-cols-2 gap-4">
        <article className="rounded-lg bg-surface-container-lowest p-6 shadow-sm">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container">
            <span className="material-symbols-outlined">umbrella</span>
          </div>
          <h3 className="font-bold text-on-surface">Rainy Day</h3>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs font-bold text-on-surface-variant">£3,105</span>
            <span className="rounded-full bg-secondary-fixed-dim px-2 py-0.5 text-[10px] font-bold text-on-secondary-fixed">88%</span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-variant">
            <div className="h-full rounded-full bg-secondary" style={{ width: "88%" }}></div>
          </div>
        </article>

        <article className="rounded-lg bg-surface-container-lowest p-6 shadow-sm">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-tertiary-fixed text-on-tertiary-fixed">
            <span className="material-symbols-outlined">flight_takeoff</span>
          </div>
          <h3 className="font-bold text-on-surface">Italy 2026</h3>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs font-bold text-on-surface-variant">£980</span>
            <span className="rounded-full bg-tertiary-container/20 px-2 py-0.5 text-[10px] font-bold text-tertiary">32%</span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-variant">
            <div className="h-full rounded-full bg-tertiary" style={{ width: "32%" }}></div>
          </div>
        </article>
      </section>

      {/* Harvest Review Prompt */}
      <section className="rounded-lg bg-primary p-8 text-on-primary shadow-lg">
        <div className="mb-6 flex items-start justify-between">
          <div className="max-w-[70%]">
            <h3 className="text-xl font-bold font-headline mb-2">Weekly Harvest Review</h3>
            <p className="text-sm opacity-90 leading-relaxed">
              You&apos;ve nurtured your &quot;House&quot; seedling with 3 consistent contributions this week.
            </p>
          </div>
          <span className="material-symbols-outlined text-4xl opacity-50">eco</span>
        </div>
        <button className="w-full rounded-full bg-white px-6 py-3 text-sm font-bold text-primary active:scale-[0.98] transition-all">
          Generate Analysis
        </button>
      </section>
    </div>
  );
}
