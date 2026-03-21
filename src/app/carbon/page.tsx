"use client";

import React from "react";

export default function CarbonPage() {
  const activities = [
    { title: "Zero-Emission Commute", impact: "+5.2kg CO2", time: "2h ago", icon: "directions_bike" },
    { title: "Solar Excess Sold", impact: "+12.8kg CO2", time: "Yesterday", icon: "wb_sunny" },
    { title: "Reduced Meat Intake", impact: "+1.4kg CO2", time: "Yesterday", icon: "restaurant" },
  ];

  return (
    <div className="mx-auto max-w-2xl px-6 pt-12 space-y-12">
      {/* Hero / Offset Summary */}
      <section className="text-center space-y-6">
        <div className="inline-block p-4 bg-emerald-100 rounded-full mb-2">
          <span className="material-symbols-outlined text-emerald-700 text-4xl">eco</span>
        </div>
        <h1 className="text-5xl font-headline font-black text-on-surface tracking-tight">
          Your Carbon <span className="text-emerald-600">Sanctuary</span>
        </h1>
        <p className="text-on-surface-variant max-w-lg mx-auto leading-relaxed">
          Every action you take in the physical world is synthesized into digital growth. 
          You&apos;ve offset enough carbon to power 4 homes for a month.
        </p>
      </section>

      {/* Impact Stats Bento */}
      <section className="grid grid-cols-2 md:grid-cols-3 gap-4 font-headline">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-emerald-50 space-y-2">
          <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Total Offset</p>
          <p className="text-3xl font-black text-on-surface">2.4<span className="text-lg">t</span></p>
          <div className="w-full bg-emerald-100 h-1 rounded-full overflow-hidden mt-4">
             <div className="bg-emerald-600 h-full w-[65%]"></div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-emerald-50 space-y-2">
          <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Trees Equivalent</p>
          <p className="text-3xl font-black text-on-surface">42</p>
          <p className="text-[10px] text-on-surface-variant font-medium">Saplings planted this year</p>
        </div>

        <div className="col-span-2 md:col-span-1 bg-emerald-900 p-6 rounded-3xl shadow-xl space-y-2 transition-transform hover:scale-[1.02]">
          <p className="text-xs font-bold text-emerald-200 uppercase tracking-widest">Global Rank</p>
          <p className="text-3xl font-black text-white">Top 2%</p>
          <p className="text-[10px] text-emerald-300 font-medium">vs. Stride Community</p>
        </div>
      </section>

      {/* Active Impact Feed */}
      <section className="space-y-6">
        <div className="flex justify-between items-end">
          <h2 className="text-2xl font-headline font-bold text-on-surface">Recent Impact</h2>
          <button className="text-sm font-bold text-emerald-600">View History</button>
        </div>
        <div className="space-y-3">
          {activities.map((item) => (
            <div key={item.title} className="flex items-center justify-between p-4 bg-white/60 backdrop-blur-sm border border-white/40 rounded-2xl">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                  <span className="material-symbols-outlined text-emerald-600 text-xl">{item.icon}</span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-on-surface">{item.title}</h4>
                  <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">{item.time}</p>
                </div>
              </div>
              <div className="text-emerald-700 font-black text-xs bg-emerald-100 px-3 py-1 rounded-full">
                {item.impact}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Project */}
      <section className="relative overflow-hidden group">
        <div className="absolute inset-0 bg-linear-to-br from-emerald-600 to-teal-800 rounded-3xl opacity-90 transition-all group-hover:opacity-100"></div>
        <div className="relative p-8 flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
             <span className="material-symbols-outlined text-5xl text-white">volcano</span>
          </div>
          <div className="space-y-2 text-white">
            <h3 className="text-xl font-headline font-bold">Amazon Reforestation</h3>
            <p className="text-emerald-100 text-sm leading-snug">
              Your yield is currently funding the protection of 4.2 hectares in the Xingu Basin. 
              Contributing to 98% biodiversity retention.
            </p>
            <div className="pt-2 flex gap-4">
              <span className="text-[10px] font-black uppercase bg-white/20 px-2 py-1 rounded">VSC Verified</span>
              <span className="text-[10px] font-black uppercase bg-white/20 px-2 py-1 rounded">High Integrity</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
