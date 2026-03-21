"use client";

import React from "react";
import { cn } from "~/lib/utils";

interface GlowBorderProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  borderRadius?: string;
  duration?: number;
}

export function GlowBorder({
  children,
  className = "",
  glowColor = "#c9b183",
  borderRadius = "1rem",
  duration = 3,
}: GlowBorderProps) {
  return (
    <div
      className={cn("relative", className)}
      style={{ borderRadius }}
    >
      <div
        className="absolute -inset-[1px] rounded-[inherit] opacity-60"
        style={{
          background: `conic-gradient(from var(--glow-angle, 0deg), transparent 60%, ${glowColor} 80%, transparent 100%)`,
          animation: `glow-spin ${duration}s linear infinite`,
          borderRadius,
        }}
      />
      <div className="relative rounded-[inherit] bg-[#0a0a0a]">
        {children}
      </div>
      <style jsx>{`
        @property --glow-angle {
          syntax: "<angle>";
          initial-value: 0deg;
          inherits: false;
        }
        @keyframes glow-spin {
          from { --glow-angle: 0deg; }
          to { --glow-angle: 360deg; }
        }
      `}</style>
    </div>
  );
}
