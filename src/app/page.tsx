"use client";

import React, { useState } from "react";
import Link from "next/link";
import { SectionHeader } from "~/components/ui/SectionHeader";
import { Divider } from "~/components/ui/Divider";
import { QuoteBlock } from "~/components/ui/QuoteBlock";
import { CardCarousel } from "~/components/ui/CardCarousel";

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
    accentClass: "text-error border-error/50 bg-error/5",
  },
  {
    id: "2",
    type: "opportunity_cost",
    icon: "trending_up",
    title: "Opportunity Cost",
    body: "Your coffee habit: £4,152/year → £8,169 invested over 10 years",
    savings: "£8,169",
    accentClass: "text-secondary border-secondary/50 bg-secondary/5",
  },
  {
    id: "3",
    type: "savings_challenge",
    icon: "savings",
    title: "Savings Challenge",
    body: "Move £20 to 'New Laptop'? Safe to swipe — rent is covered.",
    savings: "£20",
    accentClass: "text-emerald-400 border-emerald-400/50 bg-emerald-400/5",
  },
  {
    id: "4",
    type: "peer_comparison",
    icon: "group",
    title: "Peer Insight",
    body: "You spent 40% more on eating out than similar students",
    savings: "View",
    accentClass: "text-blue-400 border-blue-400/50 bg-blue-400/5",
  },
];

const DAYS = ["M", "T", "W", "T", "F", "S", "S"];
const CATEGORIES = ["Save", "Spend", "Invest", "Plan"];

const PRACTICE_CARDS = [
  { icon: "library_books", label: "Library", count: "24 items" },
  { icon: "schedule", label: "Recents", count: "3 today" },
  { icon: "monitoring", label: "Life Score", count: "72/100" },
];

const PROGRAM_CARDS = [
  {
    title: "30-Day Savings Sprint",
    subtitle: "Build your emergency fund",
    color: "from-secondary/30 to-surface-container",
  },
  {
    title: "Debt-Free Journey",
    subtitle: "Step-by-step repayment plan",
    color: "from-emerald-400/20 to-surface-container",
  },
  {
    title: "Invest Your First £100",
    subtitle: "Beginner-friendly guide",
    color: "from-blue-400/20 to-surface-container",
  },
];

