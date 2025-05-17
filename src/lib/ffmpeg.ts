import type { MediaItem } from "@/data/schema";
import { fal } from "./fal";
import { resolveMediaUrl } from "./utils";
import { toast } from "@/hooks/use-toast";

export async function getMediaMetadata(media: MediaItem) {
  try {
    const { data: mediaMetadata } = await fal.subscribe(
      "fal-ai/ffmpeg-api/metadata",
      {
        input: {
          media_url: resolveMediaUrl(media),
          extract_frames: true,
        },
        mode: "streaming",
      },
    );

    return mediaMetadata;
  } catch (error: any) {
    console.warn(
      "🚨 QUOTA-GUARD-TEST: Error caught in ffmpeg.ts",
      error?.message,
    );
    console.warn("Failed to get media metadata", error);

    // Check if the error is related to quota exceeded
    const errorMessage = error?.message || "";
    const isQuotaExceeded =
      errorMessage.includes("quota exceeded") ||
      errorMessage.includes("Free tier quota");

    if (isQuotaExceeded) {
      toast({
        title: "⚠️ FREE TIER LIMIT REACHED",
        description:
          "You've reached your free tier limit. Please upgrade to continue. Go to Settings to subscribe.",
        variant: "destructive",
        className:
          "border-4 border-orange-400 shadow-lg shadow-red-900/20 font-bold",
      });
    }

    return {};
  }
}
