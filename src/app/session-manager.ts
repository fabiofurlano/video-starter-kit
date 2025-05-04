/**
 * Session Manager for AI Video SDK
 * Handles storing and managing user session data received via postMessage
 */

// Define the type for user data
export interface UserData {
  // Auth Status
  isAuthenticated: boolean; // ADDED
  userId: string | null; // ADDED

  // API keys
  openaiApiKey?: string;
  openrouterApiKey?: string;
  falaiApiKey?: string;

  // Story elements
  language?: string;
  genre?: string;
  title?: string;
  location?: string;
  timeline?: string;

  // Characters and chapters
  characters?: any[];
  outline?: any[];
  chapters?: {
    number: string;
    title: string;
    content: string;
  }[];
}

// New interface for the data format coming from the parent
export interface ParentPostMessageData {
  apiKeys?: {
    openrouter?: string;
    openai?: string;
    falai?: string;
  };
  language?: string;
  genre?: string;
  title?: string;
  location?: string;
  timeline?: string;
  characters?: any[];
  outline?: any[];
  chapters?: any[];
}

// Define the global session state
class SessionManager {
  private userData: UserData | null = null;
  private initialized: boolean = false;
  private isAuthenticated: boolean = false; // ADDED
  private userId: string | null = null; // ADDED

  /**
   * Initialize the SDK session with user data
   * @param userData The user data to initialize with
   */
  initializeSession(userData: Record<string, any>): void {
    console.log("SDK receiving session data:", userData);

    // Store auth status
    this.isAuthenticated = userData.isAuthenticated ?? false; // ADDED
    this.userId = userData.userId ?? null; // ADDED
    console.log(
      `SDK Auth Status Received: isAuthenticated=${this.isAuthenticated}, userId=${this.userId}`,
    );

    // Process API keys from different message formats
    let apiKeys: Record<string, string> = {};

    // Process direct keys in the userData object
    if (userData.apiKeys) {
      apiKeys = userData.apiKeys;
    }

    // Extract the falai_key and save it to localStorage immediately
    const falaiKey = apiKeys.falai || userData.falai_key || "";
    if (falaiKey) {
      console.log(
        "SDK: Found falai_key in session data, saving to localStorage",
      );
      this.saveFalApiKey(falaiKey);
    } else {
      console.warn("SDK: No falai_key found in session data");
    }

    // Set user data with properly formatted chapters
    this.userData = {
      isAuthenticated: this.isAuthenticated, // Store in userData object as well
      userId: this.userId, // Store in userData object as well
      openaiApiKey: apiKeys.openai || userData.openai_key || "",
      openrouterApiKey: apiKeys.openrouter || userData.openrouter_key || "",
      falaiApiKey: falaiKey,

      language: userData.language || "",
      genre: userData.genre || "",
      title: userData.title || "",
      location: userData.location || "",
      timeline: userData.timeline || "",

      characters: userData.characters || [],
      outline: userData.outline || [],
      chapters: userData.chapters || [],
    };

    this.initialized = true;
    console.log("Session initialized successfully with data from parent");
  }

  /**
   * Store user data in the session
   * @param data The user data to store
   */
  setUserData(data: UserData): void {
    this.userData = data;
    this.initialized = true;
    console.log("Session data initialized:", this.userData);

    // Save API keys for later use
    if (data.falaiApiKey) {
      this.saveFalApiKey(data.falaiApiKey);
    }
  }

  /**
   * Get the current user data
   * @returns The user data or null if not initialized
   */
  getUserData(): UserData | null {
    return this.userData;
  }

  /**
   * Check if the session has been initialized
   * @returns True if the session has been initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /** // ADDED Getters for Auth Status
   * Get the authentication status received from the parent.
   * @returns True if the parent indicated the user is authenticated.
   */
  getIsAuthenticated(): boolean {
    return this.isAuthenticated;
  }

