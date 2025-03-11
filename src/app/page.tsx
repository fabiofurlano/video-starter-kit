"use client";

import { useEffect, useState, useRef } from "react";
import { UserData } from "./session-manager";
import sessionManager from "./session-manager";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import {
  SettingsIcon,
  Edit3Icon,
  Users,
  FileTextIcon,
  Home,
  DownloadIcon,
  LayoutDashboard,
} from "lucide-react";
import config from "@/lib/config";
import { useRouter } from "next/navigation";

export default function IndexPage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState<string>("Initializing...");
  const [expandedChapters, setExpandedChapters] = useState<
    Record<number, boolean>
  >({});
  const [slideSelections, setSlideSelections] = useState<
    Record<number, string>
  >({});
  const router = useRouter();

  const toggleChapter = (index: number) => {
    setExpandedChapters((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleSlideCountChange = (index: number, value: string) => {
    setSlideSelections((prev) => ({
      ...prev,
      [index]: value,
    }));
  };

  const generateStoryboard = (index: number) => {
    // Check if a slide count is selected
    if (!slideSelections[index] || slideSelections[index] === "") {
      alert("Please select the number of slides first");
      return;
    }

    const chapter = userData?.chapters?.[index];
    if (!chapter) return;

    const slideCount = parseInt(slideSelections[index]);
    console.log(
      `Generating ${slideCount} slides for chapter ${chapter.number}`,
    );

    // Generate prompts for each slide
    const slides = Array.from({ length: slideCount }, (_, i) => {
      // Create different prompts for different parts of the chapter
      const contentLength = chapter.content.length;
      const segmentSize = Math.floor(contentLength / slideCount);
      const startPos = i * segmentSize;
      const endPos = Math.min(startPos + segmentSize, contentLength);
      const segmentContent = chapter.content.substring(startPos, endPos);

      // Create a prompt that focuses on different parts of the chapter
      return {
        chapterNumber: chapter.number,
        prompt: `Create a visual representation for chapter ${chapter.number}: ${chapter.title}. Scene description based on the following excerpt: ${segmentContent.substring(0, 200)}...`,
        imageUrl: undefined,
      };
    });

    // Store storyboard data in localStorage
    const storyboardData = { slides };
    try {
      localStorage.setItem("storyboardData", JSON.stringify(storyboardData));
      console.log(
        "Successfully stored storyboard data in localStorage:",
        storyboardData,
      );

      // Redirect to the video editor app with a clear URL indicator
      router.push("/app?storyboard=true");
    } catch (error) {
      console.error("Error storing storyboard data:", error);
      alert("Error preparing storyboard data. Please try again.");
    }
  };

  // Listen for messages from the parent page
  useEffect(() => {
    console.log(
      "IndexPage component mounted - setting up postMessage listener",
    );
    setDebugInfo("Setting up message listener...");

    // Check for storyboard data in localStorage
    try {
      const storyboardData = localStorage.getItem("storyboardData");
      if (storyboardData) {
        console.log(
          "Found storyboard data in localStorage in page.tsx:",
          storyboardData,
        );
      } else {
        console.log("No storyboard data found in localStorage in page.tsx");
      }
    } catch (error) {
      console.error("Error checking storyboard data:", error);
    }

    // Check for session data first
    const currentData = sessionManager.getUserData();
    if (!currentData) {
      // Try to load from localStorage if no data in session
      try {
        const savedData = localStorage.getItem("videoProjectSessionData");
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          sessionManager.initializeSession(parsedData);
          setUserData(sessionManager.getUserData());
          setIsLoading(false);
          setDebugInfo("Session data loaded from localStorage");
        }
      } catch (error) {
        console.error("Error loading from localStorage:", error);
      }
    } else {
      // We already have data in the session
      setUserData(currentData);
      setIsLoading(false);
      setDebugInfo("Session data already available");
    }

    function handleMessage(event: MessageEvent) {
      console.log(
        "Message received from:",
        event.origin,
        "Type:",
        event.data?.type,
      );
      setDebugInfo(
        `Message received from: ${event.origin} at ${new Date().toISOString()}`,
      );

      // Log full message data for debugging
      console.log("Full message data:", JSON.stringify(event.data, null, 2));

      // Validate the origin - be more permissive in development
      if (
        event.origin.includes("localhost") ||
        event.origin.includes("novelvisionai.art") ||
        event.origin === "null" || // For local file:// testing
        event.origin.includes("127.0.0.1")
      ) {
        console.log("Authorized origin:", event.origin);
        setDebugInfo(`Origin validated: ${event.origin}`);

        // Handle ping test
        if (event.data && event.data.type === "PING_TEST") {
          console.log("Ping test received:", event.data.message);
          setDebugInfo(`Ping test received: ${event.data.message}`);

          // Respond to ping - use * for origin in development to be more permissive
          try {
            window.parent.postMessage(
              {
                type: "PING_RESPONSE",
                message: "Hello from AI Visual Studio!",
              },
              "*",
            ); // Less strict for testing
            console.log("Ping response sent");
            setDebugInfo("Ping response sent, waiting for data...");
          } catch (error) {
            console.error("Error sending ping response:", error);
            setDebugInfo(`Error sending ping response: ${error}`);
          }
          return;
        }

        // Handle any message with user data - be more tolerant of message format
        // Accept USER_DATA or AI_VISUAL_STUDIO_DATA or any message with the right fields
        if (event.data) {
          let userData = null;

          // Try different message formats
          if (event.data.type === "USER_DATA") {
            console.log("USER_DATA message format detected");
            userData = event.data;
          } else if (
            event.data.type === "AI_VISUAL_STUDIO_DATA" &&
            event.data.userData
          ) {
            console.log("AI_VISUAL_STUDIO_DATA message format detected");
            userData = event.data.userData;
          } else if (
            event.data.apiKeys ||
            event.data.language ||
            event.data.title
          ) {
            // If it has any expected fields, try to use it directly
            console.log("Non-standard message format with user data detected");
            userData = event.data;
          }

          if (userData) {
            // Log what we found
            console.log("User data detected, summary:");

            // Check for API keys which might be in different formats
            const openrouterKey =
              userData.apiKeys?.openrouter || userData.openrouterApiKey || "";
            const openaiKey =
              userData.apiKeys?.openai || userData.openaiApiKey || "";
            const falaiKey =
              userData.apiKeys?.falai || userData.falaiApiKey || "";

            console.log(
              "- API Keys present:",
              !!openrouterKey,
              !!openaiKey,
              !!falaiKey,
            );
            console.log("- Language:", userData.language);
            console.log("- Genre:", userData.genre);
            console.log("- Title:", userData.title);
            console.log(
              "- Characters count:",
              userData.characters?.length || 0,
            );
            console.log("- Outline count:", userData.outline?.length || 0);
            console.log("- Chapters count:", userData.chapters?.length || 0);

            // Check if we have the minimum required data (fal.ai API key)
            if (falaiKey) {
              try {
                console.log("Initializing session with received data");

                // Normalize the data for sessionManager
                const normalizedData = {
                  apiKeys: {
                    openrouter: openrouterKey,
                    openai: openaiKey,
                    falai: falaiKey,
                  },
                  language: userData.language || "",
                  genre: userData.genre || "",
                  title: userData.title || "",
                  location: userData.location || "",
                  timeline: userData.timeline || "",
                  characters: userData.characters || [],
                  outline: userData.outline || [],
                  chapters: userData.chapters
                    ? userData.chapters.map((chapter: any) => ({
                        number: String(chapter.number || ""),
                        title: chapter.title || "",
                        content: chapter.content || "",
                      }))
                    : [],
                };

                // Initialize the session with the normalized data
                sessionManager.initializeSession(normalizedData);

                // Set user data to trigger UI update
                setUserData(normalizedData);
                setIsLoading(false);
                console.log("Loading complete, showing dashboard");
              } catch (error) {
                console.error("Error initializing session:", error);
              }
            } else {
              console.log("No fal.ai API key found, displaying error");
              setUserData(null);
              setIsLoading(false);
            }
          } else {
            console.log("Message received but no user data found");
          }
        }
      } else {
        console.warn("Unauthorized origin:", event.origin);
      }
    }

    window.addEventListener("message", handleMessage);
    setDebugInfo("Message listener active, waiting for messages...");
    return () => window.removeEventListener("message", handleMessage);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-[#0A0F23] text-white relative">
      <header className="px-4 py-2 flex justify-between items-center border-b border-border glassmorphism mb-8">
        <div className="flex items-center">
          <Logo />
          <span className="mx-2 text-gray-400">|</span>
          <h2 className="text-lg font-medium">AI Visual Studio</h2>
        </div>

        <nav className="flex flex-row items-center justify-end gap-2">
          <ThemeToggle />

          <Button
            variant="ghost"
            size="sm"
            onClick={() => (window.location.href = "/app")}
          >
            <LayoutDashboard className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Video Studio</span>
          </Button>

          <Button variant="ghost" size="sm" asChild>
            <Link href={config.urls.main} target="_blank">
              <Home className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Home</span>
            </Link>
          </Button>

          <Button variant="ghost" size="sm" asChild>
            <Link href={config.urls.writingWorkspace} target="_blank">
              <Edit3Icon className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Writing Space</span>
            </Link>
          </Button>

          <Button variant="ghost" size="sm" asChild>
            <Link href={config.urls.characterSetup} target="_blank">
              <Users className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Characters</span>
            </Link>
          </Button>

          <Button variant="ghost" size="sm" asChild>
            <Link href={config.urls.storyOutline} target="_blank">
              <FileTextIcon className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Outline</span>
            </Link>
          </Button>

          <Button variant="ghost" size="sm" asChild>
            <Link href={config.urls.settings} target="_blank">
              <SettingsIcon className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Settings</span>
            </Link>
          </Button>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
            <h2 className="text-xl font-bold mb-2">
              Initializing AI Visual Studio...
            </h2>
            <p className="text-gray-400 text-center mb-4">
              Loading your creative workspace...
            </p>
          </div>
        ) : userData ? (
          <div className="space-y-8">
            {/* Story Info Panel */}
            <div className="glassmorphism p-6 border-gray-800">
              <h2 className="text-2xl font-bold mb-4 text-white">
                Story Information
              </h2>
              {userData.title || userData.genre || userData.language ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-900/40 p-4 rounded-lg border border-gray-800">
                    <h3 className="text-gray-400 text-sm mb-1">Title</h3>
                    <p className="text-lg font-medium">
                      {userData.title || "Untitled Story"}
                    </p>
                  </div>
                  <div className="bg-gray-900/40 p-4 rounded-lg border border-gray-800">
                    <h3 className="text-gray-400 text-sm mb-1">Genre</h3>
                    <p className="text-lg font-medium">
                      {userData.genre || "Not specified"}
                    </p>
                  </div>
                  <div className="bg-gray-900/40 p-4 rounded-lg border border-gray-800">
                    <h3 className="text-gray-400 text-sm mb-1">Language</h3>
                    <p className="text-lg font-medium">
                      {userData.language || "Not specified"}
                    </p>
                  </div>
                  <div className="bg-gray-900/40 p-4 rounded-lg border border-gray-800">
                    <h3 className="text-gray-400 text-sm mb-1">Location</h3>
                    <p className="text-lg font-medium">
                      {userData.location || "Not specified"}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-300">
                    No story details yet. You can start creating content from
                    scratch!
                  </p>
                </div>
              )}
            </div>

            {/* Characters Panel */}
            <div className="glassmorphism p-6 border-gray-800">
              <h2 className="text-2xl font-bold mb-6 text-white">Characters</h2>
              {userData.characters && userData.characters.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                  {userData.characters.map((character, index) => (
                    <div
                      key={index}
                      className="bg-gray-900/50 p-5 rounded-lg border border-gray-800 hover:border-blue-600 transition-all duration-300"
                    >
                      <h3 className="font-bold text-white">{character.name}</h3>
                      <p className="text-sm text-blue-300 mt-1">
                        {character.role || "No role specified"}
                      </p>
                      <p className="text-xs mt-3 text-gray-400 line-clamp-3">
                        {character.description || "No description"}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-6">
                  No characters found. You can create visual content without
                  defined characters.
                </p>
              )}
            </div>

            {/* Chapters Panel */}
            <div className="glassmorphism p-6 border-gray-800 mt-6">
              <h2 className="text-2xl font-bold mb-6 text-white">Chapters</h2>
              {userData.chapters && userData.chapters.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                  {userData.chapters.map((chapter, index) => (
                    <div
                      key={index}
                      className="bg-gray-900/50 p-5 rounded-lg shadow-lg border border-gray-800 hover:border-blue-600 transition-all duration-300"
                    >
                      <h1 className="text-xl font-bold mb-3 text-white border-b border-gray-700/50 pb-2">
                        Chapter {chapter.number}: {chapter.title}
                      </h1>
                      <div className="text-sm mt-3 text-gray-300 leading-relaxed">
                        {expandedChapters[index] ? (
                          <div
                            dangerouslySetInnerHTML={{
                              __html: chapter.content || "No content",
                            }}
                          />
                        ) : (
                          <div className="line-clamp-4">
                            {chapter.content ? (
                              <div
                                dangerouslySetInnerHTML={{
                                  __html:
                                    chapter.content.substring(0, 250) + "...",
                                }}
                              />
                            ) : (
                              "No content"
                            )}
                          </div>
                        )}

                        <button
                          onClick={() => toggleChapter(index)}
                          className="mt-2 px-3 py-1 bg-gray-800/50 hover:bg-gray-700/50 rounded-md text-blue-400 hover:text-blue-300 transition-colors text-xs"
                        >
                          {expandedChapters[index] ? "Show Less" : "Show More"}
                        </button>

                        <div className="flex items-center mt-3 space-x-2">
                          <select
                            className="bg-gray-800/70 border border-gray-700 text-gray-200 text-xs py-1.5 px-3 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            value={slideSelections[index] || ""}
                            onChange={(e) =>
                              handleSlideCountChange(index, e.target.value)
                            }
                          >
                            <option value="">Slides</option>
                            <option value="1">1 Slide</option>
                            <option value="2">2 Slides</option>
                            <option value="3">3 Slides</option>
                            <option value="4">4 Slides</option>
                            <option value="5">5 Slides</option>
                          </select>

                          <button
                            onClick={() => generateStoryboard(index)}
                            className="px-3 py-1.5 bg-gradient-to-r from-blue-600/80 to-indigo-600/80 hover:from-blue-500/80 hover:to-indigo-500/80 rounded-lg text-white text-xs font-medium shadow-sm flex items-center space-x-1"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-3.5 w-3.5 mr-1"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4a.5.5 0 01-.5-.5V5.5A.5.5 0 014 5h12a.5.5 0 01.5.5v9a.5.5 0 01-.5.5z"
                                clipRule="evenodd"
                              />
                              <path d="M6 7a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" />
                            </svg>
                            Generate Storyboard
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-6">
                  No chapters found. You can create visual content without
                  defined chapters.
                </p>
              )}
            </div>

            {/* Direct Video Studio Button (replacing the grid of project actions) */}
            <div className="flex justify-center my-10">
              <Link href="/app" className="block w-full max-w-xl">
                <div className="glassmorphism bg-gradient-to-br from-blue-900/50 to-purple-900/50 hover:from-blue-800/50 hover:to-purple-800/50 p-8 rounded-xl text-center transition-all duration-300 shadow-lg border border-indigo-800/50 hover:border-indigo-600">
                  <svg
                    className="w-16 h-16 mx-auto mb-4 text-indigo-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  <h3 className="text-2xl font-bold mb-2 text-white">
                    Open Video Studio
                  </h3>
                  <p className="text-lg text-gray-300">
                    Generate AI videos based on your story elements
                  </p>
                </div>
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex min-h-screen w-full flex-col items-center justify-center relative transition-colors duration-300">
            <div className="absolute top-4 right-4">
              <ThemeToggle />
            </div>

            <div className="mb-6 inline-block p-6 rounded-full bg-indigo-900 bg-opacity-50">
              <svg
                className="w-12 h-12 text-indigo-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Missing API Key</h2>
            <p className="text-gray-300 max-w-md mx-auto mb-6">
              To use the AI Visual Studio, you need to add a Fal.ai API key in
              your settings.
            </p>
            <div className="max-w-md mx-auto bg-gray-800 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">
                How to add your API key:
              </h3>
              <ol className="text-left text-gray-300 list-decimal pl-5 space-y-2">
                <li>Go back to the writing workspace</li>
                <li>Click on the Settings icon or menu</li>
                <li>Enter your Fal.ai API key in the appropriate field</li>
                <li>Save your settings</li>
                <li>Return to AI Visual Studio</li>
              </ol>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
