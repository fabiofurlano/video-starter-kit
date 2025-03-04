"use client";

import Image from "next/image";
import Link from "next/link";
import config from "@/lib/config";

export function Logo() {
  return (
    <Link href={config.urls.main} className="flex items-center space-x-2">
      <div className="relative w-10 h-10 flex items-center justify-center">
        <Image
          src="/logo.png"
          alt="NovelVision AI Logo"
          width={40}
          height={40}
          className="rounded-full"
        />
      </div>
      <span className="font-semibold text-lg text-foreground">
        NovelVision AI
      </span>
    </Link>
  );
}
