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

  const handleGenerateImage = async (prompt: string, modelId?: string) => {
    try {
      // Direct submission using the fal client
      const endpoint = modelId || "fal-ai/flux";
      console.log(`Generating image with endpoint: ${endpoint}`);

      const result = await fal.run(endpoint, {
        input: {
          prompt,
          image_size: "landscape_16_9",
          num_inference_steps: 12,
          guidance_scale: 3.5,
          enable_safety_checker: true,
        },
      });

      console.log("Image generation result:", result);

      // Based on the actual response structure, extract the image URL
      // @ts-ignore - The result structure might vary depending on the endpoint
      const imageUrl = result?.data?.images?.[0]?.url;

      if (imageUrl) {
        console.log("Generated image URL:", imageUrl);
        return imageUrl;
      } else {
        console.error("No image URL in response:", result);
        throw new Error("Image generation failed");
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
