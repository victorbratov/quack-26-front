"use client";

import React, { useState, useEffect } from "react";
import { GradientAvatar } from "~/components/ui/GradientAvatar";
import { Divider } from "~/components/ui/Divider";
import { SectionHeader } from "~/components/ui/SectionHeader";
import { social, squads as squadsAPI, challenges as challengesAPI, gamification } from "~/lib/api";
import type { FeedItem, Friend, Squad, Challenge, Leaderboard } from "~/lib/api";

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

  const handleJoinChallenge = async (id: string) => {
    try {
      await challengesAPI.join(id);
      setActiveChallenges((prev) => [...prev, ...allChallenges.filter((c) => c.id === id)]);
    } catch (e) { console.error(e); }
  };

  return (
    <div className="mx-auto max-w-lg pb-32 min-h-screen bg-background text-on-background font-body">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-10 pb-4">
        <h1 className="text-3xl font-headline font-extrabold text-primary">COMMUNITY</h1>
        <button className="text-muted"><span className="material-symbols-outlined text-xl">search</span></button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto px-5 pb-3 scrollbar-hide">
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
            <div className="px-5 space-y-5">
              {feed.length === 0 ? (
                <p className="text-muted text-center py-10">No activity yet. Add friends to see their progress!</p>
              ) : (
                feed.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <GradientAvatar initials={item.display_name?.[0] ?? "?"} size={40} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-on-surface leading-snug">{item.message}</p>
                      <p className="text-xs text-muted-foreground">{new Date(item.created_at).toRelativeTimeString?.() ?? new Date(item.created_at).toLocaleDateString()}</p>
                    </div>
                    <button className="text-muted hover:text-primary transition-colors flex-shrink-0">
                      <span className="material-symbols-outlined text-lg">favorite</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* SQUADS */}
          {activeTab === "Squads" && (
            <div className="px-5 space-y-4">
              {mySquads.map((squad) => (
                <div key={squad.id} className="glass-card p-5 rounded-2xl">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-headline font-bold text-xl text-on-surface">{squad.name}</h3>
                      <p className="text-xs text-muted">{squad.member_count} members</p>
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-secondary bg-secondary/10 px-2 py-1 rounded">
                      {squad.invite_code}
                    </div>
                  </div>
                </div>
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
            <div className="px-5 space-y-6">
              {activeChallenges.length > 0 && (
                <div>
                  <h3 className="text-xs uppercase font-bold tracking-widest text-muted mb-3">Active</h3>
                  {activeChallenges.map((ch) => (
                    <div key={ch.id} className="glass-card p-5 rounded-2xl mb-3">
                      <h4 className="font-headline font-bold text-lg text-on-surface">{ch.title}</h4>
                      <p className="text-sm text-muted mt-1">{ch.description}</p>
                      <div className="flex justify-between text-xs mt-3 text-muted">
                        <span>{ch.participant_count} participants</span>
                        <span>{ch.start_date} → {ch.end_date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div>
                <h3 className="text-xs uppercase font-bold tracking-widest text-muted mb-3">Discover</h3>
                {allChallenges.filter((c) => !activeChallenges.find((a) => a.id === c.id)).map((ch) => (
                  <div key={ch.id} className="glass-card p-5 rounded-2xl mb-3 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-on-surface">{ch.title}</h4>
                      <p className="text-xs text-muted">{ch.participant_count} participants</p>
                    </div>
                    <button onClick={() => handleJoinChallenge(ch.id)} className="px-4 py-2 rounded-full border border-primary text-primary text-sm font-bold hover:bg-primary/10">Join</button>
                  </div>
                ))}
                {allChallenges.length === 0 && <p className="text-muted text-center py-6">No challenges available</p>}
              </div>
            </div>
          )}

          {/* FRIENDS */}
          {activeTab === "Friends" && (
            <div className="px-5 space-y-4">
              {leaderboard && leaderboard.entries.length > 0 ? (
                <div className="border border-outline-variant rounded-2xl overflow-hidden bg-surface">
                  {leaderboard.entries.map((entry, i) => (
                    <div key={entry.user_id} className="p-4 flex items-center justify-between border-b border-outline-variant last:border-b-0">
                      <div className="flex items-center gap-3">
                        <div className="w-6 text-center text-muted font-bold text-sm">{i + 1}</div>
                        <GradientAvatar initials={entry.display_name[0] ?? "?"} size={36} />
                        <div className="font-bold text-sm">{entry.display_name}</div>
                      </div>
                      <div className="flex items-center gap-3 text-right">
                        <div className="flex items-center gap-1 text-secondary text-sm font-bold">
                          <span className="material-symbols-outlined text-sm">local_fire_department</span>{entry.current_streak_days}
                        </div>
                        <div className="text-xs text-muted w-14">{entry.total_xp} XP</div>
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
                    <div key={f.id} className="glass-card p-4 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <GradientAvatar initials={f.display_name[0] ?? "?"} size={36} />
                        <span className="font-bold text-sm">{f.display_name}</span>
                      </div>
                      <span className="text-xs text-muted">{f.total_xp} XP</span>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
