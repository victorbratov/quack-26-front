interface QuoteBlockProps {
  quote: string;
  attribution: string;
  className?: string;
}

export function QuoteBlock({ quote, attribution, className = "" }: QuoteBlockProps) {
  return (
    <blockquote className={`px-5 py-8 ${className}`}>
      <p className="font-serif text-2xl leading-relaxed italic text-primary/90">
        &ldquo;{quote}&rdquo;
      </p>
      <footer className="mt-3 text-sm tracking-wide text-muted">
        &mdash; {attribution}
      </footer>
    </blockquote>
  );
}
