"use client";

import React, { useState, useEffect } from "react";
import { SectionHeader } from "~/components/ui/SectionHeader";
import { Divider } from "~/components/ui/Divider";
import { SpotlightCard } from "~/components/ui/SpotlightCard";
import { AnimatedList } from "~/components/ui/AnimatedList";
import { AgentReasoningCard, PipelineStatus, MentorVerdictCard } from "~/components/ui/AgentReasoning";
import { decisions, goals, learning } from "~/lib/api";
import type { DecisionTemplate, DecisionSummary, DecisionDetail, LearningModule, LearningModuleDetail } from "~/lib/api";

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

// ─── Helpers for goal extraction ───
function extractAmount(text: string): number | null {
  const match = /£([\d,]+(?:\.\d{2})?)/.exec(text);
  return match?.[1] ? parseFloat(match[1].replace(",", "")) : null;
}

function extractMonths(timeframe: string): number | null {
  const monthMatch = /(\d+)\s*month/i.exec(timeframe);
  if (monthMatch?.[1]) return parseInt(monthMatch[1]);
  const yearMatch = /(\d+)\s*year/i.exec(timeframe);
  if (yearMatch?.[1]) return parseInt(yearMatch[1]) * 12;
  const weekMatch = /(\d+)\s*week/i.exec(timeframe);
  if (weekMatch?.[1]) return Math.ceil(parseInt(weekMatch[1]) / 4);
  const dayMatch = /(\d+)\s*day/i.exec(timeframe);
  if (dayMatch?.[1]) return Math.ceil(parseInt(dayMatch[1]) / 30);
  return null;
}

function computeTargetDate(months: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  return d.toISOString().split("T")[0] ?? "";
}

