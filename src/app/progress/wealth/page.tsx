"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { SpotlightCard } from "~/components/ui/SpotlightCard";
import { AnimatedCounter } from "~/components/ui/AnimatedCounter";
import { AnimatedList } from "~/components/ui/AnimatedList";
import { Divider } from "~/components/ui/Divider";
import { projections } from "~/lib/api";
import type { WealthCompareResponse, ScenarioProjection } from "~/lib/api";

const MILESTONES = [
  { month: 0, label: "Now" },
  { month: 3, label: "3 Months" },
  { month: 6, label: "6 Months" },
  { month: 12, label: "1 Year" },
  { month: 24, label: "2 Years" },
  { month: 60, label: "5 Years" },
  { month: 120, label: "10 Years" },
  { month: 240, label: "20 Years" },
];

const TIME_OPTIONS = [
  { label: "5Y", years: 5 },
  { label: "10Y", years: 10 },
  { label: "20Y", years: 20 },
];

export default function WealthTimelinePage() {
  const [data, setData] = useState<WealthCompareResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeScenario, setActiveScenario] = useState("sp_500");
  const [selectedYears, setSelectedYears] = useState(20);

  useEffect(() => {
    void projections.wealthCompare(20).then((res) => {
      setData(res);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const scenario = data?.scenarios.find((s) => s.key === activeScenario);
  const maxMonth = selectedYears * 12;

  // Dynamic milestones based on selected time horizon
  const activeMilestones = MILESTONES.filter((m) => m.month <= maxMonth);

  const timelinePoints = activeMilestones
    .filter((m) => m.month < (scenario?.path ?? []).length)
    .map((milestone) => {
      const point = (scenario?.path ?? [])[milestone.month];
      return point ? { ...milestone, ...point } : null;
    })
    .filter(Boolean) as (typeof MILESTONES[number] & ScenarioProjection["path"][number])[];

  // End values for comparison bar — use the value at selectedYears, not the end of full path
  const endValues = (data?.scenarios ?? []).map((s) => {
    const endPoint = s.path[maxMonth] ?? s.path[s.path.length - 1];
    return {
      key: s.key,
      label: s.label,
      rate: s.annual_rate,
      value: endPoint?.balance ?? 0,
    };
  }).sort((a, b) => b.value - a.value);

  if (loading) {
    return (
      <div className="app-container pb-32 min-h-screen bg-background flex items-center justify-center">
        <span className="material-symbols-outlined text-4xl text-muted animate-spin">progress_activity</span>
      </div>
    );
  }

  return (
    <div className="app-container pb-32 min-h-screen bg-background text-on-background font-body">
      {/* Header */}
      <div className="px-5 md:px-8 pt-10 pb-2">
        <Link href="/progress" className="flex items-center gap-1 text-sm text-muted hover:text-on-surface transition-colors mb-4">
          <span className="material-symbols-outlined text-lg">arrow_back</span>
        </Link>
        <h1 className="font-headline text-3xl md:text-4xl font-extrabold text-primary">WEALTH PROJECTION</h1>
        {data && (
          <p className="text-sm text-muted mt-1">
            £{data.monthly_contribution.toFixed(0)}/mo estimated savings
          </p>
        )}
      </div>

      {/* Scenario chips + time toggle */}
      <div className="px-5 md:px-8 mt-4 space-y-3">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {(data?.scenarios ?? []).map((s) => (
            <button
              key={s.key}
              onClick={() => setActiveScenario(s.key)}
              className={`shrink-0 px-4 py-2 rounded-full border text-xs font-bold transition-colors ${
                activeScenario === s.key
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "bg-white/[0.03] border-outline-variant text-muted hover:border-white/20"
              }`}
            >
              {s.label} ({(s.annual_rate * 100).toFixed(1)}%)
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted flex-1">{scenario?.description ?? ""}</p>
          <div className="flex gap-1 shrink-0 ml-3 bg-white/[0.03] rounded-full p-0.5">
            {TIME_OPTIONS.map((t) => (
              <button
                key={t.years}
                onClick={() => setSelectedYears(t.years)}
                className={`px-3 py-1 rounded-full text-[11px] font-bold transition-colors ${
                  selectedYears === t.years
                    ? "bg-primary/20 text-primary"
                    : "text-muted hover:text-on-surface"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 20-year comparison bar */}
      {endValues.length > 0 && (
        <>
          <Divider className="mt-4" />
          <div className="px-5 md:px-8 mt-4">
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted mb-3">{selectedYears}-Year Comparison</div>
            <div className="space-y-2.5">
              {endValues.map((ev) => {
                const maxVal = endValues[0]?.value ?? 1;
                const pct = Math.max((ev.value / maxVal) * 100, 12);
                const isActive = ev.key === activeScenario;
                return (
                  <button
                    key={ev.key}
                    onClick={() => setActiveScenario(ev.key)}
                    className={`w-full flex items-center gap-3 transition-opacity ${isActive ? "opacity-100" : "opacity-40 hover:opacity-70"}`}
                  >
                    <span className={`text-[10px] font-bold w-20 text-right shrink-0 ${isActive ? "text-primary" : "text-muted"}`}>
                      {ev.label}
                    </span>
                    <div className="flex-1 h-7 bg-white/[0.04] rounded-lg overflow-hidden">
                      <div
                        className={`h-full rounded-lg flex items-center justify-end pr-2.5 transition-all duration-500 ${
                          isActive ? "bg-primary/20" : "bg-white/[0.06]"
                        }`}
                        style={{ width: `${pct}%` }}
                      >
                        <span className={`text-[11px] font-bold whitespace-nowrap ${isActive ? "text-primary" : "text-muted"}`}>
                          £{ev.value >= 1000 ? `${(ev.value / 1000).toFixed(0)}k` : ev.value.toFixed(0)}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      <Divider className="mt-5" />

      {/* Timeline */}
      <div className="px-5 md:px-8 mt-6">
        <div className="text-[10px] font-bold uppercase tracking-widest text-muted mb-6">
          Timeline &middot; {scenario?.label ?? ""}
        </div>

        {timelinePoints.length === 0 ? (
          <p className="text-muted text-center py-10">No projection data available</p>
        ) : (
          <div className="relative">
            <div className="absolute left-[19px] top-0 bottom-0 w-px bg-outline-variant" />

            <AnimatedList staggerMs={120} className="space-y-0">
              {timelinePoints.map((point, idx) => {
                const isFirst = idx === 0;
                const isLast = idx === timelinePoints.length - 1;

                return (
                  <div key={point.month} className="relative flex gap-4">
                    <div className="relative z-10 flex flex-col items-center shrink-0" style={{ width: "40px" }}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isFirst
                          ? "bg-primary text-on-primary"
                          : isLast
                            ? "bg-secondary text-on-secondary"
                            : "bg-surface-container-high border border-outline-variant text-muted"
                      }`}>
                        <span className="material-symbols-outlined text-lg">
                          {isFirst ? "flag" : isLast ? "emoji_events" : "schedule"}
                        </span>
                      </div>
                    </div>

                    <div className={`flex-1 pb-8 ${isLast ? "pb-0" : ""}`}>
                      <div className="inline-block px-3 py-1 rounded-full bg-white/[0.06] mb-3">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface">{point.label}</span>
                      </div>

                      <SpotlightCard className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="text-2xl font-headline font-extrabold text-on-surface">
                              £<AnimatedCounter value={point.balance} />
                            </div>
                            <div className="text-xs text-muted mt-0.5">Projected balance</div>
                          </div>
                          {!isFirst && point.interest_earned > 0 && (
                            <div className="text-right">
                              <div className={`text-sm font-bold ${"text-secondary"}`}>
                                +£<AnimatedCounter value={point.interest_earned} />
                              </div>
                              <div className="text-[10px] text-muted">interest</div>
                            </div>
                          )}
                        </div>

                        <Divider />

                        <div className="grid grid-cols-2 gap-3 mt-3">
                          <div>
                            <div className="text-xs text-muted">Contributed</div>
                            <div className="text-sm font-bold text-on-surface mt-0.5">
                              £<AnimatedCounter value={point.total_contributed} />
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-muted">Interest earned</div>
                            <div className={`text-sm font-bold mt-0.5 ${"text-secondary"}`}>
                              £<AnimatedCounter value={point.interest_earned} />
                            </div>
                          </div>
                        </div>
                      </SpotlightCard>
                    </div>
                  </div>
                );
              })}
            </AnimatedList>
          </div>
        )}
      </div>
    </div>
  );
}
