"use client";

import React, { useState, useEffect } from "react";
import { GradientAvatar } from "~/components/ui/GradientAvatar";
import { Divider } from "~/components/ui/Divider";
import { SectionHeader } from "~/components/ui/SectionHeader";
import { SpotlightCard } from "~/components/ui/SpotlightCard";
import { AnimatedList } from "~/components/ui/AnimatedList";
import { AnimatedCounter } from "~/components/ui/AnimatedCounter";
import { social, squads as squadsAPI, challenges as challengesAPI, gamification } from "~/lib/api";
import type { FeedItem, Friend, Squad, Challenge, Leaderboard, ChallengeDetail, FriendRequest } from "~/lib/api";

type Tab = "Feed" | "Squads" | "Challenges" | "Friends";

export default function SocialPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Feed");
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [mySquads, setMySquads] = useState<Squad[]>([]);
  const [activeChallenges, setActiveChallenges] = useState<Challenge[]>([]);
  const [allChallenges, setAllChallenges] = useState<Challenge[]>([]);
  const [leaderboard, setLeaderboard] = useState<Leaderboard | null>(null);
  const [inviteCode, setInviteCode] = useState("");
  const [squadName, setSquadName] = useState("");
  const [selectedChallenge, setSelectedChallenge] = useState<ChallengeDetail | null>(null);
  const [friendUserId, setFriendUserId] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      social.feed(),
      social.friends(),
      squadsAPI.list(),
      challengesAPI.active(),
      challengesAPI.list(),
      gamification.leaderboard(),
    ]).then(([feedR, friendsR, squadsR, activeChR, allChR, lbR]) => {
      if (feedR.status === "fulfilled") setFeed(feedR.value);
      if (friendsR.status === "fulfilled") setFriends(friendsR.value);
      if (squadsR.status === "fulfilled") setMySquads(squadsR.value);
      if (activeChR.status === "fulfilled") setActiveChallenges(activeChR.value);
      if (allChR.status === "fulfilled") setAllChallenges(allChR.value);
      if (lbR.status === "fulfilled") setLeaderboard(lbR.value);
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

  return (
    <div className="app-container pb-32 min-h-screen bg-background text-on-background font-body">
      {/* Header */}
      <div className="px-5 md:px-8 pt-10 pb-4">
        <h1 className="text-3xl md:text-4xl font-headline font-extrabold text-primary">COMMUNITY</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto px-5 md:px-8 pb-3 scrollbar-hide">
        {(["Feed", "Squads", "Challenges", "Friends"] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`whitespace-nowrap px-5 py-2.5 rounded-full font-medium text-sm transition-all border ${
              activeTab === tab ? "bg-primary text-on-primary border-primary" : "bg-transparent text-muted border-outline-variant hover:border-outline"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <Divider />

      {loading ? (
        <div className="flex items-center justify-center py-20"><span className="material-symbols-outlined text-3xl text-muted animate-spin">progress_activity</span></div>
      ) : (
        <section className="mt-4">
          {/* FEED */}
          {activeTab === "Feed" && (
            <div className="px-5 md:px-8">
              {feed.length === 0 ? (
                <p className="text-muted text-center py-10">No activity yet. Add friends to see their progress!</p>
              ) : (
                <AnimatedList staggerMs={60} className="space-y-5">
                  {feed.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <GradientAvatar initials={item.display_name?.[0] ?? "?"} size={40} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-on-surface leading-snug">{item.message}</p>
                        <p className="text-xs text-muted-foreground">{new Date(item.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </AnimatedList>
              )}
            </div>
          )}

          {/* SQUADS */}
          {activeTab === "Squads" && (
            <div className="px-5 md:px-8 space-y-4">
              {mySquads.map((squad) => (
                <SpotlightCard key={squad.id} className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-headline font-bold text-xl text-on-surface">{squad.name}</h3>
                      <p className="text-xs text-muted">{squad.member_count} members</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-secondary bg-secondary/10 px-2 py-1 rounded">
                        {squad.invite_code}
                      </div>
                      <button onClick={() => handleLeaveSquad(squad.id)} className="flex items-center gap-1 px-3 py-1 rounded-full border border-outline-variant text-muted text-xs hover:border-error hover:text-error transition-colors">
                        <span className="material-symbols-outlined text-sm">logout</span>
                        Leave
                      </button>
                    </div>
                  </div>
                </SpotlightCard>
              ))}

              <div className="flex gap-2">
                <input value={squadName} onChange={(e) => setSquadName(e.target.value)} type="text" placeholder="New squad name" className="flex-1 bg-surface-container p-4 rounded-full border border-outline-variant focus:border-primary outline-none text-sm placeholder:text-muted-foreground" />
                <button onClick={handleCreateSquad} className="px-5 rounded-full bg-primary text-on-primary font-bold text-sm hover:opacity-90">Create</button>
              </div>

              <div className="flex gap-2">
                <input value={inviteCode} onChange={(e) => setInviteCode(e.target.value)} type="text" placeholder="Invite code" className="flex-1 bg-surface-container p-4 rounded-full border border-outline-variant focus:border-primary outline-none text-sm placeholder:text-muted-foreground" />
                <button onClick={handleJoinSquad} className="px-6 rounded-full bg-secondary text-on-secondary font-bold text-sm hover:opacity-90">Join</button>
              </div>
            </div>
          )}

          {/* CHALLENGES */}
          {activeTab === "Challenges" && (
            <div className="px-5 md:px-8 space-y-6">
              {activeChallenges.length > 0 && (
                <div>
                  <h3 className="text-xs uppercase font-bold tracking-widest text-muted mb-3">Active</h3>
                  {activeChallenges.map((ch) => (
                    <SpotlightCard key={ch.id} className="p-5 mb-3 cursor-pointer" onClick={() => handleViewChallenge(ch.id)}>
                      <h4 className="font-headline font-bold text-lg text-on-surface">{ch.title}</h4>
                      <p className="text-sm text-muted mt-1">{ch.description}</p>
                      <div className="flex justify-between text-xs mt-3 text-muted">
                        <span>{ch.participant_count} participants</span>
                        <span>{ch.start_date} → {ch.end_date}</span>
                      </div>
                    </SpotlightCard>
                  ))}
                </div>
              )}

              <div>
                <h3 className="text-xs uppercase font-bold tracking-widest text-muted mb-3">Discover</h3>
                {allChallenges.filter((c) => !activeChallenges.find((a) => a.id === c.id)).map((ch) => (
                  <SpotlightCard key={ch.id} className="p-5 mb-3 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-on-surface">{ch.title}</h4>
                      <p className="text-xs text-muted">{ch.participant_count} participants</p>
                    </div>
                    <button onClick={() => handleJoinChallenge(ch.id)} className="px-4 py-2 rounded-full border border-primary text-primary text-sm font-bold hover:bg-primary/10">Join</button>
                  </SpotlightCard>
                ))}
                {allChallenges.length === 0 && <p className="text-muted text-center py-6">No challenges available</p>}
              </div>

              {selectedChallenge && (
                <div className="mt-4 space-y-3">
                  <Divider />
                  <div className="flex items-center justify-between">
                    <h3 className="font-headline font-bold text-lg text-on-surface">{selectedChallenge.title}</h3>
                    <button onClick={() => setSelectedChallenge(null)} className="text-xs font-bold text-muted hover:text-on-surface">Close</button>
                  </div>
                  <p className="text-sm text-muted">{selectedChallenge.description}</p>
                  <SectionHeader title="PARTICIPANTS" />
                  {selectedChallenge.participants.map((p) => (
                    <SpotlightCard key={p.user_id} className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GradientAvatar initials={p.display_name[0] ?? "?"} size={32} />
                        <span className="font-bold text-sm text-on-surface">{p.display_name}</span>
                      </div>
                      <span className={`text-xs font-bold uppercase px-2 py-1 rounded ${p.status === "completed" ? "bg-primary/20 text-primary" : "bg-secondary/20 text-secondary"}`}>
                        {p.status}
                      </span>
                    </SpotlightCard>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* FRIENDS */}
          {activeTab === "Friends" && (
            <div className="px-5 md:px-8 space-y-4">
              {leaderboard && leaderboard.entries.length > 0 ? (
                <div className="border border-outline-variant rounded-2xl overflow-hidden bg-surface">
                  {leaderboard.entries.map((entry, i) => (
                    <div key={entry.user_id} className="p-4 flex items-center justify-between border-b border-outline-variant last:border-b-0 hover:bg-white/[0.02] transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-6 text-center text-muted font-bold text-sm">{i + 1}</div>
                        <GradientAvatar initials={entry.display_name[0] ?? "?"} size={36} />
                        <div className="font-bold text-sm">{entry.display_name}</div>
                      </div>
                      <div className="flex items-center gap-3 text-right">
                        <div className="flex items-center gap-1 text-secondary text-sm font-bold">
                          <span className="material-symbols-outlined text-sm">local_fire_department</span>
                          <AnimatedCounter value={entry.current_streak_days} />
                        </div>
                        <div className="text-xs text-muted w-14">
                          <AnimatedCounter value={entry.total_xp} /> XP
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted text-center py-10">Add friends to see the leaderboard!</p>
              )}

              {friends.length > 0 && (
                <>
                  <SectionHeader title="YOUR FRIENDS" />
                  {friends.map((f) => (
                    <SpotlightCard key={f.id} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <GradientAvatar initials={f.display_name[0] ?? "?"} size={36} />
                        <span className="font-bold text-sm">{f.display_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted">{f.total_xp} XP</span>
                        <button onClick={() => handleUnfriend(f.id)} className="flex items-center gap-1 px-3 py-1 rounded-full border border-outline-variant text-muted text-xs hover:border-error hover:text-error transition-colors">
                          <span className="material-symbols-outlined text-sm">person_remove</span>
                          Unfriend
                        </button>
                      </div>
                    </SpotlightCard>
                  ))}
                </>
              )}

              <div className="mt-4 flex gap-2">
                <input
                  value={friendUserId}
                  onChange={(e) => setFriendUserId(e.target.value)}
                  type="text"
                  placeholder="Friend's user ID"
                  className="flex-1 bg-surface-container p-4 rounded-full border border-outline-variant focus:border-primary outline-none text-sm placeholder:text-muted-foreground"
                />
                <button
                  onClick={handleSendFriendRequest}
                  className="px-5 rounded-full bg-primary text-on-primary font-bold text-sm hover:opacity-90"
                >
                  Add
                </button>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
