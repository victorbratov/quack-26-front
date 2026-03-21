"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type OnboardingData = {
  employmentStatus: string;
  universityName?: string;
  studentLoan: number;
  partTimeJob: number;
  parentalSupport: number;
  otherIncome: number;
  rent: number;
  phoneBill: number;
  bills: { name: string; amount: number }[];
  subscriptions: { name: string; amount: number }[];
  hasDebt: boolean;
  debtItems: { name: string; amount: number }[];
  savingsAmount: number;
  hasEmergencyFund: boolean | null;
  eatOutPerWeek: number;
  transportMethod: string;
  nightsOutMonthly: number;
  spendingWeakness: string;
  priorities: string[];
  biggestWorry: string;
  savingTarget: number;
  timeHorizon: string;
  personality: string;
  shareProgress: boolean;
};

const initialData: OnboardingData = {
  employmentStatus: "",
  studentLoan: 0,
  partTimeJob: 0,
  parentalSupport: 0,
  otherIncome: 0,
  rent: 0,
  phoneBill: 0,
  bills: [],
  subscriptions: [],
  hasDebt: false,
  debtItems: [],
  savingsAmount: 0,
  hasEmergencyFund: null,
  eatOutPerWeek: 0,
  transportMethod: "",
  nightsOutMonthly: 0,
  spendingWeakness: "",
  priorities: [],
  biggestWorry: "",
  savingTarget: 50,
  timeHorizon: "",
  personality: "",
  shareProgress: false,
};

