"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { SpotlightCard } from "~/components/ui/SpotlightCard";
import { AnimatedCounter } from "~/components/ui/AnimatedCounter";
import { AnimatedList } from "~/components/ui/AnimatedList";
import { Divider } from "~/components/ui/Divider";
import { projections } from "~/lib/api";
import type { WealthPath, ProjectionSummary } from "~/lib/api";

// Key milestones to highlight on the timeline
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

export default function WealthTimelinePage() {
  const [wealthPath, setWealthPath] = useState<WealthPath | null>(null);
  const [summary, setSummary] = useState<ProjectionSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void Promise.allSettled([
      projections.wealthPath(20),
      projections.summary(),
    ]).then(([pathR, sumR]) => {
      if (pathR.status === "fulfilled") setWealthPath(pathR.value);
      if (sumR.status === "fulfilled") setSummary(sumR.value);
      setLoading(false);
    });
  }, []);

  // Find the closest data point for each milestone
  const timelinePoints = wealthPath
    ? MILESTONES
        .filter((m) => m.month <= (wealthPath.path.length - 1))
        .map((milestone) => {
          const point = wealthPath.path[milestone.month] ?? wealthPath.path[wealthPath.path.length - 1];
          return point ? { ...milestone, ...point } : null;
        })
        .filter(Boolean) as (typeof MILESTONES[number] & WealthPath["path"][number])[]
    : [];

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
        {wealthPath && (
          <p className="text-sm text-muted mt-1">
            £{wealthPath.monthly_contribution.toFixed(0)}/mo at {(wealthPath.annual_rate * 100).toFixed(0)}% annual return
          </p>
        )}
      </div>

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-3 gap-3 px-5 md:px-8 mt-4">
          {[
            { label: "Saved", value: summary.total_saved, color: "text-secondary" },
            { label: "Monthly", value: summary.monthly_savings_rate, color: "text-primary", prefix: "£" },
            { label: "Potential", value: summary.total_potential, color: "text-muted", prefix: "£" },
          ].map((s) => (
            <SpotlightCard key={s.label} className="p-3 text-center">
              <div className={`text-lg font-headline font-bold ${s.color}`}>
                {s.prefix ?? "£"}<AnimatedCounter value={s.value} />
              </div>
              <div className="text-[10px] uppercase tracking-widest text-muted font-bold mt-0.5">{s.label}</div>
            </SpotlightCard>
          ))}
        </div>
      )}

      <Divider className="mt-6" />

      {/* Timeline */}
      <div className="px-5 md:px-8 mt-6">
        <div className="text-[10px] font-bold uppercase tracking-widest text-muted mb-6">Timeline</div>

        {timelinePoints.length === 0 ? (
          <p className="text-muted text-center py-10">No projection data available</p>
        ) : (
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[19px] top-0 bottom-0 w-px bg-outline-variant" />

            <AnimatedList staggerMs={120} className="space-y-0">
              {timelinePoints.map((point, idx) => {
                const isFirst = idx === 0;
                const isLast = idx === timelinePoints.length - 1;

                return (
                  <div key={point.month} className="relative flex gap-4">
                    {/* Timeline dot */}
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

                    {/* Content card */}
                    <div className={`flex-1 pb-8 ${isLast ? "pb-0" : ""}`}>
                      {/* Date label */}
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
                              <div className="text-sm font-bold text-secondary">
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
                            <div className="text-sm font-bold text-secondary mt-0.5">
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
