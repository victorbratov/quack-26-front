"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Community", icon: "public", href: "/social" },
  { label: "Discover", icon: "search", href: "/check" },
  { label: "Today", icon: "wb_sunny", href: "/" },
  { label: "Studio", icon: "place", href: "/decide" },
  { label: "Profile", icon: "person", href: "/progress" },
];

export const BottomNavBar = () => {
  const pathname = usePathname();

  if (pathname.includes("/onboarding")) return null;

  return (
    <nav
      className="fixed bottom-0 left-0 z-50 flex w-full items-center justify-around border-t border-outline-variant bg-black/90 px-2 pb-[env(safe-area-inset-bottom,1.5rem)] pt-3 backdrop-blur-xl"
      aria-label="Main Navigation"
    >
      {navItems.map((item) => {
        const isActive =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-label={item.label}
            aria-current={isActive ? "page" : undefined}
            className="flex flex-col items-center justify-center gap-1 px-3 py-1 transition-all duration-200"
          >
            <span
              className={`material-symbols-outlined text-[22px] transition-colors ${
                isActive ? "text-primary" : "text-muted"
              }`}
              style={{
                fontVariationSettings: isActive
                  ? "'FILL' 1, 'wght' 300"
                  : "'FILL' 0, 'wght' 200",
              }}
            >
              {item.icon}
            </span>
            {isActive && (
              <span className="text-[10px] font-medium tracking-wider text-primary">
                {item.label}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
};
