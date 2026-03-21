import Link from "next/link";

interface SectionHeaderProps {
  title: string;
  seeAllHref?: string;
  seeAllLabel?: string;
}

export function SectionHeader({
  title,
  seeAllHref,
  seeAllLabel = "SEE ALL",
}: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between px-5 py-3">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">
        {title}
      </h2>
      {seeAllHref && (
        <Link
          href={seeAllHref}
          className="text-xs font-medium uppercase tracking-wider text-secondary"
        >
          {seeAllLabel} &rarr;
        </Link>
      )}
    </div>
  );
}
