import { fal } from "@/lib/fal";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { db } from "./db";
import { queryKeys } from "./queries";
import type { VideoProject } from "./schema";
import { useToast } from "@/hooks/use-toast";

export const useProjectUpdater = (projectId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (project: Partial<VideoProject>) =>
      db.projects.update(projectId, project),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.project(projectId) });
    },
  });
};

export const useProjectCreator = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (project: Omit<VideoProject, "id">) =>
      db.projects.create(project),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects });
    },
  });
};

type JobCreatorParams = {
  projectId: string;
  endpointId: string;
  mediaType: "video" | "image" | "voiceover" | "music";
  input: Record<string, any>;
};

export const useJobCreator = ({
  projectId,
  endpointId,
  mediaType,
  input,
}: JobCreatorParams) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: () =>
      fal.queue.submit(endpointId, {
        input,
      }),
    onSuccess: async (data) => {
      await db.media.create({
        projectId,
        createdAt: Date.now(),
        mediaType,
        kind: "generated",
        endpointId,
        requestId: data.request_id,
        status: "pending",
        input,
      });

      await queryClient.invalidateQueries({
        queryKey: queryKeys.projectMediaItems(projectId),
      });
    },
    onError: (error: any) => {
      console.warn(
        "🚨 QUOTA-GUARD-TEST: Error caught in mutations.ts",
        error?.message,
      );
      console.warn("Failed to submit job", error);

      // Check if the error is related to quota exceeded
      const errorMessage = error?.message || "";
      const isQuotaExceeded =
        errorMessage.includes("quota exceeded") ||
        errorMessage.includes("Free tier quota");

      toast({
        title: `${mediaType.charAt(0).toUpperCase() + mediaType.slice(1)} Generation Failed`,
        description: isQuotaExceeded
          ? "You've reached your free tier limit. Please click the Settings button in the top navigation bar to upgrade."
          : "There was an unexpected error. Try again.",
        variant: isQuotaExceeded ? "destructive" : "default",
      });
    },
  });
};
