/**
 * Application configuration settings
 * Centralized configuration for easy updates between development and production
 */

interface AppConfig {
  // Main application URLs
  urls: {
    // NovelVision main website
    main: string;
    
    // Writing workspace page
    writingWorkspace: string;
    
    // Settings page
    settings: string;
    
    // Character setup page
    characterSetup: string;
    
    // Story outline page
    storyOutline: string;
  };
  
  // Environment configuration
  environment: {
    // Is this a production build
    isProduction: boolean;
  };
}

// Development configuration
const devConfig: AppConfig = {
  urls: {
    main: "http://localhost:8000",
    writingWorkspace: "http://localhost:8000/writer_workspace/writing_working_space.html",
    settings: "http://localhost:8000/pages/settings.html",
    characterSetup: "http://localhost:8000/pages/character_setup.html",
    storyOutline: "http://localhost:8000/pages/story-outline.html",
  },
  environment: {
    isProduction: false
  }
};

// Production configuration
const prodConfig: AppConfig = {
  urls: {
    main: "https://novelvisionai.art",
    writingWorkspace: "https://novelvisionai.art/writer_workspace/writing_working_space.html",
    settings: "https://novelvisionai.art/pages/settings.html",
    characterSetup: "https://novelvisionai.art/pages/character_setup.html",
    storyOutline: "https://novelvisionai.art/pages/story-outline.html",
  },
  environment: {
    isProduction: true
  }
};

// Determine which config to use
// In a real environment, you might use environment variables like NEXT_PUBLIC_APP_ENV
const isProduction = process.env.NODE_ENV === 'production';
const config: AppConfig = isProduction ? prodConfig : devConfig;

export default config; 