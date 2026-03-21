"use client";

import React, { useState } from "react";
import { SectionHeader } from "~/components/ui/SectionHeader";
import { Divider } from "~/components/ui/Divider";
import { CardCarousel } from "~/components/ui/CardCarousel";

type Phase = "INPUT" | "LOADING" | "RESULTS" | "HISTORY";
type FilterTab = "All" | "Save" | "Spend" | "Invest";

const QUICK_LINKS = ["RECENTS", "LIBRARY", "TIMER", "PROGRAMS"];

const CONTENT_CARDS = [
  {
    title: "Weekend Spending Review",
    category: "SPEND CHECK",
    author: "AI Council",
    duration: "5 min",
    locked: false,
  },
  {
    title: "Subscription Audit",
    category: "SAVE",
    author: "Ghost Finder",
    duration: "3 min",
    locked: false,
  },
  {
    title: "Investment Readiness",
    category: "INVEST",
    author: "Growth Agent",
    duration: "8 min",
    locked: true,
  },
  {
    title: "Impulse Purchase Defence",
    category: "SPEND CHECK",
    author: "Risk Agent",
    duration: "4 min",
    locked: false,
  },
];

export default function CheckPage() {
  const [phase, setPhase] = useState<Phase>("INPUT");
  const [merchant, setMerchant] = useState("");
  const [amount, setAmount] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterTab>("All");
  const [agentsLoaded, setAgentsLoaded] = useState(0);
  const [verdict, setVerdict] = useState<"ALLOW" | "REDUCE" | "BLOCK" | null>(null);

  const simulateDebate = () => {
    setPhase("LOADING");
    setAgentsLoaded(0);
    setVerdict(null);
    setTimeout(() => setAgentsLoaded(1), 800);
    setTimeout(() => setAgentsLoaded(2), 1600);
    setTimeout(() => setAgentsLoaded(3), 2400);
    setTimeout(() => {
      setPhase("RESULTS");
      const a = Number(amount);
      if (a > 100) setVerdict("BLOCK");
      else if (a > 30) setVerdict("REDUCE");
      else setVerdict("ALLOW");
    }, 3200);
  };

  const handleAction = () => {
    setPhase("INPUT");
    setMerchant("");
    setAmount("");
  };

  return (
    <div className="mx-auto max-w-lg pb-32 min-h-screen bg-background text-on-background font-body relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-10 pb-2">
        <h1 className="text-3xl font-headline font-extrabold text-primary">
          DISCOVER
        </h1>
        {phase !== "HISTORY" && (
          <button
            onClick={() => setPhase("HISTORY")}
            className="text-xs font-bold uppercase tracking-widest text-muted hover:text-primary transition-colors"
          >
            History
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-6 px-5 border-b border-outline-variant">
        {(["All", "Save", "Spend", "Invest"] as FilterTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={`pb-3 text-xs font-bold uppercase tracking-widest transition-colors border-b-2 ${
              activeFilter === tab
                ? "border-primary text-primary"
                : "border-transparent text-muted"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {phase === "INPUT" && (
        <div className="space-y-0">
          {/* Quick Links */}
          <div className="px-5 mt-6 space-y-3">
            {QUICK_LINKS.map((link) => (
              <button
                key={link}
                className="block text-2xl font-headline font-extrabold text-on-surface hover:text-primary transition-colors"
              >
                {link}
              </button>
            ))}
          </div>

          <Divider className="mt-6" />

          {/* FOR YOU */}
          <SectionHeader title="FOR YOU" seeAllHref="#" />
          <div className="px-5 mb-4">
            <h2 className="text-xl font-headline font-bold text-on-surface leading-tight">
              Before You Spend
            </h2>
            <p className="text-sm text-muted mt-1">
              Quick AI check on your next purchase
            </p>
          </div>

          {/* Spend Check Input */}
          <div className="px-5 space-y-4">
            <input
              type="text"
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              placeholder="Where?"
              className="w-full bg-surface-container text-lg p-5 rounded-2xl border border-outline-variant focus:border-primary focus:bg-surface-container-high transition-colors outline-none text-on-surface placeholder:text-muted-foreground"
            />
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-3xl font-headline font-bold text-muted-foreground">
                £
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-surface-container text-3xl font-headline font-bold p-5 pl-12 rounded-2xl border border-outline-variant focus:border-primary focus:bg-surface-container-high transition-colors outline-none text-primary"
              />
            </div>
            <button
              onClick={simulateDebate}
              disabled={!merchant || !amount}
              className="w-full bg-primary text-on-primary font-bold text-base py-4 rounded-full flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Check this spend
              <span className="material-symbols-outlined text-lg">analytics</span>
            </button>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  setMerchant("Zara");
                  setAmount("60");
                }}
                className="px-4 py-2 rounded-full border border-outline-variant bg-surface-container text-sm text-muted hover:border-primary hover:text-on-surface transition-colors"
              >
                Zara £60
              </button>
              <button
                onClick={() => {
                  setMerchant("Uber");
                  setAmount("15");
                }}
                className="px-4 py-2 rounded-full border border-outline-variant bg-surface-container text-sm text-muted hover:border-primary hover:text-on-surface transition-colors"
              >
                Uber £15
              </button>
            </div>
          </div>

          <Divider className="mt-6" />

          {/* Horizontal Content Cards */}
          <SectionHeader title="EXPLORE" />
          <CardCarousel>
            {CONTENT_CARDS.map((card) => (
              <div
                key={card.title}
                className="min-w-[200px] rounded-2xl border border-outline-variant bg-surface-container overflow-hidden flex-shrink-0"
              >
                <div className="relative aspect-[4/3] bg-gradient-to-br from-surface-container-high to-surface">
                  {card.locked && (
                    <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center">
                      <span className="material-symbols-outlined text-sm text-muted">
                        lock
                      </span>
                    </div>
                  )}
                  <div className="absolute bottom-3 left-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-secondary">
                      {card.category}
                    </span>
                  </div>
                </div>
                <div className="p-3">
                  <h4 className="font-bold text-sm text-on-surface leading-tight">
                    {card.title}
                  </h4>
                  <p className="text-xs text-muted mt-1">
                    {card.author} &middot; {card.duration}
                  </p>
                </div>
              </div>
            ))}
          </CardCarousel>
        </div>
      )}

      {phase === "LOADING" && (
        <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-12 px-5">
          <div className="relative w-28 h-28">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="material-symbols-outlined text-5xl text-primary animate-bounce">
                blur_on
              </span>
            </div>
          </div>

          <div className="space-y-3 w-full max-w-xs">
            {[
              { label: "Risk Agent", loaded: agentsLoaded >= 1, color: "primary" },
              { label: "Growth Agent", loaded: agentsLoaded >= 2, color: "secondary" },
              { label: "Lifestyle Agent", loaded: agentsLoaded >= 3, color: "emerald-400" },
            ].map((agent) => (
              <div
                key={agent.label}
                className={`p-4 rounded-2xl border transition-all duration-700 ${
                  agent.loaded
                    ? `border-${agent.color} bg-${agent.color}/10`
                    : "border-outline-variant opacity-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`material-symbols-outlined text-sm ${
                      agent.loaded ? `text-${agent.color}` : "text-muted animate-spin"
                    }`}
                  >
                    {agent.loaded ? "check_circle" : "sync"}
                  </span>
                  <span className="font-bold text-sm">
                    {agent.label} {agent.loaded ? "ready" : "analyzing"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {phase === "RESULTS" && (
        <div className="px-5 pt-6 pb-20 space-y-6">
          <div className="text-center mb-6">
            {verdict === "BLOCK" && (
              <div className="inline-block px-4 py-1 rounded-full bg-error/20 text-error font-bold tracking-widest uppercase text-xs mb-3">
                Warning
              </div>
            )}
            {verdict === "REDUCE" && (
              <div className="inline-block px-4 py-1 rounded-full bg-secondary/20 text-secondary font-bold tracking-widest uppercase text-xs mb-3">
                Alternative
              </div>
            )}
            {verdict === "ALLOW" && (
              <div className="inline-block px-4 py-1 rounded-full bg-emerald-400/20 text-emerald-400 font-bold tracking-widest uppercase text-xs mb-3">
                All Clear
              </div>
            )}
            <h1 className="text-4xl font-headline font-bold text-on-surface">
              {verdict === "BLOCK"
                ? "SKIP THIS ONE"
                : verdict === "REDUCE"
                  ? `REDUCE TO £${(Number(amount) / 2).toFixed(2)}`
                  : "ALL CLEAR"}
            </h1>
            {verdict !== "ALLOW" && (
              <div className="mt-2 text-xl text-muted line-through decoration-error decoration-2">
                £{amount}
              </div>
            )}
          </div>

          {/* Agent Cards */}
          {[
            {
              label: "Risk Agent",
              icon: "shield",
              quote: `Your £3,000 emergency fund protects against this. Proceed.`,
              agentVerdict: verdict === "ALLOW" ? "ALLOW" : "REDUCE",
              pct: verdict === "ALLOW" ? 20 : 80,
              color: verdict === "ALLOW" ? "emerald-400" : "error",
            },
            {
              label: "Growth Agent",
              icon: "trending_up",
              quote: `£${amount} today equals £${(Number(amount) * 8).toFixed(0)} in 5 years invested.`,
              agentVerdict: verdict === "BLOCK" ? "BLOCK" : "REDUCE",
              pct: 60,
              color: "secondary",
            },
            {
              label: "Lifestyle Agent",
              icon: "auto_awesome",
              quote: "5-day streak. You've earned some flexibility.",
              agentVerdict: "ALLOW",
              pct: 80,
              color: "emerald-400",
            },
          ].map((agent) => (
            <div
              key={agent.label}
              className="glass-card p-5 rounded-2xl"
            >
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-widest">
                  <span className="material-symbols-outlined text-on-surface text-base">
                    {agent.icon}
                  </span>
                  {agent.label}
                </div>
                <div
                  className={`px-2 py-1 rounded font-bold text-[10px] bg-${agent.color}/20 text-${agent.color}`}
                >
                  {agent.agentVerdict}
                </div>
              </div>
              <p className="text-on-surface font-medium text-base leading-snug mb-3">
                &quot;{agent.quote}&quot;
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1 bg-surface-container-high rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-${agent.color} rounded-full`}
                    style={{ width: `${agent.pct}%` }}
                  />
                </div>
                <span className="text-xs text-muted">{agent.pct}%</span>
              </div>
            </div>
          ))}

          {/* Summary */}
          <div className="glass-card p-5 rounded-2xl space-y-3">
            {[
              { label: "Balance after", value: "£760", color: "text-on-surface" },
              { label: "Goal delay", value: "3 days", color: "text-error" },
              { label: "Weekly budget left", value: "£42", color: "text-secondary" },
            ].map((row) => (
              <div key={row.label} className="flex justify-between items-center text-sm">
                <span className="text-muted">{row.label}</span>
                <span className={`font-bold ${row.color}`}>{row.value}</span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={handleAction}
              className={`w-full font-bold text-base py-4 rounded-full flex items-center justify-center gap-2 transition-all ${
                verdict === "ALLOW"
                  ? "bg-emerald-400 text-black"
                  : "bg-primary text-on-primary"
              }`}
            >
              <span className="material-symbols-outlined text-lg">check_circle</span>
              {verdict === "REDUCE"
                ? `Accept £${(Number(amount) / 2).toFixed(2)}`
                : "Proceed with Purchase"}
            </button>
            <button
              onClick={handleAction}
              className="w-full border border-outline text-on-surface font-bold text-base py-4 rounded-full hover:bg-white/5 transition-all"
            >
              Cancel Purchase
            </button>
            {verdict !== "ALLOW" && (
              <button
                onClick={handleAction}
                className="w-full text-muted font-medium text-sm py-3 hover:text-on-surface transition-colors uppercase tracking-widest"
              >
                Override — Spend £{amount}
              </button>
            )}
          </div>
        </div>
      )}

      {phase === "HISTORY" && (
        <div className="px-5 pt-6">
          <p className="text-sm text-muted border-b border-outline-variant pb-4 mb-4">
            Saved <strong className="text-emerald-400">£240</strong> across 14 checks
          </p>

          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="glass-card p-4 rounded-2xl flex justify-between items-center"
              >
                <div>
                  <div className="font-bold text-on-surface">Zara</div>
                  <div className="text-xs text-muted">Mar {21 - i}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-error line-through text-sm">£60</div>
                  <div className="font-bold text-emerald-400">£30</div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setPhase("INPUT")}
            className="mt-6 px-6 py-3 rounded-full border border-outline text-sm font-bold uppercase tracking-widest hover:bg-white/5 transition-colors w-full"
          >
            Back
          </button>
        </div>
      )}
    </div>
  );
}
