"use client";

import React, { useState } from "react";
import { SectionHeader } from "~/components/ui/SectionHeader";
import { Divider } from "~/components/ui/Divider";
import { PillButton } from "~/components/ui/PillButton";
import { CardCarousel } from "~/components/ui/CardCarousel";

type AgentState = {
  agent: string;
  label: string;
  icon: string;
  color: string;
  status: "LOADING" | "COMPLETED";
  summary?: string;
};

type MentorResponse = {
  verdict: string;
  key_number: string;
  action_steps: string[];
};

const decisionTemplates = [
  { icon: "house", title: "Should I move flats?", type: "move_flat" },
  { icon: "credit_card", title: "Should I get a credit card?", type: "credit_card" },
  { icon: "directions_car", title: "Should I buy a car?", type: "buy_car" },
  { icon: "flight_takeoff", title: "Can I afford this trip?", type: "trip" },
  { icon: "schedule", title: "Should I pick up extra shifts?", type: "shifts" },
  { icon: "account_balance", title: "Should I switch banks?", type: "switch_banks" },
];

export default function DecidePage() {
  const [phase, setPhase] = useState<"GRID" | "STREAMING">("GRID");
  const [streamState, setStreamState] = useState<string>("");
  const [agents, setAgents] = useState<AgentState[]>([]);
  const [mentorResponse, setMentorResponse] = useState<MentorResponse | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleDecisionClick = async (title: string, type: string) => {
    setPhase("STREAMING");
    setStreamState("pipeline_started");
    setAgents([]);
    setMentorResponse(null);
    setIsCompleted(false);

    try {
      const response = await fetch("/api/v1/decisions/evaluate/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision_type: type, title }),
      });

      if (!response.body) return;
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const text = decoder.decode(value);
        const lines = text.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const raw = line.slice(6).replace(/###NEWLINE###/g, "\n");
            if (!raw.trim()) continue;
            try {
              const event = JSON.parse(raw) as {
                type: string;
                content?: Record<string, unknown>;
              };
              switch (event.type) {
                case "pipeline_started":
                case "context_building":
                case "context_ready":
                  setStreamState(event.type);
                  break;
                case "agent_started":
                  setAgents((prev) => [
                    ...prev,
                    { ...event.content, status: "LOADING" } as AgentState,
                  ]);
                  break;
                case "agent_completed":
                  setAgents((prev) =>
                    prev.map((a) =>
                      a.agent === event.content?.agent
                        ? ({
                            ...a,
                            status: "COMPLETED",
                            summary: String(event.content?.response),
                          } as AgentState)
                        : a,
                    ),
                  );
                  break;
                case "mentor_started":
                  setStreamState("mentor_started");
                  break;
                case "mentor_completed":
                  setStreamState("mentor_completed");
                  setMentorResponse(
                    event.content?.response as MentorResponse,
                  );
                  break;
                case "pipeline_completed":
                  setIsCompleted(true);
                  break;
              }
            } catch (e) {
              console.error("Parse err", e);
            }
          }
        }
      }
    } catch (e) {
      console.error(e);
      setStreamState("error");
    }
  };

  return (
    <div className="mx-auto max-w-lg pb-32 min-h-screen bg-background text-on-background font-body relative">
      {phase === "GRID" && (
        <>
          {/* Hero Image */}
          <div className="relative mx-4 overflow-hidden rounded-3xl mt-2">
            <div className="relative aspect-[4/3] w-full bg-gradient-to-br from-surface-container-high via-surface to-surface-container">
              {/* Decorative */}
              <div className="absolute top-1/4 right-1/4 w-48 h-48 rounded-full bg-primary/8 blur-3xl" />
              <div className="absolute bottom-1/4 left-1/4 w-32 h-32 rounded-full bg-secondary/10 blur-2xl" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <h1 className="font-headline text-3xl font-extrabold text-primary leading-tight">
                  DECISION STUDIO
                </h1>
                <p className="text-sm text-muted mt-1">
                  Your AI financial advisory council
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 px-5 mt-5">
            <PillButton label="Schedule" variant="outline" />
            <button className="text-sm text-muted hover:text-primary transition-colors underline underline-offset-4">
              How it works
            </button>
          </div>

          <Divider className="mt-6" />

          {/* EXPERIENCES */}
          <SectionHeader title="EXPERIENCES" />
          <CardCarousel>
            {decisionTemplates.map((dec) => (
              <button
                key={dec.type}
                onClick={() => handleDecisionClick(dec.title, dec.type)}
                className="min-w-[180px] rounded-2xl border border-outline-variant bg-surface-container overflow-hidden flex-shrink-0 text-left group hover:border-primary transition-colors"
              >
                <div className="aspect-[4/3] bg-gradient-to-br from-surface-container-high to-surface flex items-center justify-center">
                  <span className="material-symbols-outlined text-3xl text-muted group-hover:text-primary transition-colors">
                    {dec.icon}
                  </span>
                </div>
                <div className="p-3">
                  <h4 className="font-bold text-sm text-on-surface leading-tight group-hover:text-primary transition-colors">
                    {dec.title}
                  </h4>
                </div>
              </button>
            ))}
          </CardCarousel>

          {/* Custom Question */}
          <div className="px-5 mt-6">
            <button
              className="w-full glass-card p-5 rounded-2xl flex items-center justify-between group hover:border-secondary/50 transition-colors text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                  <span className="material-symbols-outlined text-xl text-secondary">
                    edit
                  </span>
                </div>
                <h3 className="font-headline font-bold text-base text-on-surface group-hover:text-secondary transition-colors">
                  Ask something custom...
                </h3>
              </div>
              <span className="material-symbols-outlined text-muted">
                arrow_forward
              </span>
            </button>
          </div>
        </>
      )}

      {phase === "STREAMING" && (
        <div className="px-5 pt-8 pb-20 space-y-6">
          {/* Status */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-headline font-bold text-primary flex items-center justify-center gap-2">
              {(streamState === "pipeline_started" ||
                streamState === "context_building") && (
                <>
                  <span className="material-symbols-outlined animate-spin text-muted">
                    scatter_plot
                  </span>
                  Analyzing profile...
                </>
              )}
              {streamState === "context_ready" && (
                <>
                  <span className="material-symbols-outlined text-emerald-400">
                    check_circle
                  </span>
                  Profile loaded
                </>
              )}
              {agents.length > 0 &&
                streamState !== "mentor_completed" &&
                !isCompleted && (
                  <>
                    <span className="material-symbols-outlined animate-pulse text-secondary">
                      forum
                    </span>
                    Council Debating...
                  </>
                )}
              {(streamState === "mentor_completed" || isCompleted) && (
                <>
                  <span className="material-symbols-outlined text-primary">
                    gavel
                  </span>
                  Verdict Reached
                </>
              )}
            </h2>
          </div>

          {/* Agents */}
          <div className="space-y-4">
            {agents.map((agent) => (
              <div
                key={agent.agent}
                className={`glass-card rounded-2xl p-5 transition-all duration-700 ${
                  agent.status === "LOADING" ? "opacity-70" : "opacity-100"
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${agent.color.replace("text-", "bg-")}/10`}
                  >
                    <span
                      className={`material-symbols-outlined ${agent.color} ${
                        agent.status === "LOADING" ? "animate-pulse" : ""
                      }`}
                    >
                      {agent.icon}
                    </span>
                  </div>
                  <div>
                    <div
                      className={`font-bold uppercase tracking-widest text-xs ${agent.color}`}
                    >
                      {agent.label}
                    </div>
                    <div className="text-xs text-muted">
                      {agent.status === "LOADING" ? "Thinking..." : "Completed"}
                    </div>
                  </div>
                </div>

                {agent.status === "COMPLETED" && (
                  <div className="text-on-surface font-medium border-l-2 border-outline-variant pl-4 mt-2 py-1">
                    &quot;{agent.summary}&quot;
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Mentor Loading */}
          {streamState === "mentor_started" && (
            <div className="pt-6 border-t border-outline-variant flex justify-center">
              <div className="flex items-center gap-3 text-secondary font-bold font-headline animate-pulse">
                <span className="material-symbols-outlined animate-spin">
                  sync
                </span>
                The Mentor is synthesizing...
              </div>
            </div>
          )}

          {/* Mentor Response */}
          {mentorResponse && (
            <div className="mt-6">
              <div className="glass-card border-primary/30 p-6 rounded-2xl shadow-[0_10px_40px_rgba(230,221,197,0.08)]">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 bg-primary text-on-primary rounded-full flex items-center justify-center shadow-lg">
                    <span className="material-symbols-outlined text-2xl">
                      account_balance
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-xs uppercase tracking-widest text-primary">
                      The Mentor&apos;s Verdict
                    </h3>
                    <div className="font-headline font-extrabold text-2xl text-on-surface">
                      {mentorResponse.verdict}
                    </div>
                  </div>
                </div>

                <div className="text-3xl font-headline font-extrabold text-secondary text-center border-y border-outline-variant py-5 mb-5">
                  {mentorResponse.key_number}
                  <span className="text-sm font-body font-medium text-muted block mt-1">
                    Net impact if you proceed
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-xs uppercase tracking-widest text-muted mb-3">
                    Action Steps
                  </h4>
                  <ul className="space-y-3">
                    {mentorResponse.action_steps.map((step, idx) => (
                      <li
                        key={idx}
                        className="flex gap-3 text-sm text-on-surface items-start"
                      >
                        <span className="w-6 h-6 rounded-full bg-surface-container border border-outline-variant flex items-center justify-center font-bold text-xs shrink-0">
                          {idx + 1}
                        </span>
                        <span className="leading-relaxed mt-0.5">{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => setPhase("GRID")}
                  className="flex-1 py-4 border border-outline text-on-surface rounded-full font-bold hover:bg-white/5 transition-colors"
                >
                  Close
                </button>
                <button className="flex-[2] py-4 bg-primary text-on-primary rounded-full font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-xl">
                    bookmark
                  </span>
                  Save Analysis
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
