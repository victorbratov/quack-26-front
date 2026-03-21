"use client";

import React, { useState } from "react";


type TabChip = "Goals" | "Insights" | "Ghost Subs" | "Learning";

export default function ProgressPage() {
  const [activeTab, setActiveTab] = useState<TabChip>("Goals");

  const chips: TabChip[] = ["Goals", "Insights", "Ghost Subs", "Learning"];

  return (
    <div className="mx-auto max-w-lg px-6 pt-12 pb-32 min-h-screen bg-black text-on-background font-body space-y-8">
      


      {/* Header and Core Stats */}
      <section className="space-y-6">
        <h1 className="text-4xl font-headline font-bold text-primary">YOUR PROGRESS</h1>
        
        {/* Level & XP */}
        <div className="bg-surface p-5 rounded-3xl border border-outline-variant flex items-center gap-4">
          <div className="w-14 h-14 rounded-full border-4 border-primary/20 flex items-center justify-center relative flex-shrink-0">
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle className="text-primary" cx="28" cy="28" fill="none" r="24" stroke="currentColor" strokeDasharray="150" strokeDashoffset="40" strokeWidth="4"></circle>
            </svg>
            <span className="text-sm font-bold font-headline">Lvl 4</span>
          </div>
          <div>
            <div className="font-bold text-lg text-on-surface">320 XP Total</div>
            <div className="text-sm text-outline">80 XP to Level 5</div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-surface p-4 rounded-2xl border border-outline-variant">
            <div className="flex items-center gap-2 text-secondary mb-1">
              <span className="material-symbols-outlined text-sm">local_fire_department</span>
              <span className="font-bold text-xs uppercase tracking-widest">Streak</span>
            </div>
            <div className="text-2xl font-headline font-bold text-on-surface">14 Days</div>
          </div>
          <div className="bg-surface p-4 rounded-2xl border border-outline-variant">
            <div className="flex items-center gap-2 text-emerald-400 mb-1">
              <span className="material-symbols-outlined text-sm">shield</span>
              <span className="font-bold text-xs uppercase tracking-widest">Saved</span>
            </div>
            <div className="text-2xl font-headline font-bold text-on-surface">£240</div>
          </div>
        </div>
      </section>

      {/* Horizontal Scrollable Chips */}
      <section className="sticky top-4 z-10 bg-black/80 backdrop-blur-md py-4 -mx-6 px-6">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {chips.map(chip => (
            <button
              key={chip}
              onClick={() => setActiveTab(chip)}
              className={`whitespace-nowrap px-5 py-2.5 rounded-full font-bold text-sm transition-all border ${activeTab === chip ? "bg-primary text-black border-primary" : "bg-transparent text-outline border-outline-variant hover:border-outline"}`}
            >
              {chip}
            </button>
          ))}
        </div>
      </section>

      {/* Tab Content Areas */}
      <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* GOALS */}
        {activeTab === "Goals" && (
          <div className="space-y-4">
            <div className="bg-surface p-5 rounded-3xl border border-outline-variant">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-secondary">flight_takeoff</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-on-surface text-lg">Japan Trip</h3>
                    <div className="text-xs text-outline font-medium tracking-widest uppercase">Target: Oct 2026</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg text-secondary">£840</div>
                  <div className="text-xs text-outline">of £2,000</div>
                </div>
              </div>
              <div className="h-2 bg-surface-container-high rounded-full overflow-hidden mb-4">
                <div className="h-full bg-secondary" style={{ width: '42%' }}></div>
              </div>
              <button className="w-full py-3 rounded-full border border-secondary text-secondary font-bold text-sm hover:bg-secondary/10 transition-colors">
                Get AI Strategy
              </button>
            </div>

            <div className="bg-surface p-5 rounded-3xl border border-outline-variant">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-400/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-emerald-400">admin_panel_settings</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-on-surface text-lg">Emergency Fund</h3>
                    <div className="text-xs text-outline font-medium tracking-widest uppercase">Target: Flexible</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg text-emerald-400">£1,200</div>
                  <div className="text-xs text-outline">of £3,000</div>
                </div>
              </div>
              <div className="h-2 bg-surface-container-high rounded-full overflow-hidden mb-4">
                <div className="h-full bg-emerald-400" style={{ width: '40%' }}></div>
              </div>
              <button className="w-full py-3 rounded-full border border-emerald-400 text-emerald-400 font-bold text-sm hover:bg-emerald-400/10 transition-colors">
                Get AI Strategy
              </button>
            </div>

            <button className="w-full p-5 rounded-3xl border border-dashed border-outline text-outline font-bold flex items-center justify-center gap-2 hover:bg-surface-container transition-colors">
              <span className="material-symbols-outlined">add</span>
              Create Goal
            </button>
          </div>
        )}

        {/* INSIGHTS */}
        {activeTab === "Insights" && (
          <div className="space-y-4">
            <div className="bg-surface p-6 rounded-3xl border border-outline-variant">
              <span className="material-symbols-outlined text-primary text-3xl mb-4">restaurant</span>
              <p className="text-lg leading-relaxed text-on-surface">You spent <strong className="text-primary">£341</strong> on eating out this month — <strong className="text-error">127% more</strong> than similar students.</p>
            </div>
            
            <div className="bg-surface p-6 rounded-3xl border border-outline-variant">
              <span className="material-symbols-outlined text-secondary text-3xl mb-4">storefront</span>
              <p className="text-lg leading-relaxed text-on-surface">Your top merchant is <strong className="text-secondary">Pizza Express</strong> (£77 total across 5 visits).</p>
            </div>

            <div className="bg-surface p-6 rounded-3xl border border-outline-variant bg-gradient-to-br from-emerald-400/5 to-surface">
              <span className="material-symbols-outlined text-emerald-400 text-3xl mb-4">auto_awesome</span>
              <p className="text-lg leading-relaxed text-on-surface">If you cut eating out by 20%, you&apos;d save <strong className="text-emerald-400">£830/year</strong> towards your Japan Trip.</p>
            </div>
          </div>
        )}

        {/* GHOST SUBS */}
        {activeTab === "Ghost Subs" && (
          <div className="space-y-6">
            <div className="p-5 rounded-3xl bg-error/10 border border-error/20 text-error">
              <div className="font-bold text-lg mb-1">Action Required</div>
              <p className="text-sm">You could save £350/year by cancelling 2 unused subscriptions.</p>
            </div>

            <div className="space-y-3">
              <div className="bg-surface p-5 rounded-3xl border border-outline-variant flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-surface-container-high flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-surface">fitness_center</span>
                  </div>
                  <div>
                    <div className="font-bold text-on-surface text-lg">PureGym</div>
                    <div className="text-xs text-outline">£28.99/mo · Unused 41 days</div>
                  </div>
                </div>
                <button className="px-4 py-2 rounded-full border border-error text-error text-sm font-bold hover:bg-error/10">Cancel</button>
              </div>

              <div className="bg-surface p-5 rounded-3xl border border-outline-variant flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-surface-container-high flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-surface">self_improvement</span>
                  </div>
                  <div>
                    <div className="font-bold text-on-surface text-lg">Headspace</div>
                    <div className="text-xs text-outline">£12.99/mo · Unused 27 days</div>
                  </div>
                </div>
                <button className="px-4 py-2 rounded-full border border-error text-error text-sm font-bold hover:bg-error/10">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* LEARNING */}
        {activeTab === "Learning" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm font-bold uppercase tracking-widest text-outline">Modules</div>
              <div className="text-sm font-bold text-primary">7/12 completed</div>
            </div>

            <div className="space-y-4">
              <div className="bg-surface p-5 rounded-3xl border border-primary relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-primary/10 rounded-bl-full"></div>
                <div className="flex justify-between items-start mb-6 text-primary">
                  <span className="material-symbols-outlined">school</span>
                  <div className="text-xs font-bold uppercase tracking-widest bg-primary/20 px-2 py-1 rounded">+50 XP</div>
                </div>
                <h3 className="font-headline font-bold text-xl text-on-surface mb-2">Compound Interest</h3>
                <p className="text-outline text-sm mb-6">Learn how your money makes money.</p>
                <div className="h-1 bg-surface-container-high rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: '0%' }}></div>
                </div>
              </div>

              <div className="bg-surface p-5 rounded-3xl border border-outline-variant opacity-60">
                <div className="flex justify-between items-start mb-6 text-outline">
                  <span className="material-symbols-outlined">done_all</span>
                  <div className="text-xs font-bold uppercase tracking-widest bg-surface-container-high px-2 py-1 rounded">Completed</div>
                </div>
                <h3 className="font-headline font-bold text-xl text-on-surface mb-2">Budgeting 101</h3>
                <p className="text-outline text-sm">The 50/30/20 rule explained.</p>
              </div>
            </div>
          </div>
        )}

      </section>
    </div>
  );
}
