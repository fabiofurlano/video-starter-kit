import React from 'react';
import { cn } from '@/lib/utils';

export default function Footer() {
  return (
    <footer className={cn(
      "w-full py-4 px-6 mt-auto",
      "bg-black/20 backdrop-blur-sm border-t border-gray-800/20",
      "text-center text-sm text-gray-400 flex justify-between items-center"
    )}>
      <div>
        <span>NovelVision AI</span>
        <span className="mx-2">•</span>
        <span className="opacity-70">© {new Date().getFullYear()}</span>
      </div>
      <div className="flex items-center gap-4">
        <a 
          href="https://novelvisionai.art" 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:text-white transition-colors"
        >
          NovelVision AI Visual Studio
        </a>
      </div>
    </footer>
  );
} 