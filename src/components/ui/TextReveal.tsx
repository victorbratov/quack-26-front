"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "~/lib/utils";

interface TextRevealProps {
  text: string;
  className?: string;
  delay?: number;
  staggerMs?: number;
}

export function TextReveal({
  text,
  className = "",
  delay = 0,
  staggerMs = 30,
}: TextRevealProps) {
  const [visibleCount, setVisibleCount] = useState(0);
  const hasStarted = useRef(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (hasStarted.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !hasStarted.current) {
          hasStarted.current = true;
          const timeout = setTimeout(() => {
            let count = 0;
            const interval = setInterval(() => {
              count++;
              setVisibleCount(count);
              if (count >= text.length) clearInterval(interval);
            }, staggerMs);
          }, delay);
          return () => clearTimeout(timeout);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [text, delay, staggerMs]);

  return (
    <span ref={ref} className={cn("inline-block", className)}>
      {text.split("").map((char, i) => (
        <span
          key={i}
          className="inline-block transition-all duration-300"
          style={{
            opacity: i < visibleCount ? 1 : 0,
            transform: i < visibleCount ? "translateY(0)" : "translateY(8px)",
            transitionDelay: `${i * 10}ms`,
          }}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </span>
  );
}
