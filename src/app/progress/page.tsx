"use client";

import React, { useState, useEffect } from "react";
import { GradientAvatar } from "~/components/ui/GradientAvatar";
import { SectionHeader } from "~/components/ui/SectionHeader";
import { Divider } from "~/components/ui/Divider";
import { CardCarousel } from "~/components/ui/CardCarousel";
import { PillButton } from "~/components/ui/PillButton";
import {
  auth, goals as goalsAPI, ghostSpend, gamification, benchmarks,
  learning, projections, transactions,
} from "~/lib/api";
import type {
  AuthUser, SavingsGoal, RecurringTransaction, GhostSavingsPotential,
  XPInfo, Streak, SpendingBenchmark, LearningModule, LearningProgress,
  ProjectionSummary, CategorySummary,
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
  const [loading, setLoading] = useState(true);

  const [newGoalName, setNewGoalName] = useState("");
  const [newGoalTarget, setNewGoalTarget] = useState("");

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
    ]).then(([userR, goalsR, ghostR, ghostSavR, xpR, streakR, benchR, modR, learnProgR, projR, txSumR]) => {
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

  const handleCompleteModule = async (id: string) => {
    try {
      await learning.complete(id);
      setModules((prev) => prev.map((m) => m.id === id ? { ...m, completed: true } : m));
    } catch (e) { console.error(e); }
  };

  const mainStreak = streaks.find((s) => s.streak_type === "daily_savings") ?? streaks[0];
  const chips: Tab[] = ["Goals", "Insights", "Ghost Subs", "Learning", "Transactions"];

  if (loading) {
    return (
      <div className="mx-auto max-w-lg pb-32 min-h-screen bg-background flex items-center justify-center">
        <span className="material-symbols-outlined text-4xl text-muted animate-spin">progress_activity</span>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg pb-32 min-h-screen bg-background text-on-background font-body">
      {/* Menu */}
      <div className="flex justify-end px-5 pt-8">
        <button className="text-muted"><span className="material-symbols-outlined text-xl">more_horiz</span></button>
      </div>

      {/* Profile Header */}
      <div className="flex flex-col items-center px-5 pb-4">
        <div className="relative mb-3">
          <GradientAvatar size={72} initials={user?.display_name?.[0] ?? "?"} />
        </div>
        <h1 className="text-2xl font-headline font-extrabold text-on-surface">{user?.display_name ?? "User"}</h1>
        <p className="text-sm text-muted mt-0.5">{user?.email}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 px-5 mt-2">
        <div className="glass-card p-3 rounded-2xl text-center">
          <div className="text-xl font-headline font-bold text-primary">Lvl {xpInfo?.level ?? 0}</div>
          <div className="text-[10px] uppercase text-muted font-bold tracking-wider mt-1">{xpInfo?.total_xp ?? 0} XP</div>
        </div>
        <div className="glass-card p-3 rounded-2xl text-center">
          <div className="text-xl font-headline font-bold text-secondary">{mainStreak?.current_count ?? user?.current_streak_days ?? 0}</div>
          <div className="text-[10px] uppercase text-muted font-bold tracking-wider mt-1">Day Streak</div>
        </div>
        <div className="glass-card p-3 rounded-2xl text-center">
          <div className="text-xl font-headline font-bold text-emerald-400">£{projSummary?.total_saved?.toFixed(0) ?? 0}</div>
          <div className="text-[10px] uppercase text-muted font-bold tracking-wider mt-1">Saved</div>
        </div>
      </div>

      {/* Projections */}
      {projSummary && (
        <>
          <Divider className="mt-4" />
          <SectionHeader title="WEALTH PROJECTION" />
          <div className="grid grid-cols-3 gap-3 px-5">
            {[
              { label: "1 Year", value: projSummary.projected_1yr },
              { label: "5 Years", value: projSummary.projected_5yr },
              { label: "10 Years", value: projSummary.projected_10yr },
            ].map((p) => (
              <div key={p.label} className="glass-card p-3 rounded-2xl text-center">
                <div className="text-lg font-headline font-bold text-primary">£{p.value.toFixed(0)}</div>
                <div className="text-[10px] uppercase text-muted font-bold tracking-wider mt-1">{p.label}</div>
              </div>
            ))}
          </div>
        </>
      )}

      <Divider className="mt-4" />

      {/* FINANCIAL HEALTH */}
      <SectionHeader title="FINANCIAL HEALTH" />
      <CardCarousel>
        <div className="min-w-[260px] rounded-2xl border border-outline-variant bg-surface-container p-5 flex items-center gap-4 flex-shrink-0">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-secondary/30 to-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-2xl text-secondary">account_balance</span>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-sm text-on-surface">Connect Your Bank</h4>
            <p className="text-xs text-muted mt-0.5">Auto-track spending</p>
            <div className="mt-2"><PillButton label="Connect" variant="outline" /></div>
          </div>
        </div>
      </CardCarousel>

      <Divider className="mt-4" />

      {/* Tab Chips */}
      <div className="flex gap-2 overflow-x-auto px-5 py-3 scrollbar-hide">
        {chips.map((chip) => (
          <button key={chip} onClick={() => setActiveTab(chip)}
            className={`whitespace-nowrap px-5 py-2.5 rounded-full font-medium text-sm transition-all border ${activeTab === chip ? "bg-primary text-on-primary border-primary" : "bg-transparent text-muted border-outline-variant hover:border-outline"}`}>
            {chip}
          </button>
        ))}
      </div>

      <section className="px-5">
        {/* GOALS */}
        {activeTab === "Goals" && (
          <div className="space-y-4">
            {goalsList.map((goal) => (
              <div key={goal.id} className="glass-card p-5 rounded-2xl">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-on-surface">{goal.name}</h3>
                  <div className="text-right">
                    <div className="font-bold text-lg text-secondary">£{goal.current_amount.toFixed(0)}</div>
                    <div className="text-xs text-muted">of £{goal.target_amount.toFixed(0)}</div>
                  </div>
                </div>
                <div className="h-1.5 bg-surface-container-high rounded-full overflow-hidden mb-2">
                  <div className="h-full bg-secondary rounded-full" style={{ width: `${Math.min((goal.current_amount / goal.target_amount) * 100, 100)}%` }} />
                </div>
                {goal.target_date && <p className="text-xs text-muted">Target: {goal.target_date}</p>}
              </div>
            ))}

            <div className="glass-card p-4 rounded-2xl space-y-3">
              <input value={newGoalName} onChange={(e) => setNewGoalName(e.target.value)} placeholder="Goal name" className="w-full bg-surface-container p-3 rounded-xl border border-outline-variant focus:border-primary outline-none text-sm placeholder:text-muted-foreground" />
              <input value={newGoalTarget} onChange={(e) => setNewGoalTarget(e.target.value)} type="number" placeholder="Target amount (£)" className="w-full bg-surface-container p-3 rounded-xl border border-outline-variant focus:border-primary outline-none text-sm placeholder:text-muted-foreground" />
              <button onClick={handleCreateGoal} className="w-full py-3 rounded-full bg-primary text-on-primary font-bold text-sm">Create Goal</button>
            </div>
          </div>
        )}

        {/* INSIGHTS */}
        {activeTab === "Insights" && (
          <div className="space-y-4">
            {spendingBenchmarks.length === 0 ? (
              <p className="text-muted text-center py-10">Complete onboarding to see peer comparisons</p>
            ) : (
              spendingBenchmarks.map((b) => (
                <div key={b.category} className="glass-card p-5 rounded-2xl">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-muted">{b.category.replace(/_/g, " ")}</span>
                    <span className={`text-xs font-bold uppercase px-2 py-1 rounded ${b.status === "above" ? "bg-error/20 text-error" : b.status === "below" ? "bg-emerald-400/20 text-emerald-400" : "bg-secondary/20 text-secondary"}`}>
                      {b.status === "above" ? `+${b.diff_pct.toFixed(0)}%` : b.status === "below" ? `${b.diff_pct.toFixed(0)}%` : "Average"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface font-bold">£{b.your_spend.toFixed(0)}</span>
                    <span className="text-muted">Peer avg: £{b.peer_avg.toFixed(0)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* GHOST SUBS */}
        {activeTab === "Ghost Subs" && (
          <div className="space-y-4">
            {ghostSavings && ghostSavings.ghost_count > 0 && (
              <div className="p-4 rounded-2xl bg-error/10 border border-error/20 text-error">
                <div className="font-bold mb-1">Action Required</div>
                <p className="text-sm">Cancel {ghostSavings.ghost_count} unused subs to save £{ghostSavings.annual_savings.toFixed(0)}/year</p>
              </div>
            )}
            {ghostList.length === 0 ? (
              <p className="text-muted text-center py-10">No ghost subscriptions found</p>
            ) : (
              ghostList.map((sub) => (
                <div key={sub.id} className="glass-card p-4 rounded-2xl flex items-center justify-between">
                  <div>
                    <div className="font-bold text-on-surface">{sub.merchant_name}</div>
                    <div className="text-xs text-muted">£{sub.typical_amount.toFixed(2)}/{sub.frequency}</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleKeepGhost(sub.id)} className="px-3 py-1.5 rounded-full border border-outline text-xs font-bold text-muted hover:text-on-surface">Keep</button>
                    <button onClick={() => handleFlagGhost(sub.id)} className="px-3 py-1.5 rounded-full border border-error text-error text-xs font-bold hover:bg-error/10">Cancel</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* LEARNING */}
        {activeTab === "Learning" && (
          <div className="space-y-4">
            {learningProg && (
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold uppercase tracking-widest text-muted">Modules</span>
                <span className="text-sm font-bold text-primary">{learningProg.completed}/{learningProg.total}</span>
              </div>
            )}
            {modules.map((mod) => (
              <div key={mod.id} className={`glass-card p-5 rounded-2xl ${mod.completed ? "opacity-60" : ""}`}>
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
              </div>
            ))}
          </div>
        )}

        {/* TRANSACTIONS */}
        {activeTab === "Transactions" && (
          <div className="space-y-4">
            {spendingSummary.length === 0 ? (
              <p className="text-muted text-center py-10">No transactions yet</p>
            ) : (
              spendingSummary.map((cat) => (
                <div key={cat.category} className="glass-card p-4 rounded-2xl flex items-center justify-between">
                  <div>
                    <div className="font-bold text-on-surface capitalize">{cat.category.replace(/_/g, " ")}</div>
                    <div className="text-xs text-muted">{cat.count} transactions</div>
                  </div>
                  <div className="text-lg font-headline font-bold text-primary">£{cat.total.toFixed(0)}</div>
                </div>
              ))
            )}
          </div>
        )}
      </section>
    </div>
  );
}
