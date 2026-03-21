import { cn } from "~/lib/utils";

interface CardCarouselProps {
  children: React.ReactNode;
  className?: string;
  /** Use responsive grid on md+ screens instead of horizontal scroll */
  responsive?: boolean;
}

export function CardCarousel({ children, className = "", responsive = false }: CardCarouselProps) {
  return (
    <div
      className={cn(
        responsive ? "responsive-card-grid" : "flex gap-4 overflow-x-auto px-5 scrollbar-hide",
        className
      )}
    >
      {children}
    </div>
  );
}
