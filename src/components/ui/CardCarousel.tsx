interface CardCarouselProps {
  children: React.ReactNode;
  className?: string;
}

export function CardCarousel({ children, className = "" }: CardCarouselProps) {
  return (
    <div
      className={`flex gap-4 overflow-x-auto px-5 scrollbar-hide ${className}`}
    >
      {children}
    </div>
  );
}
