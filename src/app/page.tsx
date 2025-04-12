"use client";

import { useEffect, useState } from "react"; // Removed useRef as it wasn't used here
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
  AlertCircle,
} from "lucide-react";
import config from "@/lib/config";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function IndexPage() {
  // Original state variables (will be populated after auth check)
  const [sdkUserData, setSdkUserData] = useState<UserData | null>(null); // Renamed from userData
  // const [isLoading, setIsLoading] = useState(true); // Replaced by isSessionReady/isAuthenticated logic
  // const [debugInfo, setDebugInfo] = useState<string>("Initializing..."); // Can be removed or kept for debugging
  const [expandedChapters, setExpandedChapters] = useState<
    Record<number, boolean>
  >({});
  // Auth/Session State
  const [isSessionReady, setIsSessionReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [parentOrigin, setParentOrigin] = useState<string | null>(null);
  const [slideSelections, setSlideSelections] = useState<
    Record<number, string>
  >({});

  // New state for storyboard from scratch feature
  const [storyInput, setStoryInput] = useState("");
  const [customSlideCount, setCustomSlideCount] = useState("3");
  const [customImageStyle, setCustomImageStyle] = useState("fantasy");
  const [inputError, setInputError] = useState("");

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

  // Function to validate text input
  const validateStoryInput = (text: string) => {
    // Check if text is too short (minimum 20 words)
    const wordCount = text.trim().split(/\s+/).length;
    if (wordCount < 20) {
      setInputError(
        "Your story is too short! Please add more details for better visuals.",
      );
      return false;
    }

    // Check if text is too vague (very basic check)
    if (text.length < 100) {
      setInputError(
        "This text is too vague. Try adding names, locations, and actions.",
      );
      return false;
    }

    // Clear any previous errors
    setInputError("");
    return true;
  };

  // Function to generate storyboard from chapters (original function)
  const generateStoryboard = (index: number) => {
    // Check if a slide count is selected
    if (!slideSelections[index] || slideSelections[index] === "") {
      alert("Please select the number of slides first");
      return;
    }

    const chapter = sdkUserData?.chapters?.[index]; // Fix: Use sdkUserData
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

      // Create a preview version for UI display, but keep the full content in the prompt
      const previewText =
        segmentContent.length > 200
          ? segmentContent.substring(0, 200) + "..."
          : segmentContent;

      // Create a prompt that focuses on different parts of the chapter
      return {
        chapterNumber: chapter.number,
        prompt: `Create a visual representation for chapter ${chapter.number}: ${chapter.title}. Scene description based on the following excerpt: ${segmentContent}`,
        promptPreview: `Create a visual representation for chapter ${chapter.number}: ${chapter.title}. Scene description based on the following excerpt: ${previewText}`,
        imageUrl: undefined,
      };
    });

    // Store storyboard data in localStorage
    const storyboardData = {
      slides,
      metadata: {
        source: "chapter",
        chapterNumber: chapter.number,
        chapterTitle: chapter.title,
        style: "fantasy", // Default style for chapter-based storyboards
        location: sdkUserData?.location || "", // Fix: Use sdkUserData
        timeline: sdkUserData?.timeline || "", // Fix: Use sdkUserData
      },
    };

    try {
      localStorage.setItem("storyboardData", JSON.stringify(storyboardData));
      console.log(
        "Successfully stored chapter storyboard data in localStorage:",
        storyboardData,
      );

      // Redirect to the video editor app with a clear URL indicator
      router.push("/app?storyboard=true");
    } catch (error) {
      console.error("Error storing storyboard data:", error);
      alert("Error preparing storyboard data. Please try again.");
    }
  };

  // Function to generate storyboard from custom text
  const generateStoryboardFromScratch = () => {
    // Validate the input first
    if (!validateStoryInput(storyInput)) {
      return;
    }

    if (!customSlideCount || customSlideCount === "") {
      setInputError("Please select the number of slides first");
      return;
    }

    const slideCount = parseInt(customSlideCount);
    console.log(`Generating ${slideCount} slides from custom story`);

    // Generate basic slide descriptions from the input text
    // This will be enhanced by the AI in storyboard-panel.tsx
    const contentLength = storyInput.length;
    const segmentSize = Math.floor(contentLength / slideCount);

    const slides = Array.from({ length: slideCount }, (_, i) => {
      const startPos = i * segmentSize;
      const endPos = Math.min(startPos + segmentSize, contentLength);
      const segmentContent = storyInput.substring(startPos, endPos);

      // Create a visual preview for UI that's truncated, but keep full content in prompt
      const previewText =
        segmentContent.length > 200
          ? segmentContent.substring(0, 200) + "..."
          : segmentContent;

      return {
        chapterNumber: "Custom", // Mark as custom to differentiate from chapter-based slides
        prompt: `Create a visual representation for the following scene: ${segmentContent}`,
        promptPreview: `Create a visual representation for the following scene: ${previewText}`,
        imageUrl: undefined,
      };
    });

    // Store storyboard data in localStorage
    const storyboardData = {
      slides,
      metadata: {
        source: "custom",
        style: customImageStyle,
        fullStory: storyInput,
      },
    };

    try {
      localStorage.setItem("storyboardData", JSON.stringify(storyboardData));
      console.log(
        "Successfully stored custom storyboard data in localStorage:",
        storyboardData,
      );

      // Also store the original input for reference
      localStorage.setItem("story_input", storyInput);

      // Redirect to the video editor app
      router.push("/app?storyboard=true");
    } catch (error) {
      console.error("Error storing storyboard data:", error);
      setInputError("Error preparing storyboard data. Please try again.");
    }
  };

  // Listen for messages from the parent page
  useEffect(() => {
    console.log(
      "IndexPage component mounted - setting up postMessage listener",
    );
    // setDebugInfo("Setting up message listener..."); // Removed

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
          // setUserData(sessionManager.getUserData()); // Data is set later after auth check
          // setIsLoading(false); // Removed
          console.log(
            "Session data loaded from localStorage cache (pre-auth check)",
          );
          // setDebugInfo("Session data loaded from localStorage"); // Removed
        }
      } catch (error) {
        console.error("Error loading from localStorage:", error);
      }
    } else {
      // We already have data in the session from a previous load or message
      // Set the SDK user data state here as well, but wait for auth check effect
      setSdkUserData(currentData); // Restore setting the state
      console.log(
        "Session data already available in sessionManager (pre-auth check), set in state.",
      );
    }

    function handleMessage(event: MessageEvent) {
      console.log(
        "Message received from:",
        event.origin,
        "Type:",
        event.data?.type,
      );
      // setDebugInfo( // Removed
      //   `Message received from: ${event.origin} at ${new Date().toISOString()}`,
      // );

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
        // setDebugInfo(`Origin validated: ${event.origin}`); // Removed
        setParentOrigin(event.origin); // Store the validated parent origin

        // Handle ping test
        if (event.data && event.data.type === "PING_TEST") {
          console.log("Ping test received:", event.data.message);
          // setDebugInfo(`Ping test received: ${event.data.message}`); // Removed

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
            // setDebugInfo("Ping response sent, waiting for data..."); // Removed
          } catch (error) {
            console.error("Error sending ping response:", error);
            // setDebugInfo(`Error sending ping response: ${error}`); // Removed
          }
          return; // Important: Stop processing after handling ping
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

            // Initialize the session with the full received data (including auth status)
            try {
              console.log("Initializing session with received data");
              sessionManager.initializeSession(userData); // Pass the whole payload

              // Update local state to reflect session readiness and auth status
              setIsAuthenticated(sessionManager.getIsAuthenticated());
              setIsSessionReady(true); // Mark session as ready

              console.log("Session initialized via postMessage.");
            } catch (error) {
              console.error("Error initializing session:", error);
              setIsSessionReady(true); // Still mark as ready, but auth might be null/false
              setIsAuthenticated(null); // Indicate error state
            }
          } else {
            console.log(
              "Message received but no valid user data structure found",
            );
            // Potentially handle this case - maybe mark session ready but unauthenticated?
            setIsAuthenticated(false);
            setIsSessionReady(true);
          }
        }
      } else {
        console.warn("Unauthorized origin:", event.origin);
      }
    }

    window.addEventListener("message", handleMessage);
    // setDebugInfo("Message listener active, waiting for messages..."); // Removed
    return () => window.removeEventListener("message", handleMessage);
  }, []); // Effect runs once on mount

  // Effect to check authentication status once session is ready
  useEffect(() => {
    if (isSessionReady) {
      console.log("SDK: Session is ready. Checking authentication status.");
      // Use the locally tracked isAuthenticated state which was set by the message listener
      if (isAuthenticated === false) {
        console.log(
          "SDK: User is not authenticated. Sending REDIRECT_AUTH to parent.",
        );
        if (parentOrigin) {
          // Ensure we know where to send the message
          window.parent.postMessage({ type: "REDIRECT_AUTH" }, parentOrigin);
          console.log("SDK: REDIRECT_AUTH sent to:", parentOrigin);
        } else {
          console.error(
            "SDK: Cannot send REDIRECT_AUTH, parent origin not known.",
          );
          // Fallback for safety, though parentOrigin should be set
          window.parent.postMessage({ type: "REDIRECT_AUTH" }, "*");
        }
      } else if (isAuthenticated === true) {
        console.log("SDK: User is authenticated. Proceeding with rendering.");
        // Load data from session manager into local state now that auth is confirmed
        setSdkUserData(sessionManager.getUserData());
      }
    }
  }, [isSessionReady, isAuthenticated, parentOrigin]); // Re-run if session readiness or auth status changes

  // --- Conditional Rendering Logic ---
  if (!isSessionReady) {
    // Still waiting for the initial message from the parent
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        Initializing Session... Waiting for Parent Application...
      </div>
    );
  }

  if (isAuthenticated === false) {
    // User is not authenticated, waiting for parent to redirect
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        Authentication required. Redirecting to login...
      </div>
    );
  }

  if (isAuthenticated === true && sdkUserData) {
    // --- Render the main UI using sdkUserData ---
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
          {/* Main content is now rendered directly if authenticated */}
          <div className="space-y-8">
            {/* Tabs Only Section at Top */}
            <div className="glassmorphism p-6 border-gray-800">
              <h2 className="text-2xl font-bold mb-6 text-white">
                Create Storyboard
              </h2>
              <Tabs defaultValue="chapters" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6 p-1 bg-gray-800/70 rounded-lg">
                  <TabsTrigger
                    value="chapters"
                    className="transition-all duration-200 hover:bg-gray-700/50 data-[state=active]:bg-blue-600/70 data-[state=active]:text-white rounded-md py-2"
                  >
                    From Chapters
                  </TabsTrigger>
                  <TabsTrigger
                    value="scratch"
                    className="transition-all duration-200 hover:bg-gray-700/50 data-[state=active]:bg-blue-600/70 data-[state=active]:text-white rounded-md py-2"
                  >
                    Start from Scratch
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="chapters">
                  <div className="text-center py-4">
                    <p className="text-gray-300">
                      Scroll down to view your chapters and create storyboards
                      from them.
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="scratch">
                  {/* Start from Scratch UI */}
                  <div className="space-y-5">
                    <div className="bg-gray-900/50 p-5 rounded-lg border border-gray-800">
                      <div className="flex justify-between items-start mb-2">
                        <Label
                          htmlFor="story-input"
                          className="text-sm font-medium flex items-center"
                        >
                          Your Story
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="ml-1.5 cursor-help">
                                  <AlertCircle
                                    size={14}
                                    className="text-gray-400"
                                  />
                                </span>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <p>
                                  For best results, describe what happens, where
                                  it happens, and any important details.
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </Label>
                      </div>

                      <Textarea
                        id="story-input"
                        placeholder="Write a short story or scene description. Include actions, characters, and locations."
                        className="h-48 resize-none mb-3 bg-gray-800/70 border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        value={storyInput}
                        onChange={(e) => {
                          setStoryInput(e.target.value);
                          if (inputError) setInputError("");
                        }}
                      />

                      {inputError && (
                        <div className="bg-red-900/30 border border-red-700/50 p-3 rounded-md mb-4">
                          <p className="text-red-200 text-sm flex items-center">
                            <AlertCircle
                              size={14}
                              className="mr-1.5 flex-shrink-0"
                            />
                            {inputError}
                          </p>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                          <Label
                            htmlFor="slide-count"
                            className="text-sm font-medium mb-1.5 block"
                          >
                            Number of Slides
                          </Label>
                          <select
                            id="slide-count"
                            className="w-full bg-gray-800/70 border border-gray-700 text-gray-200 text-sm py-2 px-3 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 hover:border-blue-400"
                            value={customSlideCount}
                            onChange={(e) =>
                              setCustomSlideCount(e.target.value)
                            }
                          >
                            <option value="1">1 Slide</option>
                            <option value="2">2 Slides</option>
                            <option value="3">3 Slides</option>
                            <option value="4">4 Slides</option>
                            <option value="5">5 Slides</option>
                            <option value="6">6 Slides</option>
                          </select>
                        </div>

                        <div>
                          <Label
                            htmlFor="image-style"
                            className="text-sm font-medium mb-1.5 block"
                          >
                            Image Style
                          </Label>
                          <select
                            id="image-style"
                            className="w-full bg-gray-800/70 border border-gray-700 text-gray-200 text-sm py-2 px-3 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 hover:border-blue-400"
                            value={customImageStyle}
                            onChange={(e) =>
                              setCustomImageStyle(e.target.value)
                            }
                          >
                            <option value="fantasy">Fantasy</option>
                            <option value="cyberpunk">Cyberpunk</option>
                            <option value="gothic">Gothic</option>
                            <option value="historical">Historical</option>
                            <option value="surreal">Surreal</option>
                            <option value="anime">Anime</option>
                            <option value="scifi">SciFi</option>
                            <option value="watercolor">Watercolor</option>
                          </select>
                        </div>
                      </div>

                      <Button
                        onClick={generateStoryboardFromScratch}
                        className="w-full mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition-all duration-300"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-2"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                          <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                        </svg>
                        Create Storyboard
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Story Info Panel */}
            <div className="glassmorphism p-6 border-gray-800">
              <h2 className="text-2xl font-bold mb-4 text-white">
                Story Information
              </h2>
              {sdkUserData.title ||
              sdkUserData.genre ||
              sdkUserData.language ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-900/40 p-4 rounded-lg border border-gray-800 hover:border-gray-700 transition-colors duration-200">
                    <h3 className="text-gray-400 text-sm mb-1">Title</h3>
                    <p className="text-lg font-medium">
                      {sdkUserData.title || "Untitled Story"}
                    </p>
                  </div>
                  <div className="bg-gray-900/40 p-4 rounded-lg border border-gray-800 hover:border-gray-700 transition-colors duration-200">
                    <h3 className="text-gray-400 text-sm mb-1">Genre</h3>
                    <p className="text-lg font-medium">
                      {sdkUserData.genre || "Not specified"}
                    </p>
                  </div>
                  <div className="bg-gray-900/40 p-4 rounded-lg border border-gray-800 hover:border-gray-700 transition-colors duration-200">
                    <h3 className="text-gray-400 text-sm mb-1">Language</h3>
                    <p className="text-lg font-medium">
                      {sdkUserData.language || "Not specified"}
                    </p>
                  </div>
                  <div className="bg-gray-900/40 p-4 rounded-lg border border-gray-800 hover:border-gray-700 transition-colors duration-200">
                    <h3 className="text-gray-400 text-sm mb-1">Location</h3>
                    <p className="text-lg font-medium">
                      {sdkUserData.location || "Not specified"}
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
              {sdkUserData.characters && sdkUserData.characters.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                  {sdkUserData.characters.map((character, index) => (
                    <div
                      key={index}
                      className="bg-gray-900/50 p-5 rounded-lg border border-gray-800 hover:border-blue-500/50 transition-all duration-300"
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

            {/* Full Storyboard Creation Section with Chapters */}
            <div className="glassmorphism p-6 border-gray-800">
              <Tabs defaultValue="chapters" className="w-full">
                <TabsContent value="chapters">
                  {/* Existing Chapters Panel */}
                  {sdkUserData.chapters && sdkUserData.chapters.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6">
                      {sdkUserData.chapters.map((chapter, index) => (
                        <div
                          key={index}
                          className="bg-gray-900/50 p-5 rounded-lg shadow-lg border border-gray-800 hover:border-blue-500/50 transition-all duration-300"
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
                                        chapter.content.substring(0, 250) +
                                        "...",
                                    }}
                                  />
                                ) : (
                                  "No content"
                                )}
                              </div>
                            )}

                            <button
                              onClick={() => toggleChapter(index)}
                              className="mt-2 px-3 py-1 bg-gray-800/50 hover:bg-gray-700/50 rounded-md text-blue-400 hover:text-blue-300 transition-colors duration-200 text-xs"
                            >
                              {expandedChapters[index]
                                ? "Show Less"
                                : "Show More"}
                            </button>

                            <div className="flex items-center mt-3 space-x-2">
                              <select
                                className="bg-gray-800/70 border border-gray-700 text-gray-200 text-xs py-1.5 px-3 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 hover:border-blue-400"
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
                                <option value="6">6 Slides</option>
                              </select>

                              <button
                                onClick={() => generateStoryboard(index)}
                                className="px-3 py-1.5 bg-gradient-to-r from-blue-600/80 to-indigo-600/80 hover:from-blue-500/80 hover:to-indigo-500/80 rounded-lg text-white text-xs font-medium shadow-sm flex items-center space-x-1 transition-all duration-200"
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
                      No chapters found. Try creating a storyboard from scratch
                      instead.
                    </p>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Fallback loading state if authenticated but data not yet loaded into state
  // This might occur briefly between isSessionReady=true and sdkUserData being set.
  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white">
      Loading authenticated session data...
    </div>
  );

  // --- Original Missing API Key Fallback (Removed as auth check handles this now) ---
  /* REMOVED THIS ENTIRE BLOCK
   else {
     // This case should ideally not be reached if the redirect logic works
     return (
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
  */ // END REMOVED BLOCK
}
