"use client";

import BottomBar from "@/components/bottom-bar";
import Header from "@/components/header";
import RightPanel from "@/components/right-panel";
import VideoPreview from "@/components/video-preview";
import {
  VideoProjectStoreContext,
  createVideoProjectStore,
  useVideoProjectStore,
} from "@/data/store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { useStore } from "zustand";
import { ProjectDialog } from "./project-dialog";
import { MediaGallerySheet } from "./media-gallery";
import { ToastProvider } from "./ui/toast";
import { Toaster } from "./ui/toaster";
import { ExportDialog } from "./export-dialog";
import LeftPanel from "./left-panel";
import { KeyDialog } from "./key-dialog";
import { StoryboardPanel } from "./storyboard-panel";
import { fal } from "@/lib/fal";

type AppProps = {
  projectId: string;
};

export function App({ projectId }: AppProps) {
  const [keyDialog, setKeyDialog] = useState(false);

  const queryClient = useRef(new QueryClient()).current;
  const projectStore = useRef(
    createVideoProjectStore({
      projectId,
    }),
  ).current;
  const projectDialogOpen = useStore(projectStore, (s) => s.projectDialogOpen);
  const selectedMediaId = useStore(projectStore, (s) => s.selectedMediaId);
  const setSelectedMediaId = useStore(
    projectStore,
    (s) => s.setSelectedMediaId,
  );
  const handleOnSheetOpenChange = (open: boolean) => {
    if (!open) {
      setSelectedMediaId(null);
    }
  };
  const isExportDialogOpen = useStore(projectStore, (s) => s.exportDialogOpen);
  const setExportDialogOpen = useStore(
    projectStore,
    (s) => s.setExportDialogOpen,
  );

  const handleGenerateImage = async (prompt: string) => {
    try {
      // Call Fal.ai to generate the image
      const result = (await fal.subscribe("fal-ai/flux", {
        input: {
          prompt,
          image_size: "1024x768",
          num_inference_steps: 28,
          guidance_scale: 3.5,
          enable_safety_checker: true,
        },
      })) as unknown as {
        images: Array<{ url: string }>;
      };

      if (result.images?.[0]?.url) {
        // Get the image URL from the result
        const imageUrl = result.images[0].url;
        console.log("Generated image URL:", imageUrl);
        return imageUrl;
      }
    } catch (error) {
      console.error("Failed to generate image:", error);
      throw error;
    }
  };

  const handleSaveToMediaManager = async (imageUrl: string) => {
    // Get the store from the existing projectStore instead of using the hook again
    const setGenerateData = useStore(projectStore, (s) => s.setGenerateData);
    const openGenerateDialog = useStore(
      projectStore,
      (s) => s.openGenerateDialog,
    );

    setGenerateData({
      type: "image",
      image: imageUrl,
      metadata: {
        source: "storyboard",
      },
    });

    openGenerateDialog("image");
  };

  return (
    <ToastProvider>
      <QueryClientProvider client={queryClient}>
        <VideoProjectStoreContext.Provider value={projectStore}>
          <div className="flex flex-col relative overflow-x-hidden h-screen bg-background">
            <StoryboardPanel
              onGenerateImage={handleGenerateImage}
              onSaveToMediaManager={handleSaveToMediaManager}
            />
            <Header openKeyDialog={() => setKeyDialog(true)} />
            <main className="flex overflow-hidden h-full w-screen">
              <div className="w-[400px] min-w-[400px]">
                <LeftPanel />
              </div>
              <div className="flex flex-col flex-1">
                <VideoPreview />
                <BottomBar />
              </div>
            </main>
            <RightPanel />
          </div>
          <Toaster />
          <ProjectDialog open={projectDialogOpen} />
          <ExportDialog
            open={isExportDialogOpen}
            onOpenChange={setExportDialogOpen}
          />
          <KeyDialog
            open={keyDialog}
            onOpenChange={(open) => setKeyDialog(open)}
          />
          <MediaGallerySheet
            open={selectedMediaId !== null}
            onOpenChange={handleOnSheetOpenChange}
            selectedMediaId={selectedMediaId ?? ""}
          />
        </VideoProjectStoreContext.Provider>
      </QueryClientProvider>
    </ToastProvider>
  );
}
