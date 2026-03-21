"use client";

import React, { useState } from "react";
import { GradientAvatar } from "~/components/ui/GradientAvatar";
import { SectionHeader } from "~/components/ui/SectionHeader";
import { Divider } from "~/components/ui/Divider";
import { CardCarousel } from "~/components/ui/CardCarousel";
import { PillButton } from "~/components/ui/PillButton";

type TabChip = "Goals" | "Insights" | "Ghost Subs" | "Learning";

const SHORTCUT_CARDS = [
  { icon: "library_books", label: "Library" },
  { icon: "schedule", label: "Recents" },
  { icon: "monitoring", label: "Life Score" },
];

export default function ProgressPage() {
  const [activeTab, setActiveTab] = useState<TabChip>("Goals");
  const chips: TabChip[] = ["Goals", "Insights", "Ghost Subs", "Learning"];

  return (
    <div className="mx-auto max-w-lg pb-32 min-h-screen bg-background text-on-background font-body">
      {/* Top Right Menu */}
      <div className="flex justify-end px-5 pt-8">
        <button className="text-muted">
          <span className="material-symbols-outlined text-xl">more_horiz</span>
        </button>
      </div>

      {/* Profile Header */}
      <div className="flex flex-col items-center px-5 pb-6">
        <div className="relative mb-4">
          <GradientAvatar size={80} initials="TS" />
          <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center text-sm shadow-lg">
            <span className="material-symbols-outlined text-sm">add</span>
          </button>
        </div>
        <h1 className="text-2xl font-headline font-extrabold text-on-surface">
          Tanush S.
        </h1>
        <p className="text-sm text-muted mt-0.5">@tanush &middot; London, UK</p>
        <div className="flex gap-6 mt-3">
          <div className="text-center">
            <span className="font-bold text-on-surface">42</span>
            <span className="text-xs text-muted ml-1">Following</span>
          </div>
          <div className="text-center">
            <span className="font-bold text-on-surface">128</span>
            <span className="text-xs text-muted ml-1">Followers</span>
          </div>
        </div>
      </div>

      {/* Shortcut Cards */}
      <CardCarousel className="mt-2">
        {SHORTCUT_CARDS.map((card) => (
          <div
            key={card.label}
            className="min-w-[120px] rounded-2xl border border-outline-variant bg-surface-container p-4 flex flex-col items-center gap-2"
          >
            <span className="material-symbols-outlined text-xl text-primary">
              {card.icon}
            </span>
            <span className="text-xs font-semibold text-on-surface">
              {card.label}
            </span>
          </div>
        ))}
      </CardCarousel>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 px-5 mt-5">
        <div className="glass-card p-4 rounded-2xl">
          <div className="flex items-center gap-2 text-secondary mb-1">
            <span className="material-symbols-outlined text-sm">
              local_fire_department
            </span>
            <span className="font-bold text-xs uppercase tracking-widest">
              Streak
            </span>
          </div>
          <div className="text-2xl font-headline font-bold text-on-surface">
            14 Days
          </div>
        </div>
        <div className="glass-card p-4 rounded-2xl">
          <div className="flex items-center gap-2 text-emerald-400 mb-1">
            <span className="material-symbols-outlined text-sm">shield</span>
            <span className="font-bold text-xs uppercase tracking-widest">
              Saved
            </span>
          </div>
          <div className="text-2xl font-headline font-bold text-on-surface">
            £240
          </div>
        </div>
      </div>

      <Divider className="mt-6" />

      {/* FINANCIAL HEALTH (Biometrics) */}
      <SectionHeader title="FINANCIAL HEALTH" />
      <CardCarousel>
        <div className="min-w-[260px] rounded-2xl border border-outline-variant bg-surface-container p-5 flex items-center gap-4 flex-shrink-0">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-secondary/30 to-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-2xl text-secondary">
              account_balance
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-sm text-on-surface">
              Connect Your Bank
            </h4>
            <p className="text-xs text-muted mt-0.5">
              Auto-track spending & subscriptions
            </p>
            <div className="mt-2">
              <PillButton label="Connect" variant="outline" />
            </div>
          </div>
        </div>

        <div className="min-w-[260px] rounded-2xl border border-outline-variant bg-surface-container p-5 flex items-center gap-4 flex-shrink-0">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400/20 to-surface flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-2xl text-emerald-400">
              credit_score
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-sm text-on-surface">
              Credit Score Check
            </h4>
            <p className="text-xs text-muted mt-0.5">
              Free soft-check, no impact
            </p>
            <div className="mt-2">
              <PillButton label="Check" variant="outline" />
            </div>
          </div>
        </div>
      </CardCarousel>

      <Divider className="mt-6" />

      {/* SHARE OPEN — Guest Pass */}
      <SectionHeader title="SHARE OPEN" />
      <div className="px-5">
        <div className="glass-card rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-xl text-primary">
              card_giftcard
            </span>
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-sm text-on-surface">
              Invite a friend
            </h4>
            <p className="text-xs text-muted">
              Share a guest pass to Stride
            </p>
          </div>
          <PillButton label="Share" variant="filled" />
        </div>
      </div>

      <Divider className="mt-6" />

      {/* Tab Chips */}
      <div className="flex gap-2 overflow-x-auto px-5 py-4 scrollbar-hide">
        {chips.map((chip) => (
          <button
            key={chip}
            onClick={() => setActiveTab(chip)}
            className={`whitespace-nowrap px-5 py-2.5 rounded-full font-medium text-sm transition-all border ${
              activeTab === chip
                ? "bg-primary text-on-primary border-primary"
                : "bg-transparent text-muted border-outline-variant hover:border-outline"
            }`}
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <section className="px-5">
        {activeTab === "Goals" && (
          <div className="space-y-4">
            {[
              {
                icon: "flight_takeoff",
                name: "Japan Trip",
                target: "Oct 2026",
                current: 840,
                total: 2000,
                color: "secondary",
              },
              {
                icon: "admin_panel_settings",
                name: "Emergency Fund",
                target: "Flexible",
                current: 1200,
                total: 3000,
                color: "emerald-400",
              },
            ].map((goal) => (
              <div
                key={goal.name}
                className="glass-card p-5 rounded-2xl"
              >
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full bg-${goal.color}/10 flex items-center justify-center`}
                    >
                      <span
                        className={`material-symbols-outlined text-${goal.color}`}
                      >
                        {goal.icon}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-bold text-on-surface">{goal.name}</h3>
                      <div className="text-xs text-muted uppercase tracking-widest">
                        Target: {goal.target}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold text-lg text-${goal.color}`}>
                      £{goal.current}
                    </div>
                    <div className="text-xs text-muted">of £{goal.total.toLocaleString()}</div>
                  </div>
                </div>
                <div className="h-1.5 bg-surface-container-high rounded-full overflow-hidden mb-4">
                  <div
                    className={`h-full bg-${goal.color} rounded-full`}
                    style={{
                      width: `${(goal.current / goal.total) * 100}%`,
                    }}
                  />
                </div>
                <button
                  className={`w-full py-3 rounded-full border border-${goal.color} text-${goal.color} font-bold text-sm hover:bg-${goal.color}/10 transition-colors`}
                >
                  Get AI Strategy
                </button>
              </div>
            ))}
            <button className="w-full p-4 rounded-2xl border border-dashed border-outline text-muted font-bold flex items-center justify-center gap-2 hover:bg-white/5 transition-colors">
              <span className="material-symbols-outlined">add</span>
              Create Goal
            </button>
          </div>
        )}

        {activeTab === "Insights" && (
          <div className="space-y-4">
            {[
              {
                icon: "restaurant",
                text: (
                  <>
                    You spent <strong className="text-primary">£341</strong> on
                    eating out this month —{" "}
                    <strong className="text-error">127% more</strong> than similar
                    students.
                  </>
                ),
              },
              {
                icon: "storefront",
                text: (
                  <>
                    Your top merchant is{" "}
                    <strong className="text-secondary">Pizza Express</strong> (£77
                    total across 5 visits).
                  </>
                ),
              },
              {
                icon: "auto_awesome",
                text: (
                  <>
                    If you cut eating out by 20%, you&apos;d save{" "}
                    <strong className="text-emerald-400">£830/year</strong> towards
                    your Japan Trip.
                  </>
                ),
              },
            ].map((insight, i) => (
              <div key={i} className="glass-card p-5 rounded-2xl">
                <span className="material-symbols-outlined text-primary text-2xl mb-3 block">
                  {insight.icon}
                </span>
                <p className="text-base leading-relaxed text-on-surface">
                  {insight.text}
                </p>
              </div>
            ))}
          </div>
        )}

        {activeTab === "Ghost Subs" && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-error/10 border border-error/20 text-error">
              <div className="font-bold mb-1">Action Required</div>
              <p className="text-sm">
                You could save £350/year by cancelling 2 unused subscriptions.
              </p>
            </div>
            {[
              { name: "PureGym", icon: "fitness_center", cost: "£28.99/mo", unused: "41 days" },
              { name: "Headspace", icon: "self_improvement", cost: "£12.99/mo", unused: "27 days" },
            ].map((sub) => (
              <div
                key={sub.name}
                className="glass-card p-4 rounded-2xl flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-surface">
                      {sub.icon}
                    </span>
                  </div>
                  <div>
                    <div className="font-bold text-on-surface">{sub.name}</div>
                    <div className="text-xs text-muted">
                      {sub.cost} &middot; Unused {sub.unused}
                    </div>
                  </div>
                </div>
                <button className="px-4 py-2 rounded-full border border-error text-error text-sm font-bold hover:bg-error/10">
                  Cancel
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === "Learning" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm font-bold uppercase tracking-widest text-muted">
                Modules
              </div>
              <div className="text-sm font-bold text-primary">7/12 completed</div>
            </div>

            <div className="glass-card p-5 rounded-2xl border-primary/30">
              <div className="flex justify-between items-start mb-4 text-primary">
                <span className="material-symbols-outlined">school</span>
                <div className="text-xs font-bold uppercase tracking-widest bg-primary/20 px-2 py-1 rounded">
                  +50 XP
                </div>
              </div>
              <h3 className="font-headline font-bold text-lg text-on-surface mb-1">
                Compound Interest
              </h3>
              <p className="text-muted text-sm mb-4">
                Learn how your money makes money.
              </p>
              <div className="h-1 bg-surface-container-high rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: "0%" }} />
              </div>
            </div>

            <div className="glass-card p-5 rounded-2xl opacity-60">
              <div className="flex justify-between items-start mb-4 text-muted">
                <span className="material-symbols-outlined">done_all</span>
                <div className="text-xs font-bold uppercase tracking-widest bg-surface-container-high px-2 py-1 rounded">
                  Completed
                </div>
              </div>
              <h3 className="font-headline font-bold text-lg text-on-surface mb-1">
                Budgeting 101
              </h3>
              <p className="text-muted text-sm">The 50/30/20 rule explained.</p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
