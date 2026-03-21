import Image from "next/image";

interface HeroImageProps {
  src: string;
  alt: string;
  overlay?: React.ReactNode;
  className?: string;
}

export function HeroImage({ src, alt, overlay, className = "" }: HeroImageProps) {
  return (
    <div className={`relative mx-4 overflow-hidden rounded-3xl ${className}`}>
      <div className="relative aspect-[4/3] w-full">
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          priority
        />
        {/* Gradient scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </div>
      {overlay && (
        <div className="absolute inset-0 flex flex-col justify-end p-5">
          {overlay}
        </div>
      )}
    </div>
  );
}
