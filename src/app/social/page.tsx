"use client";

import React, { useState, useEffect } from "react";
import { GradientAvatar } from "~/components/ui/GradientAvatar";
import { Divider } from "~/components/ui/Divider";
import { SectionHeader } from "~/components/ui/SectionHeader";
import { SpotlightCard } from "~/components/ui/SpotlightCard";
import { AnimatedList } from "~/components/ui/AnimatedList";
import { AnimatedCounter } from "~/components/ui/AnimatedCounter";
import { social, squads as squadsAPI, challenges as challengesAPI, gamification, auth } from "~/lib/api";
import type { FeedItem, Friend, Squad, Challenge, Leaderboard, ChallengeDetail, SquadDetail, AuthUser } from "~/lib/api";
import { SquadChat } from "~/components/SquadChat";

type Tab = "Feed" | "Squads" | "Challenges" | "Friends";
type SquadView = "members" | "chat";

const EVENT_ICONS: Record<string, string> = {
  intent_cancelled: "block",
  intent_accepted: "check_circle",
  intent_vaulted: "savings",
  streak_milestone: "local_fire_department",
  challenge_joined: "flag",
  challenge_completed: "emoji_events",
  savings_milestone: "savings",
  squad_joined: "group",
};

export default function SocialPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Feed");
  const [activeFilter, setActiveFilter] = useState<"All" | "Skipped" | "Bought" | "Vaulted">("All");
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [mySquads, setMySquads] = useState<Squad[]>([]);
  const [activeChallenges, setActiveChallenges] = useState<Challenge[]>([]);
  const [allChallenges, setAllChallenges] = useState<Challenge[]>([]);
  const [leaderboard, setLeaderboard] = useState<Leaderboard | null>(null);
  const [inviteCode, setInviteCode] = useState("");
  const [squadName, setSquadName] = useState("");
  const [selectedChallenge, setSelectedChallenge] = useState<ChallengeDetail | null>(null);
  const [selectedSquad, setSelectedSquad] = useState<SquadDetail | null>(null);
  const [friendUserId, setFriendUserId] = useState("");
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [squadView, setSquadView] = useState<SquadView>("members");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void Promise.allSettled([
      social.feed(),
      social.friends(),
      squadsAPI.list(),
      challengesAPI.active(),
      challengesAPI.list(),
      gamification.leaderboard(),
      auth.me(),
    ]).then(([feedR, friendsR, squadsR, activeChR, allChR, lbR, meR]) => {
      if (feedR.status === "fulfilled") setFeed(feedR.value);
      if (friendsR.status === "fulfilled") setFriends(friendsR.value);
      if (squadsR.status === "fulfilled") setMySquads(squadsR.value);
      if (activeChR.status === "fulfilled") setActiveChallenges(activeChR.value);
      if (allChR.status === "fulfilled") setAllChallenges(allChR.value);
      if (lbR.status === "fulfilled") setLeaderboard(lbR.value);
      if (meR.status === "fulfilled") setCurrentUser(meR.value);
      setLoading(false);
    });
  }, []);

  const handleJoinSquad = async () => {
    if (!inviteCode) return;
    try {
      const squad = await squadsAPI.join(inviteCode);
      setMySquads((prev) => [...prev, squad]);
      setInviteCode("");
    } catch (e) { console.error(e); }
  };

  const handleCreateSquad = async () => {
    if (!squadName) return;
    try {
      const squad = await squadsAPI.create(squadName);
      setMySquads((prev) => [...prev, squad]);
      setSquadName("");
    } catch (e) { console.error(e); }
  };

  const handleLeaveSquad = async (id: string) => {
    try {
      await squadsAPI.leave(id);
      setMySquads((prev) => prev.filter((s) => s.id !== id));
      if (selectedSquad?.id === id) setSelectedSquad(null);
    } catch (e) { console.error(e); }
  };

  const handleViewSquad = async (id: string) => {
    try {
      const detail = await squadsAPI.get(id);
      setSelectedSquad(detail);
    } catch (e) { console.error(e); }
  };

  const handleUnfriend = async (userId: string) => {
    try {
      await social.unfriend(userId);
      setFriends((prev) => prev.filter((f) => f.id !== userId));
    } catch (e) { console.error(e); }
  };

  const handleViewChallenge = async (id: string) => {
    try {
      const detail = await challengesAPI.get(id);
      setSelectedChallenge(detail);
    } catch (e) { console.error(e); }
  };

  const handleSendFriendRequest = async () => {
    if (!friendUserId.trim()) return;
    try {
      await social.sendRequest(friendUserId.trim());
      setFriendUserId("");
    } catch (e) { console.error(e); }
  };

  const handleJoinChallenge = async (id: string) => {
    try {
      await challengesAPI.join(id);
      setActiveChallenges((prev) => [...prev, ...allChallenges.filter((c) => c.id === id)]);
    } catch (e) { console.error(e); }
  };

  // Filter feed items before grouping
  const filteredFeed = feed.filter((item) => {
    if (activeFilter === "All") return true;
    if (activeFilter === "Skipped") return item.event_type === "intent_cancelled";
    if (activeFilter === "Bought") return item.event_type === "intent_accepted";
    if (activeFilter === "Vaulted") return item.event_type === "intent_vaulted";
    return true;
  });

  // Group feed items by date
  const groupedFeed = filteredFeed.reduce<Record<string, FeedItem[]>>((acc, item) => {
    const date = new Date(item.created_at);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let label: string;
    if (date.toDateString() === today.toDateString()) label = "Today";
    else if (date.toDateString() === yesterday.toDateString()) label = "Yesterday";
    else label = date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });

    acc[label] ??= [];
    acc[label]!.push(item);
    return acc;
  }, {});

  return (
    <div className="app-container pb-32 min-h-screen bg-background text-on-background font-body">
      {/* Header */}
      <div className="px-5 md:px-8 pt-10 pb-4">
        <h1 className="text-3xl md:text-4xl font-headline font-extrabold text-primary">COMMUNITY</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto px-5 md:px-8 pb-4 scrollbar-hide">
        {(["Feed", "Squads", "Challenges", "Friends"] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setSelectedSquad(null); setSelectedChallenge(null); }}
            className={`whitespace-nowrap px-5 py-2.5 rounded-full font-medium text-sm transition-all border ${activeTab === tab ? "bg-primary text-on-primary border-primary" : "bg-transparent text-muted border-outline-variant hover:border-outline"
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><span className="material-symbols-outlined text-3xl text-muted animate-spin">progress_activity</span></div>
      ) : (
        <section>
          {/* ─── FEED ─── */}
          {activeTab === "Feed" && (
            <div className="px-5 md:px-8">
              {/* Filter Row */}
              <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide">
                {(["All", "Skipped", "Bought", "Vaulted"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setActiveFilter(f)}
                    className={`px-3 py-1.5 rounded-sm text-[10px] uppercase font-black tracking-widest transition-all border flex flex-col items-center gap-0.5 min-w-[70px] ${
                      activeFilter === f
                        ? "bg-primary/10 text-primary border-primary/50 shadow-inner"
                        : "bg-surface-container/20 text-muted/60 border-white/[0.03] hover:border-white/[0.1] hover:bg-surface-container/40"
                    }`}
                  >
                    <span className="opacity-80 leading-none">{f}</span>
                    {activeFilter === f && (
                      <div className="h-0.5 w-4 bg-primary rounded-full mt-0.5" />
                    )}
                  </button>
                ))}
              </div>

              {filteredFeed.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-14 h-14 rounded-full bg-surface-container-high flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-muted text-2xl">filter_list_off</span>
                  </div>
                  <p className="text-muted text-sm">No items match this filter.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(groupedFeed).map(([dateLabel, items]) => (
                    <div key={dateLabel}>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-muted mb-3">{dateLabel}</div>
                      <AnimatedList staggerMs={50} className="space-y-0">
                        {items.map((item, idx) => {
                          const isVaulted = item.event_type === "intent_vaulted";
                          return (
                            <div key={item.id}>
                              <div className={`flex items-start gap-3 py-4 px-3 rounded-2xl transition-all ${isVaulted ? "bg-secondary/5 border border-secondary/10" : ""}`}>
                                <GradientAvatar initials={item.display_name?.[0] ?? "?"} size={38} />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-on-surface leading-snug">
                                    <span className="font-bold">{item.display_name}</span>{" "}
                                    {isVaulted ? (
                                      <span className="text-secondary font-medium">{item.message.replace(item.display_name ?? "", "").trim()}</span>
                                    ) : (
                                      item.message.replace(item.display_name ?? "", "").trim()
                                    )}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <p className="text-[11px] text-muted-foreground">
                                      {new Date(item.created_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                                    </p>
                                    {isVaulted && (
                                      <span className="text-[9px] font-bold uppercase tracking-tighter bg-secondary/20 text-secondary px-1.5 py-0.5 rounded">Vaulted</span>
                                    )}
                                  </div>
                                </div>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${isVaulted ? "bg-secondary/20 text-secondary" : "bg-white/[0.04] text-muted"}`}>
                                  <span className="material-symbols-outlined text-[16px]">
                                    {EVENT_ICONS[item.event_type] ?? "notifications"}
                                  </span>
                                </div>
                              </div>
                              {idx < items.length - 1 && !isVaulted && <div className="h-px bg-white/[0.04] ml-[50px]" />}
                            </div>
                          );
                        })}
                      </AnimatedList>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ─── SQUADS ─── */}
          {activeTab === "Squads" && !selectedSquad && (
            <div className="px-5 md:px-8 space-y-4">
              <SectionHeader title="YOUR SQUADS" />

              {mySquads.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-14 h-14 rounded-full bg-surface-container-high flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-muted text-2xl">group_add</span>
                  </div>
                  <p className="text-muted text-sm">No squads yet. Create one or join with a code!</p>
                </div>
              ) : (
                <AnimatedList staggerMs={80} className="space-y-3">
                  {mySquads.map((squad) => (
                    <SpotlightCard
                      key={squad.id}
                      className="p-5 cursor-pointer"
                      onClick={() => handleViewSquad(squad.id)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-secondary/20 to-primary/10 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-secondary text-xl">group</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-headline font-bold text-base text-on-surface">{squad.name}</h3>
                          <p className="text-xs text-muted mt-0.5">{squad.member_count} members</p>
                        </div>
                        <span className="material-symbols-outlined text-muted text-lg">chevron_right</span>
                      </div>
                    </SpotlightCard>
                  ))}
                </AnimatedList>
              )}

              <Divider className="mt-2" />
              <SectionHeader title="JOIN OR CREATE" />

              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    value={squadName}
                    onChange={(e) => setSquadName(e.target.value)}
                    type="text"
                    placeholder="New squad name"
                    className="flex-1 bg-surface-container p-4 rounded-full border border-outline-variant focus:border-primary outline-none text-sm placeholder:text-muted-foreground"
                  />
                  <button
                    onClick={handleCreateSquad}
                    disabled={!squadName}
                    className="w-28 rounded-full bg-primary text-on-primary font-bold text-sm hover:opacity-90 disabled:opacity-40 transition-all"
                  >
                    Create
                  </button>
                </div>
                <div className="flex gap-2">
                  <input
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    type="text"
                    placeholder="Enter invite code"
                    className="flex-1 bg-surface-container p-4 rounded-full border border-outline-variant focus:border-primary outline-none text-sm placeholder:text-muted-foreground"
                  />
                  <button
                    onClick={handleJoinSquad}
                    disabled={!inviteCode}
                    className="w-28 rounded-full bg-secondary text-on-secondary font-bold text-sm hover:opacity-90 disabled:opacity-40 transition-all"
                  >
                    Join
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ─── SQUAD DETAIL ─── */}
          {activeTab === "Squads" && selectedSquad && (
            <div className="px-5 md:px-8 space-y-5">
              {/* Back button */}
              <button onClick={() => setSelectedSquad(null)} className="flex items-center gap-1 text-sm text-muted hover:text-on-surface transition-colors">
                <span className="material-symbols-outlined text-lg">arrow_back</span>
                All Squads
              </button>

              {/* Squad header */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-secondary/30 to-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-secondary text-3xl">group</span>
                </div>
                <div className="flex-1">
                  <h2 className="font-headline font-bold text-2xl text-on-surface">{selectedSquad.name}</h2>
                  <p className="text-sm text-muted">{selectedSquad.member_count} members</p>
                </div>
              </div>

              {/* View toggle */}
              <div className="flex p-1 bg-surface-container rounded-full border border-outline-variant">
                {(["members", "chat"] as SquadView[]).map((view) => (
                  <button
                    key={view}
                    onClick={() => setSquadView(view)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${squadView === view ? "bg-surface-container-high text-primary shadow-sm" : "text-muted hover:text-on-surface"
                      }`}
                  >
                    <span className="material-symbols-outlined text-sm">{view === "members" ? "group" : "forum"}</span>
                    {view}
                  </button>
                ))}
              </div>

              {squadView === "chat" ? (
                <SquadChat squadId={selectedSquad.id} currentUserId={currentUser?.id} />
              ) : (
                <>
                  {/* Invite code */}
                  <SpotlightCard className="p-4 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-muted">Invite Code</div>
                      <div className="font-mono font-bold text-lg text-primary mt-0.5">{selectedSquad.invite_code}</div>
                    </div>
                    <button
                      onClick={() => navigator.clipboard?.writeText(selectedSquad.invite_code)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-outline-variant text-sm text-muted hover:text-on-surface hover:border-outline transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">content_copy</span>
                      Copy
                    </button>
                  </SpotlightCard>

                  <Divider />

                  {/* Members */}
                  <SectionHeader title="MEMBERS" />
                  <AnimatedList staggerMs={80} className="space-y-2">
                    {selectedSquad.members.map((member, i) => (
                      <div key={member.id} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-white/[0.02] transition-colors">
                        <div className="w-6 text-center text-muted font-bold text-xs">{i + 1}</div>
                        <GradientAvatar initials={member.display_name[0] ?? "?"} size={40} />
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-sm text-on-surface">{member.display_name}</div>
                          <div className="text-xs text-muted">{member.total_xp} XP</div>
                        </div>
                        <div className="flex items-center gap-1 text-secondary text-sm font-bold">
                          <span className="material-symbols-outlined text-sm">local_fire_department</span>
                          {member.current_streak_days}
                        </div>
                      </div>
                    ))}
                  </AnimatedList>
                </>
              )}

              <Divider />

              {/* Leave squad */}
              <button
                onClick={() => handleLeaveSquad(selectedSquad.id)}
                className="w-full py-3 rounded-full border border-error/30 text-error text-sm font-bold hover:bg-error/5 transition-colors"
              >
                Leave Squad
              </button>
            </div>
          )}

          {/* ─── CHALLENGES ─── */}
          {activeTab === "Challenges" && !selectedChallenge && (
            <div className="px-5 md:px-8 space-y-5">
              {activeChallenges.length > 0 && (
                <>
                  <SectionHeader title="ACTIVE" />
                  <AnimatedList staggerMs={80} className="space-y-3">
                    {activeChallenges.map((ch) => (
                      <SpotlightCard key={ch.id} className="p-5 cursor-pointer" onClick={() => handleViewChallenge(ch.id)}>
                        <div className="flex items-start gap-4">
                          <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-primary">flag</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-headline font-bold text-base text-on-surface">{ch.title}</h4>
                            <p className="text-xs text-muted mt-1 line-clamp-1">{ch.description}</p>
                            <div className="flex items-center gap-3 mt-2 text-[11px] text-muted">
                              <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-xs">group</span>
                                {ch.participant_count}
                              </span>
                              <span>{ch.start_date} → {ch.end_date}</span>
                            </div>
                          </div>
                          <span className="material-symbols-outlined text-muted text-lg mt-1">chevron_right</span>
                        </div>
                      </SpotlightCard>
                    ))}
                  </AnimatedList>
                </>
              )}

              {(() => {
                const discoverable = allChallenges.filter((c) => !activeChallenges.find((a) => a.id === c.id));
                return discoverable.length > 0 ? (
                  <>
                    <Divider />
                    <SectionHeader title="DISCOVER" />
                    <AnimatedList staggerMs={80} className="space-y-3">
                      {discoverable.map((ch) => (
                        <SpotlightCard key={ch.id} className="p-5 flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            <div className="w-11 h-11 rounded-full bg-white/[0.04] flex items-center justify-center shrink-0">
                              <span className="material-symbols-outlined text-muted">flag</span>
                            </div>
                            <div>
                              <h4 className="font-bold text-sm text-on-surface">{ch.title}</h4>
                              <p className="text-xs text-muted mt-0.5">{ch.participant_count} participants</p>
                            </div>
                          </div>
                          <button onClick={(e) => { e.stopPropagation(); void handleJoinChallenge(ch.id); }} className="px-4 py-2 rounded-full border border-primary text-primary text-xs font-bold hover:bg-primary/10 shrink-0 ml-3">Join</button>
                        </SpotlightCard>
                      ))}
                    </AnimatedList>
                  </>
                ) : null;
              })()}

              {activeChallenges.length === 0 && allChallenges.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-14 h-14 rounded-full bg-surface-container-high flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-muted text-2xl">flag</span>
                  </div>
                  <p className="text-muted text-sm">No challenges available yet.</p>
                </div>
              )}
            </div>
          )}

          {/* ─── CHALLENGE DETAIL ─── */}
          {activeTab === "Challenges" && selectedChallenge && (
            <div className="px-5 md:px-8 space-y-5">
              <button onClick={() => setSelectedChallenge(null)} className="flex items-center gap-1 text-sm text-muted hover:text-on-surface transition-colors">
                <span className="material-symbols-outlined text-lg">arrow_back</span>
                All Challenges
              </button>

              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-2xl">flag</span>
                </div>
                <div>
                  <h2 className="font-headline font-bold text-2xl text-on-surface">{selectedChallenge.title}</h2>
                  <p className="text-sm text-muted mt-0.5">{selectedChallenge.start_date} → {selectedChallenge.end_date}</p>
                </div>
              </div>

              {selectedChallenge.description && (
                <p className="text-sm text-muted leading-relaxed">{selectedChallenge.description}</p>
              )}

              <Divider />
              <SectionHeader title={`PARTICIPANTS (${selectedChallenge.participants.length})`} />

              <AnimatedList staggerMs={60} className="space-y-2">
                {selectedChallenge.participants.map((p) => (
                  <div key={p.user_id} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-white/[0.02] transition-colors">
                    <GradientAvatar initials={p.display_name[0] ?? "?"} size={38} />
                    <div className="flex-1 min-w-0">
                      <span className="font-bold text-sm text-on-surface">{p.display_name}</span>
                    </div>
                    <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${p.status === "completed" ? "bg-primary/15 text-primary" : "bg-secondary/15 text-secondary"}`}>
                      {p.status}
                    </span>
                  </div>
                ))}
              </AnimatedList>
            </div>
          )}

          {/* ─── FRIENDS ─── */}
          {activeTab === "Friends" && (
            <div className="px-5 md:px-8 space-y-5">
              {/* Leaderboard */}
              {leaderboard && leaderboard.entries.length > 0 && (
                <>
                  <SectionHeader title="LEADERBOARD" />
                  <div className="rounded-2xl border border-outline-variant overflow-hidden bg-black">
                    {leaderboard.entries.map((entry, i) => (
                      <div key={entry.user_id} className="flex items-center gap-3 p-4 border-b border-white/[0.04] last:border-b-0">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? "bg-primary/20 text-primary" : i === 1 ? "bg-secondary/20 text-secondary" : "bg-white/[0.04] text-muted"
                          }`}>
                          {i + 1}
                        </div>
                        <GradientAvatar initials={entry.display_name[0] ?? "?"} size={36} />
                        <div className="flex-1 min-w-0 font-bold text-sm text-on-surface">{entry.display_name}</div>
                        <div className="flex items-center gap-3 text-right">
                          <div className="flex items-center gap-1 text-secondary text-sm font-bold">
                            <span className="material-symbols-outlined text-sm">local_fire_department</span>
                            <AnimatedCounter value={entry.current_streak_days} />
                          </div>
                          <div className="text-xs text-muted w-16 text-right">
                            <AnimatedCounter value={entry.total_xp} /> XP
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Friends list */}
              {friends.length > 0 && (
                <>
                  <Divider />
                  <div className="flex items-center justify-between px-5 py-3 pr-3">
                    <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">Your Friends</h2>
                    <button
                      onClick={() => setShowAddFriend(true)}
                      className="w-8 h-8 rounded-full border border-outline-variant flex items-center justify-center text-muted hover:text-primary hover:border-primary/50 transition-colors"
                      title="Add friend"
                    >
                      <span className="material-symbols-outlined text-[18px]">person_add</span>
                    </button>
                  </div>
                  <AnimatedList staggerMs={60} className="space-y-2">
                    {friends.map((f) => (
                      <div key={f.id} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-white/[0.02] transition-colors">
                        <GradientAvatar initials={f.display_name[0] ?? "?"} size={40} />
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-sm text-on-surface">{f.display_name}</div>
                          <div className="text-xs text-muted">{f.total_xp} XP · {f.current_streak_days}d streak</div>
                        </div>
                        <button onClick={() => handleUnfriend(f.id)} className="w-8 h-8 rounded-full flex items-center justify-center text-muted hover:text-error hover:bg-error/5 transition-colors" title="Unfriend">
                          <span className="material-symbols-outlined text-[18px]">person_remove</span>
                        </button>
                      </div>
                    ))}
                  </AnimatedList>
                </>
              )}

              {!leaderboard?.entries.length && !friends.length && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-14 h-14 rounded-full bg-surface-container-high flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-muted text-2xl">person_add</span>
                  </div>
                  <p className="text-muted text-sm">Add friends to see the leaderboard!</p>
                  <button onClick={() => setShowAddFriend(true)} className="mt-3 px-5 py-2 rounded-full border border-primary text-primary text-sm font-bold hover:bg-primary/10">
                    Add a friend
                  </button>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* Add Friend Modal */}
      {showAddFriend && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => { setShowAddFriend(false); setFriendUserId(""); }} />
          <div className="relative w-full max-w-sm bg-black border border-white/[0.1] rounded-3xl p-6 space-y-5 animate-slide-up">
            <div className="flex items-center justify-between">
              <h3 className="font-headline font-bold text-lg text-on-surface">Add Friend</h3>
              <button
                onClick={() => { setShowAddFriend(false); setFriendUserId(""); }}
                className="w-8 h-8 rounded-full border border-outline-variant flex items-center justify-center text-muted hover:text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
            <input
              value={friendUserId}
              onChange={(e) => setFriendUserId(e.target.value)}
              type="text"
              placeholder="Enter user ID"
              autoFocus
              className="w-full bg-surface-container p-4 rounded-2xl border border-outline-variant focus:border-primary outline-none text-sm placeholder:text-muted-foreground"
            />
            <button
              onClick={() => { handleSendFriendRequest(); setShowAddFriend(false); }}
              disabled={!friendUserId.trim()}
              className="w-full py-3.5 rounded-full bg-primary text-on-primary font-bold text-sm hover:opacity-90 disabled:opacity-40 transition-all"
            >
              Send Request
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
