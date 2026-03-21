"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const BottomNavBar = () => {
  const pathname = usePathname();

  const navItems = [
    { label: "Today", icon: "style", href: "/" },
    { label: "Check", icon: "shield", href: "/check" },
    { label: "Decide", icon: "explore", href: "/decide" },
    { label: "Progress", icon: "bar_chart", href: "/progress" },
    { label: "Social", icon: "group", href: "/social" },
  ];

  if (pathname.includes("/onboarding")) return null;

  return (
    <nav className="fixed bottom-0 left-0 z-50 flex w-full items-center justify-around bg-black/80 px-4 pb-[env(safe-area-inset-bottom,2rem)] pt-4 backdrop-blur-3xl border-t border-outline-variant" aria-label="Main Navigation">
      {navItems.map((item) => {
        const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-label={item.label}
            aria-current={isActive ? "page" : undefined}
            className={`flex flex-col items-center justify-center transition-all duration-300 ${
              isActive
                ? "text-primary scale-110"
                : "text-outline hover:text-on-surface"
            }`}
          >
            <span
              className="material-symbols-outlined transition-all text-[28px]"
              style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
            >
              {item.icon}
            </span>
            <span className={`font-headline text-[10px] font-bold tracking-widest mt-1 opacity-80 ${isActive ? 'text-primary' : 'text-outline'}`}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
};
