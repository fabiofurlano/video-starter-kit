"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Copy, Check, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ModelHint {
  label: string;
  category: string;
  headline: string;
  bestFor: string[];
  tips: string[];
  pricePerCreditUSD: number;
  secondsPerDollar: number;
  examplePrompt: string;
}

interface ModelHintsData {
  [key: string]: ModelHint;
}

export function ModelHelper({ modelId }: { modelId: string }) {
  const [modelHints, setModelHints] = useState<ModelHintsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  // Load model hints data
  useEffect(() => {
    const fetchModelHints = async () => {
      try {
        // Check if we already have the data in localStorage (for offline support)
        const cachedData = localStorage.getItem("modelHintsData");

        if (cachedData) {
          setModelHints(JSON.parse(cachedData));
          setIsLoading(false);
          return;
        }

        // If not cached, fetch from the public directory
        const response = await fetch("/model-hints.json");
        if (!response.ok) {
          throw new Error("Failed to load model hints data");
        }

        const data = await response.json();
        setModelHints(data);

        // Cache the data in localStorage
        localStorage.setItem("modelHintsData", JSON.stringify(data));
      } catch (err) {
        console.error("Error loading model hints:", err);
        setError("Failed to load model information");
      } finally {
        setIsLoading(false);
      }
    };

    fetchModelHints();
  }, []);

  // Check localStorage for expanded state on mount, default to collapsed
  useEffect(() => {
    const savedState = localStorage.getItem("modelHelperExpanded");
    if (savedState !== null) {
      setIsExpanded(savedState === "true");
    } else {
      // Default to collapsed
      setIsExpanded(false);
      // Save the default state to localStorage
      localStorage.setItem("modelHelperExpanded", "false");
    }
  }, []);

  // Save expanded state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("modelHelperExpanded", isExpanded.toString());
  }, [isExpanded]);

  // Reset copied state after 2 seconds
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => {
        setCopied(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        setCopied(true);
      },
      (err) => {
        console.error("Could not copy text: ", err);
      },
    );
  };

  if (isLoading) {
    return (
      <div className="w-full mt-3 mb-1 p-3 bg-gray-800/40 rounded-lg border border-gray-700/50 animate-pulse shadow-lg backdrop-blur-sm">
        <div className="h-5 bg-gray-700/50 rounded-full w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-700/50 rounded-full w-1/2"></div>
      </div>
    );
  }

  if (error || !modelHints) {
    return (
      <div className="w-full mt-3 mb-1 p-3 bg-gray-800/40 rounded-lg border border-gray-700/50 text-gray-300 text-sm shadow-lg backdrop-blur-sm">
        <div className="flex items-center">
          <Info className="w-4 h-4 mr-2 text-blue-400/70" />
          <span>Model information unavailable</span>
        </div>
      </div>
    );
  }

  const modelHint = modelHints[modelId];

  if (!modelHint) {
    return (
      <div className="w-full mt-3 mb-1 p-3 bg-gray-800/40 rounded-lg border border-gray-700/50 text-gray-300 text-sm shadow-lg backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Info className="w-4 h-4 mr-2 text-blue-400/70" />
            <span>No tips available for this model yet</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 opacity-70 hover:opacity-100 transition-opacity"
            onClick={toggleExpanded}
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col glassmorphism overflow-hidden transition-all duration-300 shadow-lg">
      {/* Header - always visible */}
      <div
        className="p-3 flex items-center justify-between cursor-pointer hover:bg-primary/20 transition-colors group"
        onClick={toggleExpanded}
      >
        <div className="flex items-center space-x-2">
          <div className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 backdrop-blur-sm">
            {modelHint.category}
          </div>
          <h3 className="font-medium text-sm text-gray-100">
            {modelHint.label}
          </h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 opacity-70 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            toggleExpanded();
          }}
        >
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Collapsible content */}
      <div
        className={`overflow-y-auto flex-grow transition-all duration-300 ease-in-out ${isExpanded ? "opacity-100" : "max-h-0 opacity-0"}`}
      >
        <div className="px-4 pb-4 pt-1 text-sm">
          <p className="text-gray-200 mb-3 leading-relaxed">
            {modelHint.headline}
          </p>

          {/* Best For Section */}
          <div className="mb-4">
            <h4 className="text-xs uppercase tracking-wider text-blue-300/80 mb-2 font-medium">
              Best For
            </h4>
            <div className="flex flex-wrap gap-2">
              {modelHint.bestFor.map((use, index) => (
                <span
                  key={index}
                  className="px-2.5 py-1 text-xs rounded-full bg-gray-800/70 text-gray-200 border border-gray-700/70 backdrop-blur-sm hover:bg-gray-700/50 transition-colors"
                >
                  {use}
                </span>
              ))}
            </div>
          </div>

          {/* Tips Section */}
          <div className="mb-4">
            <h4 className="text-xs uppercase tracking-wider text-blue-300/80 mb-2 font-medium">
              Prompt Tips
            </h4>
            <ul className="space-y-1.5 text-gray-200 text-xs pl-1">
              {modelHint.tips.map((tip, index) => (
                <li key={index} className="flex items-start">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-400/70 mt-1.5 mr-2 flex-shrink-0"></span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pricing Section */}
          <div className="mb-4 bg-blue-900/10 p-3 rounded-lg border border-blue-500/20 backdrop-blur-sm">
            <h4 className="text-xs uppercase tracking-wider text-blue-300/80 mb-2 font-medium">
              Pricing
            </h4>
            <div className="flex justify-between items-center">
              <div className="text-gray-200 text-sm">
                <span className="font-semibold">
                  ${modelHint.pricePerCreditUSD.toFixed(2)}
                </span>{" "}
                / 5s
              </div>
              <div className="text-gray-300 text-sm">
                ≈{" "}
                <span className="text-green-300 font-semibold">
                  {modelHint.secondsPerDollar}
                </span>{" "}
                seconds per $1
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-400 italic">
              Based on fal.ai official API pricing. We use your API keys (BYOK)
              and don't charge additional fees.
            </div>
          </div>

          {/* Example Prompt */}
          <div>
            <h4 className="text-xs uppercase tracking-wider text-blue-300/80 mb-2 font-medium">
              Example Prompt
            </h4>
            <div className="relative group">
              <div className="bg-gray-900/40 p-3 rounded-lg border border-gray-700/50 text-gray-200 text-xs pr-9 max-h-24 overflow-y-auto leading-relaxed backdrop-blur-sm">
                {modelHint.examplePrompt}
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 h-6 w-6 p-0 opacity-70 group-hover:opacity-100 transition-opacity bg-gray-800/50 hover:bg-gray-700/70 backdrop-blur-sm"
                      onClick={() => copyToClipboard(modelHint.examplePrompt)}
                    >
                      {copied ? (
                        <Check className="h-3.5 w-3.5 text-green-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5 text-gray-300" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{copied ? "Copied!" : "Copy to clipboard"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
