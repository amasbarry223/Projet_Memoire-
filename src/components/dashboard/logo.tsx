"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

// Composant Logo réutilisable — affiche le vrai logo ESGic
// Le logo recadré fait 1728×840 (ratio ~2:1). On accepte une `height` et on
// calcule la largeur automatiquement pour préserver les proportions.
export function Logo({
  size = 40,
  showText = true,
  className,
}: {
  /** Hauteur du logo en pixels */
  size?: number;
  showText?: boolean;
  className?: string;
}) {
  // Ratio largeur/hauteur du logo recadré (1728/840 ≈ 2.057)
  const ratio = 1728 / 840;
  const width = Math.round(size * ratio);
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className="relative shrink-0"
        style={{ width, height: size }}
      >
        <Image
          src="/logo-esgic.png"
          alt="ESGic"
          fill
          className="object-contain"
          sizes={`${width}px`}
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
