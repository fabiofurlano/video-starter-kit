/**
 * Session Manager for AI Video SDK
 * Handles storing and managing user session data received via postMessage
 */

// Define the type for user data
export interface UserData {
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

  /**
   * Initialize the SDK session with user data
   * @param userData The user data to initialize with
   */
  initializeSession(userData: Record<string, any>): void {
    console.log("SDK receiving session data:", userData);
    
    // Process API keys from different message formats
    let apiKeys: Record<string, string> = {};
    
    // Process direct keys in the userData object
    if (userData.apiKeys) {
      apiKeys = userData.apiKeys;
    }
    
    // Set user data with properly formatted chapters
    this.userData = {
      openaiApiKey: apiKeys.openai || userData.openai_key || "",
      openrouterApiKey: apiKeys.openrouter || userData.openrouter_key || "",
      falaiApiKey: apiKeys.falai || userData.falai_key || "",
      
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
  private saveFalApiKey(apiKey: string): void {
    try {
      // Save to window.localStorage using the same key name as settings.js
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem("falai_key", apiKey);
        console.log("Fal.ai API key stored as 'falai_key'");
      }
    } catch (error) {
      console.error("Failed to save Fal.ai API key:", error);
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

export default sessionManager;
