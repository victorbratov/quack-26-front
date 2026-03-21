"use client";

import React from "react";
import Image from "next/image";

export default function Home() {
  return (
    <div className="mx-auto max-w-2xl px-6 pt-12 space-y-12">
      {/* AI Sprout Agent Section */}
      <section className="flex flex-col items-center space-y-8">
        {/* The Breathing Sprout Agent */}
        <div className="relative group">
          <div className="absolute inset-0 bg-secondary/20 rounded-full blur-3xl group-hover:bg-secondary/30 transition-all duration-1000"></div>
          <div className="relative w-48 h-48 bg-surface-container-lowest rounded-full flex items-center justify-center shadow-2xl border-4 border-white/50">
            <span 
              className="material-symbols-outlined text-7xl text-primary animate-pulse" 
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              local_florist
            </span>
          </div>
          {/* Mini Pulsing Badge */}
          <div className="absolute -bottom-2 -right-2 bg-primary px-3 py-1 rounded-full text-white text-[10px] font-bold tracking-widest uppercase shadow-lg">Active</div>
        </div>
        
        {/* Speech Bubble */}
        <div className="glass-panel p-8 rounded-lg shadow-[0_20px_60px_rgba(81,97,68,0.08)] relative">
          {/* Bubble Tail */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-white/40 rotate-45"></div>
          <p className="text-xl md:text-2xl font-headline font-semibold text-center leading-relaxed text-on-surface">
            Good morning. I’ve synthesized your stats. <span className="text-primary font-extrabold italic">Transportation is up 15%</span> this week. It’s been a strong week. Your Harvest Review is ready.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-primary hover:bg-primary-container text-white px-8 py-4 rounded-full font-bold text-sm shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2">
              Enter The Harvest Review
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
            <div className="flex gap-2">
              <button className="flex-1 bg-secondary-container text-on-secondary-container px-6 py-4 rounded-full font-bold text-xs hover:bg-secondary-fixed transition-colors">
                Yes, let&apos;s adjust it
              </button>
              <button className="flex-1 bg-surface-container text-on-surface-variant px-6 py-4 rounded-full font-bold text-xs hover:bg-surface-variant transition-colors">
                No, I&apos;ve got it
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid Overview */}
      <section className="grid grid-cols-2 gap-4">
        <div className="col-span-2 md:col-span-1 bg-surface-container-lowest p-6 rounded-lg shadow-sm space-y-4">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-secondary-fixed rounded-full">
              <span className="material-symbols-outlined text-secondary">energy_savings_leaf</span>
            </div>
            <span className="text-tertiary font-bold">+2.4k</span>
          </div>
          <div>
            <h3 className="font-headline font-bold text-lg text-on-surface">Carbon Offset</h3>
            <p className="text-on-surface-variant text-sm">Equivalent to 4 saplings planted this week.</p>
          </div>
        </div>

        <div className="col-span-1 md:col-span-1 bg-primary-container p-6 rounded-lg shadow-sm space-y-4 text-on-primary-container">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-white/20 rounded-full">
              <span className="material-symbols-outlined">wallet</span>
            </div>
          </div>
          <div>
            <h3 className="font-headline font-bold text-lg">Yield Earned</h3>
            <p className="text-white/80 text-sm">4.2% APY Growth</p>
          </div>
        </div>

        <div className="col-span-1 bg-surface-container-low p-6 rounded-lg flex flex-col justify-between">
          <h3 className="font-headline font-bold text-on-surface">Community</h3>
          <div className="flex -space-x-2 mt-4 relative h-8">
            <div className="w-8 h-8 rounded-full border-2 border-surface relative overflow-hidden">
               <Image 
                 alt="Avatar" 
                 fill
                 className="object-cover"
                 src="https://lh3.googleusercontent.com/aida-public/AB6AXuAysK48VKATKh8qSZFag4L43XyQrGaptykte6dASd4aQhUWaEZBdGR0syxbbiojV_bqEedpfc2xcMTuqnWwMJCn4rv1xqQRSufy6BP2CbI0FdqPLUjWs7Cp-ohcDsTIR5LHGxQsGAh67Il8370krh0YZ8iwIHehllVX5iqHQzi25lwMO0ilHDOWAfafo9Mk3glWRoalbqjw0dyZHmriZrbjWseIcxOS2Vw2mOnOrHl8Hsg3E3VF7EOku_xTP2oC3zglLsLbeVhD1ho"
               />
            </div>
            <div className="w-8 h-8 rounded-full border-2 border-surface relative overflow-hidden">
               <Image 
                 alt="Avatar" 
                 fill
                 className="object-cover"
                 src="https://lh3.googleusercontent.com/aida-public/AB6AXuD_Xfa3rY2HAtAjXanltK3yPZQxHB8k_sjY9rLg8lgXeMP9BxzlZXIoBSJVZvW8p5ynLhjvg_lXjumUPSYj2vgAPYPUIREgkR7X2RNy7JQtkRkfft7dr6fa__L8gUZ4rOARPzjqV0W7hnuKmYzQe7efroOJ7nOSk3WumZxlVOcxuR0yoQIDk02wJYVPVE4qs3hr7MkaJps1KWbJciH-X2XYXGMStUGgSlq_OQbLxQW0oLKe1b1gccrG_O3jLei0nyrAFJN5QbcEFKM"
               />
            </div>
            <div className="w-8 h-8 rounded-full bg-outline-variant flex items-center justify-center text-[10px] font-bold border-2 border-surface">+12</div>
          </div>
        </div>

        <div className="col-span-2 bg-white/40 backdrop-blur-md p-8 rounded-lg flex items-center justify-between shadow-sm border border-white/20">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-widest font-bold text-on-surface-variant">Active Quest</p>
            <h4 className="text-xl font-headline font-extrabold text-emerald-900">Zero-Emission Commute</h4>
          </div>
          <div className="w-16 h-16 rounded-full border-4 border-primary/20 flex items-center justify-center relative">
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle className="text-primary" cx="32" cy="32" fill="none" r="28" stroke="currentColor" strokeDasharray="175" strokeDashoffset="44" strokeWidth="4"></circle>
            </svg>
            <span className="text-xs font-bold">75%</span>
          </div>
        </div>
      </section>
    </div>
  );
}
