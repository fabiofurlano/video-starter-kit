import type { VideoProject } from "@/data/schema";
import { fal } from "./fal";
import { toast } from "@/hooks/use-toast";

// Define the allowed LLM model types based on the Fal.ai API schema
export type LlmModelType =
  | "anthropic/claude-3.5-sonnet"
  | "anthropic/claude-3-5-haiku"
  | "anthropic/claude-3-haiku"
  | "google/gemini-pro-1.5"
  | "google/gemini-flash-1.5"
  | "google/gemini-flash-1.5-8b"
  | "meta-llama/llama-3.2-1b-instruct"
  | "meta-llama/llama-3.2-3b-instruct"
  | "meta-llama/llama-3.1-8b-instruct"
  | "meta-llama/llama-3.1-70b-instruct"
  | "openai/gpt-4o-mini"
  | "openai/gpt-4o";

type EnhancePromptOptions = {
  type: "image" | "video" | "music" | "voiceover";
  project?: VideoProject;
  model?: LlmModelType; // Use the defined type
};

const SYSTEM_PROMPT = `
You're a video editor assistant. You will receive instruction to enhance the description of
images, audio-clips and video-clips in a video project. You will be given the name of project
and a brief description. Use that contextual information to come up with created and well-formed
description for the media assets. The description should be creative and engaging.

Important guidelines:

1. The description should be creative and engaging.
2. It should be concise, don't exceed 2-3 sentences.
3. The description should be relevant to the project.
4. The description should be well-formed and grammatically correct.
5. Last but not least, **always** return just the enhanced prompt, don't add
any extra content and/or explanation. **DO NOT ADD markdown** or quotes, return the
**PLAIN STRING**.
`;

export async function enhancePrompt(
  prompt: string,
  options: EnhancePromptOptions = { type: "video" },
) {
  console.log("🔍 Starting enhancePrompt with:", { prompt, options });

  const { type, project, model = "meta-llama/llama-3.2-1b-instruct" } = options;
  const projectInfo = !project
    ? ""
    : `
    ## Project Info

    Title: ${project.title}
    Description: ${project.description}
  `.trim();
  const promptInfo = !prompt.trim() ? "" : `User prompt: ${prompt}`;

  // Check if API key exists before making the request
  const apiKey =
    typeof window !== "undefined"
      ? window.localStorage?.getItem("falai_key") || ""
      : "";
  console.log(
    "🔍 Using API key from localStorage:",
    apiKey
      ? "Found (starts with " + apiKey.substring(0, 5) + "...)"
      : "NOT FOUND",
  );

  try {
    console.log("🔍 Making request to Fal.ai using fal.subscribe...");

    const { data } = await fal.subscribe("fal-ai/any-llm", {
      input: {
        system_prompt: SYSTEM_PROMPT,
        prompt: `
          Create a prompt for generating a ${type} via AI inference. Here's the context:
          ${projectInfo}
          ${promptInfo}
        `.trim(),
        model,
      },
    });

    console.log("🔍 Received response from Fal.ai:", data);
    return data.output.replace(/^"|"$/g, "");
  } catch (error: any) {
    console.warn(
      "🚨 QUOTA-GUARD-TEST: Error caught in prompt.ts",
      error?.message,
    );
    console.error("❌ enhancePrompt error:", error);

    // Check if the error is related to quota exceeded
    const errorMessage = error?.message || "";
    const isQuotaExceeded =
      errorMessage.includes("quota exceeded") ||
      errorMessage.includes("Free tier quota");

    if (isQuotaExceeded) {
      toast({
        title: "Prompt Enhancement Failed",
        description:
          "You've reached your free tier limit. Please upgrade to continue. Go to Settings to subscribe.",
        variant: "destructive",
      });
    }

    // Rethrow the error to be handled by the component
    throw error;
  }
}
