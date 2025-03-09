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
  const [selectedLlmModel, setSelectedLlmModel] = useState<LlmModelType>("meta-llama/llama-3.2-1b-instruct");
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
        const styleText = selectedImageStyle === 'custom' 
          ? customStyle 
          : IMAGE_STYLES.find(style => style.value === selectedImageStyle)?.label || 'Fantasy';
          
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
            model: selectedLlmModel
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
      const styleText = selectedImageStyle === 'custom' 
        ? customStyle 
        : IMAGE_STYLES.find(style => style.value === selectedImageStyle)?.label || 'Fantasy';
        
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
          model: selectedLlmModel
        });
        
        // Update just this slide with the new prompt
        setSlides(slides.map((s, i) => i === index ? { ...s, prompt: enhancedPrompt } : s));
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
    setSlides(slides.map((s, i) => i === index ? { ...s, prompt: newPrompt } : s));
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
          <div className="mb-6 p-4 border rounded-lg bg-card/50">
            <h3 className="text-md font-medium mb-3">AI Prompt Generation</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* LLM Model Selector */}
              <div>
                <Label htmlFor="llm-model">LLM Model</Label>
                <Select
                  value={selectedLlmModel}
                  onValueChange={(value) => setSelectedLlmModel(value as LlmModelType)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select LLM Model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Meta Llama Models</SelectLabel>
                      <SelectItem value="meta-llama/llama-3.2-1b-instruct">
                        Llama 3.2 1B
                      </SelectItem>
                      <SelectItem value="meta-llama/llama-3.2-3b-instruct">
                        Llama 3.2 3B
                      </SelectItem>
                      <SelectItem value="meta-llama/llama-3.1-8b-instruct">
                        Llama 3.1 8B
                      </SelectItem>
                      <SelectItem value="meta-llama/llama-3.1-70b-instruct">
                        Llama 3.1 70B
                      </SelectItem>
                    </SelectGroup>
                    <SelectGroup>
                      <SelectLabel>OpenAI Models</SelectLabel>
                      <SelectItem value="openai/gpt-4o-mini">GPT-4o Mini</SelectItem>
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
                      <SelectItem value="google/gemini-pro-1.5">Gemini Pro 1.5</SelectItem>
                      <SelectItem value="google/gemini-flash-1.5">
                        Gemini Flash 1.5
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Image Style Selector */}
              <div>
                <Label htmlFor="image-style">Image Style</Label>
                <Select
                  value={selectedImageStyle}
                  onValueChange={setSelectedImageStyle}
                >
                  <SelectTrigger className="w-full">
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
            {selectedImageStyle === 'custom' && (
              <div className="mb-4">
                <Label htmlFor="custom-style">Custom Style Description</Label>
                <Textarea
                  id="custom-style"
                  placeholder="Describe your custom style (e.g., 'Dark noir with neon accents')"
                  value={customStyle}
                  onChange={(e) => setCustomStyle(e.target.value)}
                  className="resize-none h-20"
                />
              </div>
            )}
            
            {/* Generate Button */}
            <Button 
              onClick={generateAIPrompts}
              disabled={isGeneratingPrompts}
              className="w-full"
            >
              {isGeneratingPrompts ? (
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
                  Generating AI Prompts...
                </span>
              ) : (
                "Generate AI Prompts for All Slides"
              )}
            </Button>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4">
            {slides.map((slide, index) => (
              <div
                key={index}
                className="min-w-[300px] p-4 space-y-4 bg-card rounded-lg border shadow-sm"
              >
                <h3 className="font-medium flex items-center">
                  <span className="mr-2">Chapter {slide.chapterNumber}</span>
                  <span className="bg-gray-700/50 text-xs px-2 py-0.5 rounded-full">
                    Slide {index + 1}
                  </span>
                </h3>
                
                {/* Editable Prompt Text Area */}
                <div>
                  <Label htmlFor={`prompt-${index}`}>Prompt</Label>
                  <Textarea
                    id={`prompt-${index}`}
                    value={slide.prompt}
                    onChange={(e) => handlePromptEdit(index, e.target.value)}
                    className="resize-none h-32 mb-2"
                    placeholder="Edit this prompt to customize the image generation"
                  />
                </div>

                {slide.imageUrl ? (
                  <img
                    src={slide.imageUrl}
                    alt={`Chapter ${slide.chapterNumber} visualization`}
                    className="w-full h-40 object-cover rounded-md"
                  />
                ) : (
                  <div className="w-full h-40 bg-gray-800/30 rounded-md flex items-center justify-center">
                    <span className="text-gray-500 text-sm">
                      No image generated yet
                    </span>
                  </div>
                )}

                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => handleRegeneratePrompt(index)}
                    disabled={isLoading[index]}
                  >
                    {isLoading[index] ? (
                      <span className="flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-500"
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
                        Regenerating...
                      </span>
                    ) : (
                      "Regenerate Prompt"
                    )}
                  </Button>

                  <Button
                    variant="default"
                    size="sm"
                    className="w-full"
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
                      "Generate Image"
                    )}
                  </Button>

                  {slide.imageUrl && (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full"
                      onClick={() => onSaveToMediaManager(slide.imageUrl!)}
                    >
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
