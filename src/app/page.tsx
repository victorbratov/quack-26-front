"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { SectionHeader } from "~/components/ui/SectionHeader";
import { Divider } from "~/components/ui/Divider";
import { SpotlightCard } from "~/components/ui/SpotlightCard";
import { AnimatedCounter } from "~/components/ui/AnimatedCounter";
import { ShimmerButton } from "~/components/ui/ShimmerButton";
import { cards as cardsAPI, gamification, replays, debrief } from "~/lib/api";
import type { Card, XPInfo, WeeklyReplay, Debrief } from "~/lib/api";

const DAYS = ["M", "T", "W", "T", "F", "S", "S"];
const SWIPE_THRESHOLD = 80;

function SwipeCard({
  card,
  isTop,
  stackIndex,
  onSwipe,
}: {
  card: Card;
  isTop: boolean;
  stackIndex: number;
  onSwipe: (direction: "left" | "right") => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const isHorizontal = useRef<boolean | null>(null);

  const handleStart = useCallback((clientX: number, clientY: number) => {
    if (!isTop) return;
    startX.current = clientX;
    startY.current = clientY;
    isHorizontal.current = null;
    setIsDragging(true);
  }, [isTop]);

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!isDragging || !isTop) return;

    const dx = clientX - startX.current;
    const dy = clientY - startY.current;

    // Lock direction on first significant movement
    if (isHorizontal.current === null && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
      isHorizontal.current = Math.abs(dx) > Math.abs(dy);
    }

    if (isHorizontal.current) {
      setDragX(dx);
    }
  }, [isDragging, isTop]);

  const handleEnd = useCallback(() => {
    if (!isDragging || !isTop) return;
    setIsDragging(false);

    if (Math.abs(dragX) > SWIPE_THRESHOLD) {
      const direction = dragX > 0 ? "right" : "left";
      setIsExiting(true);
      setDragX(direction === "right" ? 400 : -400);
      setTimeout(() => onSwipe(direction), 250);
    } else {
      setDragX(0);
    }
    isHorizontal.current = null;
  }, [isDragging, isTop, dragX, onSwipe]);

  useEffect(() => {
    if (!isTop) return;
    const el = cardRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) handleStart(t.clientX, t.clientY);
    };
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) {
        handleMove(t.clientX, t.clientY);
        if (isHorizontal.current) e.preventDefault();
      }
    };
    const onTouchEnd = () => handleEnd();

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd);

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [isTop, handleStart, handleMove, handleEnd]);

  const rotation = dragX * 0.06;
  const swipeDirection = dragX > 0 ? "right" : dragX < 0 ? "left" : null;
  const swipeProgress = Math.min(Math.abs(dragX) / SWIPE_THRESHOLD, 1);

  return (
    <div
      ref={cardRef}
      className="absolute inset-0 w-full"
      style={{
        zIndex: 10 - stackIndex,
        transform: isTop
          ? `translateX(${dragX}px) rotate(${rotation}deg) translateY(0) scale(1)`
          : `translateY(${stackIndex * 10}px) scale(${1 - stackIndex * 0.04})`,
        opacity: isTop ? (isExiting ? 0 : 1) : 1 - stackIndex * 0.25,
        transition: isDragging ? "none" : "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
      onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
      onMouseMove={(e) => { if (isDragging) handleMove(e.clientX, e.clientY); }}
      onMouseUp={handleEnd}
      onMouseLeave={() => { if (isDragging) handleEnd(); }}
    >
      {/* Swipe indicator overlays */}
      {isTop && swipeDirection && swipeProgress > 0.2 && (
        <div className={`absolute top-8 ${swipeDirection === "right" ? "left-8" : "right-8"} z-20 px-4 py-2 rounded-xl border-2 font-headline font-bold text-lg uppercase tracking-widest transition-opacity ${
          swipeDirection === "right"
            ? "border-primary text-primary"
            : "border-error text-error"
        }`} style={{ opacity: swipeProgress }}>
          {swipeDirection === "right" ? "Accept" : "Dismiss"}
        </div>
      )}

      <div className="h-full rounded-2xl border border-white/[0.1] bg-black p-8 md:p-10 flex flex-col" style={{ cursor: isTop ? "grab" : "default" }}>
        {/* Top: card type badge */}
        <div className="mb-auto">
          <div className="inline-block px-3 py-1.5 rounded-full bg-white/5 border border-outline-variant">
            <span className="text-[10px] font-bold uppercase tracking-widest text-secondary">{card.card_type.replace(/_/g, " ")}</span>
          </div>
        </div>

        {/* Center: main content */}
        <div className="flex-1 flex flex-col justify-center py-6 space-y-4">
          <h3 className="text-3xl md:text-4xl font-headline font-bold text-on-surface leading-tight">{card.title}</h3>
          <p className="text-lg md:text-xl text-muted leading-relaxed">{card.body}</p>
          {card.potential_savings != null && card.potential_savings > 0 && (
            <div className="pt-2">
              <span className="text-3xl md:text-4xl font-headline font-extrabold text-primary">
                £<AnimatedCounter value={card.potential_savings} decimals={2} />
              </span>
              <span className="text-sm text-muted ml-2">potential savings</span>
            </div>
          )}
        </div>

        {/* Bottom: action buttons */}
        {isTop && (
          <div className="flex gap-3 pt-4">
            <button onClick={() => onSwipe("left")} className="flex-1 py-3.5 md:py-4 rounded-full border border-outline hover:bg-white/5 transition-colors font-bold text-base text-on-surface flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-xl">close</span>Dismiss
            </button>
            <button onClick={() => onSwipe("right")} className="flex-1 py-3.5 md:py-4 rounded-full bg-primary text-on-primary font-bold text-base flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-[0_0_20px_rgba(230,221,197,0.2)]">
              <span className="material-symbols-outlined text-xl">check</span>Accept
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const [cardDeck, setCardDeck] = useState<Card[]>([]);
  const [xpInfo, setXpInfo] = useState<XPInfo | null>(null);
  const [weekReplay, setWeekReplay] = useState<WeeklyReplay | null>(null);
  const [latestDebrief, setLatestDebrief] = useState<Debrief | null>(null);
  const [loading, setLoading] = useState(true);
  const [xpAnim, setXpAnim] = useState<{ id: number; text: string } | null>(null);
  const [animId, setAnimId] = useState(0);
  const [showDebrief, setShowDebrief] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [dayCards, setDayCards] = useState<Card[]>([]);
  const [dayLoading, setDayLoading] = useState(false);
  const [historyCards, setHistoryCards] = useState<Card[] | null>(null);

  const today = new Date();
  const currentDayIndex = (today.getDay() + 6) % 7;

  // Get the date for a given day index in the current week (Mon=0)
  const getDateForDay = (dayIndex: number) => {
    const d = new Date(today);
    const diff = dayIndex - currentDayIndex;
    d.setDate(d.getDate() + diff);
    return d;
  };

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

  // Fetch history once when a non-today day is first clicked
  useEffect(() => {
    if (selectedDay === null || selectedDay === currentDayIndex) return;
    if (historyCards) {
      // Already have history, just filter
      const targetDate = getDateForDay(selectedDay).toISOString().slice(0, 10);
      setDayCards(historyCards.filter((c) => c.generated_date?.slice(0, 10) === targetDate || c.created_at?.slice(0, 10) === targetDate));
      return;
    }
    setDayLoading(true);
    cardsAPI.history(7).then((cards) => {
      setHistoryCards(cards);
      const targetDate = getDateForDay(selectedDay).toISOString().slice(0, 10);
      setDayCards(cards.filter((c) => c.generated_date?.slice(0, 10) === targetDate || c.created_at?.slice(0, 10) === targetDate));
      setDayLoading(false);
    }).catch(() => {
      setDayCards([]);
      setDayLoading(false);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDay]);

  const handleDayClick = (dayIndex: number) => {
    if (dayIndex > currentDayIndex) return; // future days not clickable
    if (dayIndex === currentDayIndex && selectedDay === dayIndex) {
      setSelectedDay(null); // toggle back to live view
      return;
    }
    if (dayIndex === currentDayIndex) {
      setSelectedDay(null);
      return;
    }
    setSelectedDay(dayIndex);
  };

  const activeCard = cardDeck[0];
  const isViewingPastDay = selectedDay !== null && selectedDay !== currentDayIndex;

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
    <div className="app-container pb-32 min-h-screen bg-background text-on-background font-body relative overflow-hidden">
      {/* XP Animation */}
      {xpAnim && (
        <div key={xpAnim.id} className="absolute inset-0 pointer-events-none flex items-center justify-center z-50">
          <div className="text-3xl font-bold text-secondary font-headline animate-pulse">{xpAnim.text}</div>
        </div>
      )}

      {/* Header */}
      <div className="px-5 md:px-8 pt-10 pb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1">
            {DAYS.map((d, i) => {
              const isPast = i <= currentDayIndex;
              const isSelected = selectedDay === i;
              const isCurrent = i === currentDayIndex && selectedDay === null;
              return (
                <button
                  key={i}
                  onClick={() => handleDayClick(i)}
                  disabled={i > currentDayIndex}
                  className={`w-8 h-8 rounded-full text-[10px] md:text-xs font-bold transition-all ${
                    isSelected
                      ? "bg-primary text-on-primary scale-110"
                      : isCurrent
                        ? "text-primary bg-primary/10"
                        : isPast
                          ? "text-muted-foreground hover:bg-white/5 hover:text-on-surface cursor-pointer"
                          : "text-muted-foreground/40 cursor-default"
                  }`}
                >
                  {d}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-3 text-xs text-muted">
              <span className="flex items-center gap-1 text-on-surface">
                <span className="material-symbols-outlined text-secondary text-sm">local_fire_department</span>
                {xpInfo?.level ?? 0}
              </span>
              <span>
                <AnimatedCounter value={xpInfo?.total_xp ?? 0} className="text-muted" /> XP
              </span>
            </div>
            {latestDebrief && (
              <button
                onClick={() => setShowDebrief(true)}
                className="relative w-9 h-9 rounded-full border border-outline-variant flex items-center justify-center text-muted hover:text-primary hover:border-primary/50 transition-colors"
                title="Weekly Debrief"
              >
                <span className="material-symbols-outlined text-lg">summarize</span>
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-secondary rounded-full" />
              </button>
            )}
          </div>
        </div>
        <h1 className="font-headline text-3xl md:text-4xl font-extrabold text-primary leading-tight">
          {isViewingPastDay
            ? `${["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"][selectedDay]}'S MOVES`
            : "YOUR DAILY MOVES"}
        </h1>
      </div>

      {/* Card Deck / Past Day Summary */}
      <section className="px-4 md:px-8">
        {isViewingPastDay ? (
          /* Past day summary view */
          <div className="space-y-4">
            {dayLoading ? (
              <div className="flex items-center justify-center py-20">
                <span className="material-symbols-outlined text-4xl text-muted animate-spin">progress_activity</span>
              </div>
            ) : dayCards.length === 0 ? (
              <SpotlightCard className="p-8 flex flex-col items-center justify-center text-center">
                <div className="w-14 h-14 rounded-full bg-surface-container-high flex items-center justify-center">
                  <span className="material-symbols-outlined text-muted text-2xl">event_busy</span>
                </div>
                <h3 className="text-lg font-headline font-bold text-on-surface mt-4">No moves this day</h3>
                <p className="text-muted text-sm mt-1">No cards were generated for {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"][selectedDay]}.</p>
              </SpotlightCard>
            ) : (
              <>
                {/* Day summary stats */}
                <div className="grid grid-cols-3 gap-3">
                  <SpotlightCard className="p-3 text-center">
                    <div className="text-xl font-headline font-bold text-on-surface">{dayCards.length}</div>
                    <div className="text-[10px] uppercase text-muted font-bold tracking-wider mt-0.5">Total</div>
                  </SpotlightCard>
                  <SpotlightCard className="p-3 text-center">
                    <div className="text-xl font-headline font-bold text-primary">{dayCards.filter((c) => c.status === "swiped_right" || c.swiped_at).length}</div>
                    <div className="text-[10px] uppercase text-muted font-bold tracking-wider mt-0.5">Accepted</div>
                  </SpotlightCard>
                  <SpotlightCard className="p-3 text-center">
                    <div className="text-xl font-headline font-bold text-secondary">
                      {dayCards.filter((c) => c.potential_savings).reduce((sum, c) => sum + (c.potential_savings ?? 0), 0) > 0
                        ? `£${dayCards.filter((c) => c.potential_savings).reduce((sum, c) => sum + (c.potential_savings ?? 0), 0).toFixed(0)}`
                        : "—"}
                    </div>
                    <div className="text-[10px] uppercase text-muted font-bold tracking-wider mt-0.5">Savings</div>
                  </SpotlightCard>
                </div>

                {/* Card list */}
                {dayCards.map((card) => (
                  <SpotlightCard key={card.id} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="inline-block px-2 py-0.5 rounded-full bg-white/5 border border-outline-variant mb-2">
                          <span className="text-[9px] font-bold uppercase tracking-widest text-secondary">{card.card_type.replace(/_/g, " ")}</span>
                        </div>
                        <h4 className="font-bold text-sm text-on-surface leading-tight">{card.title}</h4>
                        <p className="text-xs text-muted mt-1 line-clamp-2">{card.body}</p>
                      </div>
                      <div className="shrink-0">
                        {card.status === "swiped_right" || card.swiped_at ? (
                          <span className="material-symbols-outlined text-primary text-lg">check_circle</span>
                        ) : card.status === "swiped_left" ? (
                          <span className="material-symbols-outlined text-muted text-lg">cancel</span>
                        ) : (
                          <span className="material-symbols-outlined text-muted-foreground text-lg">radio_button_unchecked</span>
                        )}
                      </div>
                    </div>
                    {card.potential_savings != null && card.potential_savings > 0 && (
                      <div className="mt-2 text-xs font-bold text-primary">£{card.potential_savings.toFixed(2)} potential savings</div>
                    )}
                  </SpotlightCard>
                ))}
              </>
            )}
            <button
              onClick={() => setSelectedDay(null)}
              className="w-full py-3 rounded-full border border-outline text-sm font-bold text-on-surface hover:bg-white/5 transition-colors"
            >
              Back to today
            </button>
          </div>
        ) : (
          /* Today's live card deck */
          <div className="relative h-[65vh] md:h-[55vh] lg:h-[50vh] min-h-[400px] max-h-[600px] w-full">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="material-symbols-outlined text-4xl text-muted animate-spin">progress_activity</span>
              </div>
            ) : cardDeck.length === 0 ? (
              <SpotlightCard className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center">
                  <span className="material-symbols-outlined text-muted text-3xl">done_all</span>
                </div>
                <h3 className="text-xl font-headline font-bold text-on-surface mt-4">All caught up!</h3>
                <p className="text-muted text-sm px-6 mt-2">You&apos;ve completed your daily moves. Check back tomorrow.</p>
              </SpotlightCard>
            ) : (
              cardDeck.slice(0, 3).map((card, i) => (
                <SwipeCard
                  key={card.id}
                  card={card}
                  isTop={i === 0}
                  stackIndex={i}
                  onSwipe={handleSwipe}
                />
              ))
            )}
          </div>
        )}
      </section>

      {/* Weekly Replay */}
      {weekReplay && (
        <>
          <Divider className="mt-6" />
          <SectionHeader title="THIS WEEK" />
          <div className="grid grid-cols-3 gap-3 px-5 md:px-8">
            {[
              { value: weekReplay.cards_swiped_right, label: "Accepted", color: "text-primary" },
              { value: weekReplay.cards_swiped_left, label: "Dismissed", color: "text-secondary" },
              { value: weekReplay.actual_savings ?? weekReplay.actual ?? 0, label: "Saved", color: "text-secondary", prefix: "£" },
            ].map((stat) => (
              <SpotlightCard key={stat.label} className="p-3 md:p-4 text-center">
                <div className={`text-xl md:text-2xl font-headline font-bold ${stat.color}`}>
                  <AnimatedCounter value={stat.value} prefix={stat.prefix} />
                </div>
                <div className="text-[10px] md:text-xs uppercase text-muted font-bold tracking-wider mt-1">{stat.label}</div>
              </SpotlightCard>
            ))}
          </div>
        </>
      )}

      <Divider className="mt-6" />

      {/* CTA */}
      <section className="px-5 md:px-8 mt-6">
        <Link href="/check" className="block">
          <ShimmerButton className="w-full p-6 flex flex-col items-center justify-center text-center gap-3">
            <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined">arrow_forward</span>
            </div>
            <div className="space-y-1">
              <h4 className="font-headline font-bold text-base md:text-lg text-on-surface">About to spend something?</h4>
              <p className="text-muted text-sm">Check it first with your AI council</p>
            </div>
          </ShimmerButton>
        </Link>
      </section>

      {/* Debrief Modal */}
      {showDebrief && latestDebrief && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowDebrief(false)} />

          {/* Sheet */}
          <div className="relative w-full max-w-lg max-h-[85vh] bg-black border-t border-x border-white/[0.1] rounded-t-3xl overflow-y-auto animate-slide-up">
            {/* Handle */}
            <div className="sticky top-0 z-10 bg-black pt-3 pb-2 flex justify-center">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>

            <div className="px-6 pb-8 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-headline font-bold text-2xl text-on-surface">Weekly Debrief</h2>
                  <p className="text-xs text-muted mt-0.5">
                    {latestDebrief.week_start} — {latestDebrief.week_end}
                  </p>
                </div>
                <button
                  onClick={() => setShowDebrief(false)}
                  className="w-9 h-9 rounded-full border border-outline-variant flex items-center justify-center text-muted hover:text-on-surface transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>

              {/* Analyst */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-blue-400 text-lg">analytics</span>
                  </div>
                  <div className="text-[11px] font-bold uppercase tracking-widest text-blue-400">The Numbers</div>
                </div>
                <p className="text-sm text-on-surface/90 leading-relaxed">{latestDebrief.analyst_summary.insight}</p>
                {latestDebrief.analyst_summary.top_categories.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {latestDebrief.analyst_summary.top_categories.map((cat) => (
                      <span key={cat} className="text-[10px] font-bold uppercase tracking-widest text-muted bg-white/[0.04] px-2.5 py-1 rounded-full">
                        {cat.replace(/_/g, " ")}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="h-px bg-white/[0.06]" />

              {/* Behaviorist */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-purple-500/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-purple-400 text-lg">psychology</span>
                  </div>
                  <div className="text-[11px] font-bold uppercase tracking-widest text-purple-400">Behavioral Patterns</div>
                </div>
                <p className="text-sm text-on-surface/90 leading-relaxed">{latestDebrief.behaviorist_insights.suggestion}</p>
                {latestDebrief.behaviorist_insights.patterns.length > 0 && (
                  <div className="space-y-1.5">
                    {latestDebrief.behaviorist_insights.patterns.map((p, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-muted">
                        <span className="material-symbols-outlined text-xs mt-0.5 text-purple-400/60">arrow_right</span>
                        <span className="capitalize">{p.replace(/_/g, " ")}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="h-px bg-white/[0.06]" />

              {/* Mentor */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-lg">target</span>
                  </div>
                  <div className="text-[11px] font-bold uppercase tracking-widest text-primary">Next Week&apos;s Plan</div>
                </div>
                <p className="text-sm text-on-surface/90 leading-relaxed">{latestDebrief.mentor_goals.encouragement}</p>
                {latestDebrief.mentor_goals.next_week_plan && (
                  <p className="text-sm text-muted leading-relaxed">{latestDebrief.mentor_goals.next_week_plan}</p>
                )}
                <div className="flex items-center gap-4 pt-1">
                  <div className="flex-1 text-center p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                    <div className="text-lg font-headline font-bold text-secondary">£{latestDebrief.mentor_goals.achieved}</div>
                    <div className="text-[10px] uppercase tracking-widest text-muted font-bold mt-0.5">Saved</div>
                  </div>
                  <div className="flex-1 text-center p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                    <div className="text-lg font-headline font-bold text-primary">£{latestDebrief.mentor_goals.weekly_target}</div>
                    <div className="text-[10px] uppercase tracking-widest text-muted font-bold mt-0.5">Target</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
