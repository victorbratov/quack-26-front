"use client";

import React, { useState } from "react";


export default function BloomPage() {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="mx-auto max-w-lg px-6 pt-12 pb-32 min-h-screen flex flex-col items-center">
      {/* Header Section */}
      <section className="mb-8 text-center w-full">
        <h2 className="font-headline text-3xl font-extrabold text-on-surface tracking-tight mb-2">Wellness Blooms</h2>
        {/* Progress Indicator */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 text-primary font-bold text-sm">
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
              local_florist
            </span>
            <span>12 / 24 Blooms Unlocked</span>
          </div>
          <div className="w-48 h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
            <div className="bg-primary w-1/2 h-full rounded-full"></div>
          </div>
        </div>
      </section>

      {/* Card Stack Container */}
      <div className="relative w-full aspect-[4/5] perspective-1000 group">
        {/* Background Card 2 (Deepest) */}
        <div className="absolute inset-0 bg-surface-container-low rounded-[4rem] scale-[0.85] translate-y-12 opacity-40 shadow-sm border border-outline-variant/10"></div>
        {/* Background Card 1 */}
        <div className="absolute inset-0 bg-surface-container rounded-[4rem] scale-[0.92] translate-y-6 opacity-80 shadow-md border border-outline-variant/20"></div>
        
        {/* Active Flashcard */}
        <div 
          className={`relative w-full h-full cursor-pointer transition-transform duration-600 preserve-3d ${isFlipped ? "rotate-y-180" : ""}`}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          {/* Front Face */}
          <div className="absolute inset-0 bg-white rounded-[4rem] shadow-xl border border-outline-variant/30 flex flex-col items-center justify-between p-10 text-center overflow-hidden backface-hidden">
            {/* Living Gradient Background Effect */}
            <div className="absolute inset-0 bg-breathing pointer-events-none opacity-40"></div>
            <div className="relative z-10 w-full flex justify-end">
              <span className="text-xs font-bold tracking-widest uppercase text-on-surface-variant">Finance 101</span>
            </div>
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-32 h-32 bg-secondary-container rounded-full flex items-center justify-center mb-8 shadow-inner">
                <span className="material-symbols-outlined text-primary text-7xl" style={{ fontVariationSettings: "'FILL' 1" }}>spa</span>
              </div>
              <h3 className="font-headline text-3xl font-bold text-on-surface mb-4 leading-tight">The Power of ISAs</h3>
              <p className="text-on-surface-variant font-medium leading-relaxed">How tax-free wrappers help your financial garden grow faster.</p>
            </div>
            <div className="relative z-10 flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 text-primary/60 animate-bounce">
                <span className="material-symbols-outlined text-sm">touch_app</span>
                <span className="text-xs font-bold uppercase tracking-widest">Tap to Flip</span>
              </div>
            </div>
          </div>

          {/* Back Face */}
          <div className="absolute inset-0 bg-secondary-container rounded-[4rem] shadow-xl flex flex-col items-center justify-center p-10 text-center backface-hidden rotate-y-180">
            <div className="w-16 h-16 bg-white/40 rounded-full flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-on-secondary-container" style={{ fontVariationSettings: "'FILL' 1" }}>lightbulb</span>
            </div>
            <h4 className="font-headline text-2xl font-bold text-on-secondary-container mb-4">The Seedlings Concept</h4>
            <p className="text-on-secondary-container/80 text-lg leading-relaxed mb-8">
              An Individual Savings Account (ISA) is like a greenhouse. Any growth inside is protected from the &quot;frost&quot; of capital gains and income taxes.
            </p>
            <button className="bg-primary text-on-primary px-8 py-3 rounded-full font-bold shadow-lg hover:scale-105 transition-transform active:scale-95">
              Plant this Seed
            </button>
          </div>
        </div>
      </div>

      {/* Quick Navigation Hint */}
      <div className="mt-12 flex items-center gap-6 opacity-90">
        <button className="p-3 rounded-full border border-outline/50 hover:bg-surface-container transition-colors text-on-surface">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <span className="font-bold text-sm tracking-widest uppercase">Card 1 of 12</span>
        <button className="p-3 rounded-full border border-outline/50 hover:bg-surface-container transition-colors text-on-surface">
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </div>
    </div>
  );
}
