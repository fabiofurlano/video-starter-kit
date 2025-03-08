import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useVideoProjectStore } from '@/data/store';

interface StoryboardPanelProps {
  onGenerateImage: (prompt: string) => Promise<string | undefined>;
  onSaveToMediaManager: (imageUrl: string) => void;
}

export function StoryboardPanel({ onGenerateImage, onSaveToMediaManager }: StoryboardPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [slides, setSlides] = useState<Array<{
    chapterNumber: string;
    prompt: string;
    imageUrl?: string;
  }>>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState<Record<number, boolean>>({});
  
  const sessionData = useVideoProjectStore((state) => state.generateData);

  // Immediate check on mount for console debugging
  console.log("StoryboardPanel initial render", {
    hasLocalStorage: !!localStorage.getItem('storyboardData'),
    hasSession: !!sessionData
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
      if (event.data.type === 'STORYBOARD_DATA') {
        const { slides } = event.data;
        console.log('Received storyboard data via postMessage:', slides);
        setSlides(slides);
        setTimeout(() => {
          console.log('Setting isVisible to true from postMessage');
          setIsVisible(true);
        }, 500);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);
  
  // Function to check for storyboard data
  const checkForStoryboardData = () => {
    try {
      const storedData = localStorage.getItem('storyboardData');
      if (storedData) {
        console.log('Found storyboard data in localStorage:', storedData);
        const parsedData = JSON.parse(storedData);
        if (parsedData.slides && Array.isArray(parsedData.slides)) {
          console.log('Valid slides array found, setting slides:', parsedData.slides.length);
          setSlides(parsedData.slides);
          
          // Use a staggered timing for better animation
          setTimeout(() => {
            console.log('Setting isVisible to true');
            setIsVisible(true);
          }, 300);
          
          // Clear localStorage to avoid loading it again on refresh
          // Use a delay to ensure it's processed first
          setTimeout(() => {
            localStorage.removeItem('storyboardData');
            console.log('Cleared storyboardData from localStorage');
          }, 1000);
        } else {
          console.log('Invalid slides data structure:', parsedData);
        }
      } else {
        console.log('No storyboard data found in localStorage');
      }
    } catch (error) {
      console.error('Error loading storyboard data from localStorage:', error);
    }
  };

  const handleGenerateImage = async (index: number) => {
    try {
      // Set loading state for this slide
      setIsLoading(prev => ({ ...prev, [index]: true }));
      
      const slide = slides[index];
      const imageUrl = await onGenerateImage(slide.prompt);
      
      if (imageUrl) {
        setSlides(slides.map((s, i) => 
          i === index ? { ...s, imageUrl } : s
        ));
      }
    } catch (error) {
      console.error('Failed to generate image:', error);
    } finally {
      // Clear loading state
      setIsLoading(prev => ({ ...prev, [index]: false }));
    }
  };

  // Only show the panel if we have slides
  if (slides.length === 0) {
    return null;
  }

  return (
    <div 
      className={`w-full transition-all duration-500 ease-in-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'
      }`}
    >
      <Collapsible
        open={isExpanded}
        onOpenChange={setIsExpanded}
        className="w-full bg-background border-b"
      >
        <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-accent">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            <h2 className="text-lg font-semibold">Storyboard Editor</h2>
            <span className="ml-2 bg-blue-600/70 text-xs px-2 py-0.5 rounded-full">{slides.length} Slides</span>
          </div>
          <span>{isExpanded ? '▼' : '▲'}</span>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="p-4">
          <div className="flex gap-4 overflow-x-auto pb-4">
            {slides.map((slide, index) => (
              <div 
                key={index} 
                className="min-w-[250px] p-4 space-y-4 bg-card rounded-lg border shadow-sm"
              >
                <h3 className="font-medium flex items-center">
                  <span className="mr-2">Chapter {slide.chapterNumber}</span>
                  <span className="bg-gray-700/50 text-xs px-2 py-0.5 rounded-full">Slide {index + 1}</span>
                </h3>
                <p className="text-sm text-muted-foreground">{slide.prompt}</p>
                
                {slide.imageUrl ? (
                  <img 
                    src={slide.imageUrl} 
                    alt={`Chapter ${slide.chapterNumber} visualization`}
                    className="w-full h-40 object-cover rounded-md"
                  />
                ) : (
                  <div className="w-full h-40 bg-gray-800/30 rounded-md flex items-center justify-center">
                    <span className="text-gray-500 text-sm">No image generated yet</span>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => handleGenerateImage(index)}
                    disabled={isLoading[index]}
                  >
                    {isLoading[index] ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Regenerating...
                      </span>
                    ) : (
                      'Regenerate Prompt'
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
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generating...
                      </span>
                    ) : (
                      'Generate Image'
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