const DECISION_TO_LEARNING_TOPIC: Record<string, string> = {
  move_flat: "budgeting",
  get_credit_card: "credit_scores",
  buy_car: "budgeting",
  afford_trip: "budgeting",
  extra_shifts: "budgeting",
  switch_banks: "budgeting",
  start_investing: "investing",
  custom: "compound_interest",
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

const PARAM_FIELDS: Record<string, { label: string; key: string; prefix?: string; placeholder: string }[]> = {
  move_flat: [
    { label: "New rent (monthly)", key: "new_rent", prefix: "£", placeholder: "500" },
    { label: "Current rent (monthly)", key: "current_rent", prefix: "£", placeholder: "800" },
    { label: "Moving costs", key: "moving_costs", prefix: "£", placeholder: "500" },
  ],
  buy_car: [
    { label: "Car price", key: "car_price", prefix: "£", placeholder: "5000" },
    { label: "Insurance (monthly)", key: "insurance_monthly", prefix: "£", placeholder: "150" },
    { label: "Fuel (monthly)", key: "fuel_monthly", prefix: "£", placeholder: "80" },
  ],
  afford_trip: [
    { label: "Destination", key: "destination", placeholder: "Barcelona" },
    { label: "Total trip cost", key: "total_cost", prefix: "£", placeholder: "400" },
    { label: "When?", key: "when", placeholder: "next month" },
  ],
  get_credit_card: [
    { label: "Credit limit", key: "credit_limit", prefix: "£", placeholder: "1000" },
    { label: "Purpose", key: "purpose", placeholder: "build credit / emergency / spending" },
  ],
  extra_shifts: [
    { label: "Extra hours per week", key: "extra_hours_weekly", placeholder: "8" },
    { label: "Hourly rate", key: "hourly_rate", prefix: "£", placeholder: "11.44" },
  ],
  switch_banks: [
    { label: "Current bank", key: "current_bank", placeholder: "Barclays" },
    { label: "Considering", key: "considering", placeholder: "Monzo" },
  ],
  start_investing: [
    { label: "Monthly amount to invest", key: "monthly_amount", prefix: "£", placeholder: "50" },
    { label: "Investment type", key: "investment_type", placeholder: "stocks and shares ISA / index fund" },
    { label: "Time horizon", key: "time_horizon", placeholder: "5 years" },
  ],
  custom: [
    { label: "What's your question?", key: "custom_prompt", placeholder: "Should I start investing £50/month?" },
    { label: "Amount involved (if any)", key: "amount", prefix: "£", placeholder: "50" },
  ],
};

export default function DecidePage() {
  const [phase, setPhase] = useState<"GRID" | "INPUT" | "STREAMING">("GRID");
  const [streamState, setStreamState] = useState<string>("");
  const [agents, setAgents] = useState<AgentState[]>([]);
  const [mentorResponse, setMentorResponse] = useState<MentorResponse | null>(null);
  const [templates, setTemplates] = useState<DecisionTemplate[]>([]);
  const [pastDecisions, setPastDecisions] = useState<DecisionSummary[]>([]);
  const [selectedDecision, setSelectedDecision] = useState<DecisionDetail | null>(null);

  const [pendingDecision, setPendingDecision] = useState<{ title: string; type: string } | null>(null);
  const [paramValues, setParamValues] = useState<Record<string, string>>({});

  // Goal creation sheet
  const [showGoalSheet, setShowGoalSheet] = useState(false);
  const [goalName, setGoalName] = useState("");
  const [goalAmount, setGoalAmount] = useState("");
  const [goalDate, setGoalDate] = useState("");
  const [goalCreating, setGoalCreating] = useState(false);
  const [goalCreated, setGoalCreated] = useState(false);

  // Related learning
  const [relatedModules, setRelatedModules] = useState<LearningModule[]>([]);
  const [selectedModule, setSelectedModule] = useState<LearningModuleDetail | null>(null);

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
    afford_trip: "flight_takeoff",
    trip: "flight_takeoff",
    extra_shifts: "schedule",
    shifts: "schedule",
    switch_banks: "account_balance",
    start_investing: "trending_up",
    custom: "edit_note",
  };

  const handleTemplateClick = (title: string, type: string) => {
    setPendingDecision({ title, type });
    setParamValues({});
    setPhase("INPUT");
  };

  const handleStartDecision = async () => {
    if (!pendingDecision) return;
    const { title, type } = pendingDecision;

    const params: Record<string, unknown> = {};
    let customPrompt: string | undefined;

    for (const [key, val] of Object.entries(paramValues)) {
      if (!val.trim()) continue;
      if (key === "custom_prompt") {
        customPrompt = val;
      } else {
        const num = parseFloat(val);
        params[key] = isNaN(num) ? val : num;
      }
    }

    setPhase("STREAMING");
    setStreamState("pipeline_started");
    setAgents([]);
    setMentorResponse(null);
    setShowGoalSheet(false);
    setGoalCreated(false);
    setRelatedModules([]);
    setSelectedModule(null);

    try {
      const finalTitle = type === "custom" && customPrompt ? customPrompt : title;
      const response = await decisions.streamEvaluate(
        type, finalTitle, customPrompt,
        Object.keys(params).length > 0 ? params : undefined,
      );
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

  // Open the goal creation sheet with auto-detected values from mentor response
  const handleStartPlanning = () => {
    if (!mentorResponse) return;

    // Extract amount from key_number or action steps
    let amount: number | null = null;
    if (mentorResponse.key_number) {
      amount = extractAmount(mentorResponse.key_number);
    }
    if (!amount) {
      for (const step of mentorResponse.action_steps ?? []) {
        const text = typeof step === "string" ? step : step.action ?? "";
        amount = extractAmount(text);
        if (amount) break;
      }
    }

    // Extract timeframe from action steps
    let months: number | null = null;
    for (const step of mentorResponse.action_steps ?? []) {
      const tf = typeof step === "string" ? step : step.timeframe ?? "";
      months = extractMonths(tf);
      if (months) break;
    }
    // Also try from key_number
    if (!months && mentorResponse.key_number) {
      months = extractMonths(mentorResponse.key_number);
    }

    // Build goal name from decision title or first action step
    const firstAction = mentorResponse.action_steps?.[0];
    const actionText = typeof firstAction === "string" ? firstAction : firstAction?.action ?? "";
    const name = pendingDecision?.title ?? actionText ?? "Savings Goal";

    setGoalName(name);
    setGoalAmount(amount ? String(amount) : "");
    setGoalDate(months ? computeTargetDate(months) : computeTargetDate(12));
    setGoalCreated(false);
    setShowGoalSheet(true);
  };

  const handleCreateGoal = async () => {
    const amt = parseFloat(goalAmount);
    if (!goalName.trim() || isNaN(amt) || amt <= 0) return;
    setGoalCreating(true);
    try {
      await goals.create(goalName.trim(), amt, goalDate || undefined);
      setGoalCreated(true);
      setShowGoalSheet(false);
    } catch (e) {
      console.error(e);
    } finally {
      setGoalCreating(false);
    }
  };

  // Fetch related learning modules when mentor completes
  useEffect(() => {
    if (!mentorResponse || !pendingDecision) return;
    const topic = DECISION_TO_LEARNING_TOPIC[pendingDecision.type] ?? "compound_interest";
    void learning.modules(topic).then((mods) => {
      setRelatedModules(mods.filter((m) => !m.completed).slice(0, 2));
    }).catch(() => undefined);
  }, [mentorResponse, pendingDecision]);

  const handleViewModule = async (id: string) => {
    try {
      const detail = await learning.get(id);
      setSelectedModule(detail);
    } catch (e) { console.error(e); }
  };

  const handleCompleteModule = async (id: string) => {
    try {
      await learning.complete(id);
      setRelatedModules((prev) => prev.map((m) => m.id === id ? { ...m, completed: true } : m));
      if (selectedModule?.id === id) setSelectedModule({ ...selectedModule, completed: true });
    } catch (e) { console.error(e); }
  };

  const imageMap: Record<string, string> = {
    move_flat: "/decisions/move_flat.jpg",
    get_credit_card: "/decisions/get_credit_card.jpg",
    credit_card: "/decisions/get_credit_card.jpg",
    buy_car: "/decisions/buy_car.jpg",
    afford_trip: "/decisions/afford_trip.jpg",
    extra_shifts: "/decisions/extra_shifts.jpg",
    switch_banks: "/decisions/switch_banks.jpg",
    start_investing: "/decisions/start_investing.jpg",
  };

  const templateCards = [
    ...(templates.length > 0
      ? templates.map((t) => ({ icon: iconMap[t.decision_type] ?? "help", image: imageMap[t.decision_type], title: t.title, type: t.decision_type, description: t.description }))
      : [
          { icon: "house", image: imageMap.move_flat, title: "Should I move to a different flat?", type: "move_flat", description: "Evaluate whether moving to a new flat makes financial sense" },
          { icon: "credit_card", image: imageMap.credit_card, title: "Should I get a credit card?", type: "credit_card", description: "Evaluate whether getting a credit card is right for you" },
          { icon: "directions_car", image: imageMap.buy_car, title: "Should I buy a car?", type: "buy_car", description: "Compare the costs of car ownership vs your current setup" },
          { icon: "flight_takeoff", image: imageMap.afford_trip, title: "Can I afford this trip?", type: "afford_trip", description: "Check if a trip fits your budget without derailing your goals" },
          { icon: "schedule", image: imageMap.extra_shifts, title: "Should I pick up extra shifts?", type: "extra_shifts", description: "Weigh the financial benefit against study time and wellbeing" },
          { icon: "account_balance", image: imageMap.switch_banks, title: "Should I switch banks?", type: "switch_banks", description: "Compare your current banking setup against alternatives" },
        ]),
  ];

  return (
    <div className="app-container pb-32 min-h-screen bg-background text-on-background font-body relative">
      {phase === "GRID" && (
        <>
          {!selectedDecision && (
            <>
              {/* Header */}
              <div className="px-5 md:px-8 pt-10 pb-4 flex items-start justify-between">
                <div>
                  <h1 className="font-headline text-3xl md:text-4xl font-extrabold text-primary leading-tight">DECISION STUDIO</h1>
                  <p className="text-sm text-muted mt-1">Your AI financial advisory council</p>
                </div>
                <button
                  onClick={() => handleTemplateClick("Ask something custom...", "custom")}
                  className="w-11 h-11 rounded-full border border-outline-variant flex items-center justify-center text-muted hover:text-primary hover:border-primary/50 transition-colors shrink-0 mt-1"
                  title="Ask a custom question"
                >
                  <span className="material-symbols-outlined text-xl">chat_bubble</span>
                </button>
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
                    onClick={() => handleTemplateClick(dec.title, dec.type)}
                    className="rounded-2xl border border-outline-variant bg-surface-container overflow-hidden text-left group hover:border-primary transition-colors"
                  >
                    <div className="h-28 relative overflow-hidden">
                      {dec.image ? (
                        <>
                          <img src={dec.image} alt={dec.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                          <div className="absolute inset-0 bg-gradient-to-t from-surface-container via-surface-container/60 to-transparent" />
                        </>
                      ) : (
                        <div className="h-full bg-gradient-to-br from-surface-container-high to-surface flex items-center justify-center">
                          <span className="material-symbols-outlined text-3xl text-muted group-hover:text-primary transition-colors">{dec.icon}</span>
                        </div>
                      )}
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

      {phase === "INPUT" && pendingDecision && (
        <div className="px-5 md:px-8 pt-8 pb-20 max-w-lg mx-auto space-y-6 animate-slide-up">
          <button onClick={() => setPhase("GRID")} className="flex items-center gap-1 text-sm text-muted hover:text-on-surface">
            <span className="material-symbols-outlined text-base">arrow_back</span> Back
          </button>

          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <span className="material-symbols-outlined text-primary text-2xl">{iconMap[pendingDecision.type] ?? "help"}</span>
            </div>
            <h2 className="font-headline font-bold text-xl text-on-surface">{pendingDecision.title}</h2>
            <p className="text-xs text-muted mt-1">Add details so the council can give specific advice</p>
          </div>

          <div className="space-y-4">
            {(PARAM_FIELDS[pendingDecision.type] ?? PARAM_FIELDS.custom ?? []).map((field) => (
              <div key={field.key}>
                <label className="text-xs font-bold uppercase tracking-widest text-muted mb-1.5 block">{field.label}</label>
                <div className="relative">
                  {field.prefix && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm">{field.prefix}</span>
                  )}
                  <input
                    type="text"
                    placeholder={field.placeholder}
                    value={paramValues[field.key] ?? ""}
                    onChange={(e) => setParamValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
                    className={`w-full bg-surface-container border border-outline-variant rounded-xl py-3 text-on-surface placeholder:text-muted/50 focus:border-primary focus:outline-none transition-colors ${field.prefix ? "pl-8 pr-4" : "px-4"}`}
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleStartDecision}
            className="w-full py-4 bg-primary text-on-primary rounded-full font-bold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">psychology</span>
            Ask the Council
          </button>

          <p className="text-[10px] text-muted text-center">
            Fields are optional — the council will use your financial profile to fill in gaps
          </p>
        </div>
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
              {/* Start Planning — create a goal from this advice */}
              {!goalCreated && !showGoalSheet && (
                <button
                  onClick={handleStartPlanning}
                  className="mt-4 w-full p-4 bg-primary/10 border border-primary/30 rounded-2xl hover:bg-primary/20 transition-colors flex items-center gap-4 text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary text-xl">flag</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-on-surface">Start Planning</h4>
                    <p className="text-xs text-muted mt-0.5">Create a savings goal from this advice</p>
                  </div>
                  <span className="material-symbols-outlined text-muted text-base ml-auto shrink-0">chevron_right</span>
                </button>
              )}

              {/* Goal creation confirmation sheet */}
              {showGoalSheet && (
                <SpotlightCard className="mt-4 p-5 space-y-4" spotlightColor="rgba(201, 177, 131, 0.15)">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="material-symbols-outlined text-primary text-lg">flag</span>
                    <h4 className="font-bold text-xs uppercase tracking-widest text-primary">Create Goal from This Advice</h4>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-widest text-muted mb-1 block">Goal name</label>
                      <input
                        type="text"
                        value={goalName}
                        onChange={(e) => setGoalName(e.target.value)}
                        className="w-full bg-surface-container border border-outline-variant rounded-xl py-2.5 px-4 text-on-surface text-sm focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-widest text-muted mb-1 block">Target amount</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm">£</span>
                        <input
                          type="number"
                          value={goalAmount}
                          onChange={(e) => setGoalAmount(e.target.value)}
                          className="w-full bg-surface-container border border-outline-variant rounded-xl py-2.5 pl-8 pr-4 text-on-surface text-sm focus:border-primary focus:outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-widest text-muted mb-1 block">Target date</label>
                      <input
                        type="date"
                        value={goalDate}
                        onChange={(e) => setGoalDate(e.target.value)}
                        className="w-full bg-surface-container border border-outline-variant rounded-xl py-2.5 px-4 text-on-surface text-sm focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleCreateGoal}
                      disabled={goalCreating || !goalName.trim() || !goalAmount}
                      className="flex-1 py-3 bg-primary text-on-primary rounded-full font-bold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {goalCreating ? (
                        <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                      ) : (
                        <span className="material-symbols-outlined text-base">check</span>
                      )}
                      {goalCreating ? "Creating..." : "Create Goal"}
                    </button>
                    <button
                      onClick={() => setShowGoalSheet(false)}
                      className="px-6 py-3 border border-outline text-on-surface rounded-full font-bold text-sm hover:bg-white/5 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </SpotlightCard>
              )}

              {/* Goal created success */}
              {goalCreated && (
                <div className="mt-4 rounded-2xl border border-green-500/30 bg-green-500/10 p-4 flex items-center gap-3">
                  <span className="material-symbols-outlined text-green-400 text-xl">check_circle</span>
                  <div>
                    <p className="text-sm font-bold text-green-400">Goal created!</p>
                    <p className="text-xs text-muted">Track your progress in the Goals tab</p>
                  </div>
                </div>
              )}

              {/* Related Learning Modules */}
              {relatedModules.length > 0 && (
                <div className="mt-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary text-base">school</span>
                    <h4 className="font-bold text-xs uppercase tracking-widest text-muted">Related Learning</h4>
                  </div>
                  {relatedModules.map((mod) => (
                    <SpotlightCard
                      key={mod.id}
                      className="p-4 cursor-pointer hover:border-primary transition-colors"
                      onClick={() => handleViewModule(mod.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-primary">menu_book</span>
                          <div>
                            <h5 className="font-bold text-sm text-on-surface">{mod.title}</h5>
                            <p className="text-xs text-muted">Topic: {mod.topic}</p>
                          </div>
                        </div>
                        <div className="text-xs font-bold bg-primary/20 px-2 py-1 rounded text-primary">+{mod.xp_reward} XP</div>
                      </div>
                    </SpotlightCard>
                  ))}

                  {/* Inline module content */}
                  {selectedModule && (
                    <div className="space-y-3">
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
                          onClick={() => handleCompleteModule(selectedModule.id)}
                          className="w-full py-3 rounded-full bg-primary text-on-primary font-bold text-sm"
                        >
                          Mark Complete (+{selectedModule.xp_reward} XP)
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

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
