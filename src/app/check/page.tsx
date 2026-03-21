"use client";

import React, { useState, useEffect } from "react";
import { SectionHeader } from "~/components/ui/SectionHeader";
import { Divider } from "~/components/ui/Divider";
import { CardCarousel } from "~/components/ui/CardCarousel";
import { SpotlightCard } from "~/components/ui/SpotlightCard";
import { AnimatedCounter } from "~/components/ui/AnimatedCounter";
import { AnimatedList } from "~/components/ui/AnimatedList";
import { ProgressRing } from "~/components/ui/ProgressRing";
import { intents, transactions } from "~/lib/api";
import type { IntentEvaluation, IntentHistoryItem, CategorySummary, IntentStats } from "~/lib/api";

type Phase = "INPUT" | "LOADING" | "RESULTS" | "HISTORY";

export default function CheckPage() {
  const [phase, setPhase] = useState<Phase>("INPUT");
  const [merchant, setMerchant] = useState("");
  const [amount, setAmount] = useState("");
  const [evaluation, setEvaluation] = useState<IntentEvaluation | null>(null);
  const [history, setHistory] = useState<IntentHistoryItem[]>([]);
  const [spendingSummary, setSpendingSummary] = useState<CategorySummary[]>([]);
  const [intentStats, setIntentStats] = useState<IntentStats | null>(null);
  const [loadingAgents, setLoadingAgents] = useState(0);

  useEffect(() => {
    transactions.summary().then(setSpendingSummary).catch(() => {});
    intents.stats().then(setIntentStats).catch(() => {});
  }, []);

  const handleEvaluate = async () => {
    setPhase("LOADING");
    setLoadingAgents(0);
    setEvaluation(null);

    const t1 = setTimeout(() => setLoadingAgents(1), 600);
    const t2 = setTimeout(() => setLoadingAgents(2), 1200);
    const t3 = setTimeout(() => setLoadingAgents(3), 1800);

    try {
      const result = await intents.evaluate(merchant, Number(amount));
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3);
      setLoadingAgents(3);
      setEvaluation(result);
      setPhase("RESULTS");
    } catch (e) {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3);
      console.error(e);
      setPhase("INPUT");
    }
  };

  const handleAction = async (action: "accept" | "override" | "cancel") => {
    if (evaluation) {
      try {
        await intents.action(evaluation.id, action);
      } catch { /* ok */ }
    }
    setPhase("INPUT");
    setMerchant("");
    setAmount("");
    setEvaluation(null);
  };

  const loadHistory = async () => {
    setPhase("HISTORY");
    try {
      const h = await intents.history();
      setHistory(h);
    } catch { /* ok */ }
  };

  const verdict = evaluation?.decision.status ?? null;

  return (
    <div className="app-container pb-32 min-h-screen bg-background text-on-background font-body relative overflow-hidden">
      {/* Header */}
      <div className="px-5 md:px-8 pt-10 pb-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl md:text-4xl font-headline font-extrabold text-primary">DISCOVER</h1>
          {phase !== "HISTORY" && (
            <button onClick={loadHistory} className="text-xs font-bold uppercase tracking-widest text-muted hover:text-primary transition-colors">History</button>
          )}
        </div>
        {phase === "INPUT" && (
          <p className="text-sm text-muted mt-1">Check a purchase before you commit</p>
        )}
      </div>

      {phase === "INPUT" && (
        <div className="space-y-0">
          {intentStats && intentStats.total_intents > 0 && (
            <div className="px-5 md:px-8 mb-2">
              <SpotlightCard className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary text-xl">savings</span>
                </div>
                <div>
                  <div className="text-lg font-headline font-bold text-primary">£{intentStats.total_money_saved.toFixed(0)} saved</div>
                  <div className="text-xs text-muted">across {intentStats.total_intents} spend checks &middot; {Math.round(intentStats.cancel_rate * 100)}% cancelled</div>
                </div>
              </SpotlightCard>
            </div>
          )}
          {/* Spend Check Form */}
          <SectionHeader title="BEFORE YOU SPEND" />
          <div className="px-5 md:px-8 space-y-4 max-w-xl">
            <input
              type="text"
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              placeholder="Where?"
              className="w-full bg-surface-container text-lg p-5 rounded-2xl border border-outline-variant focus:border-primary focus:bg-surface-container-high transition-colors outline-none text-on-surface placeholder:text-muted-foreground"
            />
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-3xl font-headline font-bold text-muted-foreground">£</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-surface-container text-3xl font-headline font-bold p-5 pl-12 rounded-2xl border border-outline-variant focus:border-primary focus:bg-surface-container-high transition-colors outline-none text-primary"
              />
            </div>
            <button
              onClick={handleEvaluate}
              disabled={!merchant || !amount}
              className="w-full bg-primary text-on-primary font-bold text-base py-4 rounded-full flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Check this spend
              <span className="material-symbols-outlined text-lg">analytics</span>
            </button>
          </div>

          {/* How It Works */}
          <Divider className="mt-6" />
          <SectionHeader title="HOW IT WORKS" />
          <div className="px-5 md:px-8 grid grid-cols-3 gap-3">
            {[
              { icon: "edit_note", label: "Enter spend", desc: "Tell us where and how much" },
              { icon: "forum", label: "AI council", desc: "3 agents analyse it" },
              { icon: "gavel", label: "Get verdict", desc: "Informed decision" },
            ].map((step, i) => (
              <SpotlightCard key={i} className="p-4 flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                  <span className="material-symbols-outlined text-primary text-lg">{step.icon}</span>
                </div>
                <div className="text-xs font-bold text-on-surface">{step.label}</div>
                <div className="text-[10px] text-muted mt-0.5">{step.desc}</div>
              </SpotlightCard>
            ))}
          </div>

          {/* Spending Summary */}
          {spendingSummary.length > 0 && (
            <>
              <Divider className="mt-6" />
              <SectionHeader title="SPENDING THIS MONTH" />
              <CardCarousel responsive>
                {spendingSummary.slice(0, 6).map((cat) => (
                  <SpotlightCard key={cat.category} className="min-w-[130px] p-4 flex-shrink-0">
                    <div className="text-lg font-headline font-bold text-primary">
                      £<AnimatedCounter value={cat.total} decimals={0} />
                    </div>
                    <div className="text-[10px] uppercase tracking-widest text-muted font-bold mt-1">{cat.category.replace(/_/g, " ")}</div>
                    <div className="text-xs text-muted-foreground">{cat.count} txns</div>
                  </SpotlightCard>
                ))}
              </CardCarousel>
            </>
          )}
        </div>
      )}

      {phase === "LOADING" && (
        <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-12 px-5">
          <ProgressRing progress={loadingAgents >= 3 ? 100 : loadingAgents * 33} size={112} strokeWidth={4} color="#c9b183">
            <span className="material-symbols-outlined text-4xl text-primary animate-pulse">blur_on</span>
          </ProgressRing>
          <AnimatedList staggerMs={600} className="space-y-3 w-full max-w-xs">
            {[
              { label: "Risk Guardian", loaded: loadingAgents >= 1 },
              { label: "Growth Strategist", loaded: loadingAgents >= 2 },
              { label: "Lifestyle Advocate", loaded: loadingAgents >= 3 },
            ].map((agent) => (
              <div key={agent.label} className={`p-4 rounded-2xl border transition-all duration-700 ${agent.loaded ? "border-primary bg-primary/10" : "border-outline-variant opacity-50"}`}>
                <div className="flex items-center gap-3">
                  <span className={`material-symbols-outlined text-sm ${agent.loaded ? "text-primary" : "text-muted animate-spin"}`}>{agent.loaded ? "check_circle" : "sync"}</span>
                  <span className="font-bold text-sm">{agent.label} {agent.loaded ? "ready" : "analyzing"}</span>
                </div>
              </div>
            ))}
          </AnimatedList>
        </div>
      )}

      {phase === "RESULTS" && evaluation && (
        <div className="px-5 md:px-8 pt-6 pb-20 space-y-6 max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <div className={`inline-block px-4 py-1 rounded-full font-bold tracking-widest uppercase text-xs mb-3 ${
              verdict === "block" ? "bg-error/20 text-error" : verdict === "reduce" ? "bg-secondary/20 text-secondary" : "bg-primary/20 text-primary"
            }`}>
              {verdict === "block" ? "Warning" : verdict === "reduce" ? "Alternative" : "All Clear"}
            </div>
            <h1 className="text-3xl md:text-4xl font-headline font-bold text-on-surface">{evaluation.decision.message}</h1>
            {verdict !== "allow" && (
              <div className="mt-2 text-xl text-muted line-through decoration-error decoration-2">£{evaluation.decision.original_amount}</div>
            )}
          </div>

          {/* Agent Cards */}
          <AnimatedList staggerMs={150} className="space-y-4">
            {evaluation.agents.map((agent) => (
              <SpotlightCard key={agent.name} className="p-5">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-widest">
                    {agent.icon && <span>{agent.icon}</span>}
                    {agent.name}
                  </div>
                  <div className={`px-2 py-1 rounded font-bold text-[10px] ${
                    agent.vote === "allow" ? "bg-primary/20 text-primary" : agent.vote === "block" ? "bg-error/20 text-error" : "bg-secondary/20 text-secondary"
                  }`}>
                    {agent.vote.toUpperCase()}
                  </div>
                </div>
                <p className="text-on-surface font-medium text-base leading-snug mb-3">&quot;{agent.reason}&quot;</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1 bg-surface-container-high rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${agent.confidence * 100}%` }} />
                  </div>
                  <span className="text-xs text-muted">
                    <AnimatedCounter value={Math.round(agent.confidence * 100)} suffix="%" />
                  </span>
                </div>
              </SpotlightCard>
            ))}
          </AnimatedList>

          {/* Impact */}
          <SpotlightCard className="p-5 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted">Balance after</span>
              <span className="font-bold text-on-surface">£<AnimatedCounter value={evaluation.impact.balance_after} decimals={2} /></span>
            </div>
            {evaluation.impact.goal_delay_days != null && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted">Goal delay</span>
                <span className="font-bold text-error"><AnimatedCounter value={evaluation.impact.goal_delay_days} /> days</span>
              </div>
            )}
            {evaluation.impact.weekly_budget_remaining != null && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted">Weekly budget left</span>
                <span className="font-bold text-secondary">£<AnimatedCounter value={evaluation.impact.weekly_budget_remaining} decimals={2} /></span>
              </div>
            )}
            {evaluation.impact.opportunity_cost_5yr != null && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted">5yr opportunity cost</span>
                <span className="font-bold text-primary">£<AnimatedCounter value={evaluation.impact.opportunity_cost_5yr} decimals={2} /></span>
              </div>
            )}
          </SpotlightCard>

          {/* Actions */}
          <div className="space-y-3">
            <button onClick={() => handleAction("accept")} className={`w-full font-bold text-base py-4 rounded-full flex items-center justify-center gap-2 transition-all ${verdict === "allow" ? "bg-primary text-on-primary" : "bg-primary text-on-primary"}`}>
              <span className="material-symbols-outlined text-lg">check_circle</span>
              {verdict === "reduce" ? `Accept £${evaluation.decision.approved_amount.toFixed(2)}` : "Proceed"}
            </button>
            <button onClick={() => handleAction("cancel")} className="w-full border border-outline text-on-surface font-bold text-base py-4 rounded-full hover:bg-white/5 transition-all">
              Cancel Purchase (+20 XP)
            </button>
            {verdict !== "allow" && (
              <button onClick={() => handleAction("override")} className="w-full text-muted font-medium text-sm py-3 hover:text-on-surface transition-colors uppercase tracking-widest">
                Override — Spend £{evaluation.decision.original_amount}
              </button>
            )}
          </div>
        </div>
      )}

      {phase === "HISTORY" && (
        <div className="px-5 md:px-8 pt-6 max-w-2xl mx-auto">
          <AnimatedList staggerMs={80} className="space-y-3">
            {history.length === 0 ? (
              <p className="text-muted text-center py-10">No spend checks yet</p>
            ) : (
              history.map((item) => (
                <SpotlightCard key={item.id} className="p-4 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-on-surface">{item.merchant}</div>
                    <div className="text-xs text-muted">{new Date(item.created_at).toLocaleDateString()}</div>
                  </div>
                  <div className="text-right">
                    {item.money_saved > 0 && <div className="font-bold text-primary">+£{item.money_saved.toFixed(2)}</div>}
                    <div className={`text-xs font-bold uppercase ${item.user_action === "cancel" ? "text-primary" : item.user_action === "override" ? "text-error" : "text-secondary"}`}>
                      {item.user_action}
                    </div>
                  </div>
                </SpotlightCard>
              ))
            )}
          </AnimatedList>
          <button onClick={() => setPhase("INPUT")} className="mt-6 px-6 py-3 rounded-full border border-outline text-sm font-bold uppercase tracking-widest hover:bg-white/5 transition-colors w-full">Back</button>
        </div>
      )}
    </div>
  );
}
