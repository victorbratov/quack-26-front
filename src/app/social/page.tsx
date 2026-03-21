"use client";

import React, { useState } from "react";
import Image from "next/image";
import { GradientAvatar } from "~/components/ui/GradientAvatar";
import { Divider } from "~/components/ui/Divider";

type FeedTab = "All" | "Friends";

const MOCK_FRIENDS = [
  {
    id: 1,
    name: "Alex Chen",
    streak: 14,
    xp: 1240,
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAysK48VKATKh8qSZFag4L43XyQrGaptykte6dASd4aQhUWaEZBdGR0syxbbiojV_bqEedpfc2xcMTuqnWwMJCn4rv1xqQRSufy6BP2CbI0FdqPLUjWs7Cp-ohcDsTIR5LHGxQsGAh67Il8370krh0YZ8iwIHehllVX5iqHQzi25lwMO0ilHDOWAfafo9Mk3glWRoalbqjw0dyZHmriZrbjWseIcxOS2Vw2mOnOrHl8Hsg3E3VF7EOku_xTP2oC3zglLsLbeVhD1ho",
  },
  {
    id: 2,
    name: "Sarah Jenkins",
    streak: 5,
    xp: 820,
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD_Xfa3rY2HAtAjXanltK3yPZQxHB8k_sjY9rLg8lgXeMP9BxzlZXIoBSJVZvW8p5ynLhjvg_lXjumUPSYj2vgAPYPUIREgkR7X2RNy7JQtkRkfft7dr6fa__L8gUZ4rOARPzjqV0W7hnuKmYzQe7efroOJ7nOSk3WumZxlVOcxuR0yoQIDk02wJYVPVE4qs3hr7MkaJps1KWbJciH-X2XYXGMStUGgSlq_OQbLxQW0oLKe1b1gccrG_O3jLei0nyrAFJN5QbcEFKM",
  },
  { id: 3, name: "Jake Peralta", streak: 21, xp: 3400, avatar: "" },
  { id: 4, name: "Emma Smith", streak: 2, xp: 150, avatar: "" },
];

const FEED_ITEMS = [
  {
    name: "Alex",
    action: "reviewed budget",
    with: "Sarah",
    time: "6m",
    friend: MOCK_FRIENDS[0]!,
  },
  {
    name: "Sarah",
    action: "completed savings goal",
    with: "",
    time: "23m",
    friend: MOCK_FRIENDS[1]!,
  },
  {
    name: "Jake",
    action: "cancelled impulse at Zara",
    with: "",
    time: "1h",
    friend: MOCK_FRIENDS[2]!,
  },
  {
    name: "Emma",
    action: "joined No-Spend Weekend",
    with: "",
    time: "2h",
    friend: MOCK_FRIENDS[3]!,
  },
];

export default function SocialPage() {
  const [feedTab, setFeedTab] = useState<FeedTab>("All");

  return (
    <div className="mx-auto max-w-lg pb-32 min-h-screen bg-background text-on-background font-body">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-10 pb-4">
        <h1 className="text-3xl font-headline font-extrabold text-primary">
          COMMUNITY
        </h1>
        <button className="text-muted">
          <span className="material-symbols-outlined text-xl">search</span>
        </button>
      </div>

      {/* Tabs: All / Friends */}
      <div className="flex gap-6 px-5 border-b border-outline-variant">
        {(["All", "Friends"] as FeedTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setFeedTab(tab)}
            className={`pb-3 text-xs font-bold uppercase tracking-widest transition-colors border-b-2 ${
              feedTab === tab
                ? "border-primary text-primary"
                : "border-transparent text-muted"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Monthly Challenge Card */}
      <div className="px-5 mt-6">
        <div className="flex items-center gap-4 rounded-2xl border border-outline-variant bg-surface-container p-4">
          {/* Geometric art thumbnail */}
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-secondary/40 to-primary/20 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-2xl text-secondary">
              calendar_month
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold uppercase tracking-widest text-muted">
              MARCH 2026 DAILY PRACTICE
            </div>
            <div className="text-sm text-on-surface font-medium mt-0.5">
              487 participating
            </div>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex-1 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                <div
                  className="h-full bg-secondary rounded-full"
                  style={{ width: "0%" }}
                />
              </div>
              <span className="text-xs font-bold text-muted">0 / 31</span>
            </div>
          </div>
        </div>
      </div>

      <Divider className="mt-6" />

      {/* TODAY Activity Feed */}
      <div className="px-5 mt-4">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-muted mb-4">
          TODAY
        </h3>

        <div className="space-y-5">
          {FEED_ITEMS.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <GradientAvatar
                src={item.friend.avatar || undefined}
                initials={item.friend.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
                size={40}
              />

              <div className="flex-1 min-w-0">
                <p className="text-sm text-on-surface leading-snug">
                  <strong>{item.name}</strong> {item.action}
                  {item.with && (
                    <>
                      {" "}
                      w/ <strong>{item.with}</strong>
                    </>
                  )}
                  .{" "}
                  <span className="text-muted-foreground">{item.time}</span>
                </p>
              </div>

              {/* Small thumbnail */}
              <div className="w-10 h-10 rounded-lg bg-surface-container flex-shrink-0 overflow-hidden">
                {item.friend.avatar ? (
                  <Image
                    src={item.friend.avatar}
                    alt=""
                    width={40}
                    height={40}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full bg-surface-container-high" />
                )}
              </div>

              {/* Heart */}
              <button className="text-muted hover:text-primary transition-colors flex-shrink-0">
                <span className="material-symbols-outlined text-lg">
                  favorite
                </span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
