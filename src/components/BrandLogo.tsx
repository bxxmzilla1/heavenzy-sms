"use client";

import Image from "next/image";

const LOGO_SRC = "/icons/icon-192.png";

type Props = {
  size?: number;
  className?: string;
  priority?: boolean;
};

export default function BrandLogo({ size = 32, className = "", priority = false }: Props) {
  return (
    <Image
      src={LOGO_SRC}
      alt="Heavenzy SMS"
      width={size}
      height={size}
      className={`shrink-0 object-cover ${className}`}
      priority={priority}
    />
  );
}
