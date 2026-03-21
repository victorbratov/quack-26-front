"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { SectionHeader } from "~/components/ui/SectionHeader";
import { Divider } from "~/components/ui/Divider";
import { CardCarousel } from "~/components/ui/CardCarousel";
import { cards as cardsAPI, gamification, replays, debrief } from "~/lib/api";
import type { Card, XPInfo, WeeklyReplay, Debrief } from "~/lib/api";

const DAYS = ["M", "T", "W", "T", "F", "S", "S"];
const CATEGORIES = ["Save", "Spend", "Invest", "Plan"];

const PRACTICE_CARDS = [
  { icon: "library_books", label: "Library", count: "Saved items", href: "/check" },
  { icon: "schedule", label: "Recents", count: "Recent checks", href: "/check" },
  { icon: "monitoring", label: "Life Score", count: "View stats", href: "/progress" },
];

export default function Home() {
  const [cardDeck, setCardDeck] = useState<Card[]>([]);
  const [xpInfo, setXpInfo] = useState<XPInfo | null>(null);
  const [weekReplay, setWeekReplay] = useState<WeeklyReplay | null>(null);
  const [latestDebrief, setLatestDebrief] = useState<Debrief | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("Save");
  const [xpAnim, setXpAnim] = useState<{ id: number; text: string } | null>(null);
  const [animId, setAnimId] = useState(0);

  const today = new Date();
  const currentDayIndex = (today.getDay() + 6) % 7;

  useEffect(() => {
    Promise.allSettled([
      cardsAPI.today(),
      gamification.xp(),
      replays.latest(),
      debrief.latest(),
    ]).then(([cardsRes, xpRes, replayRes, debriefRes]) => {
      if (cardsRes.status === "fulfilled") setCardDeck(cardsRes.value.cards);
      if (xpRes.status === "fulfilled") setXpInfo(xpRes.value);
      if (replayRes.status === "fulfilled") setWeekReplay(replayRes.value);
      if (debriefRes.status === "fulfilled") setLatestDebrief(debriefRes.value);
      setLoading(false);
    });
  }, []);

  const activeCard = cardDeck[0];

  const handleSwipe = async (direction: "left" | "right") => {
    if (!activeCard) return;
    const newId = animId + 1;
    setAnimId(newId);

    try {
      await cardsAPI.swipe(activeCard.id, direction);
      if (direction === "right") {
        setXpAnim({ id: newId, text: "+5 XP" });
        if (xpInfo) setXpInfo({ ...xpInfo, total_xp: xpInfo.total_xp + 5 });
      } else {
        setXpAnim({ id: newId, text: "Dismissed" });
      }
    } catch {
      setXpAnim({ id: newId, text: direction === "right" ? "+5 XP" : "Dismissed" });
    }

    setTimeout(() => setXpAnim(null), 1000);
    setCardDeck((prev) => prev.slice(1));
  };

  return (
    <div className="mx-auto max-w-lg pb-32 min-h-screen bg-background text-on-background font-body relative overflow-hidden">
      {/* XP Animation */}
      {xpAnim && (
        <div key={xpAnim.id} className="absolute inset-0 pointer-events-none flex items-center justify-center z-50">
          <div className="text-3xl font-bold text-secondary font-headline animate-pulse">{xpAnim.text}</div>
        </div>
      )}

      {/* Compact Header */}
      <div className="flex items-center justify-between px-5 pt-2 pb-1">
        <div>
          <div className="flex items-center gap-3 mb-1">
            {DAYS.map((d, i) => (
              <span key={i} className={`text-[10px] font-bold ${i === currentDayIndex ? "text-primary" : "text-muted-foreground"}`}>{d}</span>
            ))}
          </div>
          <h1 className="font-headline text-xl font-extrabold text-primary leading-tight">YOUR DAILY MOVES</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 text-xs text-muted">
            <span className="flex items-center gap-1 text-on-surface">
              <span className="material-symbols-outlined text-secondary text-sm">local_fire_department</span>
              {xpInfo?.level ?? 0}
            </span>
            <span>{xpInfo?.total_xp ?? 0} XP</span>
          </div>
          <button className="text-muted">
            <span className="material-symbols-outlined text-lg">notifications</span>
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 px-5 mt-2 mb-3">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
              activeCategory === cat ? "bg-primary text-on-primary" : "text-muted hover:text-on-surface"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Card Deck */}
      <section className="px-4">
        <div className="relative h-[70vh] min-h-[500px] w-full">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="material-symbols-outlined text-4xl text-muted animate-spin">progress_activity</span>
            </div>
          ) : cardDeck.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-4 border border-outline-variant rounded-3xl glass-card">
              <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center">
                <span className="material-symbols-outlined text-muted text-3xl">done_all</span>
              </div>
              <h3 className="text-xl font-headline font-bold text-on-surface">All caught up!</h3>
              <p className="text-muted text-sm px-6">You&apos;ve completed your daily moves. Check back tomorrow.</p>
            </div>
          ) : (
            cardDeck.slice(0, 3).map((card, i) => {
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
                  <div className="h-full border border-outline-variant rounded-3xl p-8 flex flex-col justify-between bg-surface">
                    <div className="space-y-5 mt-4">
                      <div className="inline-block px-3 py-1 rounded-full bg-white/5 border border-outline-variant">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-secondary">{card.card_type.replace(/_/g, " ")}</span>
                      </div>
                      <h3 className="text-3xl font-headline font-bold text-on-surface leading-tight">{card.title}</h3>
                      <p className="text-lg text-muted font-medium leading-relaxed">{card.body}</p>
                      {card.potential_savings && (
                        <div className="inline-block mt-2 px-4 py-2 rounded-full bg-white/5 border border-outline-variant">
                          <span className="text-xl font-headline font-bold text-primary">£{card.potential_savings.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                    {isTop && (
                      <div className="flex gap-3 mt-auto pt-6">
                        <button onClick={() => handleSwipe("left")} className="flex-1 py-4 rounded-full border border-outline hover:bg-white/5 transition-colors font-bold text-lg text-on-surface flex items-center justify-center gap-2">
                          <span className="material-symbols-outlined text-xl">close</span>Dismiss
                        </button>
                        <button onClick={() => handleSwipe("right")} className="flex-1 py-4 rounded-full bg-primary text-on-primary font-bold text-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-[0_0_20px_rgba(230,221,197,0.2)]">
                          <span className="material-symbols-outlined text-xl">check</span>Accept
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

      {/* Weekly Replay */}
      {weekReplay && (
        <>
          <Divider className="mt-6" />
          <SectionHeader title="THIS WEEK" />
          <div className="grid grid-cols-3 gap-3 px-5">
            <div className="glass-card p-3 rounded-2xl text-center">
              <div className="text-xl font-headline font-bold text-primary">{weekReplay.cards_swiped_right}</div>
              <div className="text-[10px] uppercase text-muted font-bold tracking-wider mt-1">Accepted</div>
            </div>
            <div className="glass-card p-3 rounded-2xl text-center">
              <div className="text-xl font-headline font-bold text-secondary">{weekReplay.cards_swiped_left}</div>
              <div className="text-[10px] uppercase text-muted font-bold tracking-wider mt-1">Dismissed</div>
            </div>
            <div className="glass-card p-3 rounded-2xl text-center">
              <div className="text-xl font-headline font-bold text-emerald-400">£{weekReplay.actual_savings ?? weekReplay.actual ?? 0}</div>
              <div className="text-[10px] uppercase text-muted font-bold tracking-wider mt-1">Saved</div>
            </div>
          </div>
        </>
      )}

      {/* Debrief Summary */}
      {latestDebrief && (
        <>
          <Divider className="mt-6" />
          <SectionHeader title="WEEKLY DEBRIEF" />
          <div className="px-5">
            <div className="glass-card rounded-2xl p-5">
              <p className="text-sm text-on-surface leading-relaxed">{latestDebrief.mentor_goals.encouragement}</p>
              <p className="text-xs text-muted mt-3">{latestDebrief.analyst_summary.insight}</p>
            </div>
          </div>
        </>
      )}

      <Divider className="mt-6" />

      {/* YOUR PRACTICE */}
      <SectionHeader title="YOUR PRACTICE" seeAllHref="/progress" />
      <CardCarousel>
        {PRACTICE_CARDS.map((card) => (
          <Link key={card.label} href={card.href} className="min-w-[140px] rounded-2xl border border-outline-variant bg-surface-container p-4 flex flex-col gap-3">
            <span className="material-symbols-outlined text-2xl text-primary">{card.icon}</span>
            <div>
              <div className="font-bold text-sm text-on-surface">{card.label}</div>
              <div className="text-xs text-muted">{card.count}</div>
            </div>
          </Link>
        ))}
      </CardCarousel>

      {/* CTA */}
      <section className="px-5 mt-6">
        <Link href="/check" className="block">
          <div className="w-full glass-card p-5 rounded-3xl flex items-center justify-between group hover:border-secondary/50 transition-colors">
            <div className="space-y-1">
              <h4 className="font-headline font-bold text-lg text-on-surface group-hover:text-secondary transition-colors">About to spend something?</h4>
              <p className="text-muted text-sm">Check it first with your AI council</p>
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
