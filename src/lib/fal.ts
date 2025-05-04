"use client";

import { createFalClient } from "@fal-ai/client";
import {
  isPremiumUser,
  quotaExceeded,
  incrementFreeApiCalls,
  shouldCountRequest,
} from "./quota-manager";

// Add logging for debugging
console.log("🔍 Initializing Fal.ai client...");

// Function to wait for the falai_key to be set in localStorage
async function waitForFalaiKey(maxWaitMs = 10000, checkIntervalMs = 100) {
  console.log("🔍 Waiting for falai_key to be set in localStorage...");

  return new Promise<string>((resolve) => {
    // Check if the key is already in localStorage
    const initialCheck = localStorage?.getItem("falai_key");
    if (initialCheck) {
      console.log(
        "🔍 falai_key already in localStorage:",
        initialCheck.substring(0, 5) + "...",
      );
      return resolve(initialCheck);
    }

    // Set up a timeout to resolve with empty string after maxWaitMs
    const timeoutId = setTimeout(() => {
      console.warn(
        "❌ Timed out waiting for falai_key after " + maxWaitMs + "ms",
      );
      clearInterval(intervalId);

      // Show UI notification about missing key
      if (typeof window !== "undefined" && window.document) {
        console.error(
          "FALAI KEY MISSING: Unable to use Fal.ai features. Please ensure your API key is set in the parent application.",
        );

        // Display a more visible error in the console for easier debugging
        console.error("=== FAL.AI API KEY ERROR ===");
        console.error("The Fal.ai API key is missing or invalid.");
        console.error(
          "This will prevent all Fal.ai features from working correctly.",
        );
        console.error(
          "Please ensure the parent application is providing the API key via postMessage.",
        );
        console.error("==========================");
      }

      // Try one more request before giving up
      try {
        window.parent.postMessage(
          {
            type: "REQUEST_FALAI_KEY",
            retry: true,
            timestamp: new Date().toISOString(),
          },
          "*",
        );
        console.log("🔍 Sent final REQUEST_FALAI_KEY to parent before timeout");
      } catch (e) {
        console.error("🔍 Error sending final key request to parent:", e);
      }

      resolve("");
    }, maxWaitMs);

    // Check localStorage at regular intervals
    const intervalId = setInterval(() => {
      const key = localStorage?.getItem("falai_key");
      if (key) {
        console.log(
          "🔍 falai_key found in localStorage:",
          key.substring(0, 5) + "...",
        );
        clearTimeout(timeoutId);
        clearInterval(intervalId);
        resolve(key);
      }
    }, checkIntervalMs);

    // Also listen for the FALAI_KEY_RESPONSE message
    const messageHandler = (event: MessageEvent) => {
      if (
        event.data &&
        event.data.type === "FALAI_KEY_RESPONSE" &&
        event.data.falai_key
      ) {
        console.log(
          "🔍 Received FALAI_KEY_RESPONSE:",
          event.data.falai_key.substring(0, 5) + "...",
        );
        localStorage.setItem("falai_key", event.data.falai_key);
        clearTimeout(timeoutId);
        clearInterval(intervalId);
        window.removeEventListener("message", messageHandler);
        resolve(event.data.falai_key);
      }
    };

    window.addEventListener("message", messageHandler);

    // Request the key from the parent
    try {
      window.parent.postMessage({ type: "REQUEST_FALAI_KEY" }, "*");
      console.log("🔍 Sent REQUEST_FALAI_KEY to parent");

      // Schedule additional requests at intervals if no response
      const requestInterval = setInterval(() => {
        if (localStorage?.getItem("falai_key")) {
          clearInterval(requestInterval);
          return;
        }

        try {
          window.parent.postMessage(
            {
              type: "REQUEST_FALAI_KEY",
              retry: true,
              timestamp: new Date().toISOString(),
            },
            "*",
          );
          console.log("🔍 Sent follow-up REQUEST_FALAI_KEY to parent");
        } catch (e) {
          console.error("🔍 Error sending follow-up key request to parent:", e);
          clearInterval(requestInterval);
        }
      }, 2000); // Try every 2 seconds

      // Clear the interval after maxWaitMs
      setTimeout(() => clearInterval(requestInterval), maxWaitMs);
    } catch (e) {
      console.error("🔍 Error requesting key from parent:", e);
    }
  });
}

