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
   * Initialize session with data from parent iframe
   * @param data The data received from postMessage
   */
  initializeSession(data: ParentPostMessageData): void {
    console.log('Initializing session with data from parent');
    
    // Convert from parent format to internal UserData format
    const userData: UserData = {
      // Map API keys
      openaiApiKey: data.apiKeys?.openai || '',
      openrouterApiKey: data.apiKeys?.openrouter || '',
      falaiApiKey: data.apiKeys?.falai || '',
      
      // Story elements
      language: data.language || '',
      genre: data.genre || '',
      title: data.title || '',
      location: data.location || '',
      timeline: data.timeline || '',
      
      // Characters, outline, chapters
      characters: data.characters || [],
      outline: data.outline || [],
      chapters: data.chapters || []
    };
    
    // Set the user data
    this.setUserData(userData);
    console.log('Session initialized successfully with data from parent');
  }

  /**
   * Store user data in the session
   * @param data The user data to store
   */
  setUserData(data: UserData): void {
    this.userData = data;
    this.initialized = true;
    console.log('Session data initialized:', this.userData);
    
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
  getApiKey(keyType: 'openai' | 'openrouter' | 'falai'): string {
    if (!this.userData) return '';
    
    switch (keyType) {
      case 'openai':
        return this.userData.openaiApiKey || '';
      case 'openrouter':
        return this.userData.openrouterApiKey || '';
      case 'falai':
        return this.userData.falaiApiKey || '';
      default:
        return '';
    }
  }

  /**
   * Save the fal.ai API key to the SDK's storage
   * @param apiKey The API key to save
   */
  private saveFalApiKey(apiKey: string): void {
    try {
      // Save to window.localStorage for SDK compatibility
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('fal_key', apiKey);
        console.log('Fal.ai API key stored for SDK use');
      }
    } catch (error) {
      console.error('Failed to save Fal.ai API key:', error);
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
    return this.userData?.genre || '';
  }

  /**
   * Get the story title
   * @returns The title or an empty string if not initialized
   */
  getTitle(): string {
    return this.userData?.title || '';
  }
}

// Create a singleton instance
const sessionManager = new SessionManager();

export default sessionManager; 