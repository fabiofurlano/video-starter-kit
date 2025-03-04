"use client";

import Link from "next/link";
import config from "@/lib/config";

export function NovelVisionLogo() {
  return (
    <Link href={config.urls.main} className="flex items-center space-x-2">
      <div className="relative w-9 h-9 flex items-center justify-center">
        <svg
          width="36"
          height="36"
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-foreground"
        >
          {/* Simplified NovelVision AI logo as SVG */}
          <circle
            cx="100"
            cy="100"
            r="90"
            fill="url(#purpleGradient)"
            stroke="currentColor"
            strokeWidth="6"
          />
          <path
            d="M60,80 Q80,100 60,120"
            stroke="#60A5FA"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="M80,60 Q100,80 120,60"
            stroke="#60A5FA"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="M140,80 Q120,100 140,120"
            stroke="#60A5FA"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="M80,140 Q100,120 120,140"
            stroke="#60A5FA"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="M100,50 L100,150"
            stroke="#F9FAFB"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M50,100 L150,100"
            stroke="#F9FAFB"
            strokeWidth="4"
            strokeLinecap="round"
          />

          {/* Feather element */}
          <path
            d="M140,70 Q160,90 140,130"
            stroke="#F9FAFB"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path
            d="M140,85 L160,65"
            stroke="#F9FAFB"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M140,100 L170,70"
            stroke="#F9FAFB"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M140,115 L170,85"
            stroke="#F9FAFB"
            strokeWidth="4"
            strokeLinecap="round"
          />

          {/* Glowing dots */}
          <circle cx="80" cy="80" r="6" fill="#60A5FA" />
          <circle cx="120" cy="80" r="6" fill="#60A5FA" />
          <circle cx="80" cy="120" r="6" fill="#60A5FA" />
          <circle cx="120" cy="120" r="6" fill="#60A5FA" />

          {/* Gradient definitions */}
          <defs>
            <linearGradient
              id="purpleGradient"
              x1="0"
              y1="0"
              x2="200"
              y2="200"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#5B21B6" />
              <stop offset="100%" stopColor="#7C3AED" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <span className="font-semibold text-lg text-foreground">
        NovelVision AI
      </span>
    </Link>
  );
}
