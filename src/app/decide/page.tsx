"use client";

import React, { useState } from "react";


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
      const response = await fetch('/api/v1/decisions/evaluate/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision_type: type, title })
      });

      if (!response.body) return;
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        const lines = text.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const raw = line.slice(6).replace(/###NEWLINE###/g, '\n');
            if (!raw.trim()) continue;
            
            try {
              const event = JSON.parse(raw) as { type: string, content?: Record<string, unknown> };
              
              switch (event.type) {
                case 'pipeline_started':
                case 'context_building':
                case 'context_ready':
                  setStreamState(event.type);
                  break;
                case 'agent_started':
                  setAgents(prev => [...prev, { ...event.content, status: "LOADING" } as AgentState]);
                  break;
                case 'agent_completed':
                  setAgents(prev => prev.map(a => 
                    a.agent === event.content?.agent ? 
                    { ...a, status: "COMPLETED", summary: String(event.content?.response) } as AgentState : a
                  ));
                  break;
                case 'mentor_started':
                  setStreamState('mentor_started');
                  break;
                case 'mentor_completed':
                  setStreamState('mentor_completed');
                  setMentorResponse(event.content?.response as MentorResponse);
                  break;
                case 'pipeline_completed':
                  setIsCompleted(true);
                  break;
              }
            } catch(e) { console.error("Parse err", e) }
          }
        }
      }
    } catch (e) {
      console.error(e);
      setStreamState("error");
    }
  };

  const decisionTemplates = [
    { icon: "house", title: "Should I move flats?", type: "move_flat" },
    { icon: "credit_card", title: "Should I get a credit card?", type: "credit_card" },
    { icon: "directions_car", title: "Should I buy a car?", type: "buy_car" },
    { icon: "flight_takeoff", title: "Can I afford this trip?", type: "trip" },
    { icon: "schedule", title: "Should I pick up extra shifts?", type: "shifts" },
    { icon: "account_balance", title: "Should I switch banks?", type: "switch_banks" },
  ];

  return (
    <div className="mx-auto max-w-lg px-6 pt-12 pb-32 space-y-10 min-h-screen bg-black text-on-background font-body relative">


      {phase === "GRID" && (
        <div className="animate-in fade-in pt-4">
          <h1 className="text-4xl font-headline font-bold text-primary mb-2">BIG DECISIONS</h1>
          <p className="text-outline text-sm mb-10">Consult your AI council on significant financial moves.</p>

          <div className="grid grid-cols-2 gap-4">
            {decisionTemplates.map(dec => (
              <button
                key={dec.type}
                onClick={() => handleDecisionClick(dec.title, dec.type)}
                className="bg-surface border border-outline-variant p-5 rounded-3xl text-left hover:border-primary hover:bg-surface-container transition-all group shadow-sm flex flex-col justify-between aspect-square"
              >
                <div className="w-12 h-12 rounded-full bg-surface-container-high group-hover:bg-primary/20 flex items-center justify-center transition-colors">
                  <span className="material-symbols-outlined text-2xl text-on-surface group-hover:text-primary">{dec.icon}</span>
                </div>
                <h3 className="font-headline font-bold text-lg leading-tight group-hover:text-primary transition-colors mt-4">
                  {dec.title}
                </h3>
              </button>
            ))}
            
            <button className="col-span-2 bg-gradient-to-r from-surface-container to-surface border border-outline-variant p-5 rounded-3xl text-left hover:border-secondary hover:bg-surface-container transition-all group flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-surface-container-high group-hover:bg-secondary/20 flex items-center justify-center transition-colors">
                  <span className="material-symbols-outlined text-xl text-on-surface group-hover:text-secondary">edit</span>
                </div>
                <h3 className="font-headline font-bold text-lg leading-tight group-hover:text-secondary transition-colors">
                  Ask something custom...
                </h3>
              </div>
            </button>
          </div>
        </div>
      )}

      {phase === "STREAMING" && (
        <div className="animate-in fade-in duration-500 pt-4 pb-20 space-y-6">
          
          {/* Top Status */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-headline font-bold text-primary mb-2 flex items-center justify-center gap-3">
              {(streamState === "pipeline_started" || streamState === "context_building") && (
                <><span className="material-symbols-outlined animate-spin text-outline">scatter_plot</span> Analyzing profile...</>
              )}
              {streamState === "context_ready" && (
                <><span className="material-symbols-outlined text-emerald-400">check_circle</span> Profile loaded</>
              )}
              {agents.length > 0 && streamState !== "mentor_completed" && !isCompleted && (
                <><span className="material-symbols-outlined animate-pulse text-secondary">forum</span> Council Debating...</>
              )}
              {(streamState === "mentor_completed" || isCompleted) && (
                <><span className="material-symbols-outlined text-primary">gavel</span> Council Verizon Reached</>
              )}
            </h2>
          </div>

          {/* Agents Column */}
          <div className="space-y-4">
            {agents.map((agent) => (
              <div key={agent.agent} className={`bg-surface border border-outline-variant rounded-3xl p-5 shadow-lg relative overflow-hidden transition-all duration-700 ${agent.status === "LOADING" ? "opacity-70" : "scale-100 opacity-100"}`}>
                <div className={`absolute top-0 right-0 w-32 h-32 ${agent.color.replace('text-', 'bg-')}/5 rounded-bl-[100px]`}></div>
                
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${agent.color.replace('text-', 'bg-')}/10`}>
                    <span className={`material-symbols-outlined ${agent.color} ${agent.status === "LOADING" ? "animate-pulse" : ""}`}>{agent.icon}</span>
                  </div>
                  <div>
                    <div className={`font-bold uppercase tracking-widest text-xs ${agent.color}`}>{agent.label}</div>
                    <div className="text-xs text-outline">{agent.status === "LOADING" ? "Thinking..." : "Completed"}</div>
                  </div>
                </div>
                
                {agent.status === "COMPLETED" && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-500 text-on-surface font-medium border-l-2 border-outline-variant pl-4 mt-2 py-1">
                    &quot;{agent.summary}&quot;
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Mentor */}
          {streamState === "mentor_started" && (
            <div className="mt-8 pt-8 border-t border-outline-variant flex justify-center">
              <div className="flex items-center gap-3 text-secondary font-bold font-headline animate-pulse">
                <span className="material-symbols-outlined animate-spin">sync</span>
                The Mentor is synthesizing...
              </div>
            </div>
          )}

          {mentorResponse && (
            <div className="mt-8 animate-in slide-in-from-bottom-8 duration-1000">
              <div className="bg-gradient-to-br from-primary/20 to-surface border-2 border-primary p-6 rounded-3xl shadow-[0_10px_40px_rgba(230,221,197,0.1)]">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-primary text-black rounded-full flex items-center justify-center shadow-lg">
                    <span className="material-symbols-outlined text-2xl">account_balance</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-xs uppercase tracking-widest text-primary">The Mentor&apos;s Verdict</h3>
                    <div className="font-headline font-black text-2xl text-on-surface">{mentorResponse.verdict}</div>
                  </div>
                </div>

                <div className="text-4xl font-headline font-black text-secondary mb-6 text-center border-y border-outline-variant py-6">
                  {mentorResponse.key_number} <span className="text-sm font-body font-medium text-outline block mt-1">Net impact if you proceed</span>
                </div>

                <div>
                  <h4 className="font-bold text-xs uppercase tracking-widest text-outline mb-4">Action Steps</h4>
                  <ul className="space-y-3">
                    {mentorResponse.action_steps.map((step, idx) => (
                      <li key={idx} className="flex gap-3 text-sm text-on-surface items-start">
                        <span className="w-6 h-6 rounded-full bg-surface-container border border-outline-variant flex items-center justify-center font-bold text-xs shrink-0">{idx + 1}</span>
                        <span className="leading-relaxed mt-0.5">{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setPhase("GRID")}
                  className="flex-1 py-4 border border-outline text-on-surface rounded-full font-bold hover:bg-surface-container transition-colors"
                >
                  Close
                </button>
                <button
                  className="flex-[2] py-4 bg-primary text-black rounded-full font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-xl">bookmark</span>
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
