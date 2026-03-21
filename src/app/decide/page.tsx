"use client";

import React, { useState, useEffect } from "react";
import { SectionHeader } from "~/components/ui/SectionHeader";
import { Divider } from "~/components/ui/Divider";
import { SpotlightCard } from "~/components/ui/SpotlightCard";
import { AnimatedList } from "~/components/ui/AnimatedList";
import { AgentReasoningCard, PipelineStatus, MentorVerdictCard } from "~/components/ui/AgentReasoning";
import { decisions } from "~/lib/api";
import type { DecisionTemplate, DecisionSummary, DecisionDetail } from "~/lib/api";

type AgentState = {
  agent: string;
  label: string;
  icon: string;
  color: string;
  status: "LOADING" | "COMPLETED";
  summary?: string;
};

function extractSummary(agentRole: string, resp: Record<string, unknown> | undefined): string {
  if (!resp) return "Analysis complete.";
  if (typeof resp.summary === "string" && resp.summary) return resp.summary;
  if (typeof resp.behavioral_prediction === "string") return resp.behavioral_prediction;
  if (typeof resp.worst_case_scenario === "string") return resp.worst_case_scenario;
  if (typeof resp.reasoning === "string") return resp.reasoning;
  if (Array.isArray(resp.benefits) && resp.benefits.length > 0) {
    const b = resp.benefits[0] as Record<string, unknown>;
    return typeof b.point === "string" ? b.point : "Benefits identified.";
  }
  if (Array.isArray(resp.risks) && resp.risks.length > 0) {
    const r = resp.risks[0] as Record<string, unknown>;
    return typeof r.point === "string" ? r.point : "Risks identified.";
  }
  return "Analysis complete.";
}

const AGENT_COLORS: Record<string, string> = {
  analyst: "text-blue-400",
  advocate: "text-green-400",
  critic: "text-red-400",
  behaviorist: "text-purple-400",
  mentor: "text-amber-400",
};

const AGENT_BG_COLORS: Record<string, string> = {
  analyst: "bg-blue-400/10",
  advocate: "bg-green-400/10",
  critic: "bg-red-400/10",
  behaviorist: "bg-purple-400/10",
  mentor: "bg-amber-400/10",
};

type ActionStep = {
  step: number;
  action: string;
  timeframe: string;
};

type MentorResponse = {
  recommendation: string;
  verdict: string;
  key_number: string;
  reasoning: string;
  confidence: number;
  conditions: string[] | null;
  action_steps: (ActionStep | string)[];
  summary?: string;
  action_items?: string[];
};

