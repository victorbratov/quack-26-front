"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GradientAvatar } from "~/components/ui/GradientAvatar";
import { SectionHeader } from "~/components/ui/SectionHeader";
import { Divider } from "~/components/ui/Divider";
import { SpotlightCard } from "~/components/ui/SpotlightCard";
import { AnimatedCounter } from "~/components/ui/AnimatedCounter";
import { ProgressRing } from "~/components/ui/ProgressRing";
import { AnimatedList } from "~/components/ui/AnimatedList";
import { authClient } from "~/server/better-auth/client";
import { AgentReasoningCard } from "~/components/ui/AgentReasoning";
import {
  auth, goals as goalsAPI, ghostSpend, gamification, benchmarks,
  projections, transactions, debrief as debriefAPI, ingestion, clearAuthToken,
} from "~/lib/api";
import type {
  AuthUser, SavingsGoal, RecurringTransaction, GhostSavingsPotential,
  XPInfo, Streak, SpendingBenchmark,
  ProjectionSummary, CategorySummary, Milestone,
  Debrief, IngestionResponse,
} from "~/lib/api";

type Tab = "Goals" | "Insights" | "Ghost Subs" | "Transactions" | "Debrief";

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

export default function ProgressPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Goals");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [goalsList, setGoalsList] = useState<SavingsGoal[]>([]);
  const [ghostList, setGhostList] = useState<RecurringTransaction[]>([]);
  const [ghostSavings, setGhostSavings] = useState<GhostSavingsPotential | null>(null);
  const [xpInfo, setXpInfo] = useState<XPInfo | null>(null);
  const [streaks, setStreaks] = useState<Streak[]>([]);
  const [spendingBenchmarks, setSpendingBenchmarks] = useState<SpendingBenchmark[]>([]);
  const [projSummary, setProjSummary] = useState<ProjectionSummary | null>(null);
  const [spendingSummary, setSpendingSummary] = useState<CategorySummary[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);

  const [newGoalName, setNewGoalName] = useState("");
  const [newGoalTarget, setNewGoalTarget] = useState("");
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [depositGoalId, setDepositGoalId] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState("");
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [expandedTxCategory, setExpandedTxCategory] = useState<string | null>(null);
  const [insightCache, setInsightCache] = useState<Record<string, string>>({});
  const [insightLoading, setInsightLoading] = useState(false);

  const [debriefList, setDebriefList] = useState<Debrief[]>([]);
  const [selectedDebrief, setSelectedDebrief] = useState<Debrief | null>(null);
  const [generatingDebrief, setGeneratingDebrief] = useState(false);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<IngestionResponse | null>(null);

  const refreshData = useCallback(async () => {
    try {
      const [userR, goalsR, ghostR, ghostSavR, xpR, streakR, benchR, projR, txSumR, milestonesR, debriefHistR] = await Promise.allSettled([
        auth.me(),
        goalsAPI.list(),
        ghostSpend.list(),
        ghostSpend.savingsPotential(),
        gamification.xp(),
        gamification.streaks(),
        benchmarks.spending(),
        projections.summary(),
        transactions.summary(),
        gamification.milestones(),
        debriefAPI.history(),
      ]);

      if (userR.status === "fulfilled") setUser(userR.value);
      if (goalsR.status === "fulfilled") setGoalsList(goalsR.value);
      if (ghostR.status === "fulfilled") setGhostList(ghostR.value);
      if (ghostSavR.status === "fulfilled") setGhostSavings(ghostSavR.value);
      if (xpR.status === "fulfilled") setXpInfo(xpR.value);
      if (streakR.status === "fulfilled") setStreaks(streakR.value);
      if (benchR.status === "fulfilled") setSpendingBenchmarks(benchR.value);
      if (projR.status === "fulfilled") setProjSummary(projR.value);
      if (txSumR.status === "fulfilled") setSpendingSummary(txSumR.value);
      if (milestonesR.status === "fulfilled") setMilestones(milestonesR.value);
      if (debriefHistR.status === "fulfilled") setDebriefList(debriefHistR.value);
    } catch (e) {
      console.error("Failed to refresh data:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshData();
  }, [refreshData]);

  const handleToggleInsight = useCallback(async (b: SpendingBenchmark) => {
    if (expandedCategory === b.category) {
      setExpandedCategory(null);
      return;
    }
    setExpandedCategory(b.category);
    if (insightCache[b.category]) return;
    setInsightLoading(true);
    try {
      const result = await benchmarks.insight({
        category: b.category,
        your_spend: b.your_spend,
        peer_avg: b.peer_avg,
        peer_median: b.peer_median,
        peer_p25: b.peer_p25,
        peer_p75: b.peer_p75,
        diff_pct: b.diff_pct,
        status: b.status,
      });
      setInsightCache((prev) => ({ ...prev, [b.category]: result.insight }));
    } catch {
      setInsightCache((prev) => ({ ...prev, [b.category]: "Unable to generate insight." }));
    }
    setInsightLoading(false);
  }, [expandedCategory, insightCache]);

  const handleCreateGoal = async () => {
    if (!newGoalName || !newGoalTarget) return;
    try {
      const goal = await goalsAPI.create(newGoalName, Number(newGoalTarget));
      setGoalsList((prev) => [goal, ...prev]);
      setNewGoalName("");
      setNewGoalTarget("");
      setShowGoalModal(false);
    } catch (e) { console.error(e); }
  };

  const handleDeposit = async (id: string) => {
    const amt = Number(depositAmount);
    if (!amt || amt <= 0) return;
    try {
      const updated = await goalsAPI.deposit(id, amt);
      setGoalsList((prev) => prev.map((g) => (g.id === id ? updated : g)));
      setDepositGoalId(null);
      setDepositAmount("");
    } catch (e) { console.error(e); }
  };

  const handleDeleteGoal = async (id: string) => {
    try {
      await goalsAPI.delete(id);
      setGoalsList((prev) => prev.filter((g) => g.id !== id));
    } catch (e) { console.error(e); }
  };

  const handleFlagGhost = async (id: string) => {
    try {
      await ghostSpend.flag(id);
      setGhostList((prev) => prev.filter((g) => g.id !== id));
    } catch (e) { console.error(e); }
  };

  const handleKeepGhost = async (id: string) => {
    try {
      await ghostSpend.keep(id);
      setGhostList((prev) => prev.filter((g) => g.id !== id));
    } catch (e) { console.error(e); }
  };


  const handleGenerateDebrief = async () => {
    setGeneratingDebrief(true);
    try {
      const newDebrief = await debriefAPI.generate();
      setDebriefList((prev) => [newDebrief, ...prev]);
      setSelectedDebrief(newDebrief);
      setGeneratingDebrief(false);
    } catch (e) {
      console.error(e);
      setGeneratingDebrief(false);
    }
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    setUploadError(null);
    setUploadResult(null);
    try {
      const response = await ingestion.upload(Array.from(files));
      if (response.success) {
        setUploadResult(response);
        await refreshData();
      } else {
        setUploadError(response.message || "Failed to process document.");
      }
    } catch (e) {
      console.error(e);
      setUploadError(e instanceof Error ? e.message : "An error occurred during upload.");
    } finally {
      setIsUploading(false);
    }
  };


  const router = useRouter();

  const handleLogout = async () => {
    clearAuthToken();
    void authClient.signOut().catch(() => undefined);
    router.push("/sign-in");
  };

  const mainStreak = streaks.find((s) => s.streak_type === "daily_savings") ?? streaks[0];
  const chips: Tab[] = ["Goals", "Insights", "Ghost Subs", "Transactions", "Debrief"];

  if (loading) {
    return (
      <div className="app-container pb-32 min-h-screen bg-background flex items-center justify-center">
        <span className="material-symbols-outlined text-4xl text-muted animate-spin">progress_activity</span>
      </div>
    );
  }

  const xpProgress = xpInfo ? ((xpInfo.total_xp % 100) / 100) * 100 : 0;

  return (
    <>
    <div className="app-container pb-32 min-h-screen bg-background text-on-background font-body">
      {/* Profile Card */}
      <div className="px-5 md:px-8 pt-8">
        <SpotlightCard className="p-6 relative" spotlightColor="rgba(201, 177, 131, 0.1)">
          <button
            onClick={handleLogout}
            className="absolute top-4 right-4 px-3 py-1 rounded-full border border-outline-variant text-[11px] font-medium text-muted hover:text-error hover:border-error/50 transition-colors"
          >
            Sign out
          </button>
          <div className="flex items-center gap-5">
            <div className="shrink-0">
              <ProgressRing progress={xpProgress} size={76} strokeWidth={3} color="#c9b183">
                <GradientAvatar size={62} initials={user?.display_name?.[0] ?? "?"} seed={user?.display_name ?? "user"} />
              </ProgressRing>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl md:text-2xl font-headline font-extrabold text-on-surface truncate">{user?.display_name ?? "User"}</h1>
              <p className="text-xs text-muted mt-0.5 truncate">{user?.email}</p>
            </div>
          </div>

          <div className="h-px bg-white/[0.06] my-4" />

          <div className="grid grid-cols-4 gap-3">
            {[
              { value: user?.balance ?? 0, label: "Balance", prefix: "£", color: "text-primary" },
              { value: goalsList.reduce((sum, g) => sum + g.current_amount, 0), label: "Savings", prefix: "£", color: "text-secondary" },
              { value: mainStreak?.current_count ?? user?.current_streak_days ?? 0, label: "Streak", color: "text-primary", suffix: "d" },
              { value: xpInfo?.level ?? 0, label: "Level", prefix: "Lvl ", color: "text-secondary" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className={`text-lg md:text-xl font-headline font-bold ${stat.color}`}>
                  <AnimatedCounter value={stat.value} prefix={stat.prefix} />{"suffix" in stat ? stat.suffix : ""}
                </div>
                <div className="text-[9px] md:text-[10px] uppercase text-muted font-bold tracking-wider mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </SpotlightCard>
      </div>

      {milestones.length > 0 && (
        <>
          <Divider className="mt-4" />
          <SectionHeader title="ACHIEVEMENTS" />
          <div className="flex gap-3 overflow-x-auto px-5 md:px-8 scrollbar-hide">
            {milestones.map((m) => (
              <SpotlightCard key={m.id} className="p-3 min-w-[100px] flex-shrink-0 text-center">
                <span className="material-symbols-outlined text-primary text-2xl">emoji_events</span>
                <div className="text-[10px] uppercase tracking-widest text-muted font-bold mt-1">{m.milestone_type.replace(/_/g, " ")}</div>
                <div className="text-[10px] text-secondary font-bold">+{m.xp_awarded} XP</div>
              </SpotlightCard>
            ))}
          </div>
        </>
      )}

      {/* Projections */}
      {projSummary && (
        <>
          <Divider className="mt-4" />
          <div className="px-5 md:px-8 mt-3">
            <Link href="/progress/wealth">
              <SpotlightCard className="p-5 flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary text-xl">savings</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold uppercase tracking-widest text-muted">Wealth Projection</div>
                  <div className="text-sm text-on-surface mt-0.5">
                    Saving £<AnimatedCounter value={projSummary.monthly_savings_rate} />/mo — see your timeline
                  </div>
                </div>
                <span className="material-symbols-outlined text-muted text-lg">chevron_right</span>
              </SpotlightCard>
            </Link>
          </div>
        </>
      )}

      <Divider className="mt-4" />

      {/* Tab Chips */}
      <div className="flex gap-2 overflow-x-auto px-5 md:px-8 py-3 scrollbar-hide">
        {chips.map((chip) => (
          <button key={chip} onClick={() => setActiveTab(chip)}
            className={`whitespace-nowrap px-5 py-2.5 rounded-full font-medium text-sm transition-all border ${activeTab === chip ? "bg-primary text-on-primary border-primary" : "bg-transparent text-muted border-outline-variant hover:border-outline"}`}>
            {chip}
          </button>
        ))}
      </div>

      <section className="px-5 md:px-8">
        {/* GOALS */}
        {activeTab === "Goals" && (
          <div className="space-y-4">
            <button
              onClick={() => { setShowGoalModal(true); setNewGoalName(""); setNewGoalTarget(""); }}
              className="w-full py-3 rounded-xl border border-dashed border-outline-variant text-sm font-bold text-muted hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              New Goal
            </button>
          <AnimatedList staggerMs={100} className="space-y-4">
            {goalsList.map((goal) => {
              const pct = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
              const isDepositing = depositGoalId === goal.id;
              return (
                <SpotlightCard key={goal.id} className="p-5">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-on-surface">{goal.name}</h3>
                    <div className="text-right">
                      <div className="font-bold text-lg text-secondary">
                        £<AnimatedCounter value={goal.current_amount} />
                      </div>
                      <div className="text-xs text-muted">of £{goal.target_amount.toFixed(0)}</div>
                    </div>
                  </div>
                  <div className="h-1.5 bg-surface-container-high rounded-full overflow-hidden mb-2">
                    <div className="h-full bg-secondary rounded-full transition-all duration-1000" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex items-center gap-2">
                      {goal.target_date && <p className="text-xs text-muted">Target: {goal.target_date}</p>}
                      <button
                        onClick={() => handleDeleteGoal(goal.id)}
                        className="text-muted hover:text-error transition-colors"
                        title="Delete goal"
                      >
                        <span className="material-symbols-outlined text-[14px]">delete</span>
                      </button>
                    </div>
                    {!isDepositing && (
                      <button
                        onClick={() => { setDepositGoalId(goal.id); setDepositAmount(""); }}
                        className="w-9 h-9 flex items-center justify-center rounded-full border border-primary text-primary hover:bg-primary/10 transition-colors"
                        title="Add funds"
                      >
                        <span className="material-symbols-outlined text-[18px]">add</span>
                      </button>
                    )}
                  </div>
                  {isDepositing && (
                    <div className="flex items-center gap-2 mt-3">
                      <input
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        type="number"
                        placeholder="£ amount"
                        autoFocus
                        className="flex-1 bg-surface-container p-2.5 rounded-xl border border-outline-variant focus:border-primary outline-none text-sm placeholder:text-muted-foreground"
                      />
                      <button
                        onClick={() => handleDeposit(goal.id)}
                        className="px-4 py-2.5 rounded-full bg-primary text-on-primary font-bold text-xs"
                      >
                        Deposit
                      </button>
                      <button
                        onClick={() => { setDepositGoalId(null); setDepositAmount(""); }}
                        className="w-9 h-9 flex items-center justify-center rounded-full border border-outline-variant text-muted hover:text-on-surface transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">close</span>
                      </button>
                    </div>
                  )}
                </SpotlightCard>
              );
            })}

          </AnimatedList>
          </div>
        )}

        {/* INSIGHTS */}
        {activeTab === "Insights" && (
          <AnimatedList staggerMs={100} className="space-y-4">
            {spendingBenchmarks.length === 0 ? (
              <p className="text-muted text-center py-10">Complete onboarding to see peer comparisons</p>
            ) : (
              spendingBenchmarks.map((b) => {
                const isExpanded = expandedCategory === b.category;
                return (
                  <SpotlightCard key={b.category} className="overflow-hidden cursor-pointer hover:border-primary/30 transition-colors" onClick={() => handleToggleInsight(b)}>
                    <div className="p-5">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold uppercase tracking-widest text-muted">{b.category.replace(/_/g, " ")}</span>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold uppercase px-2 py-1 rounded ${b.status === "above" ? "bg-error/20 text-error" : b.status === "below" ? "bg-primary/20 text-primary" : "bg-secondary/20 text-secondary"}`}>
                            {b.status === "above" ? `+${b.diff_pct.toFixed(0)}%` : b.status === "below" ? `${b.diff_pct.toFixed(0)}%` : "Average"}
                          </span>
                          <span className={`material-symbols-outlined text-muted text-sm transition-transform ${isExpanded ? "rotate-180" : ""}`}>expand_more</span>
                        </div>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-on-surface font-bold">£<AnimatedCounter value={b.your_spend} /></span>
                        <span className="text-muted">Peer avg: £{b.peer_avg.toFixed(0)}</span>
                      </div>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-5 space-y-4 border-t border-white/[0.06] pt-4">
                            {/* Visual comparison */}
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-muted w-8 text-right shrink-0">You</span>
                                <div className="flex-1 h-4 bg-white/[0.04] rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${b.status === "above" ? "bg-error/30" : b.status === "below" ? "bg-primary/30" : "bg-secondary/30"}`}
                                    style={{ width: `${Math.min((b.your_spend / Math.max(b.peer_p75, b.your_spend)) * 100, 100)}%` }}
                                  />
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-muted w-8 text-right shrink-0">Avg</span>
                                <div className="flex-1 h-4 bg-white/[0.04] rounded-full overflow-hidden">
                                  <div
                                    className="h-full rounded-full bg-white/[0.1]"
                                    style={{ width: `${Math.min((b.peer_avg / Math.max(b.peer_p75, b.your_spend)) * 100, 100)}%` }}
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Percentile breakdown */}
                            <div className="grid grid-cols-3 gap-2">
                              <div className="text-center p-2 rounded-xl bg-white/[0.03]">
                                <div className="text-xs font-bold text-on-surface">£{b.peer_p25.toFixed(0)}</div>
                                <div className="text-[9px] text-muted">Low</div>
                              </div>
                              <div className="text-center p-2 rounded-xl bg-white/[0.03]">
                                <div className="text-xs font-bold text-on-surface">£{b.peer_median.toFixed(0)}</div>
                                <div className="text-[9px] text-muted">Median</div>
                              </div>
                              <div className="text-center p-2 rounded-xl bg-white/[0.03]">
                                <div className="text-xs font-bold text-on-surface">£{b.peer_p75.toFixed(0)}</div>
                                <div className="text-[9px] text-muted">High</div>
                              </div>
                            </div>

                            {/* AI Insight */}
                            <div className="pt-1">
                              <div className="flex items-center gap-1.5 mb-1.5">
                                <span className="material-symbols-outlined text-primary text-sm">auto_awesome</span>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-primary">AI Insight</span>
                              </div>
                              {insightLoading && expandedCategory === b.category && !insightCache[b.category] ? (
                                <div className="flex items-center gap-2">
                                  <span className="material-symbols-outlined text-sm text-muted animate-spin">progress_activity</span>
                                  <span className="text-xs text-muted">Analysing...</span>
                                </div>
                              ) : (
                                <p className="text-xs text-on-surface/70 leading-relaxed">{insightCache[b.category] ?? ""}</p>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </SpotlightCard>
                );
              })
            )}
          </AnimatedList>
        )}

        {/* GHOST SUBS */}
        {activeTab === "Ghost Subs" && (
          <div className="space-y-4">
            {ghostSavings && ghostSavings.ghost_count > 0 && (
              <div className="p-4 rounded-2xl bg-error/10 border border-error/20 text-error">
                <div className="font-bold mb-1">Action Required</div>
                <p className="text-sm">Cancel {ghostSavings.ghost_count} unused subs to save £<AnimatedCounter value={ghostSavings.annual_savings} />/year</p>
              </div>
            )}
            {ghostList.length === 0 ? (
              <p className="text-muted text-center py-10">No ghost subscriptions found</p>
            ) : (
              <AnimatedList staggerMs={80} className="space-y-3">
                {ghostList.map((sub) => (
                  <SpotlightCard key={sub.id} className="p-4 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-on-surface">{sub.merchant_name}</div>
                      <div className="text-xs text-muted">£{sub.typical_amount.toFixed(2)}/{sub.frequency}</div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleKeepGhost(sub.id)} className="px-3 py-1.5 rounded-full border border-outline text-xs font-bold text-muted hover:text-on-surface">Keep</button>
                      <button onClick={() => handleFlagGhost(sub.id)} className="px-3 py-1.5 rounded-full border border-error text-error text-xs font-bold hover:bg-error/10">Cancel</button>
                    </div>
                  </SpotlightCard>
                ))}
              </AnimatedList>
            )}
          </div>
        )}



        {/* DEBRIEF */}
        {activeTab === "Debrief" && (
          <div className="space-y-4">
            {/* Generate button */}
            <button
              onClick={handleGenerateDebrief}
              disabled={generatingDebrief}
              className="w-full py-3.5 rounded-full bg-primary text-on-primary font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-lg">{generatingDebrief ? "sync" : "auto_awesome"}</span>
              {generatingDebrief ? "Generating..." : "Generate Weekly Debrief"}
            </button>

            {/* Selected debrief detail */}
            {selectedDebrief && (
              <div className="space-y-3 animate-slide-up">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold uppercase tracking-widest text-muted">
                    {selectedDebrief.week_start} — {selectedDebrief.week_end}
                  </div>
                  <button onClick={() => setSelectedDebrief(null)} className="text-xs font-bold text-muted hover:text-on-surface">Close</button>
                </div>

                {/* Analyst */}
                <AgentReasoningCard
                  label="Analyst"
                  icon="analytics"
                  color="text-secondary"
                  status="COMPLETED"
                  summary={extractDebriefText(selectedDebrief.analyst_summary)}
                  defaultOpen
                />

                {/* Behaviorist */}
                <AgentReasoningCard
                  label="Behaviorist"
                  icon="psychology"
                  color="text-primary"
                  status="COMPLETED"
                  summary={extractDebriefText(selectedDebrief.behaviorist_insights)}
                  defaultOpen
                />

                {/* Mentor Goals */}
                <AgentReasoningCard
                  label="Mentor"
                  icon="gavel"
                  color="text-secondary"
                  status="COMPLETED"
                  summary={extractDebriefText(selectedDebrief.mentor_goals)}
                  defaultOpen
                />
                {/* empty — content shown inline in AgentReasoningCard above */}
              </div>
            )}

            {/* Past debriefs list */}
            {!selectedDebrief && (
              <>
                {debriefList.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-14 h-14 rounded-full bg-surface-container-high flex items-center justify-center mb-4">
                      <span className="material-symbols-outlined text-muted text-2xl">summarize</span>
                    </div>
                    <p className="text-muted text-sm">No debriefs yet. Generate your first one above!</p>
                  </div>
                ) : (
                  <AnimatedList staggerMs={80} className="space-y-3">
                    {debriefList.map((d) => (
                      <SpotlightCard key={d.id} className="p-4 cursor-pointer" onClick={() => setSelectedDebrief(d)}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="material-symbols-outlined text-primary text-lg">summarize</span>
                            </div>
                            <div>
                              <div className="font-bold text-sm text-on-surface">{d.week_start} — {d.week_end}</div>
                              <div className="text-xs text-muted mt-0.5">{d.analyst_summary?.total_spent != null ? `£${d.analyst_summary.total_spent.toLocaleString()} spent` : ""}{d.analyst_summary?.trend ? ` · ${d.analyst_summary.trend}` : ""}</div>
                            </div>
                          </div>
                          <span className="material-symbols-outlined text-muted text-lg">chevron_right</span>
                        </div>
                      </SpotlightCard>
                    ))}
                  </AnimatedList>
                )}
              </>
            )}
          </div>
        )}

        {/* TRANSACTIONS */}
        {activeTab === "Transactions" && (() => {
          const grandTotal = spendingSummary.reduce((s, c) => s + c.total, 0);
          return (
            <div className="space-y-4">
              <button
                onClick={() => setShowUploadModal(true)}
                className="w-full py-3 rounded-xl border border-dashed border-outline-variant text-sm font-bold text-muted hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">document_scanner</span>
                Add Statement
              </button>
            <AnimatedList staggerMs={80} className="space-y-4">
              {spendingSummary.length === 0 ? (
                <p className="text-muted text-center py-10">No transactions yet</p>
              ) : (
                spendingSummary.map((cat) => {
                  const isExpanded = expandedTxCategory === cat.category;
                  const pctOfTotal = grandTotal > 0 ? (cat.total / grandTotal) * 100 : 0;
                  const avgPerTx = cat.count > 0 ? cat.total / cat.count : 0;
                  return (
                    <SpotlightCard
                      key={cat.category}
                      className="overflow-hidden cursor-pointer hover:border-primary/30 transition-colors"
                      onClick={() => setExpandedTxCategory(isExpanded ? null : cat.category)}
                    >
                      <div className="p-4 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-on-surface capitalize">{cat.category.replace(/_/g, " ")}</div>
                          <div className="text-xs text-muted">{cat.count} transactions</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-lg font-headline font-bold text-primary">
                            £<AnimatedCounter value={cat.total} />
                          </div>
                          <span className={`material-symbols-outlined text-muted text-sm transition-transform ${isExpanded ? "rotate-180" : ""}`}>expand_more</span>
                        </div>
                      </div>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-4 space-y-3 border-t border-white/[0.06] pt-3">
                              {/* % of total bar */}
                              <div>
                                <div className="flex justify-between text-[10px] text-muted mb-1">
                                  <span>{pctOfTotal.toFixed(0)}% of total spending</span>
                                  <span>£{grandTotal.toFixed(0)} total</span>
                                </div>
                                <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden">
                                  <div className="h-full rounded-full bg-primary/30" style={{ width: `${pctOfTotal}%` }} />
                                </div>
                              </div>

                              {/* Stats */}
                              <div className="grid grid-cols-2 gap-3">
                                <div className="p-2.5 rounded-xl bg-white/[0.03] text-center">
                                  <div className="text-sm font-bold text-on-surface">£{avgPerTx.toFixed(0)}</div>
                                  <div className="text-[9px] text-muted">Avg per transaction</div>
                                </div>
                                <div className="p-2.5 rounded-xl bg-white/[0.03] text-center">
                                  <div className="text-sm font-bold text-on-surface">£{(cat.total / 4.3).toFixed(0)}</div>
                                  <div className="text-[9px] text-muted">Weekly average</div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </SpotlightCard>
                  );
                  })
                  )}
                  </AnimatedList>
                  </div>
                  );
                  })()}

      </section>
    </div>

      {/* Create Goal Popup */}
      {showGoalModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }} onClick={() => setShowGoalModal(false)} />
          <div className="w-full max-w-sm bg-black border border-white/[0.1] rounded-3xl overflow-hidden animate-slide-up" style={{ position: "relative" }}>
            <div className="p-5 pb-3">
              <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-4" />
              <div className="flex items-center justify-between">
                <h2 className="font-headline font-bold text-lg text-on-surface">New Goal</h2>
                <button onClick={() => setShowGoalModal(false)} className="text-muted hover:text-on-surface p-1">
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              </div>
            </div>
            <div className="px-5 pb-5 space-y-3">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-muted mb-1.5 block">Goal name</label>
                <input
                  value={newGoalName}
                  onChange={(e) => setNewGoalName(e.target.value)}
                  placeholder="e.g. Emergency Fund"
                  autoFocus
                  className="w-full bg-surface-container p-3 rounded-xl border border-outline-variant focus:border-primary outline-none text-sm placeholder:text-muted/50"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-muted mb-1.5 block">Target amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm">£</span>
                  <input
                    value={newGoalTarget}
                    onChange={(e) => setNewGoalTarget(e.target.value)}
                    type="number"
                    placeholder="1000"
                    className="w-full bg-surface-container p-3 pl-8 rounded-xl border border-outline-variant focus:border-primary outline-none text-sm placeholder:text-muted/50"
                  />
                </div>
              </div>
              <button
                onClick={handleCreateGoal}
                disabled={!newGoalName || !newGoalTarget}
                className="w-full py-3.5 rounded-full bg-primary text-on-primary font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
              >
                <span className="material-symbols-outlined text-base">flag</span>
                Create Goal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Statement Modal */}
      {showUploadModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }} onClick={() => !isUploading && setShowUploadModal(false)} />
          <div className="w-full max-w-sm bg-black border border-white/[0.1] rounded-3xl overflow-hidden animate-slide-up" style={{ position: "relative" }}>
            <div className="p-5 pb-3">
              <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-4" />
              <div className="flex items-center justify-between">
                <h2 className="font-headline font-bold text-lg text-on-surface">
                  {uploadResult ? "Analysis Complete" : "Add Statement"}
                </h2>
                <button onClick={() => !isUploading && (setShowUploadModal(false), setUploadResult(null), setUploadError(null))} className="text-muted hover:text-on-surface p-1">
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              </div>
            </div>
            <div className="px-5 pb-5 space-y-4">
              {!uploadResult && <p className="text-sm text-muted">Upload a photo of your bank statement or receipt to automatically sync transactions.</p>}
              
              {uploadError && (
                <div className="p-3 rounded-xl bg-error/10 border border-error/20 text-error text-xs">
                  {uploadError}
                </div>
              )}

              {isUploading ? (
                <div className="py-8 flex flex-col items-center justify-center gap-4">
                  <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
                  <div className="text-center">
                    <p className="font-bold text-on-surface">Processing document...</p>
                    <p className="text-xs text-muted mt-1">This may take several seconds</p>
                  </div>
                </div>
              ) : uploadResult ? (
                <div className="space-y-4 animate-slide-up">
                  <div className="flex flex-col items-center justify-center py-4 gap-2">
                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-2">
                      <span className="material-symbols-outlined text-3xl text-primary">check_circle</span>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-headline font-bold text-primary">
                        £<AnimatedCounter value={uploadResult.new_balance} />
                      </div>
                      <div className="text-xs uppercase tracking-widest text-muted font-bold">New Balance</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 rounded-2xl bg-surface-container border border-white/[0.05] text-center">
                      <div className="text-xl font-headline font-bold text-on-surface">{uploadResult.added_transactions_count}</div>
                      <div className="text-[10px] uppercase tracking-wider text-muted font-bold mt-1">Transactions</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-surface-container border border-white/[0.05] text-center">
                      <div className="text-xl font-headline font-bold text-on-surface">Success</div>
                      <div className="text-[10px] uppercase tracking-wider text-muted font-bold mt-1">Status</div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                    <div className="flex gap-2 items-start">
                      <span className="material-symbols-outlined text-primary text-lg shrink-0">auto_awesome</span>
                      <p className="text-xs text-on-surface/80 leading-relaxed italic">&quot;{uploadResult.message}&quot;</p>
                    </div>
                  </div>

                  <button
                    onClick={() => { setShowUploadModal(false); setUploadResult(null); }}
                    className="w-full py-3.5 rounded-full bg-primary text-on-primary font-bold text-sm flex items-center justify-center gap-2"
                  >
                    Great, thanks!
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      const input = document.createElement("input");
                      input.type = "file";
                      input.accept = "image/*";
                      input.capture = "environment";
                      input.onchange = (e) => handleFileUpload((e.target as HTMLInputElement).files);
                      input.click();
                    }}
                    className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-surface-container border border-outline-variant hover:border-primary transition-colors"
                  >
                    <span className="material-symbols-outlined text-2xl text-primary">photo_camera</span>
                    <span className="text-xs font-bold">Camera</span>
                  </button>
                  <button
                    onClick={() => {
                      const input = document.createElement("input");
                      input.type = "file";
                      input.accept = "image/*";
                      input.multiple = true;
                      input.onchange = (e) => handleFileUpload((e.target as HTMLInputElement).files);
                      input.click();
                    }}
                    className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-surface-container border border-outline-variant hover:border-primary transition-colors"
                  >
                    <span className="material-symbols-outlined text-2xl text-secondary">photo_library</span>
                    <span className="text-xs font-bold">Gallery</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