const STEP_TITLES = [
  "Tell us about your income",
  "Fixed monthly costs",
  "Financial health",
  "How do you spend?",
  "What matters?",
  "How should we talk?",
];

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>(initialData);
  const router = useRouter();

  const updateData = (updates: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const currentIncome =
    data.studentLoan + data.partTimeJob + data.parentalSupport + data.otherIncome;
  const currentFixedCosts =
    data.rent +
    data.phoneBill +
    data.bills.reduce((acc, curr) => acc + curr.amount, 0) +
    data.subscriptions.reduce((acc, curr) => acc + curr.amount, 0);

  const handleNext = async () => {
    if (step < 6) {
      setStep(step + 1);
    } else {
      router.push("/");
    }
  };

  const progressPct = ((step - 1) / 5) * 100;

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col px-5 pt-6 pb-24 font-body">
      {/* Progress Indicator */}
      <div className="flex items-center gap-3 mb-8">
        {step > 1 && (
          <button
            onClick={() => setStep(step - 1)}
            className="text-muted hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-xl">
              arrow_back
            </span>
          </button>
        )}
        <div className="flex-1 flex gap-1.5">
          {Array.from({ length: 6 }, (_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                i < step ? "bg-primary" : "bg-outline-variant"
              }`}
            />
          ))}
        </div>
        <span className="text-xs text-muted font-medium">{step}/6</span>
      </div>

      <div className="flex-1 flex flex-col max-w-md mx-auto w-full">
        {/* Step Title */}
        <h1 className="text-3xl font-extrabold font-headline text-primary mb-8 leading-tight">
          {STEP_TITLES[step - 1]}
        </h1>

        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="text-xs text-muted uppercase tracking-widest mb-3 block font-semibold">
                Status
              </label>
              <div className="grid grid-cols-2 gap-3">
                {["Student", "Part-time", "Full-time", "Unemployed"].map(
                  (status) => (
                    <button
                      key={status}
                      onClick={() => updateData({ employmentStatus: status })}
                      className={`p-4 rounded-2xl border transition-all font-medium ${
                        data.employmentStatus === status
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-outline-variant text-on-surface hover:border-outline"
                      }`}
                    >
                      {status}
                    </button>
                  ),
                )}
              </div>
            </div>

            {data.employmentStatus === "Student" && (
              <div>
                <label className="text-xs text-muted uppercase tracking-widest mb-2 block font-semibold">
                  University Name
                </label>
                <input
                  type="text"
                  value={data.universityName ?? ""}
                  onChange={(e) =>
                    updateData({ universityName: e.target.value })
                  }
                  className="w-full bg-surface-container p-4 rounded-2xl border border-outline-variant focus:border-primary outline-none text-on-surface placeholder:text-muted-foreground"
                  placeholder="e.g. UCL"
                />
              </div>
            )}

            <div className="space-y-3 pt-4 border-t border-outline-variant">
              <label className="text-xs text-muted uppercase tracking-widest block font-semibold">
                Monthly Income (£)
              </label>
              {[
                { id: "studentLoan", label: "Student Loan (monthly avg)" },
                { id: "partTimeJob", label: "Part-time Job" },
                { id: "parentalSupport", label: "Parental Support" },
                { id: "otherIncome", label: "Other" },
              ].map((field) => (
                <div
                  key={field.id}
                  className="flex items-center justify-between bg-surface-container p-4 rounded-2xl"
                >
                  <span className="text-on-surface text-sm">{field.label}</span>
                  <input
                    type="number"
                    value={
                      (data as unknown as Record<string, number>)[field.id] ??
                      ""
                    }
                    onChange={(e) =>
                      updateData({ [field.id]: Number(e.target.value) })
                    }
                    className="bg-transparent text-right w-24 outline-none text-primary font-bold"
                    placeholder="0"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            {[
              { id: "rent", label: "Rent" },
              { id: "phoneBill", label: "Phone Bill" },
            ].map((field) => (
              <div
                key={field.id}
                className="flex items-center justify-between bg-surface-container p-4 rounded-2xl"
              >
                <span className="text-on-surface text-sm">{field.label}</span>
                <input
                  type="number"
                  value={
                    (data as unknown as Record<string, number>)[field.id] || ""
                  }
                  onChange={(e) =>
                    updateData({ [field.id]: Number(e.target.value) })
                  }
                  className="bg-transparent text-right w-24 outline-none text-primary font-bold"
                  placeholder="0"
                />
              </div>
            ))}

            <div className="pt-4 space-y-3">
              <button className="text-secondary font-bold flex items-center gap-2 text-sm">
                <span className="material-symbols-outlined text-sm">add</span>
                Add other bills
              </button>
              <button className="text-secondary font-bold flex items-center gap-2 text-sm">
                <span className="material-symbols-outlined text-sm">add</span>
                Add subscriptions
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <label className="text-xs text-muted uppercase tracking-widest block font-semibold flex-1">
                  Do you have debt?
                </label>
                <button
                  onClick={() => updateData({ hasDebt: !data.hasDebt })}
                  className={`w-14 h-8 rounded-full transition-colors flex items-center px-1 ${
                    data.hasDebt ? "bg-primary" : "bg-surface-container-high"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full bg-black transition-transform ${
                      data.hasDebt ? "translate-x-6" : ""
                    }`}
                  />
                </button>
              </div>
              {data.hasDebt && (
                <div className="bg-surface-container p-4 rounded-2xl text-center text-muted text-sm">
                  Debt list goes here...
                </div>
              )}
            </div>

            <div>
              <label className="text-xs text-muted uppercase tracking-widest mb-2 block font-semibold">
                Current Savings (£)
              </label>
              <input
                type="number"
                value={data.savingsAmount || ""}
                onChange={(e) =>
                  updateData({ savingsAmount: Number(e.target.value) })
                }
                className="w-full bg-surface-container p-4 rounded-2xl border border-outline-variant focus:border-primary outline-none text-2xl text-primary font-bold"
                placeholder="0"
              />
            </div>

            <div>
              <label className="text-xs text-muted uppercase tracking-widest mb-3 block font-semibold">
                Emergency Fund?
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { val: true, label: "Yes" },
                  { val: false, label: "No" },
                ].map((opt) => (
                  <button
                    key={opt.label}
                    onClick={() =>
                      updateData({ hasEmergencyFund: opt.val })
                    }
                    className={`p-4 rounded-2xl border transition-all font-medium ${
                      data.hasEmergencyFund === opt.val
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-outline-variant text-on-surface hover:border-outline"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-8">
            <div>
              <label className="text-xs text-muted uppercase tracking-widest mb-3 block font-semibold">
                Eating out / week: {data.eatOutPerWeek}
              </label>
              <input
                type="range"
                min="0"
                max="14"
                value={data.eatOutPerWeek}
                onChange={(e) =>
                  updateData({ eatOutPerWeek: Number(e.target.value) })
                }
                className="w-full h-1.5 bg-outline-variant rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            <div>
              <label className="text-xs text-muted uppercase tracking-widest mb-3 block font-semibold">
                Transport
              </label>
              <div className="flex flex-wrap gap-2">
                {["Walk", "Public", "Uber", "Car", "Mixed"].map((t) => (
                  <button
                    key={t}
                    onClick={() => updateData({ transportMethod: t })}
                    className={`px-5 py-2.5 rounded-full border transition-all text-sm font-medium ${
                      data.transportMethod === t
                        ? "border-primary bg-primary text-on-primary"
                        : "border-outline-variant text-on-surface hover:border-outline"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-muted uppercase tracking-widest mb-3 block font-semibold">
                Weakness
              </label>
              <div className="flex flex-wrap gap-2">
                {["Takeaway", "Clothes", "Nights Out", "Tech", "Coffee"].map(
                  (w) => (
                    <button
                      key={w}
                      onClick={() => updateData({ spendingWeakness: w })}
                      className={`px-5 py-2.5 rounded-full border transition-all text-sm font-medium ${
                        data.spendingWeakness === w
                          ? "border-secondary bg-secondary text-on-secondary"
                          : "border-outline-variant text-on-surface hover:border-outline"
                      }`}
                    >
                      {w}
                    </button>
                  ),
                )}
              </div>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-8">
            <div>
              <label className="text-xs text-muted uppercase tracking-widest mb-3 block font-semibold">
                Goals (Pick Many)
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  "Emergency",
                  "Holiday",
                  "Tech",
                  "Car",
                  "House",
                  "Investing",
                  "Spend Less",
                ].map((p) => {
                  const isSelected = data.priorities.includes(p);
                  return (
                    <button
                      key={p}
                      onClick={() => {
                        if (isSelected)
                          updateData({
                            priorities: data.priorities.filter((x) => x !== p),
                          });
                        else
                          updateData({
                            priorities: [...data.priorities, p],
                          });
                      }}
                      className={`px-5 py-2.5 rounded-full border transition-all text-sm font-medium ${
                        isSelected
                          ? "border-primary bg-primary text-on-primary"
                          : "border-outline-variant text-on-surface hover:border-outline"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-xs text-muted uppercase tracking-widest mb-3 block font-semibold">
                Biggest Worry
              </label>
              <select
                value={data.biggestWorry}
                onChange={(e) =>
                  updateData({ biggestWorry: e.target.value })
                }
                className="w-full bg-surface-container p-4 rounded-2xl border border-outline-variant focus:border-primary outline-none text-on-surface"
              >
                <option value="">Select one...</option>
                <option value="Running out">Running out of money</option>
                <option value="Debt">Debt</option>
                <option value="Not saving">Not saving enough</option>
                <option value="Confused">
                  Don&apos;t understand finance
                </option>
                <option value="FOMO">FOMO spending</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-muted uppercase tracking-widest mb-2 block font-semibold">
                Save Target: £{data.savingTarget}/mo
              </label>
              <input
                type="range"
                min="0"
                max="500"
                step="10"
                value={data.savingTarget}
                onChange={(e) =>
                  updateData({ savingTarget: Number(e.target.value) })
                }
                className="w-full h-1.5 bg-outline-variant rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-3">
              {[
                { id: "Gentle", icon: "spa", desc: "Gentle encouragement" },
                { id: "Tough", icon: "shield", desc: "Tough love" },
                { id: "Data", icon: "bar_chart", desc: "Data-driven facts" },
                { id: "Social", icon: "group", desc: "Social comparison" },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => updateData({ personality: p.id })}
                  className={`p-5 rounded-2xl border flex items-center gap-4 transition-all ${
                    data.personality === p.id
                      ? "border-secondary bg-secondary/10"
                      : "border-outline-variant bg-surface-container hover:border-outline"
                  }`}
                >
                  <span
                    className={`material-symbols-outlined ${
                      data.personality === p.id
                        ? "text-secondary"
                        : "text-muted"
                    }`}
                  >
                    {p.icon}
                  </span>
                  <span
                    className={`font-medium ${
                      data.personality === p.id
                        ? "text-secondary"
                        : "text-on-surface"
                    }`}
                  >
                    {p.desc}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between bg-surface-container p-5 rounded-2xl border border-outline-variant">
              <span className="font-medium text-on-surface">
                Share progress?
              </span>
              <button
                onClick={() =>
                  updateData({ shareProgress: !data.shareProgress })
                }
                className={`w-14 h-8 rounded-full transition-colors flex items-center px-1 ${
                  data.shareProgress
                    ? "bg-primary"
                    : "bg-surface-container-high"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full bg-black transition-transform ${
                    data.shareProgress ? "translate-x-6" : ""
                  }`}
                />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Action */}
      <div className="mt-10 bg-surface-container border border-outline-variant p-5 rounded-2xl sticky bottom-4">
        {step < 3 && (
          <div className="flex justify-between text-sm mb-4 border-b border-outline-variant pb-4 items-center">
            <div className="text-xs text-muted uppercase tracking-widest font-semibold">
              {step === 1 ? "Total Income" : "Disposable"}
            </div>
            <div className="text-xl font-bold font-headline text-primary">
              £{step === 1 ? currentIncome : currentIncome - currentFixedCosts}
            </div>
          </div>
        )}

        <button
          onClick={handleNext}
          className="w-full bg-primary text-on-primary font-bold text-base py-4 rounded-full flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
        >
          {step === 6 ? "Start your journey" : "Continue"}
          <span className="material-symbols-outlined text-lg">
            arrow_forward
          </span>
        </button>
      </div>
    </div>
  );
}
