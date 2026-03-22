import Image from "next/image";

function getDiceBearUrl(seed: string, size: number): string {
  const encoded = encodeURIComponent(seed.trim() || "user");
  return `https://api.dicebear.com/9.x/notionists/svg?seed=${encoded}&size=${size}&backgroundColor=c9b183,b6e3f4,ffd5dc,d1d4f9,ffdfbf&backgroundType=gradientLinear`;
}

interface GradientAvatarProps {
  src?: string;
  alt?: string;
  size?: number;
  initials?: string;
  seed?: string;
  className?: string;
}

export function GradientAvatar({
  src,
  alt = "",
  size = 40,
  initials,
  seed,
  className = "",
}: GradientAvatarProps) {
  const avatarSeed = seed ?? initials ?? "?";
  const avatarUrl = src ?? getDiceBearUrl(avatarSeed, size);

  return (
    <div
      className={`gradient-avatar flex-shrink-0 ${className}`}
      style={{ width: size + 4, height: size + 4 }}
    >
      <div
        className="gradient-avatar-inner flex items-center justify-center overflow-hidden"
        style={{ width: size, height: size }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={avatarUrl}
          alt={alt || avatarSeed}
          width={size}
          height={size}
          className="h-full w-full rounded-full object-cover"
        />
      </div>
    </div>
  );
}
