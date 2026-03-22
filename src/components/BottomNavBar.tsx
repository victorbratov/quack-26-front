"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Community", icon: "language", href: "/social" },
  { label: "Discover", icon: "shield", href: "/check" },
  { label: "Today", icon: "wb_sunny", href: "/" },
  { label: "Studio", icon: "auto_awesome", href: "/decide" },
  { label: "Profile", icon: "person", href: "/progress" },
];

export const BottomNavBar = () => {
  const pathname = usePathname();

  if (pathname.includes("/onboarding") || pathname.includes("/sign-in")) return null;

  return (
    <nav
      className="fixed bottom-0 left-0 z-50 w-full md:max-w-3xl md:left-1/2 md:-translate-x-1/2 md:bottom-4 lg:max-w-4xl"
      aria-label="Main Navigation"
    >
      {/* Curved background shape (mobile only) — single element, no seam */}
      <div className="absolute inset-0 md:hidden pointer-events-none" style={{ top: "-22px" }}>
        <svg
          viewBox="0 0 390 22"
          preserveAspectRatio="none"
          className="w-full h-[22px] block"
        >
          <defs>
            <linearGradient id="nav-curve-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(255,255,255,0.07)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0)" />
            </linearGradient>
          </defs>
          {/* Solid curve fill matching the bar */}
          <path d="M0 22 Q195 0 390 22 L390 22 L0 22 Z" fill="#111111" />
          {/* Gradient overlay for depth */}
          <path d="M0 22 Q195 0 390 22 L390 22 L0 22 Z" fill="url(#nav-curve-grad)" />
        </svg>
      </div>

      <div className="relative flex items-center justify-around bg-[#111111] backdrop-blur-xl px-2 pb-[env(safe-area-inset-bottom,1.5rem)] pt-3 md:rounded-full md:border md:border-white/10 md:shadow-2xl md:shadow-black/50">
        {navItems.map((item) => {
          const isActive =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
              className="flex flex-col items-center justify-center gap-1 px-3 md:px-5 py-1 transition-all duration-200"
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
                <span className="text-[10px] md:text-xs font-medium tracking-wider text-primary uppercase">
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
