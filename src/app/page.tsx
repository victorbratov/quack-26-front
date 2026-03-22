"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { SectionHeader } from "~/components/ui/SectionHeader";
import { Divider } from "~/components/ui/Divider";
import { SpotlightCard } from "~/components/ui/SpotlightCard";
import { AnimatedCounter } from "~/components/ui/AnimatedCounter";
import { ShimmerButton } from "~/components/ui/ShimmerButton";
import ReactMarkdown from "react-markdown";
import { useNotificationIsland } from "~/components/ui/NotificationIsland";
import { cards as cardsAPI, gamification, debrief as debriefAPI, learning } from "~/lib/api";
import type { Card, XPInfo, Debrief, LearningModule, LearningModuleDetail } from "~/lib/api";

const DAYS = ["M", "T", "W", "T", "F", "S", "S"];

function extractDebriefText(data: Record<string, unknown> | null | undefined): string {
  if (!data) return "";
  const candidates = [
    data.summary, data.insight, data.suggestion, data.encouragement,
    data.nudge_recommendation, data.behavioral_prediction, data.reasoning,
    data.next_week_plan, data.analysis,
  ];
  for (const c of candidates) {
    if (typeof c === "string" && c.length > 10) return c;
  }
  const allStrings = Object.values(data).filter((v): v is string => typeof v === "string" && v.length > 20);
  if (allStrings.length > 0) return allStrings[0]!;
  return JSON.stringify(data).slice(0, 300);
}
const SWIPE_THRESHOLD = 80;

function getCtaLabel(card: Card): string {
  const detail = card.detail_json ?? {};
  const payload = card.action_payload ?? {};
  switch (card.action_type) {
    case "move_savings": {
      const amt = payload.amount as number | undefined;
      return amt ? `Save £${amt}` : "Save now";
    }
    case "cancel_sub": {
      const merchant = (payload.merchant ?? detail.merchant) as string | undefined;
      return merchant ? `Cancel ${merchant}` : "Cancel sub";
    }
    case "join_challenge":
      return "Join challenge";
    case "learn":
      return "Start lesson";
    default:
      return "Got it";
  }
}

function getImpactLine(card: Card): string | null {
  const d = card.detail_json ?? {};
  if (typeof d.annual_savings === "number" && d.annual_savings > 0)
    return `That's £${Math.round(d.annual_savings)} saved per year`;
  if (typeof d.projected_10yr === "number" && d.projected_10yr > 0)
    return `Worth £${Math.round(d.projected_10yr).toLocaleString()} over 10 years`;
  if (typeof d.annual_cost === "number" && d.annual_cost > 0)
    return `You spend £${Math.round(d.annual_cost).toLocaleString()} a year on this`;
  if (typeof d.annual_hike === "number" && d.annual_hike > 0)
    return `Price went up £${d.annual_hike.toFixed(2)}/year`;
  if (typeof d.pct_above === "number" && d.pct_above > 0)
    return `${Math.round(d.pct_above)}% above your peer average`;
  return null;
}