export default function Home() {
  const [cards, setCards] = useState<Card[]>(mockCards);
  const [xpAnim, setXpAnim] = useState<{ id: number; text: string } | null>(null);
  const [xp, setXp] = useState(85);
  const [streak] = useState(7);
  const [saved, setSaved] = useState(42);
  const [animIdCounter, setAnimIdCounter] = useState(0);
  const [activeCategory, setActiveCategory] = useState("Save");

  const activeCard = cards[0];
  const today = new Date();
  const currentDayIndex = (today.getDay() + 6) % 7; // Monday=0

  const handleAction = (direction: "left" | "right") => {
    if (!activeCard) return;
    const newId = animIdCounter + 1;
    setAnimIdCounter(newId);

    if (direction === "right") {
      setXpAnim({ id: newId, text: "+5 XP" });
      setXp((x) => x + 5);
      if (activeCard.savings.startsWith("£")) {
        const val = parseFloat(activeCard.savings.replace("£", "").replace(",", ""));
        if (!isNaN(val)) setSaved((s) => s + val);
      }
    } else {
      setXpAnim({ id: newId, text: "Dismissed" });
    }

    setTimeout(() => setXpAnim(null), 1000);
    setCards((prev) => prev.slice(1));
  };

  const dateLabel = today
    .toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
    .toUpperCase();

  return (
    <div className="mx-auto max-w-lg pb-32 min-h-screen bg-background text-on-background font-body relative overflow-hidden">
      {/* Floating XP Animation */}
      {xpAnim && (
        <div
          key={xpAnim.id}
          className="absolute inset-0 pointer-events-none flex items-center justify-center z-50"
        >
          <div className="text-3xl font-bold text-secondary font-headline animate-pulse">
            {xpAnim.text}
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="relative mx-4 overflow-hidden rounded-3xl">
        <div className="relative aspect-[4/3] w-full bg-gradient-to-br from-surface-container-high via-surface-container to-surface">
          {/* Decorative gradient orb */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-secondary/10 blur-3xl" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />

          {/* Top bar: day indicators + bell */}
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-5 pt-5">
            <div className="flex gap-3">
              {DAYS.map((d, i) => (
                <span
                  key={i}
                  className={`text-xs font-bold ${
                    i === currentDayIndex ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {d}
                </span>
              ))}
            </div>
            <button className="text-muted">
              <span className="material-symbols-outlined text-xl">notifications</span>
            </button>
          </div>

          {/* Bottom of hero */}
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <div className="text-xs font-semibold uppercase tracking-widest text-muted mb-2">
              Daily Finance &middot; {dateLabel}
            </div>
            <h1 className="font-headline text-3xl font-extrabold text-primary leading-tight mb-1">
              MORNING BUDGET REVIEW
            </h1>
            <p className="text-sm text-muted">
              Your AI council &middot; 5 min
            </p>
          </div>
        </div>

        {/* Play button overlay */}
        <Link
          href="/check"
          className="absolute bottom-5 right-5 w-14 h-14 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-lg shadow-primary/30"
        >
          <span className="material-symbols-outlined text-2xl">play_arrow</span>
        </Link>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-3 px-5 mt-6">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeCategory === cat
                ? "bg-primary text-on-primary"
                : "text-muted hover:text-on-surface"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Stats Bar */}
      <div className="flex items-center gap-4 px-5 mt-5 text-sm text-muted">
        <div className="flex items-center gap-1 text-on-surface">
          <span className="material-symbols-outlined text-secondary text-base">
            local_fire_department
          </span>
          {streak}-day streak
        </div>
        <span>&middot;</span>
        <div>£{saved.toLocaleString()} saved</div>
        <span>&middot;</span>
        <div>{xp} XP</div>
      </div>

      <Divider className="mt-6" />

      {/* Quote Block */}
      <QuoteBlock
        quote="The goal isn't more money. The goal is living life on your terms."
        attribution="Chris Brogan"
      />

      <Divider />

      {/* Card Deck */}
      <section className="px-5 mt-6">
        <div className="relative h-[340px] w-full">
          {cards.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-4 border border-outline-variant rounded-3xl glass-card">
              <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center">
                <span className="material-symbols-outlined text-muted text-3xl">
                  done_all
                </span>
              </div>
              <h3 className="text-xl font-headline font-bold text-on-surface">
                All caught up!
              </h3>
              <p className="text-muted text-sm px-6">
                You&apos;ve completed your daily moves. Check back tomorrow.
              </p>
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
                    transform: `translateY(${i * 12}px) scale(${1 - i * 0.04})`,
                    opacity: 1 - i * 0.2,
                  }}
                >
                  <div
                    className={`h-full border rounded-3xl p-7 flex flex-col justify-between glass-card ${card.accentClass}`}
                  >
                    <div className="space-y-3">
                      <span className="material-symbols-outlined text-3xl">
                        {card.icon}
                      </span>
                      <h3 className="text-2xl font-headline font-bold text-on-surface leading-tight">
                        {card.title}
                      </h3>
                      <p className="text-base text-muted font-medium">
                        {card.body}
                      </p>
                    </div>

                    {isTop && (
                      <div className="flex gap-3 mt-6">
                        <button
                          onClick={() => handleAction("left")}
                          className="flex-1 py-3.5 rounded-full border border-outline hover:bg-white/5 transition-colors font-bold text-on-surface flex items-center justify-center gap-2"
                        >
                          <span className="material-symbols-outlined text-lg">
                            close
                          </span>
                          Dismiss
                        </button>
                        <button
                          onClick={() => handleAction("right")}
                          className="flex-1 py-3.5 rounded-full bg-primary text-on-primary font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-[0_0_20px_rgba(230,221,197,0.2)]"
                        >
                          <span className="material-symbols-outlined text-lg">
                            check
                          </span>
                          Accept
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      <Divider className="mt-8" />

      {/* YOUR PRACTICE */}
      <SectionHeader title="YOUR PRACTICE" seeAllHref="/progress" />
      <CardCarousel>
        {PRACTICE_CARDS.map((card) => (
          <div
            key={card.label}
            className="min-w-[140px] rounded-2xl border border-outline-variant bg-surface-container p-4 flex flex-col gap-3"
          >
            <span className="material-symbols-outlined text-2xl text-primary">
              {card.icon}
            </span>
            <div>
              <div className="font-bold text-sm text-on-surface">{card.label}</div>
              <div className="text-xs text-muted">{card.count}</div>
            </div>
          </div>
        ))}
      </CardCarousel>

      <Divider className="mt-6" />

      {/* PROGRAMS */}
      <SectionHeader title="PROGRAMS" seeAllHref="/check" />
      <CardCarousel>
        {PROGRAM_CARDS.map((prog) => (
          <div
            key={prog.title}
            className={`min-w-[220px] rounded-2xl bg-gradient-to-br ${prog.color} border border-outline-variant p-5 flex flex-col justify-end aspect-[3/2]`}
          >
            <h4 className="font-headline font-bold text-base text-on-surface leading-tight">
              {prog.title}
            </h4>
            <p className="text-xs text-muted mt-1">{prog.subtitle}</p>
          </div>
        ))}
      </CardCarousel>

      {/* CTA */}
      <section className="px-5 mt-8">
        <Link href="/check" className="block">
          <div className="w-full glass-card p-5 rounded-3xl flex items-center justify-between group hover:border-secondary/50 transition-colors">
            <div className="space-y-1">
              <h4 className="font-headline font-bold text-lg text-on-surface group-hover:text-secondary transition-colors">
                About to spend something?
              </h4>
              <p className="text-muted text-sm">
                Check it first with your AI council
              </p>
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
