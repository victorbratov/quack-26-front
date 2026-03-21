"use client";

import React, { useState } from "react";

export default function ActionsPage() {
  const [currentId, setCurrentId] = useState(0);

  const cards = [
    {
      id: 0,
      title: "Cancel Subscription?",
      description: "You haven&apos;t used Spotify for 30 days. Save £10.99/mo.",
      impact: "£131.88/yr",
      category: "Subscription",
      icon: "subscriptions",
      color: "bg-primary",
      textColor: "text-white",
    },
    {
      id: 1,
      title: "Switch Energy Provider?",
      description: "Your fixed tariff expires in 14 days. Potential saving found.",
      impact: "£18/mo",
      category: "Fixed Costs",
      icon: "bolt",
      color: "bg-secondary",
      textColor: "text-white",
    },
    {
      id: 2,
      title: "Round-up Surplus?",
      description: "You have £4.20 in loose change from coffee spends.",
      impact: "£4.20",
      category: "Savings",
      icon: "savings",
      color: "bg-tertiary",
      textColor: "text-white",
    },
  ];

  const currentCard = cards[currentId % cards.length]!;

  return (
    <div className="mx-auto flex h-[calc(100dvh-10rem)] max-w-xl flex-col px-6">
      <header className="mb-8 shrink-0 text-center">
        <h1 className="font-headline text-4xl font-extrabold tracking-tight text-on-surface">Action Deck</h1>
        <p className="mt-2 text-on-surface-variant">Quick wins for your financial wellness.</p>
      </header>

      {/* Swipeable Card (Simulated) */}
      <div className="relative flex grow flex-col justify-center gap-12">
        <article className={`relative flex flex-col justify-between overflow-hidden rounded-xl p-12 shadow-2xl transition-all duration-500 active:scale-95 ${currentCard.color} ${currentCard.textColor}`}>
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-4">
              <span className="material-symbols-outlined text-4xl text-inherit opacity-50">
                {currentCard.icon}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-inherit opacity-60">
                {currentCard.category}
              </span>
            </div>
            
            <h2 className="font-headline text-4xl font-extrabold text-white leading-tight">
              {currentCard.title}
            </h2>
            
            <p className="max-w-[85%] text-lg text-white/80 leading-relaxed font-medium">
              {currentCard.description}
            </p>

            <div className="rounded-2xl bg-white/10 p-5 backdrop-blur-md">
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">Estimated Impact</span>
              <p className="mt-1 text-2xl font-extrabold text-white">+{currentCard.impact}</p>
            </div>
          </div>

          {/* Liquid Decoration Background */}
          <div className="absolute right-[-4rem] top-[-4rem] h-64 w-64 rounded-full bg-white/5 blur-3xl"></div>
          <div className="absolute left-[-2rem] bottom-[-2rem] h-48 w-48 rounded-full bg-black/10 blur-2xl"></div>
        </article>

        {/* Action Buttons */}
        <div className="flex justify-around items-center">
            <button 
                onClick={() => setCurrentId(currentId + 1)}
                aria-label="Skip action"
                className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant shadow-lg active:scale-95 transition-all"
            >
                <span className="material-symbols-outlined text-3xl">close</span>
            </button>
            <div className="flex flex-col items-center gap-2">
                <div className="flex gap-2" aria-label={`Card ${currentId % cards.length + 1} of ${cards.length}`}>
                    {cards.map((card) => (
                        <div key={card.id} className={`h-1.5 rounded-full transition-all duration-300 ${card.id === (currentId % cards.length) ? 'w-8 bg-primary' : 'w-2 bg-outline-variant/30'}`}></div>
                    ))}
                </div>
            </div>
            <button 
                onClick={() => setCurrentId(currentId + 1)}
                aria-label="Accept action"
                className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white shadow-lg active:scale-95 transition-all"
            >
                <span className="material-symbols-outlined text-3xl">check</span>
            </button>
        </div>
      </div>
    </div>
  );
}
