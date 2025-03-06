"use client";

import { Button } from "@/components/ui/button";
import { Logo } from "./logo";
import {
  SettingsIcon,
  Edit3Icon,
  Users,
  FileTextIcon,
  Home,
  DownloadIcon,
  LayoutDashboard,
} from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import config from "@/lib/config";
import Link from "next/link";
import { useVideoProjectStore } from "@/data/store";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import sessionManager from "@/app/session-manager";

export default function Header({
  openKeyDialog,
}: {
  openKeyDialog?: () => void;
}) {
  const setExportDialogOpen = useVideoProjectStore(
    (s) => s.setExportDialogOpen,
  );
  const router = useRouter();

  // Handle navigation to storyboard with session data
  const navigateToStoryboard = useCallback(() => {
    // The session data is already in sessionManager
    // We just need to navigate while preserving it
    console.log('Navigating to storyboard, current session data:', sessionManager.getUserData());
    router.push('/');
  }, [router]);

  return (
    <header className="px-4 py-2 flex justify-between items-center border-b border-border glassmorphism">
      <div className="flex items-center">
        <Logo />
        <span className="mx-2 text-gray-400">|</span>
        <h2 className="text-lg font-medium">AI Visual Studio</h2>
      </div>

      <nav className="flex flex-row items-center justify-end gap-2">
        <ThemeToggle />

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExportDialogOpen(true)}
        >
          <DownloadIcon className="w-4 h-4 mr-1" />
          <span className="hidden sm:inline">Export</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={navigateToStoryboard}
        >
          <LayoutDashboard className="w-4 h-4 mr-1" />
          <span className="hidden sm:inline">Storyboard</span>
        </Button>

        <Button variant="ghost" size="sm" asChild>
          <Link href={config.urls.main} target="_blank">
            <Home className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Home</span>
          </Link>
        </Button>

        <Button variant="ghost" size="sm" asChild>
          <Link href={config.urls.writingWorkspace} target="_blank">
            <Edit3Icon className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Writing Space</span>
          </Link>
        </Button>

        <Button variant="ghost" size="sm" asChild>
          <Link href={config.urls.characterSetup} target="_blank">
            <Users className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Characters</span>
          </Link>
        </Button>

        <Button variant="ghost" size="sm" asChild>
          <Link href={config.urls.storyOutline} target="_blank">
            <FileTextIcon className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Outline</span>
          </Link>
        </Button>

        <Button variant="ghost" size="sm" asChild>
          <Link href={config.urls.settings} target="_blank">
            <SettingsIcon className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Settings</span>
          </Link>
        </Button>
      </nav>
    </header>
  );
}
