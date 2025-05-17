import { VideoProject } from "@/data/schema";
import { fal } from "./fal";
import { extractJson } from "./utils";
import { toast } from "@/hooks/use-toast";

const SYSTEM_PROMPT = `
You're a video editor assistant. You will receive a request to create a new short video project.
You need to provide a short title (2-5 words) and a brief description (2-3 sentences) for the project.
This description will help the creator to understand the context and general direction of the video.

## Output example:

\`\`\`json
{
  "title": "Summer Memories",
  "description": "A of clips of a summer vacation, featuring beach, sunsets, beautiful blue ocean waters."
}
\`\`\`

## Important guidelines:

1. The description should be creative and engaging, come up with cool ideas that could fit a 10-30s video.
2. Think of different situations, like product advertisement, casual videos, travel vlog, movie teaser, etc.
3. Last but not least, **always** return the result in JSON format with the keys "title" and "description".
**Do not add any extra content and/or explanation, return plain JSON**.

`;

type ProjectSuggestion = {
  title: string;
  description: string;
};

export async function createProjectSuggestion() {
  try {
    const { data } = await fal.subscribe("fal-ai/any-llm", {
      input: {
        system_prompt: SYSTEM_PROMPT,
        prompt: "Create a short video project with a title and description.",
        model: "meta-llama/llama-3.2-1b-instruct",
      },
    });

    return extractJson<ProjectSuggestion>(data.output);
  } catch (error: any) {
    console.warn(
      "🚨 QUOTA-GUARD-TEST: Error caught in project.ts",
      error?.message,
    );
    console.warn("Failed to create project suggestion", error);

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

    // Return a default suggestion
    return {
      title: "New Project",
      description: "A new video project.",
    };
  }
}