  /**
   * Get the user ID received from the parent.
   * @returns The Firebase User ID string or null.
   */
  getUserId(): string | null {
    return this.userId;
  }
  // END ADDED Getters

  /**
   * Get a specific API key
   * @param keyType The type of API key to get
   * @returns The API key or an empty string if not found
   */
  getApiKey(keyType: "openai" | "openrouter" | "falai"): string {
    if (!this.userData) return "";

    switch (keyType) {
      case "openai":
        return this.userData.openaiApiKey || "";
      case "openrouter":
        return this.userData.openrouterApiKey || "";
      case "falai":
        return this.userData.falaiApiKey || "";
      default:
        return "";
    }
  }

  /**
   * Save the fal.ai API key to the SDK's storage
   * @param apiKey The API key to save
   */
  saveFalApiKey(apiKey: string): void {
    try {
      console.log(
        "SDK: Attempting to save falai_key to localStorage:",
        apiKey.substring(0, 5) + "...",
      );

      // Save to window.localStorage using the same key name as settings.js
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem("falai_key", apiKey);
        console.log("SDK: Fal.ai API key stored as 'falai_key'");

        // Verify the key was saved correctly
        const savedKey = window.localStorage.getItem("falai_key");
        if (savedKey) {
          console.log(
            "SDK: Verified falai_key was saved correctly:",
            savedKey.substring(0, 5) + "...",
          );
        } else {
          console.error("SDK: Failed to verify falai_key in localStorage");
        }
      } else {
        console.error("SDK: window.localStorage is not available");
      }
    } catch (error) {
      console.error("SDK: Failed to save Fal.ai API key:", error);
    }
  }

  /**
   * Get the story characters
   * @returns The characters array or an empty array if not initialized
   */
  getCharacters(): any[] {
    return this.userData?.characters || [];
  }

  /**
   * Get the story chapters
   * @returns The chapters array or an empty array if not initialized
   */
  getChapters(): any[] {
    return this.userData?.chapters || [];
  }

  /**
   * Get the story outline
   * @returns The outline array or an empty array if not initialized
   */
  getOutline(): any[] {
    return this.userData?.outline || [];
  }

  /**
   * Get the story genre
   * @returns The genre or an empty string if not initialized
   */
  getGenre(): string {
    return this.userData?.genre || "";
  }

  /**
   * Get the story title
   * @returns The title or an empty string if not initialized
   */
  getTitle(): string {
    return this.userData?.title || "";
  }
}

// Create a singleton instance
const sessionManager = new SessionManager();

/**
 * Initialize message listeners for API keys
 * This function sets up event listeners to receive API keys via postMessage
 */
function initializeMessageListeners(): void {
  console.log("SDK: Initializing message listeners for API keys");

  const messageHandler = (event: MessageEvent) => {
    // Handle USER_DATA message
    if (event.data?.type === "USER_DATA") {
      console.log("SDK: Received USER_DATA message");

      // Extract the falai key
      const falaiKey = event.data.apiKeys?.falai;
      if (falaiKey) {
        console.log("SDK: Found falai_key in USER_DATA message");
        sessionManager.saveFalApiKey(falaiKey);
      }
    }

    // Handle FALAI_KEY_RESPONSE message
    if (event.data?.type === "FALAI_KEY_RESPONSE" && event.data.falai_key) {
      console.log("SDK: Received FALAI_KEY_RESPONSE message");
      sessionManager.saveFalApiKey(event.data.falai_key);
    }
  };

  // Add the event listener
  if (typeof window !== "undefined") {
    window.addEventListener("message", messageHandler);
    console.log("SDK: Message listener registered for API keys");

    // Request the key from parent
    try {
      window.parent.postMessage({ type: "REQUEST_FALAI_KEY" }, "*");
      console.log("SDK: Sent REQUEST_FALAI_KEY to parent");
    } catch (e) {
      console.error("SDK: Error requesting key from parent:", e);
    }
  }
}

// Initialize message listeners immediately
initializeMessageListeners();

export default sessionManager;
