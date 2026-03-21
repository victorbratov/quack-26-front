"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type OnboardingData = {
  // Step 1
  employmentStatus: string;
  universityName?: string;
  studentLoan: number;
  partTimeJob: number;
  parentalSupport: number;
  otherIncome: number;
  // Step 2
  rent: number;
  phoneBill: number;
  bills: { name: string; amount: number }[];
  subscriptions: { name: string; amount: number }[];
  // Step 3
  hasDebt: boolean;
  debtItems: { name: string; amount: number }[];
  savingsAmount: number;
  hasEmergencyFund: boolean | null;
  // Step 4
  eatOutPerWeek: number;
  transportMethod: string;
  nightsOutMonthly: number;
  spendingWeakness: string;
  // Step 5
  priorities: string[];
  biggestWorry: string;
  savingTarget: number;
  timeHorizon: string;
  // Step 6
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
    // In a real app, we might fire PUT /api/v1/onboarding/step/{step}
    if (step < 6) {
      setStep(step + 1);
    } else {
      // POST /api/v1/onboarding/generate-mock
      router.push("/");
    }
  };

  const progressPct = ((step - 1) / 5) * 100;

  return (
    <div className="min-h-screen bg-black text-on-background flex flex-col p-6 pb-24 font-body">
      {/* Progress Bar */}
      <div className="w-full h-1 bg-surface-container-high rounded-full overflow-hidden mb-8">
        <div 
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${progressPct}%` }}
        />
      </div>
      
      <div className="flex-1 flex flex-col max-w-md mx-auto w-full">
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-3xl font-bold font-headline mb-8 text-primary">Tell us about your income</h1>
            
            <div className="space-y-6">
              <div>
                <label className="text-sm text-outline uppercase tracking-wider mb-2 block font-semibold">Status</label>
                <div className="grid grid-cols-2 gap-3">
                  {["Student", "Part-time", "Full-time", "Unemployed"].map(status => (
                    <button
                      key={status}
                      onClick={() => updateData({ employmentStatus: status })}
                      className={`p-4 rounded-xl border transition-colors ${data.employmentStatus === status ? "border-primary bg-primary/10 text-primary" : "border-outline-variant text-on-surface"}`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
              
              {data.employmentStatus === "Student" && (
                <div>
                  <label className="text-sm text-outline uppercase tracking-wider mb-2 block font-semibold">University Name</label>
                  <input 
                    type="text" 
                    value={data.universityName ?? ""}
                    onChange={e => updateData({ universityName: e.target.value })}
                    className="w-full bg-surface p-4 rounded-xl border border-outline-variant focus:border-primary outline-none" 
                    placeholder="e.g. UCL" 
                  />
                </div>
              )}

              <div className="space-y-4 pt-4 border-t border-outline-variant">
                <label className="text-sm text-outline uppercase tracking-wider block font-semibold">Monthly Income (£)</label>
                {[
                  { id: "studentLoan", label: "Student Loan (monthly avg)" },
                  { id: "partTimeJob", label: "Part-time Job" },
                  { id: "parentalSupport", label: "Parental Support" },
                  { id: "otherIncome", label: "Other" }
                ].map(field => (
                  <div key={field.id} className="flex items-center justify-between bg-surface p-4 rounded-xl">
                    <span className="text-on-surface">{field.label}</span>
                    <input 
                      type="number" 
                      value={(data as unknown as Record<string, number>)[field.id] ?? ""}
                      onChange={e => updateData({ [field.id]: Number(e.target.value) })}
                      className="bg-transparent text-right w-24 outline-none text-primary font-bold" 
                      placeholder="0" 
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-3xl font-bold font-headline mb-8 text-primary">Fixed monthly costs</h1>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-surface p-4 rounded-xl">
                <span className="text-on-surface">Rent</span>
                <input 
                  type="number" 
                  value={data.rent || ""}
                  onChange={e => updateData({ rent: Number(e.target.value) })}
                  className="bg-transparent text-right w-24 outline-none text-primary font-bold" 
                  placeholder="0" 
                />
              </div>
              
              <div className="flex items-center justify-between bg-surface p-4 rounded-xl">
                <span className="text-on-surface">Phone Bill</span>
                <input 
                  type="number" 
                  value={data.phoneBill || ""}
                  onChange={e => updateData({ phoneBill: Number(e.target.value) })}
                  className="bg-transparent text-right w-24 outline-none text-primary font-bold" 
                  placeholder="0" 
                />
              </div>
              
              <div className="pt-4">
                <button className="text-secondary font-bold flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-sm">add</span>
                  Add other bills
                </button>
                <button className="text-secondary font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">add</span>
                  Add subscriptions
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-3xl font-bold font-headline mb-8 text-primary">Financial health</h1>
            
            <div className="space-y-8">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <label className="text-sm text-outline uppercase tracking-wider block font-semibold flex-1">Do you have debt?</label>
                  <button 
                    onClick={() => updateData({ hasDebt: !data.hasDebt })}
                    className={`w-14 h-8 rounded-full transition-colors flex items-center px-1 ${data.hasDebt ? 'bg-primary' : 'bg-surface-container-high'}`}
                  >
                    <div className={`w-6 h-6 rounded-full bg-black transition-transform ${data.hasDebt ? 'translate-x-6' : ''}`} />
                  </button>
                </div>
                {data.hasDebt && (
                  <div className="bg-surface p-4 rounded-xl text-center text-outline text-sm">
                    Debt list goes here...
                  </div>
                )}
              </div>
              
              <div>
                <label className="text-sm text-outline uppercase tracking-wider mb-2 block font-semibold">Current Savings (£)</label>
                <input 
                  type="number" 
                  value={data.savingsAmount || ""}
                  onChange={e => updateData({ savingsAmount: Number(e.target.value) })}
                  className="w-full bg-surface p-4 rounded-xl border border-outline-variant focus:border-primary outline-none text-2xl text-primary font-bold" 
                  placeholder="0" 
                />
              </div>
              
              <div>
                <label className="text-sm text-outline uppercase tracking-wider mb-2 block font-semibold">Emergency Fund?</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => updateData({ hasEmergencyFund: true })}
                    className={`p-4 rounded-xl border transition-colors ${data.hasEmergencyFund === true ? "border-primary bg-primary/10 text-primary" : "border-outline-variant text-on-surface"}`}
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => updateData({ hasEmergencyFund: false })}
                    className={`p-4 rounded-xl border transition-colors ${data.hasEmergencyFund === false ? "border-primary bg-primary/10 text-primary" : "border-outline-variant text-on-surface"}`}
                  >
                    No
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-3xl font-bold font-headline mb-8 text-primary">How do you spend?</h1>
            
            <div className="space-y-8">
              <div>
                <label className="text-sm text-outline uppercase tracking-wider mb-2 block font-semibold">Eating out / week: {data.eatOutPerWeek}</label>
                <input 
                  type="range" 
                  min="0" max="14" 
                  value={data.eatOutPerWeek}
                  onChange={e => updateData({ eatOutPerWeek: Number(e.target.value) })}
                  className="w-full h-2 bg-surface-container-high rounded-lg appearance-none cursor-pointer accent-primary" 
                />
              </div>
              
              <div>
                <label className="text-sm text-outline uppercase tracking-wider mb-2 block font-semibold">Transport</label>
                <div className="flex flex-wrap gap-2">
                  {["Walk", "Public", "Uber", "Car", "Mixed"].map(t => (
                    <button
                      key={t}
                      onClick={() => updateData({ transportMethod: t })}
                      className={`px-4 py-2 rounded-full border transition-colors ${data.transportMethod === t ? "border-primary bg-primary text-black font-bold" : "border-outline-variant text-on-surface"}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm text-outline uppercase tracking-wider mb-2 block font-semibold">Weakness</label>
                <div className="flex flex-wrap gap-2">
                  {["Takeaway", "Clothes", "Nights Out", "Tech", "Coffee"].map(w => (
                    <button
                      key={w}
                      onClick={() => updateData({ spendingWeakness: w })}
                      className={`px-4 py-2 rounded-full border transition-colors ${data.spendingWeakness === w ? "border-secondary bg-secondary text-black font-bold" : "border-outline-variant text-on-surface"}`}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-3xl font-bold font-headline mb-8 text-primary">What matters?</h1>
            
            <div className="space-y-8">
              <div>
                <label className="text-sm text-outline uppercase tracking-wider mb-3 block font-semibold">Goals (Pick Many)</label>
                <div className="flex flex-wrap gap-2">
                  {["Emergency", "Holiday", "Tech", "Car", "House", "Investing", "Spend Less"].map(p => {
                    const isSelected = data.priorities.includes(p);
                    return (
                      <button
                        key={p}
                        onClick={() => {
                          if (isSelected) updateData({ priorities: data.priorities.filter(x => x !== p) });
                          else updateData({ priorities: [...data.priorities, p] });
                        }}
                        className={`px-4 py-2 rounded-full border transition-colors ${isSelected ? "border-primary bg-primary text-black font-bold" : "border-outline-variant text-on-surface"}`}
                      >
                        {p}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="text-sm text-outline uppercase tracking-wider mb-3 block font-semibold">Biggest Worry</label>
                <select 
                  value={data.biggestWorry}
                  onChange={e => updateData({ biggestWorry: e.target.value })}
                  className="w-full bg-surface p-4 rounded-xl border border-outline-variant focus:border-primary outline-none text-on-surface"
                >
                  <option value="">Select one...</option>
                  <option value="Running out">Running out of money</option>
                  <option value="Debt">Debt</option>
                  <option value="Not saving">Not saving enough</option>
                  <option value="Confused">Don&apos;t understand finance</option>
                  <option value="FOMO">FOMO spending</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-outline uppercase tracking-wider mb-2 block font-semibold">Save Target: £{data.savingTarget}/mo</label>
                <input 
                  type="range" 
                  min="0" max="500" step="10"
                  value={data.savingTarget}
                  onChange={e => updateData({ savingTarget: Number(e.target.value) })}
                  className="w-full h-2 bg-surface-container-high rounded-lg appearance-none cursor-pointer accent-primary" 
                />
              </div>
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-3xl font-bold font-headline mb-8 text-primary">How should we talk?</h1>
            
            <div className="grid grid-cols-1 gap-4 mb-8">
              {[
                { id: "Gentle", icon: "spa", desc: "Gentle encouragement" },
                { id: "Tough", icon: "shield", desc: "Tough love" },
                { id: "Data", icon: "bar_chart", desc: "Data-driven facts" },
                { id: "Social", icon: "group", desc: "Social comparison" }
              ].map(p => (
                <button
                  key={p.id}
                  onClick={() => updateData({ personality: p.id })}
                  className={`p-5 rounded-2xl border flex items-center gap-4 transition-all ${data.personality === p.id ? "border-secondary bg-secondary/10" : "border-outline-variant bg-surface"}`}
                >
                  <span className={`material-symbols-outlined ${data.personality === p.id ? "text-secondary" : "text-outline"}`}>{p.icon}</span>
                  <span className={`font-semibold ${data.personality === p.id ? "text-secondary" : "text-on-surface"}`}>{p.desc}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between bg-surface p-5 rounded-2xl border border-outline-variant">
              <span className="font-semibold text-on-surface">Share progress?</span>
              <button 
                onClick={() => updateData({ shareProgress: !data.shareProgress })}
                className={`w-14 h-8 rounded-full transition-colors flex items-center px-1 ${data.shareProgress ? 'bg-primary' : 'bg-surface-container-high'}`}
              >
                <div className={`w-6 h-6 rounded-full bg-black transition-transform ${data.shareProgress ? 'translate-x-6' : ''}`} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Floating Bottom Section For Totals & Action */}
      <div className="mt-12 bg-surface border border-outline-variant p-6 rounded-3xl sticky bottom-4">
        {step < 3 && (
          <div className="flex justify-between text-sm mb-4 border-b border-outline-variant pb-4 items-center">
            <div className="text-outline uppercase tracking-wider font-semibold">
              {step === 1 ? 'Total Income' : 'Disposable'}
            </div>
            <div className="text-xl font-bold font-headline text-primary">
              £{step === 1 ? currentIncome : (currentIncome - currentFixedCosts)}
            </div>
          </div>
        )}
        
        <button 
          onClick={handleNext}
          className="w-full bg-primary text-black font-bold text-lg py-4 rounded-full flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
        >
          {step === 6 ? "Start your journey" : "Continue"}
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </div>

    </div>
  );
}