export default function DecidePage() {
  const [phase, setPhase] = useState<"GRID" | "STREAMING">("GRID");
  const [streamState, setStreamState] = useState<string>("");
  const [agents, setAgents] = useState<AgentState[]>([]);
  const [mentorResponse, setMentorResponse] = useState<MentorResponse | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [templates, setTemplates] = useState<DecisionTemplate[]>([]);
  const [pastDecisions, setPastDecisions] = useState<DecisionSummary[]>([]);
  const [selectedDecision, setSelectedDecision] = useState<DecisionDetail | null>(null);

  useEffect(() => {
    void decisions.templates().then(setTemplates).catch(() => undefined);
    void decisions.list().then(setPastDecisions).catch(() => undefined);
  }, []);

  const iconMap: Record<string, string> = {
    big_purchase: "shopping_bag",
    subscription: "subscriptions",
    move_flat: "house",
    credit_card: "credit_card",
    buy_car: "directions_car",
    trip: "flight_takeoff",
    shifts: "schedule",
    switch_banks: "account_balance",
  };

  const handleDecisionClick = async (title: string, type: string) => {
    setPhase("STREAMING");
    setStreamState("pipeline_started");
    setAgents([]);
    setMentorResponse(null);
    setIsCompleted(false);

    try {
      const response = await decisions.streamEvaluate(type, title);
      if (!response.body) return;
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const chunks = buffer.split("\n\n");
        buffer = chunks.pop() ?? "";

        for (const chunk of chunks) {
          for (const line of chunk.split("\n")) {
            if (!line.startsWith("data: ")) continue;
            const raw = line.slice(6).replace(/###NEWLINE###/g, "\n");
            if (!raw.trim()) continue;
            try {
              const event = JSON.parse(raw) as { type: string; content?: Record<string, unknown> };
              switch (event.type) {
                case "pipeline_started":
                case "context_building":
                case "context_ready":
                  setStreamState(event.type);
                  break;
                case "agent_started":
                  setAgents((prev) => [...prev, { ...event.content, status: "LOADING" } as AgentState]);
                  break;
                case "agent_completed": {
                  const agentName = typeof event.content?.agent === "string" ? event.content.agent : "";
                  const resp = event.content?.response as Record<string, unknown> | undefined;
                  const summary = extractSummary(agentName, resp);
                  setAgents((prev) => {
                    const exists = prev.some((a) => a.agent === agentName);
                    if (!exists) {
                      return [...prev, {
                        agent: agentName,
                        label: typeof event.content?.label === "string" ? event.content.label : agentName,
                        icon: typeof event.content?.icon === "string" ? event.content.icon : "psychology",
                        color: AGENT_COLORS[agentName] ?? "text-muted",
                        status: "COMPLETED" as const,
                        summary,
                      }];
                    }
                    return prev.map((a) =>
                      a.agent === agentName
                        ? { ...a, status: "COMPLETED" as const, summary }
                        : a,
                    );
                  });
                  break;
                }
                case "mentor_started":
                  setStreamState("mentor_started");
                  break;
                case "mentor_completed":
                  setStreamState("mentor_completed");
                  setMentorResponse(event.content?.response as MentorResponse);
                  break;
                case "pipeline_completed":
                  setIsCompleted(true);
                  break;
              }
            } catch (e) { console.error("Parse err", e); }
          }
        }
      }
    } catch (e) {
      console.error(e);
      setStreamState("error");
    }
  };

  const handleViewDecision = async (id: string) => {
    try {
      const detail = await decisions.get(id);
      setSelectedDecision(detail);
    } catch (e) { console.error(e); }
  };

  const templateCards = templates.length > 0
    ? templates.map((t) => ({ icon: iconMap[t.decision_type] ?? "help", title: t.title, type: t.decision_type, description: t.description }))
    : [
        { icon: "house", title: "Should I move flats?", type: "move_flat", description: "" },
        { icon: "credit_card", title: "Should I get a credit card?", type: "credit_card", description: "" },
        { icon: "directions_car", title: "Should I buy a car?", type: "buy_car", description: "" },
        { icon: "flight_takeoff", title: "Can I afford this trip?", type: "trip", description: "" },
        { icon: "schedule", title: "Should I pick up extra shifts?", type: "shifts", description: "" },
        { icon: "account_balance", title: "Should I switch banks?", type: "switch_banks", description: "" },
      ];

  return (
    <div className="app-container pb-32 min-h-screen bg-background text-on-background font-body relative">
      {phase === "GRID" && (
        <>
          {!selectedDecision && (
            <>
              {/* Header */}
              <div className="px-5 md:px-8 pt-10 pb-4">
                <h1 className="font-headline text-3xl md:text-4xl font-extrabold text-primary leading-tight">DECISION STUDIO</h1>
                <p className="text-sm text-muted mt-1">Your AI financial advisory council</p>
              </div>

              {/* Intro Card */}
              <div className="px-5 md:px-8">
                <SpotlightCard className="p-5 flex items-start gap-4">
                  <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary text-xl">psychology</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-on-surface">Big decision? Let your council weigh in.</h3>
                    <p className="text-xs text-muted mt-1">Pick a scenario below and 3 AI agents will analyse your finances, debate the trade-offs, and deliver a verdict.</p>
                  </div>
                </SpotlightCard>
              </div>

              <Divider className="mt-6" />

              {/* EXPERIENCES — consistent grid */}
              <SectionHeader title="EXPERIENCES" />
              <div className="px-5 md:px-8 grid grid-cols-2 gap-3">
                {templateCards.map((dec) => (
                  <button
                    key={dec.type}
                    onClick={() => handleDecisionClick(dec.title, dec.type)}
                    className="rounded-2xl border border-outline-variant bg-surface-container overflow-hidden text-left group hover:border-primary transition-colors"
                  >
                    <div className="h-24 bg-gradient-to-br from-surface-container-high to-surface flex items-center justify-center">
                      <span className="material-symbols-outlined text-3xl text-muted group-hover:text-primary transition-colors">{dec.icon}</span>
                    </div>
                    <div className="p-3">
                      <h4 className="font-bold text-sm text-on-surface leading-tight group-hover:text-primary transition-colors">{dec.title}</h4>
                      {dec.description && <p className="text-xs text-muted mt-1 line-clamp-2">{dec.description}</p>}
                    </div>
                  </button>
                ))}
              </div>

              {/* Past Decisions */}
              {pastDecisions.length > 0 && (
                <>
                  <Divider className="mt-6" />
                  <SectionHeader title="PAST DECISIONS" />
                  <div className="px-5 md:px-8 space-y-3">
                    <AnimatedList staggerMs={100}>
                      {pastDecisions.slice(0, 5).map((d) => (
                        <SpotlightCard key={d.id} className="p-4 flex items-center justify-between cursor-pointer" onClick={() => handleViewDecision(d.id)}>
                          <div>
                            <div className="font-bold text-sm text-on-surface">{d.title}</div>
                            <div className="text-xs text-muted">{new Date(d.created_at).toLocaleDateString()}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className={`text-xs font-bold uppercase px-2 py-1 rounded ${d.status === "completed" ? "bg-primary/20 text-primary" : "bg-secondary/20 text-secondary"}`}>
                              {d.status}
                            </div>
                            <span className="material-symbols-outlined text-muted text-base">chevron_right</span>
                          </div>
                        </SpotlightCard>
                      ))}
                    </AnimatedList>
                  </div>
                </>
              )}
            </>
          )}

          {selectedDecision && (
            <div className="px-5 md:px-8 pt-8 pb-20 space-y-6 max-w-2xl mx-auto">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-headline font-bold text-on-surface">{selectedDecision.title}</h2>
                <div className={`text-xs font-bold uppercase px-2 py-1 rounded ${selectedDecision.status === "completed" ? "bg-primary/20 text-primary" : "bg-secondary/20 text-secondary"}`}>
                  {selectedDecision.status}
                </div>
              </div>

              {selectedDecision.agent_responses?.length > 0 && (
                <>
                  <SectionHeader title="COUNCIL RESPONSES" />
                  <AnimatedList staggerMs={100} className="space-y-3">
                    {selectedDecision.agent_responses.map((agent, i) => (
                      <SpotlightCard key={i} className="p-4">
                        <div className="font-bold text-xs uppercase tracking-widest text-secondary mb-2">{agent.agent_role.replace(/_/g, " ")}</div>
                        <p className="text-sm text-on-surface">{typeof agent.response === "string" ? agent.response : JSON.stringify(agent.response)}</p>
                      </SpotlightCard>
                    ))}
                  </AnimatedList>
                </>
              )}

              {selectedDecision.final_recommendation && (
                <SpotlightCard className="p-6" spotlightColor="rgba(201, 177, 131, 0.2)">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-primary text-on-primary rounded-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-xl">gavel</span>
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-widest text-primary">Verdict</div>
                      <div className="font-headline font-bold text-xl text-on-surface">{(selectedDecision.final_recommendation.verdict ?? selectedDecision.final_recommendation.summary ?? "").replace(/_/g, " ").toUpperCase()}</div>
                    </div>
                  </div>
                  {selectedDecision.final_recommendation.summary && (
                    <p className="text-sm text-muted mb-4">{selectedDecision.final_recommendation.summary}</p>
                  )}
                  {selectedDecision.final_recommendation.action_items?.length > 0 && (
                    <div>
                      <h4 className="font-bold text-xs uppercase tracking-widest text-muted mb-2">Action Items</h4>
                      <ul className="space-y-2">
                        {selectedDecision.final_recommendation.action_items.map((item: string, idx: number) => (
                          <li key={idx} className="flex gap-2 text-sm text-on-surface">
                            <span className="w-5 h-5 rounded-full bg-surface-container border border-outline-variant flex items-center justify-center font-bold text-[10px] shrink-0">{idx + 1}</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </SpotlightCard>
              )}

              <button onClick={() => setSelectedDecision(null)} className="w-full py-4 border border-outline text-on-surface rounded-full font-bold hover:bg-white/5 transition-colors">Back</button>
            </div>
          )}
        </>
      )}

      {phase === "STREAMING" && (
        <div className="px-5 md:px-8 lg:px-12 pt-6 pb-20 space-y-5 max-w-3xl mx-auto">
          {/* Pipeline progress bar */}
          <PipelineStatus
            stage={streamState}
            agentCount={agents.length}
            completedCount={agents.filter((a) => a.status === "COMPLETED").length}
          />

          {/* Agent reasoning cards */}
          <div className="space-y-3">
            {agents.map((agent) => (
              <AgentReasoningCard
                key={agent.agent}
                label={agent.label}
                icon={agent.icon}
                color={AGENT_COLORS[agent.agent] ?? "text-secondary"}
                status={agent.status}
                summary={agent.summary}
              />
            ))}
          </div>

          {/* Mentor synthesizing */}
          {streamState === "mentor_started" && (
            <AgentReasoningCard
              label="The Mentor"
              icon="gavel"
              color="text-primary"
              status="LOADING"
            />
          )}

          {/* Mentor verdict */}
          {mentorResponse && (
            <>
              <MentorVerdictCard
                verdict={(mentorResponse.recommendation ?? mentorResponse.verdict ?? mentorResponse.summary ?? "").replace(/_/g, " ").toUpperCase()}
                keyNumber={mentorResponse.key_number}
                actionSteps={(mentorResponse.action_steps ?? mentorResponse.action_items ?? []).map((step: ActionStep | string | Record<string, unknown>) => {
                  if (typeof step === "string") return { text: step };
                  const s = step as Record<string, unknown>;
                  const rawText = s.action ?? s.description ?? s.step_description ?? s.task ?? s.item ?? (() => {
                    const vals = Object.values(s).filter(v => typeof v === "string" && v.length > 5);
                    return vals[0] ?? JSON.stringify(s);
                  })();
                  const text = typeof rawText === "string" ? rawText : JSON.stringify(rawText);
                  const rawTime = s.timeframe ?? s.timeline ?? s.when ?? "";
                  const timeframe = typeof rawTime === "string" ? rawTime : JSON.stringify(rawTime);
                  return { text, timeframe: timeframe || undefined };
                })}
              />
              <div className="mt-5">
                <button onClick={() => setPhase("GRID")} className="w-full py-4 border border-outline text-on-surface rounded-full font-bold hover:bg-white/5 transition-colors">Close</button>
              </div>
            </>
          )}

          {/* Error state */}
          {streamState === "error" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-error/30 bg-error/5 p-5 text-center">
                <span className="material-symbols-outlined text-error text-2xl block mb-2">error</span>
                <p className="text-sm text-error font-medium">Something went wrong. Please try again.</p>
              </div>
              <button onClick={() => setPhase("GRID")} className="w-full py-4 border border-outline text-on-surface rounded-full font-bold hover:bg-white/5">Back</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