function SwipeCard({
  card,
  isTop,
  stackIndex,
  onSwipe,
  onQuizAnswer,
}: {
  card: Card;
  isTop: boolean;
  stackIndex: number;
  onSwipe: (direction: "left" | "right") => void;
  onQuizAnswer?: (cardId: string, data: { selected_index?: number; choice?: string }) => Promise<{ correct: boolean; explanation: string; xp_awarded: number } | null>;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const isHorizontal = useRef<boolean | null>(null);

  // Quiz/scenario state
  const isQuiz = card.card_type === "market_quiz";
  const isScenario = card.card_type === "historical_scenario";
  const isInteractive = isQuiz || isScenario;
  const [flipped, setFlipped] = useState(false);
  const [quizResult, setQuizResult] = useState<{ correct: boolean; explanation: string; xp_awarded: number } | null>(null);
  const [answering, setAnswering] = useState(false);
  const [showResult, setShowResult] = useState(true);

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
          {swipeDirection === "right" ? getCtaLabel(card) : "Dismiss"}
        </div>
      )}

      <div
        className="h-full rounded-2xl border border-white/[0.1] bg-black p-8 md:p-10 flex flex-col"
        style={{ cursor: isTop && isQuiz ? "pointer" : isTop ? "grab" : "default" }}
        onClick={() => {
          if (!isTop || !isQuiz || isDragging || Math.abs(dragX) > 8) return;
          if (!quizResult) {
            setFlipped(!flipped);
          } else {
            setShowResult(!showResult);
          }
        }}
      >
        {/* Top: card type badge */}
        <div className="mb-auto">
          <div className={`inline-block px-3 py-1.5 rounded-full border ${
            isQuiz ? "bg-emerald-400/10 border-emerald-400/30" :
            isScenario ? "bg-amber-400/10 border-amber-400/30" :
            "bg-white/5 border-outline-variant"
          }`}>
            <span className={`text-[10px] font-bold uppercase tracking-widest ${
              isQuiz ? "text-emerald-400" : isScenario ? "text-amber-400" : "text-secondary"
            }`}>{card.card_type.replace(/_/g, " ")}</span>
          </div>
        </div>

        {/* Center: main content */}
        <div className="flex-1 flex flex-col justify-center py-6 space-y-4 overflow-y-auto">
          {/* QUIZ CARD — front (headline) or back (question + options) */}
          {isQuiz && !flipped && !quizResult && (
            <>
              <h3 className="text-2xl md:text-3xl font-headline font-bold text-on-surface leading-tight">{card.detail_json?.fact_headline as string ?? card.title}</h3>
              {card.detail_json?.context && (
                <p className="text-sm text-on-surface/70 leading-relaxed">{card.detail_json.context as string}</p>
              )}
              <p className="text-sm text-emerald-400/80 mt-1">Tap to test yourself</p>
            </>
          )}
          {isQuiz && flipped && !quizResult && (
            <>
              <p className="text-xs text-muted">Tap to go back to the context</p>
              <h3 className="text-xl md:text-2xl font-headline font-bold text-on-surface leading-tight">{card.detail_json?.question as string ?? card.body}</h3>
              <div className="space-y-2 pt-2">
                {((card.detail_json?.options as string[]) ?? []).map((option, i) => (
                  <button
                    key={i}
                    disabled={answering}
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (answering || !onQuizAnswer) return;
                      setAnswering(true);
                      const result = await onQuizAnswer(card.id, { selected_index: i });
                      if (result) setQuizResult(result);
                      setAnswering(false);
                    }}
                    className="w-full py-3 px-4 rounded-xl border border-outline-variant bg-white/[0.03] text-left text-sm text-on-surface hover:border-primary hover:bg-primary/10 transition-colors disabled:opacity-50"
                  >
                    <span className="font-bold text-muted mr-2">{String.fromCharCode(65 + i)}.</span>
                    {option}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* SCENARIO CARD — event + hold/sell buttons */}
          {isScenario && !quizResult && (
            <>
              <div className="text-xs font-bold uppercase tracking-widest text-amber-400">{card.detail_json?.event_date as string}</div>
              <h3 className="text-2xl md:text-3xl font-headline font-bold text-on-surface leading-tight">{card.detail_json?.event_title as string ?? card.title}</h3>
              <p className="text-base text-muted leading-relaxed">{card.detail_json?.event_description as string ?? card.body}</p>
              {isTop && (
                <div className="flex gap-3 pt-2">
                  <button
                    disabled={answering}
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (answering || !onQuizAnswer) return;
                      setAnswering(true);
                      const result = await onQuizAnswer(card.id, { choice: "held" });
                      if (result) setQuizResult(result);
                      setAnswering(false);
                    }}
                    className="flex-1 py-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-bold text-sm hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
                  >
                    I&apos;d hold
                  </button>
                  <button
                    disabled={answering}
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (answering || !onQuizAnswer) return;
                      setAnswering(true);
                      const result = await onQuizAnswer(card.id, { choice: "sold" });
                      if (result) setQuizResult(result);
                      setAnswering(false);
                    }}
                    className="flex-1 py-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 font-bold text-sm hover:bg-red-500/20 transition-colors disabled:opacity-50"
                  >
                    I&apos;d sell
                  </button>
                </div>
              )}
            </>
          )}

          {/* Quiz result — tappable to flip back to question */}
          {isQuiz && quizResult && showResult && (
            <>
              <div className="flex items-center gap-2">
                <span className={`material-symbols-outlined text-2xl ${quizResult.correct ? "text-emerald-400" : "text-amber-400"}`}>
                  {quizResult.correct ? "check_circle" : "info"}
                </span>
                <span className={`font-headline font-bold text-xl ${quizResult.correct ? "text-emerald-400" : "text-amber-400"}`}>
                  {quizResult.correct ? "Correct!" : "Not quite!"}
                </span>
              </div>
              <p className="text-sm text-on-surface/80 leading-relaxed whitespace-pre-wrap">{quizResult.explanation}</p>
              <div className="text-xs font-bold text-primary">+{quizResult.xp_awarded} XP</div>
              <p className="text-xs text-muted mt-1">Tap to see the question again</p>
            </>
          )}
          {isQuiz && quizResult && !showResult && (
            <>
              <h3 className="text-xl md:text-2xl font-headline font-bold text-on-surface leading-tight">{card.detail_json?.question as string ?? card.body}</h3>
              <div className="space-y-2 pt-2">
                {((card.detail_json?.options as string[]) ?? []).map((option, i) => {
                  const correctIdx = card.detail_json?.correct_index as number ?? 0;
                  return (
                    <div
                      key={i}
                      className={`w-full py-3 px-4 rounded-xl border text-left text-sm ${
                        i === correctIdx
                          ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400"
                          : "border-outline-variant bg-white/[0.03] text-muted"
                      }`}
                    >
                      <span className="font-bold mr-2">{String.fromCharCode(65 + i)}.</span>
                      {option}
                      {i === correctIdx && <span className="material-symbols-outlined text-sm ml-2 align-middle">check</span>}
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-muted mt-1">Tap to see the explanation</p>
            </>
          )}

          {/* Scenario result */}
          {isScenario && quizResult && (
            <>
              <div className="flex items-center gap-2">
                <span className={`material-symbols-outlined text-2xl ${quizResult.correct ? "text-emerald-400" : "text-amber-400"}`}>
                  {quizResult.correct ? "check_circle" : "info"}
                </span>
                <span className={`font-headline font-bold text-xl ${quizResult.correct ? "text-emerald-400" : "text-amber-400"}`}>
                  Here&apos;s what happened:
                </span>
              </div>
              <p className="text-sm text-on-surface/80 leading-relaxed whitespace-pre-wrap">{quizResult.explanation}</p>
              <div className="text-xs font-bold text-primary">+{quizResult.xp_awarded} XP</div>
            </>
          )}

          {/* STANDARD CARD — original rendering */}
          {!isInteractive && (
            <>
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
              {(() => {
                const impact = getImpactLine(card);
                return impact ? (
                  <p className="text-sm text-secondary/80 italic">{impact}</p>
                ) : null;
              })()}
            </>
          )}
        </div>

        {/* Bottom: action buttons */}
        {isTop && !isInteractive && (
          <div className="flex gap-3 pt-4">
            <button onClick={() => onSwipe("left")} className="flex-1 py-3.5 md:py-4 rounded-full border border-outline hover:bg-white/5 transition-colors font-bold text-base text-on-surface flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-xl">close</span>Dismiss
            </button>
            <button onClick={() => onSwipe("right")} className="flex-1 py-3.5 md:py-4 rounded-full bg-primary text-on-primary font-bold text-sm flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity shadow-[0_0_20px_rgba(230,221,197,0.2)] whitespace-nowrap overflow-hidden px-4">
              <span className="material-symbols-outlined text-lg shrink-0">check</span><span className="truncate">{getCtaLabel(card)}</span>
            </button>
          </div>
        )}
        {isTop && isInteractive && quizResult && (
          <div className="pt-4">
            <button onClick={() => onSwipe("right")} className="w-full py-3.5 rounded-full border border-outline hover:bg-white/5 transition-colors font-bold text-sm text-on-surface">
              Continue
            </button>
          </div>
        )}
        {isTop && isInteractive && !quizResult && !isScenario && !flipped && (
          <div className="pt-4">
            <button onClick={() => onSwipe("left")} className="w-full py-3 rounded-full border border-outline hover:bg-white/5 transition-colors font-bold text-sm text-muted">
              Skip
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

  const [latestDebrief, setLatestDebrief] = useState<Debrief | null>(null);
  const [loading, setLoading] = useState(true);
  const [xpAnim, setXpAnim] = useState<{ id: number; text: string } | null>(null);
  const [animId, setAnimId] = useState(0);
  const [showDebrief, setShowDebrief] = useState(false);
  const [generatingDebrief, setGeneratingDebrief] = useState(false);
  const [expandNumbers, setExpandNumbers] = useState(false);
  const [expandPatterns, setExpandPatterns] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [dayCards, setDayCards] = useState<Card[]>([]);
  const [dayLoading, setDayLoading] = useState(false);
  const [historyCards, setHistoryCards] = useState<Card[] | null>(null);
  const [learningModules, setLearningModules] = useState<LearningModule[]>([]);
  const [selectedModule, setSelectedModule] = useState<LearningModuleDetail | null>(null);
  const [completingModule, setCompletingModule] = useState<string | null>(null);
  const [moduleStep, setModuleStep] = useState(0);

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
    void Promise.allSettled([
      cardsAPI.today(),
      gamification.xp(),
      debriefAPI.latest(),
      learning.modules(),
    ]).then(([cardsRes, xpRes, debriefRes, learningRes]) => {
      if (cardsRes.status === "fulfilled") setCardDeck(cardsRes.value.cards);
      if (xpRes.status === "fulfilled") setXpInfo(xpRes.value);
      if (debriefRes.status === "fulfilled") setLatestDebrief(debriefRes.value);
      if (learningRes.status === "fulfilled") setLearningModules(learningRes.value);
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

  const island = useNotificationIsland();
  const activeCard = cardDeck[0];
  const isViewingPastDay = selectedDay !== null && selectedDay !== currentDayIndex;

  const handleSwipe = async (direction: "left" | "right") => {
    if (!activeCard) return;
    const newId = animId + 1;
    setAnimId(newId);

    // Micro-learning: open the module instead of just dismissing
    const isMicroLearning = activeCard.card_type === "micro_learning" && direction === "right";
    const rawModuleId = activeCard.detail_json?.module_id ?? activeCard.action_payload?.module_id;
    const moduleId = typeof rawModuleId === "string" ? rawModuleId : "";

    try {
      await cardsAPI.swipe(activeCard.id, direction);
      if (direction === "right") {
        setXpAnim({ id: newId, text: "+5 XP" });
        if (xpInfo) setXpInfo({ ...xpInfo, total_xp: xpInfo.total_xp + 5 });
        island?.show("star", "+5 XP", "#c9b183");
      } else {
        setXpAnim({ id: newId, text: "Dismissed" });
      }
    } catch {
      setXpAnim({ id: newId, text: direction === "right" ? "+5 XP" : "Dismissed" });
    }

    setTimeout(() => setXpAnim(null), 1000);
    setCardDeck((prev) => prev.slice(1));

    // Open module after removing card from deck
    if (isMicroLearning && moduleId) {
      void handleViewModule(moduleId);
    }
  };

  const handleGenerateDebrief = async () => {
    setGeneratingDebrief(true);
    try {
      const newDebrief = await debriefAPI.generate();
      setLatestDebrief(newDebrief);
    } catch (e) { console.error(e); }
    setGeneratingDebrief(false);
  };

  const handleQuizAnswer = async (cardId: string, data: { selected_index?: number; choice?: string }) => {
    try {
      const result = await cardsAPI.answer(cardId, data);
      const newId = animId + 1;
      setAnimId(newId);
      setXpAnim({ id: newId, text: `+${result.xp_awarded} XP` });
      if (xpInfo) setXpInfo({ ...xpInfo, total_xp: xpInfo.total_xp + result.xp_awarded });
      setTimeout(() => setXpAnim(null), 1000);
      island?.show(
        result.correct ? "check_circle" : "info",
        `+${result.xp_awarded} XP`,
        result.correct ? "#34d399" : "#fbbf24"
      );
      return result;
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  const uncompletedModules = learningModules.filter((m) => !m.completed);

  const handleViewModule = async (id: string) => {
    try {
      const detail = await learning.get(id);
      setSelectedModule(detail);
      setModuleStep(0);
    } catch (e) { console.error(e); }
  };

  const handleCompleteModule = async (id: string) => {
    setCompletingModule(id);
    try {
      const result = await learning.complete(id);
      setLearningModules((prev) => prev.map((m) => m.id === id ? { ...m, completed: true } : m));
      if (selectedModule?.id === id) setSelectedModule({ ...selectedModule, completed: true });
      // Flash XP animation
      const newId = animId + 1;
      setAnimId(newId);
      setXpAnim({ id: newId, text: `+${result.xp_awarded} XP` });
      if (xpInfo) setXpInfo({ ...xpInfo, total_xp: xpInfo.total_xp + result.xp_awarded });
      setTimeout(() => setXpAnim(null), 1000);
      island?.show("school", `+${result.xp_awarded} XP`, "#c9b183");
    } catch (e) { console.error(e); }
    setCompletingModule(null);
  };

  if (loading) {
    return (
      <div className="app-container min-h-screen bg-background flex flex-col items-center justify-center text-center px-8">
        {/* Bouncing logo */}
        <div className="animate-bounce mb-6">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-4xl">bolt</span>
          </div>
        </div>

        {/* Brand name */}
        <h1 className="font-headline text-3xl font-extrabold text-on-surface tracking-tight">STRIDE</h1>

        {/* Loading pill */}
        <div className="mt-4 flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/[0.04] border border-outline-variant">
          <span className="material-symbols-outlined text-primary text-base animate-spin">progress_activity</span>
          <span className="text-sm text-muted font-medium">Preparing your moves...</span>
        </div>

        {/* Subtitle */}
        <p className="text-[11px] uppercase tracking-widest text-muted/50 mt-3 font-bold">Hold tight, crunching the numbers</p>

        {/* Animated progress bar */}
        <div className="w-48 h-0.5 bg-white/[0.04] rounded-full mt-6 overflow-hidden">
          <div className="h-full w-1/3 bg-primary/40 rounded-full animate-[shimmer_1.5s_ease-in-out_infinite]" />
        </div>
      </div>
    );
  }

  return (
    <>
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
            <button
              onClick={() => { setShowDebrief(true); setExpandNumbers(false); setExpandPatterns(false); }}
              className="relative w-9 h-9 rounded-full border border-outline-variant flex items-center justify-center text-muted hover:text-primary hover:border-primary/50 transition-colors"
              title="Weekly Debrief"
            >
              <span className="material-symbols-outlined text-lg">summarize</span>
              {latestDebrief && <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-secondary rounded-full" />}
            </button>
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
            {cardDeck.length === 0 ? (
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
                  onQuizAnswer={handleQuizAnswer}
                />
              ))
            )}
          </div>
        )}
      </section>

      {/* Learn & Earn */}
      {uncompletedModules.length > 0 && (
        <>
          <Divider className="mt-6" />
          <SectionHeader title="LEARN & EARN" />
          <div className="px-5 md:px-8 space-y-3">
            {uncompletedModules.slice(0, 3).map((mod) => (
              <SpotlightCard
                key={mod.id}
                className="p-4 cursor-pointer hover:border-primary transition-colors"
                onClick={() => handleViewModule(mod.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary text-xl">school</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-on-surface truncate">{mod.title}</h4>
                    <p className="text-xs text-muted mt-0.5">{mod.topic} &middot; Difficulty {mod.difficulty}</p>
                  </div>
                  <div className="text-xs font-bold bg-primary/20 px-2 py-1 rounded text-primary shrink-0">+{mod.xp_reward} XP</div>
                </div>
              </SpotlightCard>
            ))}
          </div>
        </>
      )}

      <Divider className="mt-6" />

      {/* CTA */}
      <section className="px-5 md:px-8 mt-6">
        <Link href="/check" className="block">
          <ShimmerButton className="w-full py-4 px-6 text-center">
            <h4 className="font-headline font-bold text-base md:text-lg text-on-surface">About to spend something?</h4>
            <p className="text-muted text-sm mt-0.5">Check it first with your AI council</p>
          </ShimmerButton>
        </Link>
      </section>
    </div>

      {/* Module detail modal */}
      {selectedModule && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setSelectedModule(null)} />
          <div className="relative w-full max-w-lg max-h-[80vh] bg-black border border-white/[0.1] rounded-3xl overflow-hidden animate-slide-up flex flex-col">
            {/* Header */}
            <div className="p-5 pb-3 border-b border-white/[0.05] shrink-0">
              <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-4" />
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-headline font-bold text-lg text-on-surface">{selectedModule.title}</h2>
                  <p className="text-xs text-muted mt-1">{selectedModule.topic} &middot; Difficulty {selectedModule.difficulty}</p>
                </div>
                <button onClick={() => setSelectedModule(null)} className="text-muted hover:text-on-surface p-1">
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              </div>
            </div>
            {/* Content — supports multi-step modules (delimited by ---STEP---) */}
            {(() => {
              const steps = selectedModule.content.split("---STEP---").map(s => s.trim()).filter(Boolean);
              const isMultiStep = steps.length > 1;
              const totalSteps = steps.length;
              const currentContent = steps[moduleStep] ?? steps[0] ?? selectedModule.content;

              return (
                <>
                  {/* Step indicator */}
                  {isMultiStep && (
                    <div className="px-5 pt-3 shrink-0 flex items-center gap-2">
                      {steps.map((_, i) => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= moduleStep ? "bg-primary" : "bg-white/10"}`} />
                      ))}
                      <span className="text-xs text-muted ml-2 shrink-0">{moduleStep + 1}/{totalSteps}</span>
                    </div>
                  )}
                  <div className="p-5 overflow-y-auto flex-1">
                    <div className="prose prose-invert prose-sm max-w-none text-on-surface text-sm leading-relaxed">
                      <ReactMarkdown>{currentContent}</ReactMarkdown>
                    </div>
                  </div>
                  {/* Footer */}
                  {isMultiStep && moduleStep < totalSteps - 1 && (
                    <div className="p-5 pt-3 border-t border-white/[0.05] shrink-0">
                      <button
                        onClick={() => setModuleStep(moduleStep + 1)}
                        className="w-full py-3.5 rounded-full bg-primary text-on-primary font-bold text-sm flex items-center justify-center gap-2"
                      >
                        Next <span className="material-symbols-outlined text-base">arrow_forward</span>
                      </button>
                    </div>
                  )}
                  {(!isMultiStep || moduleStep === totalSteps - 1) && !selectedModule.completed && (
                    <div className="p-5 pt-3 border-t border-white/[0.05] shrink-0">
                      <button
                        onClick={() => handleCompleteModule(selectedModule.id)}
                        disabled={completingModule === selectedModule.id}
                        className="w-full py-3.5 rounded-full bg-primary text-on-primary font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {completingModule === selectedModule.id ? (
                          <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                        ) : (
                          <span className="material-symbols-outlined text-base">check</span>
                        )}
                        {completingModule === selectedModule.id ? "Completing..." : `Mark Complete (+${selectedModule.xp_reward} XP)`}
                      </button>
                    </div>
                  )}
                  {(!isMultiStep || moduleStep === totalSteps - 1) && selectedModule.completed && (
                    <div className="p-5 pt-3 border-t border-white/[0.05] shrink-0">
                      <div className="rounded-2xl border border-green-500/30 bg-green-500/10 p-3 flex items-center gap-3">
                        <span className="material-symbols-outlined text-green-400">done_all</span>
                        <p className="text-sm font-bold text-green-400">Completed!</p>
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Debrief Modal — full screen sheet */}
      {showDebrief && (
        <div className="fixed inset-0 z-[200] bg-background flex flex-col">
            {/* Header */}
            <div className="px-5 pt-10 pb-3 border-b border-white/[0.05] shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-headline font-bold text-2xl text-on-surface">Weekly Debrief</h2>
                  {latestDebrief && (
                    <p className="text-xs text-muted mt-1">
                      {latestDebrief.week_start} — {latestDebrief.week_end}
                    </p>
                  )}
                </div>
                <button onClick={() => setShowDebrief(false)} className="w-9 h-9 rounded-full border border-outline-variant flex items-center justify-center text-muted hover:text-on-surface transition-colors">
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto flex-1 px-5 py-5">
              {!latestDebrief && !generatingDebrief && (
                <div className="flex flex-col items-center justify-center text-center gap-4 py-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-xl">summarize</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-on-surface">No debrief yet</h3>
                    <p className="text-xs text-muted mt-1">Get a weekly summary of your spending and habits</p>
                  </div>
                  <button
                    onClick={handleGenerateDebrief}
                    className="px-6 py-3 bg-primary text-on-primary rounded-full font-bold text-sm flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-base">auto_awesome</span>
                    Generate Debrief
                  </button>
                </div>
              )}

              {generatingDebrief && (
                <div className="flex flex-col items-center justify-center text-center gap-3 py-8">
                  <span className="material-symbols-outlined text-2xl text-primary animate-spin">progress_activity</span>
                  <p className="text-sm text-muted">Analysing your week...</p>
                </div>
              )}

              {latestDebrief && !generatingDebrief && (
                <div className="space-y-4">
                  {/* The Numbers — truncated */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-full bg-blue-500/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-blue-400 text-sm">analytics</span>
                      </div>
                      <span className="text-[11px] font-bold uppercase tracking-widest text-blue-400">The Numbers</span>
                    </div>
                    <p className={`text-sm text-on-surface/80 leading-relaxed ${expandNumbers ? "" : "line-clamp-2"}`}>
                      {extractDebriefText(latestDebrief.analyst_summary)}
                    </p>
                    {extractDebriefText(latestDebrief.analyst_summary).length > 100 && (
                      <button onClick={() => setExpandNumbers(!expandNumbers)} className="text-xs font-bold text-primary mt-1">
                        {expandNumbers ? "Show less" : "Show more"}
                      </button>
                    )}
                  </div>

                  <div className="h-px bg-white/[0.06]" />

                  {/* Behavioral Patterns — truncated */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-full bg-purple-500/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-purple-400 text-sm">psychology</span>
                      </div>
                      <span className="text-[11px] font-bold uppercase tracking-widest text-purple-400">Behavioral Patterns</span>
                    </div>
                    <p className={`text-sm text-on-surface/80 leading-relaxed ${expandPatterns ? "" : "line-clamp-2"}`}>
                      {extractDebriefText(latestDebrief.behaviorist_insights)}
                    </p>
                    {extractDebriefText(latestDebrief.behaviorist_insights).length > 100 && (
                      <button onClick={() => setExpandPatterns(!expandPatterns)} className="text-xs font-bold text-primary mt-1">
                        {expandPatterns ? "Show less" : "Show more"}
                      </button>
                    )}
                  </div>

                  <div className="h-px bg-white/[0.06]" />

                  {/* Next Week's Plan — always full */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary text-sm">target</span>
                      </div>
                      <span className="text-[11px] font-bold uppercase tracking-widest text-primary">Next Week&apos;s Plan</span>
                    </div>
                    <p className="text-sm text-on-surface/90 leading-relaxed">
                      {extractDebriefText(latestDebrief.mentor_goals)}
                    </p>
                  </div>
                </div>
              )}
            </div>
        </div>
      )}
    </>
  );
}
