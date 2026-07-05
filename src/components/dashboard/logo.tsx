"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

// Composant Logo réutilisable — affiche le vrai logo ESGic
export function Logo({
  size = 40,
  showText = true,
  className,
}: {
  size?: number;
  showText?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className="relative shrink-0 overflow-hidden rounded-lg"
        style={{ width: size, height: size }}
      >
        <Image
          src="/logo-esgic.png"
          alt="ESGic"
          fill
          className="object-contain"
          sizes={`${size}px`}
          priority
        />
      </div>
      {showText && (
        <span className="text-xl font-bold text-gray-900">
          ESG<span className="text-emerald-500">ic</span>
        </span>
      )}
    </div>
  );
}
