"use client";

import React, { useState, useEffect } from "react";
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
  projections, transactions, debrief as debriefAPI, clearAuthToken,
} from "~/lib/api";
import type {
  AuthUser, SavingsGoal, RecurringTransaction, GhostSavingsPotential,
  XPInfo, Streak, SpendingBenchmark,
  ProjectionSummary, CategorySummary, Milestone,
  Debrief,
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
  const [depositGoalId, setDepositGoalId] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState("");

  const [debriefList, setDebriefList] = useState<Debrief[]>([]);
  const [selectedDebrief, setSelectedDebrief] = useState<Debrief | null>(null);
  const [generatingDebrief, setGeneratingDebrief] = useState(false);

  useEffect(() => {
    void Promise.allSettled([
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
    ]).then(([userR, goalsR, ghostR, ghostSavR, xpR, streakR, benchR, projR, txSumR, milestonesR, debriefHistR]) => {
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
      setLoading(false);
    });
  }, []);

  const handleCreateGoal = async () => {
    if (!newGoalName || !newGoalTarget) return;
    try {
      const goal = await goalsAPI.create(newGoalName, Number(newGoalTarget));
      setGoalsList((prev) => [goal, ...prev]);
      setNewGoalName("");
      setNewGoalTarget("");
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
    <div className="app-container pb-32 min-h-screen bg-background text-on-background font-body">
      {/* Profile Header */}
      <div className="flex flex-col items-center px-5 md:px-8 pt-8 pb-4">
        <div className="relative mb-3">
          <ProgressRing progress={xpProgress} size={88} strokeWidth={3} color="#c9b183">
            <GradientAvatar size={72} initials={user?.display_name?.[0] ?? "?"} />
          </ProgressRing>
        </div>
        <h1 className="text-2xl md:text-3xl font-headline font-extrabold text-on-surface">{user?.display_name ?? "User"}</h1>
        <p className="text-sm text-muted mt-0.5">{user?.email}</p>
        <button
          onClick={handleLogout}
          className="mt-3 px-5 py-2 rounded-full border border-outline-variant text-sm font-medium text-muted hover:text-error hover:border-error/50 transition-colors"
        >
          Sign out
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 px-5 md:px-8 mt-2">
        {[
          { value: xpInfo?.level ?? 0, label: "Level", prefix: "Lvl ", color: "text-primary" },
          { value: mainStreak?.current_count ?? user?.current_streak_days ?? 0, label: "Day Streak", color: "text-secondary" },
          { value: projSummary?.total_saved ?? 0, label: "Saved", prefix: "£", color: "text-primary" },
        ].map((stat) => (
          <SpotlightCard key={stat.label} className="p-3 md:p-4 text-center">
            <div className={`text-xl md:text-2xl font-headline font-bold ${stat.color}`}>
              <AnimatedCounter value={stat.value} prefix={stat.prefix} />
            </div>
            <div className="text-[10px] md:text-xs uppercase text-muted font-bold tracking-wider mt-1">{stat.label}</div>
          </SpotlightCard>
        ))}
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

            <SpotlightCard className="p-4 space-y-3">
              <input value={newGoalName} onChange={(e) => setNewGoalName(e.target.value)} placeholder="Goal name" className="w-full bg-surface-container p-3 rounded-xl border border-outline-variant focus:border-primary outline-none text-sm placeholder:text-muted-foreground" />
              <input value={newGoalTarget} onChange={(e) => setNewGoalTarget(e.target.value)} type="number" placeholder="Target amount (£)" className="w-full bg-surface-container p-3 rounded-xl border border-outline-variant focus:border-primary outline-none text-sm placeholder:text-muted-foreground" />
              <button onClick={handleCreateGoal} className="w-full py-3 rounded-full bg-primary text-on-primary font-bold text-sm">Create Goal</button>
            </SpotlightCard>
          </AnimatedList>
        )}

        {/* INSIGHTS */}
        {activeTab === "Insights" && (
          <AnimatedList staggerMs={100} className="space-y-4">
            {spendingBenchmarks.length === 0 ? (
              <p className="text-muted text-center py-10">Complete onboarding to see peer comparisons</p>
            ) : (
              spendingBenchmarks.map((b) => (
                <SpotlightCard key={b.category} className="p-5">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-muted">{b.category.replace(/_/g, " ")}</span>
                    <span className={`text-xs font-bold uppercase px-2 py-1 rounded ${b.status === "above" ? "bg-error/20 text-error" : b.status === "below" ? "bg-primary/20 text-primary" : "bg-secondary/20 text-secondary"}`}>
                      {b.status === "above" ? `+${b.diff_pct.toFixed(0)}%` : b.status === "below" ? `${b.diff_pct.toFixed(0)}%` : "Average"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface font-bold">£<AnimatedCounter value={b.your_spend} /></span>
                    <span className="text-muted">Peer avg: £{b.peer_avg.toFixed(0)}</span>
                  </div>
                </SpotlightCard>
              ))
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
        {activeTab === "Transactions" && (
          <AnimatedList staggerMs={80} className="space-y-4">
            {spendingSummary.length === 0 ? (
              <p className="text-muted text-center py-10">No transactions yet</p>
            ) : (
              spendingSummary.map((cat) => (
                <SpotlightCard key={cat.category} className="p-4 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-on-surface capitalize">{cat.category.replace(/_/g, " ")}</div>
                    <div className="text-xs text-muted">{cat.count} transactions</div>
                  </div>
                  <div className="text-lg font-headline font-bold text-primary">
                    £<AnimatedCounter value={cat.total} />
                  </div>
                </SpotlightCard>
              ))
            )}
          </AnimatedList>
        )}
      </section>
    </div>
  );
}
