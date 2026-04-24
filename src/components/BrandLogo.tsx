"use client";

import Image from "next/image";

const LOGO_SRC = "/icons/icon-192.png";

type Props = {
  size?: number;
  className?: string;
  priority?: boolean;
  /** Fills the card without extra shadow; uses same surface as the UI behind it */
  seamless?: boolean;
};

export default function BrandLogo({ size = 32, className = "", priority = false, seamless = false }: Props) {
  return (
    <Image
      src={LOGO_SRC}
      alt="Heavenzy SMS"
      width={size}
      height={size}
      className={`shrink-0 ${seamless ? "object-contain" : "object-cover"} ${className}`}
      style={seamless ? { boxShadow: "none", backgroundColor: "var(--surface)" } : undefined}
      priority={priority}
    />
  );
}
