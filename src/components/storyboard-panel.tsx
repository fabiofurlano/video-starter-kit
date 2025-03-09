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
import { RotateCcw } from "lucide-react";

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

interface StoryboardPanelProps {
  onGenerateImage: (prompt: string) => Promise<string | undefined>;
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

  const sessionData = useVideoProjectStore((state) => state.generateData);

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
        const { slides } = event.data;
        console.log("Received storyboard data via postMessage:", slides);
        setSlides(slides);
        setTimeout(() => {
          console.log("Setting isVisible to true from postMessage");
          setIsVisible(true);
        }, 500);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

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

      for (let i = 0; i < updatedSlides.length; i++) {
        const slide = updatedSlides[i];

        // Get the style text to embed
        const styleText =
          selectedImageStyle === "custom"
            ? customStyle
            : IMAGE_STYLES.find((style) => style.value === selectedImageStyle)
                ?.label || "Fantasy";

        // Create a context-specific prompt for the LLM
        const promptContext = `
          Generate a detailed and creative image description for a story slide.
          
          Chapter Context: Chapter ${slide.chapterNumber}
          Current Slide Content: ${slide.prompt}
          
          The image should be in ${styleText} style.
          
          Your task is to create a vivid, detailed prompt that would help an AI image generator 
          create a compelling visual representation of this scene. Focus on the important elements, 
          mood, lighting, characters, and setting. Be specific about visual details.
        `;

        try {
          // Use the enhancePrompt function with the selected LLM model
          const enhancedPrompt = await enhancePrompt(promptContext, {
            type: "image",
            model: selectedLlmModel,
          });

          // Update the slide with the new AI-generated prompt
          updatedSlides[i] = {
            ...slide,
            prompt: enhancedPrompt,
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

  const handleGenerateImage = async (index: number) => {
    try {
      // Set loading state for this slide
      setIsLoading((prev) => ({ ...prev, [index]: true }));

      const slide = slides[index];
      const imageUrl = await onGenerateImage(slide.prompt);

      if (imageUrl) {
        setSlides(slides.map((s, i) => (i === index ? { ...s, imageUrl } : s)));
      }
    } catch (error) {
      console.error("Failed to generate image:", error);
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

      // Create a context-specific prompt for the LLM
      const promptContext = `
        Generate a detailed and creative image description for a story slide.
        
        Chapter Context: Chapter ${slide.chapterNumber}
        Current Slide Content: ${slide.prompt}
        
        The image should be in ${styleText} style.
        
        Your task is to create a vivid, detailed prompt that would help an AI image generator 
        create a compelling visual representation of this scene. Focus on the important elements, 
        mood, lighting, characters, and setting. Be specific about visual details.
      `;

      try {
        // Use the enhancePrompt function with the selected LLM model
        const enhancedPrompt = await enhancePrompt(promptContext, {
          type: "image",
          model: selectedLlmModel,
        });

        // Update just this slide with the new prompt
        setSlides(
          slides.map((s, i) =>
            i === index ? { ...s, prompt: enhancedPrompt } : s,
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

  // Function to handle prompt editing
  const handlePromptEdit = (index: number, newPrompt: string) => {
    setSlides(
      slides.map((s, i) => (i === index ? { ...s, prompt: newPrompt } : s)),
    );
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
            <h2 className="text-lg font-semibold">Storyboard Editor</h2>
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
                    Chapter {slide.chapterNumber}
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
                  <img
                    src={slide.imageUrl}
                    alt={`Chapter ${slide.chapterNumber} visualization`}
                    className="w-full h-40 object-cover rounded-md shadow-sm"
                  />
                ) : (
                  <div className="w-full h-40 bg-gradient-to-br from-gray-800/10 to-gray-800/25 rounded-md flex flex-col items-center justify-center border border-gray-700/20 shadow-inner">
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
                      className="w-full flex items-center justify-center"
                      onClick={() => onSaveToMediaManager(slide.imageUrl!)}
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
                        <path d="M5 12h14" />
                        <path d="M12 5v14" />
                      </svg>
                      Save to Media Manager
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
