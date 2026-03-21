"use client";

import React, { useState } from "react";
import Link from "next/link";

type Card = {
  id: string;
  type: string;
  icon: string;
  title: string;
  body: string;
  savings: string;
  accentClass: string;
};

const mockCards: Card[] = [
  {
    id: "1",
    type: "ghost_spend",
    icon: "warning",
    title: "Ghost Subscription",
    body: "Headspace: £12.99/month unused for 27 days",
    savings: "£12.99",
    accentClass: "text-error border-error/50 bg-error/5"
  },
  {
    id: "2",
    type: "opportunity_cost",
    icon: "trending_up",
    title: "Opportunity Cost",
    body: "Your coffee habit: £4,152/year → £8,169 invested over 10 years",
    savings: "£8,169",
    accentClass: "text-secondary border-secondary/50 bg-secondary/5"
  },
  {
    id: "3",
    type: "savings_challenge",
    icon: "savings",
    title: "Savings Challenge",
    body: "Move £20 to 'New Laptop'? Safe to swipe — rent is covered.",
    savings: "£20",
    accentClass: "text-emerald-400 border-emerald-400/50 bg-emerald-400/5"
  },
  {
    id: "4",
    type: "peer_comparison",
    icon: "group",
    title: "Peer Insight",
    body: "You spent 40% more on eating out than similar students",
    savings: "View",
    accentClass: "text-blue-400 border-blue-400/50 bg-blue-400/5"
  }
];

export default function Home() {
  const [cards, setCards] = useState<Card[]>(mockCards);
  const [xpAnim, setXpAnim] = useState<{ id: number, text: string } | null>(null);
  const [xp, setXp] = useState(85);
  const [streak, setStreak] = useState(7);
  const [saved, setSaved] = useState(42);
  const [animIdCounter, setAnimIdCounter] = useState(0);

  const activeCard = cards[0];

  const handleAction = (direction: "left" | "right") => {
    if (!activeCard) return;
    
    // Trigger animation
    const newId = animIdCounter + 1;
    setAnimIdCounter(newId);
    
    if (direction === "right") {
      setXpAnim({ id: newId, text: "+5 XP" });
      setXp(x => x + 5);
      if (activeCard.savings.startsWith("£")) {
        const val = parseFloat(activeCard.savings.replace("£", "").replace(",", ""));
        if (!isNaN(val)) setSaved(s => s + val);
      }
    } else {
      setXpAnim({ id: newId, text: "Dismissed" });
    }

    setTimeout(() => setXpAnim(null), 1000);

    // Remove card
    setCards(prev => prev.slice(1));
  };

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase();

  return (
    <div className="mx-auto max-w-lg px-6 pt-12 pb-32 space-y-10 min-h-screen bg-black text-on-background font-body relative overflow-hidden">
      
      {/* Floating XP Animation */}
      {xpAnim && (
        <div key={xpAnim.id} className="absolute inset-0 pointer-events-none flex items-center justify-center z-50">
          <div className="animate-in slide-in-from-bottom-10 fade-in zoom-in duration-500 text-3xl font-bold text-secondary font-headline">
            {xpAnim.text}
          </div>
        </div>
      )}

      {/* Top Banner / Stats */}
      <section className="space-y-4">
        <div className="text-secondary text-xs tracking-widest uppercase font-bold">{today}</div>
        <h1 className="text-4xl font-headline font-bold text-primary">YOUR DAILY MOVES</h1>
        
        <div className="flex items-center gap-4 text-sm font-semibold text-outline">
          <div className="flex items-center gap-1 text-on-surface">
            <span className="material-symbols-outlined text-secondary text-base">local_fire_department</span>
            {streak}-day streak
          </div>
          <span>·</span>
          <div>£{saved.toLocaleString()} saved this week</div>
          <span>·</span>
          <div>{xp} XP earned</div>
        </div>
      </section>

      {/* Card Deck */}
      <section className="relative h-[400px] w-full mt-8">
        {cards.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-4 border border-outline-variant rounded-3xl bg-surface-container">
            <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center">
              <span className="material-symbols-outlined text-outline text-3xl">done_all</span>
            </div>
            <h3 className="text-xl font-headline font-bold text-on-surface">All caught up!</h3>
            <p className="text-outline text-sm px-6">You&apos;ve completed your daily moves. Check back tomorrow.</p>
          </div>
        ) : (
          cards.slice(0, 3).map((card, i) => {
            const isTop = i === 0;
            return (
              <div
                key={card.id}
                className="absolute inset-0 w-full transition-all duration-300 ease-out"
                style={{
                  zIndex: 10 - i,
                  transform: `translateY(${i * 15}px) scale(${1 - i * 0.05})`,
                  opacity: 1 - i * 0.2
                }}
              >
                <div className={`h-full border rounded-3xl p-8 flex flex-col justify-between bg-surface shadow-2xl ${card.accentClass}`}>
                  <div className="space-y-4">
                    <span className="material-symbols-outlined text-4xl">{card.icon}</span>
                    <h3 className="text-2xl font-headline font-bold text-on-surface leading-tight">{card.title}</h3>
                    <p className="text-lg text-outline font-medium">{card.body}</p>
                  </div>
                  
                  {isTop && (
                    <div className="flex gap-4 mt-8">
                      <button 
                        onClick={() => handleAction("left")}
                        className="flex-1 py-4 rounded-full border border-outline hover:bg-surface-container transition-colors font-bold text-on-surface flex items-center justify-center gap-2"
                      >
                        <span className="material-symbols-outlined text-xl">close</span>
                        Dismiss
                      </button>
                      <button 
                        onClick={() => handleAction("right")}
                        className="flex-1 py-4 rounded-full bg-primary text-black font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-[0_0_20px_rgba(230,221,197,0.3)]"
                      >
                        <span className="material-symbols-outlined text-xl">check</span>
                        Accept
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </section>

      {/* Your Week & CTA */}
      <section className="space-y-6 pt-12 animate-in fade-in duration-700 delay-300 fill-mode-both">
        <h3 className="text-xs uppercase tracking-widest font-bold text-outline">Your Week</h3>
        
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-surface border border-outline-variant p-4 rounded-2xl flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-headline font-bold text-primary">14</span>
            <span className="text-[10px] uppercase text-outline font-bold tracking-wider mt-1">Cards Swiped</span>
          </div>
          <div className="bg-surface border border-outline-variant p-4 rounded-2xl flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-headline font-bold text-secondary">9</span>
            <span className="text-[10px] uppercase text-outline font-bold tracking-wider mt-1">Accepted</span>
          </div>
          <div className="bg-surface border border-outline-variant p-4 rounded-2xl flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-headline font-bold text-emerald-400">£47</span>
            <span className="text-[10px] uppercase text-outline font-bold tracking-wider mt-1">Saved</span>
          </div>
        </div>

        <Link href="/check" className="block">
          <div className="w-full mt-4 bg-gradient-to-r from-surface-container to-surface border border-outline-variant p-6 rounded-3xl flex items-center justify-between group hover:border-secondary/50 transition-colors">
            <div className="space-y-1">
              <h4 className="font-headline font-bold text-lg text-on-surface group-hover:text-secondary transition-colors">About to spend something?</h4>
              <p className="text-outline text-sm">Check it first with your AI council</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-black transition-all">
              <span className="material-symbols-outlined">arrow_forward</span>
            </div>
          </div>
        </Link>
      </section>
      
    </div>
  );
}
