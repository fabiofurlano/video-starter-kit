import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useVideoProjectStore } from "@/data/store";
import { enhancePrompt, LlmModelType } from "@/lib/prompt";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RotateCcw, Maximize2 } from "lucide-react";
import { AVAILABLE_ENDPOINTS } from "@/lib/fal";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { db } from "@/data/db";
import { useProjectId } from "@/data/store";
import { queryKeys } from "@/data/queries";
import { useToast } from "@/hooks/use-toast";
import { DownloadButton } from "@/components/ui/download-button";

// Image style options
const IMAGE_STYLES = [
  { value: "fantasy", label: "Fantasy" },
  { value: "cyberpunk", label: "Cyberpunk" },
  { value: "gothic", label: "Gothic" },
  { value: "historical", label: "Historical" },
  { value: "surreal", label: "Surreal" },
  { value: "anime", label: "Anime" },
  { value: "scifi", label: "SciFi" },
  { value: "watercolor", label: "Watercolor" },
  { value: "custom", label: "Custom" },
];

// Add this new component for image model selection
function ImageModelPicker({
  value,
  onValueChange,
  ...props
}: {
  value: string;
  onValueChange: (value: string) => void;
} & Parameters<typeof Select>[0]) {
  // Filter only image generation endpoints from the actual configuration
  const imageEndpoints = AVAILABLE_ENDPOINTS.filter(
    (endpoint) => endpoint.category === "image",
  );

  return (
    <Select value={value} onValueChange={onValueChange} {...props}>
      <SelectTrigger className="w-full text-sm">
        <SelectValue placeholder="Select Image Model" />
      </SelectTrigger>
      <SelectContent>
        {/* Simply map all available image endpoints from the configuration */}
        {imageEndpoints.map((endpoint) => (
          <SelectItem key={endpoint.endpointId} value={endpoint.endpointId}>
            {endpoint.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

interface StoryboardPanelProps {
  onGenerateImage: (
    prompt: string,
    modelId?: string,
    aspectRatio?: string,
  ) => Promise<string | undefined>;
  onSaveToMediaManager: (imageUrl: string) => void;
}

export function StoryboardPanel({
  onGenerateImage,
  onSaveToMediaManager,
}: StoryboardPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [slides, setSlides] = useState<
    Array<{
      chapterNumber: string;
      prompt: string;
      promptPreview?: string;
      imageUrl?: string;
    }>
  >([]);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState<Record<number, boolean>>({});
  const [isGeneratingPrompts, setIsGeneratingPrompts] = useState(false);
  const [selectedLlmModel, setSelectedLlmModel] = useState<LlmModelType>(
    "anthropic/claude-3-haiku",
  );
  const [selectedImageStyle, setSelectedImageStyle] = useState("fantasy");
  const [customStyle, setCustomStyle] = useState("");
  const [selectedImageModel, setSelectedImageModel] = useState<string>(() => {
    // Get the default image model from available endpoints
    const imageEndpoints = AVAILABLE_ENDPOINTS.filter(
      (endpoint) => endpoint.category === "image",
    );
    // Use the first available image model, or fallback to a common default
    return imageEndpoints.length > 0
      ? imageEndpoints[0].endpointId
      : "fal-ai/fast-sdxl";
  });
  // Add state for expanded image
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  // Add state for storyboard metadata
  const [storyboardSource, setStoryboardSource] = useState<
    "chapter" | "custom"
  >("chapter");
  const [storyboardMetadata, setStoryboardMetadata] = useState<any>({});
  const [storyboardTitle, setStoryboardTitle] = useState("Storyboard Editor");
  // Add state for aspect ratio
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "9:16">("16:9");

  const sessionData = useVideoProjectStore((state) => state.generateData);
  const projectId = useProjectId();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Immediate check on mount for console debugging
  console.log("StoryboardPanel initial render", {
    hasLocalStorage: !!localStorage.getItem("storyboardData"),
    hasSession: !!sessionData,
  });

  useEffect(() => {
    console.log("StoryboardPanel mounted - checking for storyboard data");

    // Use a slight delay to ensure localStorage is available
    setTimeout(() => {
      checkForStoryboardData();
    }, 200);

    // Also listen for postMessage events as a fallback
    const handleMessage = (event: MessageEvent) => {
      console.log("Received message event:", event.data);
      if (event.data.type === "STORYBOARD_DATA") {
        const { slides, metadata } = event.data;
        console.log("Received storyboard data via postMessage:", slides);
        setSlides(slides);

        if (metadata) {
          processStoryboardMetadata(metadata);
        }

        setTimeout(() => {
          console.log("Setting isVisible to true from postMessage");
          setIsVisible(true);
        }, 500);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Function to process storyboard metadata
  const processStoryboardMetadata = (metadata: any) => {
    console.log("Processing storyboard metadata:", metadata);
    setStoryboardMetadata(metadata);

    // Set source
    if (metadata.source) {
      setStoryboardSource(metadata.source);
    }

    // Set image style from metadata if available
    if (metadata.style) {
      console.log("Setting image style from metadata:", metadata.style);
      setSelectedImageStyle(metadata.style);
    }

    // Set title based on source
    if (metadata.source === "chapter" && metadata.chapterNumber) {
      setStoryboardTitle(
        `Storyboard: Chapter ${metadata.chapterNumber}${metadata.chapterTitle ? ` - ${metadata.chapterTitle}` : ""}`,
      );
    } else if (metadata.source === "custom") {
      setStoryboardTitle("Custom Storyboard");
    }
  };

  // Function to check for storyboard data
  const checkForStoryboardData = () => {
    try {
      const storedData = localStorage.getItem("storyboardData");
      if (storedData) {
        console.log("Found storyboard data in localStorage:", storedData);
        const parsedData = JSON.parse(storedData);
        if (parsedData.slides && Array.isArray(parsedData.slides)) {
          console.log(
            "Valid slides array found, setting slides:",
            parsedData.slides.length,
          );
          setSlides(parsedData.slides);

          // Process metadata if available
          if (parsedData.metadata) {
            processStoryboardMetadata(parsedData.metadata);
          }

          // Use a staggered timing for better animation
          setTimeout(() => {
            console.log("Setting isVisible to true");
            setIsVisible(true);
          }, 300);

          // Clear localStorage to avoid loading it again on refresh
          // Use a delay to ensure it's processed first
          setTimeout(() => {
            localStorage.removeItem("storyboardData");
            console.log("Cleared storyboardData from localStorage");
          }, 1000);
        } else {
          console.log("Invalid slides data structure:", parsedData);
        }
      } else {
        console.log("No storyboard data found in localStorage");
      }
    } catch (error) {
      console.error("Error loading storyboard data from localStorage:", error);
    }
  };

  // Function to generate AI prompts for all slides
  const generateAIPrompts = async () => {
    if (slides.length === 0) return;

    try {
      setIsGeneratingPrompts(true);

      // Generate new prompts for each slide using the selected LLM and style
      const updatedSlides = [...slides];

      // Create a comprehensive context for the entire storyboard
      const styleText =
        selectedImageStyle === "custom"
          ? customStyle
          : IMAGE_STYLES.find((style) => style.value === selectedImageStyle)
              ?.label || "Fantasy";

      // Get the full story or chapter content
      const fullStory = storyboardMetadata?.fullStory || "";
      const location = storyboardMetadata?.location || "";
      const timeline = storyboardMetadata?.timeline || "";

      // Different prompt formats based on source
      let promptContext = "";

      if (storyboardSource === "chapter") {
        // Format for chapter-based storyboards
        promptContext = `
          You are an expert storyboard generator for AI-based image creation. Your task is to enhance the provided prompts to make them more detailed and visually compelling. Follow these instructions internally, and output only the final image prompts.

          1. Analyze the current slide prompt:
             "${slides.map((slide) => slide.prompt).join("\n")}"
          
          2. Since this is from a chapter, integrate location: "${location}" and timeline: "${timeline}" from memory to maintain continuity and setting accuracy.

          3. For each prompt, create a comprehensive image generation prompt. Each prompt must be a complete sentence that vividly describes the scene with details such as setting, characters, actions, and cinematic elements. Ensure you integrate the selected art style: "${styleText}".

          4. Output only the enhanced prompts. Do not include numbering, explanations, or any other text.
        `;
      } else {
        // Format for custom story input
        promptContext = `
          You are an expert storyboard generator for AI-based image creation. Your task is to enhance the provided prompts to make them more detailed and visually compelling. Follow these instructions internally, and output only the final image prompts.

          1. Analyze the following narrative and current prompts:
             Full Story: "${fullStory}"
             Current Prompts:
             "${slides.map((slide) => slide.prompt).join("\n")}"
          
          2. Since this is a "Start from Scratch" mode, do NOT use location or timeline unless explicitly mentioned in the provided text. Instead, infer the necessary scene details from the given input.

          3. For each prompt, create a comprehensive image generation prompt. Each prompt must be a complete sentence that vividly describes the scene with details such as setting, characters, actions, and cinematic elements. Ensure you integrate the selected art style: "${styleText}".

          4. Output only the enhanced prompts. Do not include numbering, explanations, or any other text.
        `;
      }

      // Process each slide individually to enhance its prompt
      for (let i = 0; i < updatedSlides.length; i++) {
        const slide = updatedSlides[i];

        // Create a slide-specific prompt for the LLM
        const slidePromptContext = `
          ${promptContext}
          
          Current slide to enhance:
          "${slide.prompt}"
          
          Output only the enhanced prompt for this specific slide. Make it rich in visual details, cinematic quality, and incorporate the ${styleText} style. Do not include any explanations or numbering.
        `;

        try {
          // Use the enhancePrompt function with the selected LLM model
          const enhancedPrompt = await enhancePrompt(slidePromptContext, {
            type: "image",
            model: selectedLlmModel,
          });

          // Generate a preview version for display
          const promptPreview =
            enhancedPrompt.length > 200
              ? enhancedPrompt.substring(0, 200) + "..."
              : enhancedPrompt;

          // Update the slide with the new AI-generated prompt
          updatedSlides[i] = {
            ...slide,
            prompt: enhancedPrompt,
            promptPreview,
          };
        } catch (error) {
          console.error(`Failed to generate prompt for slide ${i}:`, error);
        }
      }

      // Update all slides with their new prompts
      setSlides(updatedSlides);
    } catch (error) {
      console.error("Failed to generate AI prompts:", error);
    } finally {
      setIsGeneratingPrompts(false);
    }
  };

  // Function to get the StoryboardPanel title based on source
  const getStoryboardTitle = () => {
    if (storyboardSource === "chapter") {
      return `Storyboard: Chapter ${storyboardMetadata.chapterNumber || ""}`;
    } else {
      return "Custom Storyboard";
    }
  };

  const handleGenerateImage = async (index: number) => {
    try {
      // Set loading state for this slide
      setIsLoading((prev) => ({ ...prev, [index]: true }));

      const slide = slides[index];
      console.log(
        "Generating image with model:",
        selectedImageModel,
        "aspect ratio:",
        aspectRatio,
      );

      // Pass the prompt, model ID, and now the aspect ratio
      const imageUrl = await onGenerateImage(
        slide.prompt,
        selectedImageModel,
        aspectRatio,
      );

      if (imageUrl) {
        console.log("Image generated successfully:", imageUrl);
        setSlides(slides.map((s, i) => (i === index ? { ...s, imageUrl } : s)));
      }
    } catch (error) {
      console.error(`Failed to generate image for slide ${index}:`, error);
    } finally {
      // Clear loading state
      setIsLoading((prev) => ({ ...prev, [index]: false }));
    }
  };

  // Function to regenerate a single prompt
  const handleRegeneratePrompt = async (index: number) => {
    try {
      setIsLoading((prev) => ({ ...prev, [index]: true }));

      const slide = slides[index];

      // Get the style text to embed
      const styleText =
        selectedImageStyle === "custom"
          ? customStyle
          : IMAGE_STYLES.find((style) => style.value === selectedImageStyle)
              ?.label || "Fantasy";

      // Get relevant metadata
      const fullStory = storyboardMetadata?.fullStory || "";
      const location = storyboardMetadata?.location || "";
      const timeline = storyboardMetadata?.timeline || "";

      // Create prompt context based on source
      let promptContext = "";

      if (storyboardSource === "chapter") {
        promptContext = `
          You are an expert storyboard generator for AI-based image creation. Your task is to create a detailed image prompt based on a chapter segment.

          1. Analyze the following chapter content:
             "Chapter ${slide.chapterNumber}, with location "${location}" and timeline "${timeline}""
             
          2. The current prompt is: "${slide.prompt}"
          
          3. Create a comprehensive, visually rich image generation prompt that captures this scene. Include details about setting, characters, actions, mood, lighting, and cinematic elements. The image should be in ${styleText} style.
          
          4. Output ONLY the enhanced prompt, with no additional text, explanations, or numbering.
        `;
      } else {
        // For custom story input
        promptContext = `
          You are an expert storyboard generator for AI-based image creation. Your task is to create a detailed image prompt based on a story segment.

          1. Analyze the following story segment:
             "${slide.prompt}"
             
          2. If helpful, here's more context from the full story: "${fullStory.substring(0, 300)}..."
          
          3. Create a comprehensive, visually rich image generation prompt that captures this scene. Include details about setting, characters, actions, mood, lighting, and cinematic elements. The image should be in ${styleText} style.
          
          4. Output ONLY the enhanced prompt, with no additional text, explanations, or numbering.
        `;
      }

      try {
        // Use the enhancePrompt function with the selected LLM model
        const enhancedPrompt = await enhancePrompt(promptContext, {
          type: "image",
          model: selectedLlmModel,
        });

        // Generate a preview version for display
        const promptPreview =
          enhancedPrompt.length > 200
            ? enhancedPrompt.substring(0, 200) + "..."
            : enhancedPrompt;

        // Update just this slide with the new prompt
        setSlides(
          slides.map((s, i) =>
            i === index ? { ...s, prompt: enhancedPrompt, promptPreview } : s,
          ),
        );
      } catch (error) {
        console.error(`Failed to regenerate prompt for slide ${index}:`, error);
      }
    } catch (error) {
      console.error(`Failed to regenerate prompt for slide ${index}:`, error);
    } finally {
      setIsLoading((prev) => ({ ...prev, [index]: false }));
    }
  };

  // Update the handlePromptEdit function to handle full prompt text
  const handlePromptEdit = (index: number, newPrompt: string) => {
    setSlides(
      slides.map((s, i) => {
        if (i === index) {
          return {
            ...s,
            prompt: newPrompt,
            // If we had a preview, update it with a truncated version of the new prompt
            promptPreview:
              newPrompt.length > 200
                ? newPrompt.substring(0, 200) + "..."
                : newPrompt,
          };
        }
        return s;
      }),
    );
  };

  // Add this mutation for saving media
  const saveMediaMutation = useMutation({
    mutationFn: async (imageUrl: string) => {
      // Find the slide with this image
      const slide = slides.find((s) => s.imageUrl === imageUrl);

      // Create properly structured media data
      const mediaData = {
        projectId,
        kind: "generated" as "generated" | "uploaded",
        mediaType: "image" as "image" | "video" | "music" | "voiceover",
        status: "completed" as "pending" | "running" | "completed" | "failed",
        createdAt: Date.now(),
        endpointId: selectedImageModel,
        input: {
          prompt: slide?.prompt || "",
        },
        // Add the output structure with images array - this is critical
        output: {
          images: [
            {
              url: imageUrl,
              // Include any other metadata available
              width: 1024,
              height: 1024,
            },
          ],
        },
      };

      try {
        const mediaId = await db.media.create(mediaData);
        console.log("Created media with ID:", mediaId);
        return mediaId;
      } catch (error) {
        console.error("Failed to save to media gallery:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.projectMediaItems(projectId),
      });
      toast({
        title: "Image saved to media gallery",
        description: "The image has been added to your media library",
      });
    },
    onError: (error) => {
      console.error("Error saving media:", error);
      toast({
        title: "Failed to save image",
        description:
          "There was an error adding the image to your media library",
      });
    },
  });

  // Update the onSaveToMediaManager usage
  const handleSaveToMediaManager = (imageUrl: string) => {
    saveMediaMutation.mutate(imageUrl);
  };

  // Only show the panel if we have slides
  if (slides.length === 0) {
    return null;
  }

  return (
    <div
      className={`w-full transition-all duration-500 ease-in-out ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full"
      }`}
    >
      <Collapsible
        open={isExpanded}
        onOpenChange={setIsExpanded}
        className="w-full bg-background border-b"
      >
        <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-accent">
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            <h2 className="text-lg font-semibold">{storyboardTitle}</h2>
            <span className="ml-2 bg-blue-600/70 text-xs px-2 py-0.5 rounded-full">
              {slides.length} Slides
            </span>
          </div>
          <span>{isExpanded ? "▼" : "▲"}</span>
        </CollapsibleTrigger>

        <CollapsibleContent className="p-4">
          {/* AI Prompt Generation Controls */}
          <div className="mb-6 p-5 border rounded-lg bg-card/50 shadow-sm">
            <h3 className="text-md font-medium mb-4 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                <path d="M9 11h6" />
                <path d="M12 8v6" />
              </svg>
              AI Prompt Generation
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* LLM Model Selector */}
              <div>
                <Label
                  htmlFor="llm-model"
                  className="text-sm font-medium mb-1.5 block"
                >
                  LLM Model
                </Label>
                <Select
                  value={selectedLlmModel}
                  onValueChange={(value) =>
                    setSelectedLlmModel(value as LlmModelType)
                  }
                >
                  <SelectTrigger className="w-full bg-background/80">
                    <SelectValue placeholder="Select LLM Model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Meta Llama Models</SelectLabel>
                      <SelectItem value="meta-llama/llama-3.1-70b-instruct">
                        Llama 3.1 70B
                      </SelectItem>
                    </SelectGroup>
                    <SelectGroup>
                      <SelectLabel>OpenAI Models</SelectLabel>
                      <SelectItem value="openai/gpt-4o-mini">
                        GPT-4o Mini
                      </SelectItem>
                      <SelectItem value="openai/gpt-4o">GPT-4o</SelectItem>
                    </SelectGroup>
                    <SelectGroup>
                      <SelectLabel>Anthropic Models</SelectLabel>
                      <SelectItem value="anthropic/claude-3.5-sonnet">
                        Claude 3.5 Sonnet
                      </SelectItem>
                      <SelectItem value="anthropic/claude-3-5-haiku">
                        Claude 3.5 Haiku
                      </SelectItem>
                      <SelectItem value="anthropic/claude-3-haiku">
                        Claude 3 Haiku
                      </SelectItem>
                    </SelectGroup>
                    <SelectGroup>
                      <SelectLabel>Google Models</SelectLabel>
                      <SelectItem value="google/gemini-pro-1.5">
                        Gemini Pro 1.5
                      </SelectItem>
                      <SelectItem value="google/gemini-flash-1.5">
                        Gemini Flash 1.5
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              {/* Image Style Selector */}
              <div>
                <Label
                  htmlFor="image-style"
                  className="text-sm font-medium mb-1.5 block"
                >
                  Image Style
                </Label>
                <Select
                  value={selectedImageStyle}
                  onValueChange={setSelectedImageStyle}
                >
                  <SelectTrigger className="w-full bg-background/80">
                    <SelectValue placeholder="Select Image Style" />
                  </SelectTrigger>
                  <SelectContent>
                    {IMAGE_STYLES.map((style) => (
                      <SelectItem key={style.value} value={style.value}>
                        {style.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Custom Style Input (shown only when "Custom" is selected) */}
            {selectedImageStyle === "custom" && (
              <div className="mb-4">
                <Label
                  htmlFor="custom-style"
                  className="text-sm font-medium mb-1.5 block"
                >
                  Custom Style Description
                </Label>
                <Textarea
                  id="custom-style"
                  placeholder="Describe your custom style (e.g., 'Dark noir with neon accents')"
                  value={customStyle}
                  onChange={(e) => setCustomStyle(e.target.value)}
                  className="resize-none h-20 bg-background/80"
                />
              </div>
            )}

            {/* Generate Button */}
            <Button
              onClick={generateAIPrompts}
              disabled={isGeneratingPrompts}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
            >
              {isGeneratingPrompts ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Generating AI Prompts...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2"
                  >
                    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                  Generate AI Prompts for All Slides
                </span>
              )}
            </Button>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-6">
            {slides.map((slide, index) => (
              <div
                key={index}
                className="min-w-[300px] p-5 space-y-4 bg-card rounded-lg border border-gray-700/20 shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <h3 className="font-medium flex items-center justify-between">
                  <span className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-1.5"
                    >
                      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
                      <path d="M10 2v20" />
                    </svg>
                    {storyboardSource === "chapter"
                      ? `Chapter ${slide.chapterNumber}`
                      : "Scene"}
                  </span>
                  <span className="bg-blue-600/20 text-blue-500 text-xs px-2 py-0.5 rounded-full font-medium">
                    Slide {index + 1}
                  </span>
                </h3>

                {/* Editable Prompt Text Area */}
                <div>
                  <Label
                    htmlFor={`prompt-${index}`}
                    className="text-sm font-medium mb-1.5 block flex items-center"
                  >
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
                      className="mr-1.5"
                    >
                      <polyline points="9 17 4 12 9 7" />
                      <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
                    </svg>
                    Prompt
                  </Label>
                  <Textarea
                    id={`prompt-${index}`}
                    className="h-28 mb-3 bg-background/50 text-sm shadow-inner border-gray-700/30"
                    placeholder="Edit this prompt to customize the image generation"
                    value={slide.prompt}
                    onChange={(e) => handlePromptEdit(index, e.target.value)}
                  />
                </div>

                <div className="mb-3">
                  <Label
                    htmlFor={`image-model-${index}`}
                    className="text-sm font-medium mb-1.5 block"
                  >
                    Image Model
                  </Label>
                  <ImageModelPicker
                    value={selectedImageModel}
                    onValueChange={setSelectedImageModel}
                  />
                </div>

                {/* Add Aspect Ratio selector */}
                <div className="mb-3">
                  <Label
                    htmlFor={`aspect-ratio-${index}`}
                    className="text-sm font-medium mb-1.5 block"
                  >
                    Aspect Ratio
                  </Label>
                  <div className="flex flex-row gap-2">
                    <Button
                      id={`aspect-ratio-16-9-${index}`}
                      variant={aspectRatio === "16:9" ? "secondary" : "outline"}
                      size="sm"
                      className="flex-1"
                      onClick={() => setAspectRatio("16:9")}
                    >
                      16:9
                    </Button>
                    <Button
                      id={`aspect-ratio-9-16-${index}`}
                      variant={aspectRatio === "9:16" ? "secondary" : "outline"}
                      size="sm"
                      className="flex-1"
                      onClick={() => setAspectRatio("9:16")}
                    >
                      9:16
                    </Button>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mb-3 group"
                  onClick={() => handleRegeneratePrompt(index)}
                  disabled={isGeneratingPrompts}
                >
                  <span className="flex items-center">
                    <RotateCcw className="mr-1.5 w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-300" />
                    Regenerate Prompt
                  </span>
                </Button>

                {slide.imageUrl ? (
                  <div className="relative">
                    <img
                      src={slide.imageUrl}
                      alt={`Chapter ${slide.chapterNumber} visualization`}
                      className={`w-full ${aspectRatio === "16:9" ? "h-40" : "h-48"} object-cover rounded-md shadow-sm cursor-pointer hover:opacity-95 transition-opacity`}
                      onClick={() => {
                        if (slide.imageUrl) {
                          setExpandedImage(slide.imageUrl);
                        }
                      }}
                    />
                    <div className="absolute top-2 right-2 flex gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="w-7 h-7 rounded-full bg-background/70 backdrop-blur-sm hover:bg-background/90"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (slide.imageUrl) {
                            setExpandedImage(slide.imageUrl);
                          }
                        }}
                      >
                        <Maximize2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`w-full ${aspectRatio === "16:9" ? "h-40" : "h-48"} bg-gradient-to-br from-gray-800/10 to-gray-800/25 rounded-md flex flex-col items-center justify-center border border-gray-700/20 shadow-inner`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-gray-400 mb-2"
                    >
                      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                      <circle cx="9" cy="9" r="2" />
                      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                    </svg>
                    <span className="text-gray-500 text-sm font-medium">
                      Image will appear here
                    </span>
                    <span className="text-gray-400 text-xs mt-1">
                      {aspectRatio === "16:9" ? "Landscape" : "Portrait"} format
                    </span>
                  </div>
                )}

                <div className="space-y-2">
                  <Button
                    variant="default"
                    size="sm"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center"
                    onClick={() => handleGenerateImage(index)}
                    disabled={isLoading[index]}
                  >
                    {isLoading[index] ? (
                      <span className="flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Generating...
                      </span>
                    ) : (
                      <span className="flex items-center">
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
                          className="mr-1.5"
                        >
                          <path d="M21 8v-.65A2.15 2.15 0 0 0 19 5.2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                          <path d="M12 7v9" />
                          <path d="m15 13-3 3-3-3" />
                        </svg>
                        Generate Image
                      </span>
                    )}
                  </Button>

                  {slide.imageUrl && (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full flex items-center justify-center mb-2"
                      onClick={() => handleSaveToMediaManager(slide.imageUrl!)}
                      disabled={saveMediaMutation.isPending}
                    >
                      {saveMediaMutation.isPending ? (
                        <span className="flex items-center">
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Saving...
                        </span>
                      ) : (
                        <span className="flex items-center">
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
                            className="mr-1.5"
                          >
                            <path d="M5 12h14" />
                            <path d="M12 5v14" />
                          </svg>
                          Save to Media Manager
                        </span>
                      )}
                    </Button>
                  )}

                  {slide.imageUrl && (
                    <DownloadButton
                      imageUrl={slide.imageUrl}
                      filename={`storyboard-image-${index + 1}.png`}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Image Expansion Dialog */}
      <Dialog
        open={!!expandedImage}
        onOpenChange={(open) => !open && setExpandedImage(null)}
      >
        <DialogContent className="max-w-4xl">
          {expandedImage && (
            <img
              src={expandedImage}
              alt="Expanded view"
              className="w-full object-contain"
            />
          )}
          <DialogClose asChild>
            <Button className="mt-4">Close</Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </div>
  );
}
