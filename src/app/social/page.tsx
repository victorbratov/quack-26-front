"use client";

import React, { useState } from "react";

import Image from "next/image";

type SocialTab = "Feed" | "Squads" | "Challenges" | "Friends";

const MOCK_FRIENDS = [
  { id: 1, name: "Alex Chen", streak: 14, xp: 1240, avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAysK48VKATKh8qSZFag4L43XyQrGaptykte6dASd4aQhUWaEZBdGR0syxbbiojV_bqEedpfc2xcMTuqnWwMJCn4rv1xqQRSufy6BP2CbI0FdqPLUjWs7Cp-ohcDsTIR5LHGxQsGAh67Il8370krh0YZ8iwIHehllVX5iqHQzi25lwMO0ilHDOWAfafo9Mk3glWRoalbqjw0dyZHmriZrbjWseIcxOS2Vw2mOnOrHl8Hsg3E3VF7EOku_xTP2oC3zglLsLbeVhD1ho" },
  { id: 2, name: "Sarah Jenkins", streak: 5, xp: 820, avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuD_Xfa3rY2HAtAjXanltK3yPZQxHB8k_sjY9rLg8lgXeMP9BxzlZXIoBSJVZvW8p5ynLhjvg_lXjumUPSYj2vgAPYPUIREgkR7X2RNy7JQtkRkfft7dr6fa__L8gUZ4rOARPzjqV0W7hnuKmYzQe7efroOJ7nOSk3WumZxlVOcxuR0yoQIDk02wJYVPVE4qs3hr7MkaJps1KWbJciH-X2XYXGMStUGgSlq_OQbLxQW0oLKe1b1gccrG_O3jLei0nyrAFJN5QbcEFKM" },
  { id: 3, name: "Jake Peralta", streak: 21, xp: 3400, avatar: "" },
  { id: 4, name: "Emma Smith", streak: 2, xp: 150, avatar: "" }
];

export default function SocialPage() {
  const [activeTab, setActiveTab] = useState<SocialTab>("Feed");
  const [feedFilter, setFeedFilter] = useState<"All" | "Friends">("Friends");

  return (
    <div className="mx-auto max-w-lg px-6 pt-12 pb-32 min-h-screen bg-black text-on-background font-body space-y-8">
      


      <section className="space-y-4">
        <h1 className="text-4xl font-headline font-bold text-primary">COMMUNITY</h1>
      </section>

      {/* Horizontal Scrollable Tabs */}
      <section className="sticky top-4 z-10 bg-black/80 backdrop-blur-md py-4 -mx-6 px-6">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {(["Feed", "Squads", "Challenges", "Friends"] as SocialTab[]).map(chip => (
            <button
              key={chip}
              onClick={() => setActiveTab(chip)}
              className={`whitespace-nowrap px-5 py-2.5 rounded-full font-bold text-sm transition-all border ${activeTab === chip ? "bg-primary text-black border-primary" : "bg-transparent text-outline border-outline-variant hover:border-outline"}`}
            >
              {chip}
            </button>
          ))}
        </div>
      </section>

      {/* TAB CONTENT */}
      <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* FEED */}
        {activeTab === "Feed" && (
          <div className="space-y-6">
            <div className="flex gap-4 border-b border-outline-variant pb-2">
              <button onClick={() => setFeedFilter("Friends")} className={`pb-2 font-bold uppercase tracking-widest text-xs transition-colors border-b-2 ${feedFilter === "Friends" ? "border-primary text-primary" : "border-transparent text-outline"}`}>Friends</button>
              <button onClick={() => setFeedFilter("All")} className={`pb-2 font-bold uppercase tracking-widest text-xs transition-colors border-b-2 ${feedFilter === "All" ? "border-primary text-primary" : "border-transparent text-outline"}`}>Global</button>
            </div>

            <div className="space-y-6">
              {/* Intent Cancelled */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full border-2 border-surface relative overflow-hidden bg-surface-container shrink-0">
                  <Image src={MOCK_FRIENDS[0]!.avatar} alt="Avatar" fill className="object-cover" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-on-surface"><strong>Alex Chen</strong> cancelled a <strong className="text-emerald-400">£60</strong> impulse at Zara.</p>
                  <p className="text-xs text-outline">2 hours ago</p>
                </div>
                <button className="w-8 h-8 rounded-full bg-surface-container-high hover:bg-primary/20 hover:text-primary flex items-center justify-center transition-colors">
                  <span className="material-symbols-outlined text-sm">favorite</span>
                </button>
              </div>

              {/* Streak Milestone */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full border-2 border-surface relative overflow-hidden bg-surface-container shrink-0">
                  <Image src={MOCK_FRIENDS[1]!.avatar} alt="Avatar" fill className="object-cover" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-on-surface"><strong>Sarah Jenkins</strong> hit a <strong className="text-secondary">14-day tracking streak 🔥</strong></p>
                  <p className="text-xs text-outline">5 hours ago</p>
                </div>
                <button className="w-8 h-8 rounded-full bg-surface-container-high hover:bg-primary/20 hover:text-primary flex items-center justify-center transition-colors">
                  <span className="material-symbols-outlined text-sm">front_hand</span>
                </button>
              </div>

              {/* Joined Challenge */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full border-2 border-surface relative flex items-center justify-center bg-emerald-400/20 text-emerald-400 shrink-0 font-bold">
                  JP
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-on-surface"><strong>Jake Peralta</strong> joined the <strong>No-Spend Weekend</strong> challenge.</p>
                  <div className="mt-2 p-3 bg-surface border border-outline-variant rounded-xl flex items-center justify-between">
                    <span className="text-xs uppercase font-bold tracking-widest text-outline">No-Spend Weekend</span>
                    <button className="text-xs font-bold text-primary">Join</button>
                  </div>
                  <p className="text-xs text-outline pt-2">Yesterday</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SQUADS */}
        {activeTab === "Squads" && (
          <div className="space-y-4">
            <button className="w-full p-5 rounded-3xl border border-dashed border-outline text-outline font-bold flex items-center justify-center gap-2 hover:bg-surface-container transition-colors mb-4">
              <span className="material-symbols-outlined">add</span>
              Create a Squad
            </button>

            <div className="bg-surface p-6 rounded-3xl border border-primary/30 relative overflow-hidden group hover:border-primary transition-colors cursor-pointer">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-bl-[100px] transition-transform group-hover:scale-110"></div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="font-headline font-bold text-2xl text-on-surface">UCL Savers</h3>
                    <p className="text-outline text-sm">Private · 12 Members</p>
                  </div>
                  <div className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase">
                    Rank #4
                  </div>
                </div>
                
                <div className="flex -space-x-3 mb-6">
                  <div className="w-10 h-10 rounded-full border-2 border-surface relative overflow-hidden bg-surface-container"><Image src={MOCK_FRIENDS[0]!.avatar} alt="" fill className="object-cover"/></div>
                  <div className="w-10 h-10 rounded-full border-2 border-surface relative overflow-hidden bg-surface-container"><Image src={MOCK_FRIENDS[1]!.avatar} alt="" fill className="object-cover"/></div>
                  <div className="w-10 h-10 rounded-full border-2 border-surface relative flex items-center justify-center bg-emerald-400/20 text-emerald-400 font-bold text-xs">JP</div>
                  <div className="w-10 h-10 rounded-full border-2 border-surface flex items-center justify-center bg-surface-container-high text-xs font-bold">+9</div>
                </div>

                <div className="pt-4 border-t border-outline-variant">
                  <div className="text-xs uppercase font-bold tracking-widest text-outline mb-2">Active Squad Challenge</div>
                  <div className="flex justify-between items-center text-sm font-bold text-on-surface">
                    <span>£500 Collective Savings</span>
                    <span className="text-primary">£340 / £500</span>
                  </div>
                  <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden mt-2">
                    <div className="h-full bg-primary" style={{ width: '68%' }}></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <input type="text" placeholder="Squad Invite Code" className="flex-1 bg-surface-container p-4 rounded-full border border-outline-variant focus:border-primary outline-none text-sm placeholder:text-outline" />
              <button className="px-6 rounded-full bg-primary text-black font-bold text-sm hover:opacity-90">Join</button>
            </div>
          </div>
        )}

        {/* CHALLENGES */}
        {activeTab === "Challenges" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xs uppercase font-bold tracking-widest text-outline mb-4">Active</h3>
              <div className="bg-gradient-to-br from-secondary/20 to-surface border border-secondary/30 p-6 rounded-3xl relative overflow-hidden">
                <div className="flex items-center gap-3 text-secondary mb-4">
                  <span className="material-symbols-outlined text-3xl">local_cafe</span>
                  <h4 className="font-headline font-bold text-xl text-on-surface">No-Coffee Week</h4>
                </div>
                <p className="text-outline text-sm mb-6 max-w-[80%]">Skip buying coffee out for 7 days. Make it at home.</p>
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest mb-2 text-on-surface">
                  <span>Day 4 of 7</span>
                  <span className="text-secondary">+500 XP</span>
                </div>
                <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden mb-4">
                  <div className="h-full bg-secondary" style={{ width: '57%' }}></div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xs uppercase font-bold tracking-widest text-outline mb-4">Discover</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-surface border border-outline-variant p-5 rounded-2xl flex flex-col justify-between aspect-square hover:border-emerald-400 group cursor-pointer transition-colors">
                  <span className="material-symbols-outlined text-emerald-400 text-3xl group-hover:scale-110 transition-transform">restaurant</span>
                  <div>
                    <h5 className="font-bold text-on-surface text-lg leading-tight mb-1">Cook at Home</h5>
                    <div className="text-xs text-outline font-bold">14 Days</div>
                  </div>
                </div>
                <div className="bg-surface border border-outline-variant p-5 rounded-2xl flex flex-col justify-between aspect-square hover:border-primary group cursor-pointer transition-colors">
                  <span className="material-symbols-outlined text-primary text-3xl group-hover:scale-110 transition-transform">directions_walk</span>
                  <div>
                    <h5 className="font-bold text-on-surface text-lg leading-tight mb-1">Walk to Work</h5>
                    <div className="text-xs text-outline font-bold">5 Days</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FRIENDS */}
        {activeTab === "Friends" && (
          <div className="space-y-6">
            <div className="flex gap-2">
              <input type="text" placeholder="Search by email or username" className="flex-1 bg-surface-container p-4 rounded-full border border-outline-variant focus:border-primary outline-none text-sm placeholder:text-outline" />
              <button className="w-14 h-14 rounded-full bg-primary text-black flex items-center justify-center hover:opacity-90">
                <span className="material-symbols-outlined">person_add</span>
              </button>
            </div>

            <div className="space-y-0 text-on-surface border border-outline-variant rounded-3xl overflow-hidden bg-surface">
              {MOCK_FRIENDS.sort((a,b) => b.xp - a.xp).map((friend, i) => (
                <div key={friend.id} className="p-4 flex items-center justify-between border-b border-outline-variant last:border-b-0 hover:bg-surface-container transition-colors cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-6 text-center text-outline font-bold text-sm">{i + 1}</div>
                    <div className="w-10 h-10 rounded-full border-2 border-surface relative overflow-hidden bg-surface-container-high flex items-center justify-center font-bold text-xs">
                      {friend.avatar ? (
                        <Image src={friend.avatar} alt={friend.name} fill className="object-cover" />
                      ) : (
                        friend.name.split(' ').map(n => n[0]).join('')
                      )}
                    </div>
                    <div className="font-bold">{friend.name}</div>
                  </div>
                  <div className="flex items-center gap-4 text-right">
                    <div className="flex items-center gap-1 text-secondary text-sm font-bold">
                      <span className="material-symbols-outlined text-sm">local_fire_department</span>
                      {friend.streak}
                    </div>
                    <div className="text-xs text-outline w-12">{friend.xp} XP</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </section>
    </div>
  );
}
