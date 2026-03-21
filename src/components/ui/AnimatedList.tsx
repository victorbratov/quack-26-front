"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "~/lib/utils";

interface AnimatedListProps {
  children: React.ReactNode | React.ReactNode[];
  className?: string;
  staggerMs?: number;
  animateFrom?: "bottom" | "left" | "right";
}

export function AnimatedList({
  children,
  className = "",
  staggerMs = 80,
  animateFrom = "bottom",
}: AnimatedListProps) {
  const [visibleCount, setVisibleCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          let count = 0;
          const interval = setInterval(() => {
            count++;
            setVisibleCount(count);
            if (count >= React.Children.count(children)) clearInterval(interval);
          }, staggerMs);
        }
      },
      { threshold: 0.1 }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [children, staggerMs]);

  const getTransform = (visible: boolean) => {
    if (visible) return "translate(0, 0)";
    switch (animateFrom) {
      case "left": return "translate(-20px, 0)";
      case "right": return "translate(20px, 0)";
      default: return "translate(0, 16px)";
    }
  };

  return (
    <div ref={containerRef} className={cn("", className)}>
      {React.Children.map(children, (child, i) => {
        const visible = i < visibleCount;
        return (
          <div
            className="transition-all duration-500 ease-out"
            style={{
              opacity: visible ? 1 : 0,
              transform: getTransform(visible),
            }}
          >
            {child}
          </div>
        );
      })}
    </div>
  );
}
