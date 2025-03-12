import React from "react";
import { cn } from "@/lib/utils";

export default function Footer() {
  return (
    <footer
      className={cn(
        "w-full py-3 px-6 mt-auto",
        "glassmorphism border-t border-gray-800/20",
        "text-center text-sm flex justify-between items-center",
      )}
    >
      <div className="flex items-center">
        <span className="font-medium">NovelVision AI</span>
        <span className="mx-2 opacity-50">|</span>
        <span className="opacity-70">© {new Date().getFullYear()}</span>
      </div>
      <div className="flex items-center gap-4">
        <a
          href="https://novelvisionai.art"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-primary transition-colors flex items-center"
        >
          <span className="mr-1">AI Visual Studio</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-50"
          >
            <path d="M7 7h10v10" />
            <path d="M7 17 17 7" />
          </svg>
        </a>
      </div>
    </footer>
  );
}