export const fal = createFalClient({
  // Use the official fal.ai configuration pattern
  proxyUrl: "/api/fal", // This is our custom proxy endpoint

  // The credentials function is called when the client needs to authenticate
  credentials: () => {
    // Safe check for browser environment
    if (typeof window === "undefined") {
      console.log(
        "🔍 FAL CLIENT: Running on server, returning empty credentials",
      );
      return ""; // Empty string on server-side
    }

    // Try to get the key from localStorage
    const apiKey = localStorage?.getItem("falai_key") || "";

    // Log the attempt
    console.log(
      "🔍 FAL CLIENT: API key from localStorage:",
      apiKey
        ? "Found (starts with " + apiKey.substring(0, 5) + "...)"
        : "NOT FOUND",
    );

    // If no key found, request it from the parent
    if (!apiKey) {
      console.log(
        "🔍 FAL CLIENT: No key found in localStorage, requesting from parent",
      );
      try {
        // Send a message to the parent window requesting the key
        window.parent.postMessage({ type: "REQUEST_FALAI_KEY" }, "*");
        console.log("🔍 FAL CLIENT: Sent REQUEST_FALAI_KEY to parent");
      } catch (e) {
        console.error("🔍 FAL CLIENT: Error requesting key from parent:", e);
      }

      // Warning if key is missing
      console.warn(
        "❌ FAL CLIENT credentials: No Fal.ai API key found in localStorage.",
      );
    } else {
      console.log("🔍 FAL CLIENT: Using key from localStorage");
    }

    return apiKey;
  },

  // This middleware is called before each request to allow customizing the request
  requestMiddleware: async (request) => {
    console.log("🚨 QUOTA-GUARD-TEST: requestMiddleware EXECUTED");
    console.log("🔍 FAL CLIENT: Request middleware executed");

    // Free tier quota enforcement
    if (!isPremiumUser()) {
      if (quotaExceeded()) {
        console.error("❌ FAL CLIENT: Free tier quota exceeded");
        throw new Error(
          "Free tier quota exceeded. Please upgrade to continue.",
        );
      }

      // Only count requests that should be counted against the quota
      if (shouldCountRequest(request.url, request.method)) {
        incrementFreeApiCalls();
        console.log("🔍 FAL CLIENT: Free tier API call counted");
      } else {
        console.log(
          "🔍 FAL CLIENT: Request not counted against quota (status/result check)",
        );
      }
    }

    // Log request details for debugging
    const targetUrl = request.url;
    console.log("🔍 FAL CLIENT middleware: Target URL:", targetUrl);
    console.log("🔍 FAL CLIENT middleware: Request method:", request.method);

    // Try to get the key from localStorage
    let apiKey = localStorage?.getItem("falai_key") || "";
    console.log(
      "🔍 FAL CLIENT middleware: API key from localStorage (initial attempt):",
      apiKey
        ? "Found (starts with " + apiKey.substring(0, 5) + "...)"
        : "NOT FOUND",
    );

    // If no key found, wait for it to be set with increased timeout
    if (!apiKey) {
      console.log(
        "🔍 FAL CLIENT middleware: No key found in localStorage, waiting for it to be set",
      );
      try {
        // Wait for the key to be set in localStorage with longer timeout
        apiKey = await waitForFalaiKey(10000); // Wait up to 10 seconds

        if (apiKey) {
          console.log(
            "🔍 FAL CLIENT middleware: Key found after waiting:",
            apiKey.substring(0, 5) + "...",
          );
        } else {
          console.warn("🔍 FAL CLIENT middleware: No key found after waiting");

          // Show UI error about missing key
          if (typeof window !== "undefined" && window.document) {
            console.error(
              "FALAI KEY MISSING: Unable to proceed with request. The API key is required for Fal.ai features.",
            );

            // Try one more request with urgent flag
            try {
              window.parent.postMessage(
                {
                  type: "REQUEST_FALAI_KEY",
                  urgent: true,
                  requestUrl: targetUrl,
                  timestamp: new Date().toISOString(),
                },
                "*",
              );
              console.log("🔍 Sent URGENT REQUEST_FALAI_KEY to parent");
            } catch (e) {
              console.error(
                "🔍 Error sending urgent key request to parent:",
                e,
              );
            }
          }
        }
      } catch (e) {
        console.error("🔍 FAL CLIENT middleware: Error waiting for key:", e);
      }
    }

    // Add the Authorization header with the API key
    if (apiKey) {
      request.headers = {
        ...request.headers,
        Authorization: `Key ${apiKey}`,
        // IMPORTANT: Add the x-fal-target-url header for the proxy to know where to forward the request
        "x-fal-target-url": targetUrl,
      };
      console.log(
        "🔍 FAL CLIENT middleware: Added Authorization header and x-fal-target-url header",
      );
      console.log(
        "🔍 FAL CLIENT middleware: Final request headers:",
        JSON.stringify(request.headers, null, 2),
      );
    } else {
      console.error(
        "❌ FAL CLIENT middleware: No API key available to add to request",
      );

      // Try one last check for the key
      const emergencyKey = localStorage?.getItem("falai_key");
      if (emergencyKey) {
        console.log(
          "🔍 FAL CLIENT middleware: EMERGENCY RECOVERY - Found key in localStorage",
        );
        request.headers = {
          ...request.headers,
          Authorization: `Key ${emergencyKey}`,
          "x-fal-target-url": targetUrl,
        };
        console.log(
          "🔍 FAL CLIENT middleware: EMERGENCY RECOVERY - Added Authorization header",
        );
      } else {
        // Show clear UI error about missing key
        if (typeof window !== "undefined" && window.document) {
          console.error(
            "FALAI KEY MISSING: Request cannot proceed without API key. Please ensure your API key is set in the parent application.",
          );
        }

        // Add a custom header to indicate missing key for the proxy to handle appropriately
        request.headers = {
          ...request.headers,
          "x-fal-key-missing": "true",
          "x-fal-target-url": targetUrl,
        };

        // Throw a specific error that will be caught by the application
        // This will help provide a better user experience with clear error messages
        throw new Error(
          "Fal.ai API key is missing. Please ensure your API key is properly set in the parent application.",
        );
      }
    }

    return request;
  },
});

