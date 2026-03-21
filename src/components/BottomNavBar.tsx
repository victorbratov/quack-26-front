"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const BottomNavBar = () => {
  const pathname = usePathname();

  const navItems = [
    { label: "Home", icon: "home", href: "/" },
    { label: "Actions", icon: "layers", href: "/actions" },
    { label: "Growth", icon: "local_florist", href: "/growth" },
    { label: "Bloom", icon: "auto_stories", href: "/bloom" },
    { label: "Council", icon: "groups", href: "/council" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 z-50 flex w-full items-center justify-around bg-stone-50/80 dark:bg-stone-950/80 px-4 pb-[env(safe-area-inset-bottom,2rem)] pt-4 backdrop-blur-2xl rounded-t-[32px] shadow-[0_-8px_30px_rgba(0,0,0,0.03)]" aria-label="Main Navigation">
      {navItems.map((item) => {
        const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-label={item.label}
            aria-current={isActive ? "page" : undefined}
            className={`flex flex-col items-center justify-center px-4 py-2 transition-all duration-300 rounded-full ${
              isActive
                ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-900 dark:text-emerald-100"
                : "text-stone-500 hover:text-emerald-600 dark:hover:text-emerald-400"
            }`}
          >
            <span
              className="material-symbols-outlined transition-all text-[24px]"
              style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
            >
              {item.icon}
            </span>
            <span className={`font-headline text-[11px] font-semibold uppercase tracking-wider mt-1`}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
};
