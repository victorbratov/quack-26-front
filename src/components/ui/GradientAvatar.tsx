import Image from "next/image";

interface GradientAvatarProps {
  src?: string;
  alt?: string;
  size?: number;
  initials?: string;
  className?: string;
}

export function GradientAvatar({
  src,
  alt = "",
  size = 40,
  initials,
  className = "",
}: GradientAvatarProps) {
  return (
    <div
      className={`gradient-avatar flex-shrink-0 ${className}`}
      style={{ width: size + 4, height: size + 4 }}
    >
      <div
        className="gradient-avatar-inner flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        {src ? (
          <Image
            src={src}
            alt={alt}
            width={size}
            height={size}
            className="h-full w-full rounded-full object-cover"
          />
        ) : (
          <span className="text-sm font-semibold text-primary">
            {initials ?? "?"}
          </span>
        )}
      </div>
    </div>
  );
}