export type InputAsset =
  | "video"
  | "image"
  | "audio"
  | {
      type: "video" | "image" | "audio";
      key: string;
    };

export type ApiInfo = {
  endpointId: string;
  label: string;
  description: string;
  cost: string;
  inferenceTime?: string;
  inputMap?: Record<string, string>;
  inputAsset?: InputAsset[];
  initialInput?: Record<string, unknown>;
  cameraControl?: boolean;
  imageForFrame?: boolean;
  category: "image" | "video" | "music" | "voiceover";
};

export const AVAILABLE_ENDPOINTS: ApiInfo[] = [
  {
    endpointId: "fal-ai/flux/dev",
    label: "Flux Dev",
    description: "Generate a video from a text prompt",
    cost: "",
    category: "image",
  },
  {
    endpointId: "fal-ai/flux/schnell",
    label: "Flux Schnell",
    description: "Generate a video from a text prompt",
    cost: "",
    category: "image",
  },
  {
    endpointId: "fal-ai/flux-pro/v1.1-ultra",
    label: "Flux Pro 1.1 Ultra",
    description: "Generate a video from a text prompt",
    cost: "",
    category: "image",
  },
  {
    endpointId: "fal-ai/stable-diffusion-v35-large",
    label: "Stable Diffusion 3.5 Large",
    description: "Image quality, typography, complex prompt understanding",
    cost: "",
    category: "image",
  },
  {
    endpointId: "fal-ai/minimax/video-01-live",
    label: "Minimax Video 01 Live",
    description: "High quality video, realistic motion and physics",
    cost: "",
    category: "video",
    inputAsset: ["image"],
  },
  {
    endpointId: "fal-ai/hunyuan-video",
    label: "Hunyuan",
    description: "High visual quality, motion diversity and text alignment",
    cost: "",
    category: "video",
  },
  {
    endpointId: "fal-ai/kling-video/v1.5/pro",
    label: "Kling 1.5 Pro",
    description: "High quality video",
    cost: "",
    category: "video",
    inputAsset: ["image"],
  },
  {
    endpointId: "fal-ai/kling-video/v1/standard/text-to-video",
    label: "Kling 1.0 Standard",
    description: "High quality video",
    cost: "",
    category: "video",
    inputAsset: [],
    cameraControl: true,
  },
  {
    endpointId: "fal-ai/luma-dream-machine",
    label: "Luma Dream Machine 1.5",
    description: "High quality video",
    cost: "",
    category: "video",
    inputAsset: ["image"],
  },
  {
    endpointId: "fal-ai/minimax-music",
    label: "Minimax Music",
    description:
      "Advanced AI techniques to create high-quality, diverse musical compositions",
    cost: "",
    category: "music",
    inputAsset: [
      {
        type: "audio",
        key: "reference_audio_url",
      },
    ],
  },
  {
    endpointId: "fal-ai/mmaudio-v2",
    label: "MMAudio V2",
    description:
      "MMAudio generates synchronized audio given video and/or text inputs. It can be combined with video models to get videos with audio.",
    cost: "",
    inputAsset: ["video"],
    category: "video",
  },
  {
    endpointId: "fal-ai/sync-lipsync",
    label: "sync.so -- lipsync 1.8.0",
    description:
      "Generate realistic lipsync animations from audio using advanced algorithms for high-quality synchronization.",
    cost: "",
    inputAsset: ["video", "audio"],
    category: "video",
  },
  {
    endpointId: "fal-ai/stable-audio",
    label: "Stable Audio",
    description: "Stable Diffusion music creation with high-quality tracks",
    cost: "",
    category: "music",
  },
  {
    endpointId: "fal-ai/playht/tts/v3",
    label: "PlayHT TTS v3",
    description: "Fluent and faithful speech with flow matching",
    cost: "",
    category: "voiceover",
    initialInput: {
      voice: "Dexter (English (US)/American)",
    },
  },
  {
    endpointId: "fal-ai/playai/tts/dialog",
    label: "PlayAI Text-to-Speech Dialog",
    description:
      "Generate natural-sounding multi-speaker dialogues. Perfect for expressive outputs, storytelling, games, animations, and interactive media.",
    cost: "",
    category: "voiceover",
    inputMap: {
      prompt: "input",
    },
    initialInput: {
      voices: [
        {
          voice: "Jennifer (English (US)/American)",
          turn_prefix: "Speaker 1: ",
        },
        {
          voice: "Furio (English (IT)/Italian)",
          turn_prefix: "Speaker 2: ",
        },
      ],
    },
  },
  {
    endpointId: "fal-ai/f5-tts",
    label: "F5 TTS",
    description: "Fluent and faithful speech with flow matching",
    cost: "",
    category: "voiceover",
    initialInput: {
      ref_audio_url:
        "https://github.com/SWivid/F5-TTS/raw/21900ba97d5020a5a70bcc9a0575dc7dec5021cb/tests/ref_audio/test_en_1_ref_short.wav",
      ref_text: "Some call me nature, others call me mother nature.",
      model_type: "F5-TTS",
      remove_silence: true,
    },
  },
  {
    endpointId: "fal-ai/veo2",
    label: "Veo 2",
    description:
      "Veo creates videos with realistic motion and high quality output, up to 4K.",
    cost: "",
    category: "video",
  },
  {
    endpointId: "fal-ai/ltx-video-v095/multiconditioning",
    label: "LTX Video v0.95 Multiconditioning",
    description: "Generate videos from prompts, images using LTX Video-0.9.5",
    cost: "",
    imageForFrame: true,
    category: "video",
  },
];
