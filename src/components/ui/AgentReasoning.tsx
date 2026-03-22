"use client";

import React, { useState, useEffect } from "react";
import { cn } from "~/lib/utils";

/* ── Thinking Dots ── */
export function ThinkingDots({ className = "" }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"
          style={{ animationDelay: `${i * 200}ms` }}
        />
      ))}
    </span>
  );
}

/* ── Shimmer Bar (loading placeholder) ── */
export function ShimmerBar({ className = "" }: { className?: string }) {
  return (
    <div className={cn("relative overflow-hidden rounded bg-white/[0.06] h-3", className)}>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent animate-[shimmer_2s_ease-in-out_infinite]" />
    </div>
  );
}

/* ── Agent Reasoning Card ── */
interface AgentReasoningProps {
  label: string;
  icon: string;
  color: string;
  status: "LOADING" | "COMPLETED";
  summary?: string;
  defaultOpen?: boolean;
}

export function AgentReasoningCard({
  label,
  icon,
  color,
  status,
  summary,
  defaultOpen,
}: AgentReasoningProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen ?? status === "LOADING");

  // Auto-expand when loading, auto-collapse shortly after completion
  useEffect(() => {
    if (status === "LOADING") {
      setIsOpen(true);
    }
  }, [status]);

  const isLoading = status === "LOADING";
  const colorClass = color || "text-secondary";

  return (
    <div className={cn(
      "rounded-2xl border bg-black overflow-hidden transition-all duration-500",
      isLoading ? "border-white/[0.12]" : "border-white/[0.08]",
    )}>
      {/* Header / Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 p-4 text-left transition-colors hover:bg-white/[0.02]"
      >
        {/* Agent icon */}
        <div className={cn(
          "w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors",
          isLoading ? "bg-white/[0.08]" : "bg-white/[0.05]",
        )}>
          <span className={cn(
            "material-symbols-outlined text-lg",
            colorClass,
            isLoading && "animate-pulse",
          )}>
            {icon}
          </span>
        </div>

        {/* Label + status */}
        <div className="flex-1 min-w-0">
          <div className={cn("font-bold uppercase tracking-widest text-[11px]", colorClass)}>
            {label}
          </div>
          <div className="text-[11px] text-muted flex items-center gap-1.5">
            {isLoading ? (
              <>Reasoning <ThinkingDots className="text-muted" /></>
            ) : (
              <>
                <span className="material-symbols-outlined text-primary text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                Complete
              </>
            )}
          </div>
        </div>

        {/* Expand/collapse chevron */}
        <span className={cn(
          "material-symbols-outlined text-muted text-lg transition-transform duration-300",
          isOpen && "rotate-180",
        )}>
          expand_more
        </span>
      </button>

      {/* Content */}
      <div className={cn(
        "overflow-hidden transition-all duration-400 ease-out",
        isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0",
      )}>
        <div className="px-4 pb-4 pt-0">
          {isLoading ? (
            <div className="space-y-2.5 pl-12">
              <ShimmerBar className="w-full" />
              <ShimmerBar className="w-4/5" />
              <ShimmerBar className="w-3/5" />
            </div>
          ) : summary ? (
            <div className="pl-12">
              <p className="text-sm text-on-surface/90 leading-relaxed italic">
                &ldquo;{summary}&rdquo;
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/* ── Pipeline Status Bar ── */
interface PipelineStatusProps {
  stage: string;
  agentCount: number;
  completedCount: number;
}

export function PipelineStatus({ stage, agentCount, completedCount }: PipelineStatusProps) {
  const stages = [
    { key: "context", label: "Profile", icon: "person_search" },
    { key: "agents", label: "Council", icon: "forum" },
    { key: "mentor", label: "Verdict", icon: "gavel" },
  ];

  const currentStageIndex =
    stage === "pipeline_started" || stage === "context_building" ? 0
    : stage === "context_ready" || (agentCount > 0 && stage !== "mentor_started" && stage !== "mentor_completed") ? 1
    : stage === "mentor_started" || stage === "mentor_completed" ? 2
    : 0;

  return (
    <div className="flex items-center justify-center gap-2 py-4">
      {stages.map((s, i) => {
        const isActive = i === currentStageIndex;
        const isDone = i < currentStageIndex || (i === 2 && stage === "mentor_completed");
        const isAgentStage = i === 1;

        return (
          <React.Fragment key={s.key}>
            {i > 0 && (
              <div className={cn(
                "w-8 h-px transition-colors duration-500",
                isDone ? "bg-primary" : "bg-outline-variant",
              )} />
            )}
            <div className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-500",
              isDone ? "text-primary bg-primary/10" :
              isActive ? "text-on-surface bg-white/[0.06]" :
              "text-muted-foreground",
            )}>
              <span className={cn(
                "material-symbols-outlined text-sm",
                isActive && !isDone && "animate-pulse",
              )} style={isDone ? { fontVariationSettings: "'FILL' 1" } : undefined}>
                {isDone ? "check_circle" : s.icon}
              </span>
              <span>{s.label}</span>
              {isAgentStage && agentCount > 0 && (
                <span className="text-muted">
                  {completedCount}/{agentCount}
                </span>
              )}
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* ── Mentor Verdict Card ── */
interface MentorVerdictProps {
  verdict: string;
  keyNumber?: string;
  actionSteps: { text: string; timeframe?: string }[];
}

export function MentorVerdictCard({ verdict, keyNumber, actionSteps }: MentorVerdictProps) {
  const [showSteps, setShowSteps] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowSteps(true), 600);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="rounded-2xl border border-primary/20 bg-black overflow-hidden animate-slide-up">
      {/* Verdict header */}
      <div className="p-6 md:p-8 border-b border-white/[0.06]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-2xl">gavel</span>
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">The Mentor&apos;s Verdict</div>
            <div className="font-headline font-extrabold text-2xl md:text-3xl text-on-surface">{verdict}</div>
          </div>
        </div>
      </div>

      {/* Key number */}
      {keyNumber && (
        <div className="px-6 md:px-8 py-5 border-b border-white/[0.06] text-center">
          <div className="text-3xl md:text-4xl font-headline font-extrabold text-secondary">{keyNumber}</div>
          <div className="text-xs text-muted mt-1">Net impact if you proceed</div>
        </div>
      )}

      {/* Action steps */}
      {actionSteps.length > 0 && (
        <div className="p-6 md:p-8">
          <h4 className="font-bold text-[10px] uppercase tracking-widest text-muted mb-4">Action Steps</h4>
          <ul className="space-y-3">
            {actionSteps.map((step, idx) => (
              <li
                key={idx}
                className="flex gap-3 text-sm text-on-surface items-start transition-all duration-500"
                style={{
                  opacity: showSteps ? 1 : 0,
                  transform: showSteps ? "translateX(0)" : "translateX(-12px)",
                  transitionDelay: `${idx * 120}ms`,
                }}
              >
                <span className="w-6 h-6 rounded-full bg-surface-container border border-outline-variant flex items-center justify-center font-bold text-[10px] shrink-0">
                  {idx + 1}
                </span>
                <div className="leading-relaxed mt-0.5">
                  <span>{step.text}</span>
                  {step.timeframe && <span className="text-xs text-muted ml-2">({step.timeframe})</span>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
