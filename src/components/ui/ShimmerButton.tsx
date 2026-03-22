"use client";

import React from "react";
import { cn } from "~/lib/utils";

interface ShimmerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  shimmerColor?: string;
  className?: string;
}

export function ShimmerButton({
  children,
  shimmerColor = "rgba(201, 177, 131, 0.3)",
  className = "",
  ...props
}: ShimmerButtonProps) {
  return (
    <button
      className={cn(
        "group relative overflow-hidden rounded-full border border-white/10 bg-white/[0.03] px-6 py-3 font-bold transition-all hover:border-white/20 hover:bg-white/[0.06] active:scale-[0.98]",
        className
      )}
      {...props}
    >
      <div
        className="absolute inset-0 -translate-x-full animate-[shimmer_2.5s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-[var(--shimmer-color)] to-transparent"
        style={{ "--shimmer-color": shimmerColor } as React.CSSProperties}
      />
      <div className="relative z-10">{children}</div>
    </button>
  );
}
