"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { GradientAvatar } from "~/components/ui/GradientAvatar";
import { SectionHeader } from "~/components/ui/SectionHeader";
import { Divider } from "~/components/ui/Divider";
import { SpotlightCard } from "~/components/ui/SpotlightCard";
import { AnimatedCounter } from "~/components/ui/AnimatedCounter";
import { ProgressRing } from "~/components/ui/ProgressRing";
import { AnimatedList } from "~/components/ui/AnimatedList";
import { authClient } from "~/server/better-auth/client";
import {
  auth, goals as goalsAPI, ghostSpend, gamification, benchmarks,
  learning, projections, transactions, clearAuthToken,
} from "~/lib/api";
import type {
  AuthUser, SavingsGoal, RecurringTransaction, GhostSavingsPotential,
  XPInfo, Streak, SpendingBenchmark, LearningModule, LearningProgress,
  ProjectionSummary, CategorySummary, Milestone, WhatIfProjection, LearningModuleDetail,
} from "~/lib/api";

type Tab = "Goals" | "Insights" | "Ghost Subs" | "Learning" | "Transactions";

export default function ProgressPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Goals");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [goalsList, setGoalsList] = useState<SavingsGoal[]>([]);
  const [ghostList, setGhostList] = useState<RecurringTransaction[]>([]);
  const [ghostSavings, setGhostSavings] = useState<GhostSavingsPotential | null>(null);
  const [xpInfo, setXpInfo] = useState<XPInfo | null>(null);
  const [streaks, setStreaks] = useState<Streak[]>([]);
  const [spendingBenchmarks, setSpendingBenchmarks] = useState<SpendingBenchmark[]>([]);
  const [modules, setModules] = useState<LearningModule[]>([]);
  const [learningProg, setLearningProg] = useState<LearningProgress | null>(null);
  const [projSummary, setProjSummary] = useState<ProjectionSummary | null>(null);
  const [spendingSummary, setSpendingSummary] = useState<CategorySummary[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);

  const [newGoalName, setNewGoalName] = useState("");
  const [newGoalTarget, setNewGoalTarget] = useState("");
  const [depositGoalId, setDepositGoalId] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState("");

  const [whatIfAmount, setWhatIfAmount] = useState("");
  const [whatIfResult, setWhatIfResult] = useState<WhatIfProjection | null>(null);
  const [whatIfRecurring, setWhatIfRecurring] = useState(true);
  const [selectedModule, setSelectedModule] = useState<LearningModuleDetail | null>(null);

  useEffect(() => {
    Promise.allSettled([
      auth.me(),
      goalsAPI.list(),
      ghostSpend.list(),
      ghostSpend.savingsPotential(),
      gamification.xp(),
      gamification.streaks(),
      benchmarks.spending(),
      learning.modules(),
      learning.progress(),
      projections.summary(),
      transactions.summary(),
      gamification.milestones(),
    ]).then(([userR, goalsR, ghostR, ghostSavR, xpR, streakR, benchR, modR, learnProgR, projR, txSumR, milestonesR]) => {
      if (userR.status === "fulfilled") setUser(userR.value);
      if (goalsR.status === "fulfilled") setGoalsList(goalsR.value);
      if (ghostR.status === "fulfilled") setGhostList(ghostR.value);
      if (ghostSavR.status === "fulfilled") setGhostSavings(ghostSavR.value);
      if (xpR.status === "fulfilled") setXpInfo(xpR.value);
      if (streakR.status === "fulfilled") setStreaks(streakR.value);
      if (benchR.status === "fulfilled") setSpendingBenchmarks(benchR.value);
      if (modR.status === "fulfilled") setModules(modR.value);
      if (learnProgR.status === "fulfilled") setLearningProg(learnProgR.value);
      if (projR.status === "fulfilled") setProjSummary(projR.value);
      if (txSumR.status === "fulfilled") setSpendingSummary(txSumR.value);
      if (milestonesR.status === "fulfilled") setMilestones(milestonesR.value);
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

  const handleWhatIf = async () => {
    const amt = Number(whatIfAmount);
    if (!amt || amt <= 0) return;
    try {
      const result = await projections.whatIf(amt, whatIfRecurring);
      setWhatIfResult(result);
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

  const handleViewModule = async (id: string) => {
    try {
      const detail = await learning.get(id);
      setSelectedModule(detail);
    } catch (e) { console.error(e); }
  };

  const handleCompleteModule = async (id: string) => {
    try {
      await learning.complete(id);
      setModules((prev) => prev.map((m) => m.id === id ? { ...m, completed: true } : m));
    } catch (e) { console.error(e); }
  };

  const router = useRouter();

  const handleLogout = async () => {
    clearAuthToken();
    await authClient.signOut().catch(() => {});
    router.push("/sign-in");
  };

  const mainStreak = streaks.find((s) => s.streak_type === "daily_savings") ?? streaks[0];
  const chips: Tab[] = ["Goals", "Insights", "Ghost Subs", "Learning", "Transactions"];

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
          <SectionHeader title="WEALTH PROJECTION" />
          <div className="grid grid-cols-3 gap-3 px-5 md:px-8">
            {[
              { label: "1 Year", value: projSummary.projected_1yr },
              { label: "5 Years", value: projSummary.projected_5yr },
              { label: "10 Years", value: projSummary.projected_10yr },
            ].map((p) => (
              <SpotlightCard key={p.label} className="p-3 md:p-4 text-center">
                <div className="text-lg md:text-xl font-headline font-bold text-primary">
                  £<AnimatedCounter value={p.value} />
                </div>
                <div className="text-[10px] md:text-xs uppercase text-muted font-bold tracking-wider mt-1">{p.label}</div>
              </SpotlightCard>
            ))}
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
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="font-bold text-lg text-secondary">
                          £<AnimatedCounter value={goal.current_amount} />
                        </div>
                        <div className="text-xs text-muted">of £{goal.target_amount.toFixed(0)}</div>
                      </div>
                      <button
                        onClick={() => handleDeleteGoal(goal.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-full border border-outline-variant text-muted hover:text-error hover:border-error/50 transition-colors"
                        title="Delete goal"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </div>
                  <div className="h-1.5 bg-surface-container-high rounded-full overflow-hidden mb-2">
                    <div className="h-full bg-secondary rounded-full transition-all duration-1000" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    {goal.target_date && <p className="text-xs text-muted">Target: {goal.target_date}</p>}
                    {!goal.target_date && <span />}
                    {!isDepositing && (
                      <button
                        onClick={() => { setDepositGoalId(goal.id); setDepositAmount(""); }}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-primary text-primary text-xs font-bold hover:bg-primary/10 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]">add</span>
                        Deposit
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

        {/* LEARNING */}
        {activeTab === "Learning" && (
          <div className="space-y-4">
            {learningProg && (
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold uppercase tracking-widest text-muted">Modules</span>
                <span className="text-sm font-bold text-primary">
                  <AnimatedCounter value={learningProg.completed} />/{learningProg.total}
                </span>
              </div>
            )}
            <AnimatedList staggerMs={100} className="space-y-4">
              {modules.map((mod) => (
                <SpotlightCard key={mod.id} className={`p-5 cursor-pointer ${mod.completed ? "opacity-60" : ""}`} onClick={() => handleViewModule(mod.id)}>
                  <div className="flex justify-between items-start mb-3">
                    <span className="material-symbols-outlined text-primary">{mod.completed ? "done_all" : "school"}</span>
                    <div className="text-xs font-bold uppercase tracking-widest bg-primary/20 px-2 py-1 rounded text-primary">+{mod.xp_reward} XP</div>
                  </div>
                  <h3 className="font-headline font-bold text-lg text-on-surface mb-1">{mod.title}</h3>
                  <p className="text-muted text-xs mb-3">Topic: {mod.topic} &middot; Difficulty: {mod.difficulty}</p>
                  {!mod.completed && (
                    <button onClick={() => handleCompleteModule(mod.id)} className="w-full py-2.5 rounded-full border border-primary text-primary font-bold text-sm hover:bg-primary/10">
                      Complete Module
                    </button>
                  )}
                </SpotlightCard>
              ))}
            </AnimatedList>
            {selectedModule && (
              <div className="mt-4 space-y-3">
                <Divider />
                <div className="flex items-center justify-between">
                  <h3 className="font-headline font-bold text-lg text-on-surface">{selectedModule.title}</h3>
                  <button onClick={() => setSelectedModule(null)} className="text-xs font-bold text-muted hover:text-on-surface">Close</button>
                </div>
                <SpotlightCard className="p-5">
                  <div className="prose prose-invert prose-sm max-w-none text-on-surface text-sm leading-relaxed whitespace-pre-wrap">{selectedModule.content}</div>
                </SpotlightCard>
                {!selectedModule.completed && (
                  <button
                    onClick={() => { handleCompleteModule(selectedModule.id); setSelectedModule({ ...selectedModule, completed: true }); }}
                    className="w-full py-3 rounded-full bg-primary text-on-primary font-bold text-sm"
                  >
                    Mark Complete (+{selectedModule.xp_reward} XP)
                  </button>
                )}
              </div>
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
