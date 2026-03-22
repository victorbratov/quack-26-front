import Link from "next/link";

interface PillButtonProps {
  label: string;
  href?: string;
  onClick?: () => void;
  variant?: "outline" | "filled";
  className?: string;
}

export function PillButton({
  label,
  href,
  onClick,
  variant = "outline",
  className = "",
}: PillButtonProps) {
  const base =
    "inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-medium tracking-wide transition-colors";
  const variants = {
    outline: "border border-outline text-primary hover:bg-white/5",
    filled: "bg-primary text-on-primary hover:bg-primary/90",
  };

  const classes = `${base} ${variants[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {label} <span aria-hidden>&rarr;</span>
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={classes}>
      {label} <span aria-hidden>&rarr;</span>
    </button>
  );
}
