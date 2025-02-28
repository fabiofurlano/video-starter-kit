"use client";

import { useEffect, useState } from "react";
import { UserData } from "./session-manager";
import sessionManager from "./session-manager";
import Link from "next/link";

export default function IndexPage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState<string>('Initializing...');

  // Listen for messages from the parent page
  useEffect(() => {
    console.log('IndexPage component mounted - setting up postMessage listener');
    setDebugInfo('Setting up message listener...');
    
    function handleMessage(event: MessageEvent) {
      console.log('Message received from:', event.origin, 'Type:', event.data?.type);
      setDebugInfo(`Message received from: ${event.origin} at ${new Date().toISOString()}`);
      
      // Log full message data for debugging
      console.log('Full message data:', JSON.stringify(event.data, null, 2));
      
      // Validate the origin - be more permissive in development
      if (event.origin.includes('localhost') || 
          event.origin.includes('novelvisionai.art') || 
          event.origin === 'null' || // For local file:// testing
          event.origin.includes('127.0.0.1')) {
        console.log('Authorized origin:', event.origin);
        setDebugInfo(`Origin validated: ${event.origin}`);
        
        // Handle ping test
        if (event.data && event.data.type === 'PING_TEST') {
          console.log('Ping test received:', event.data.message);
          setDebugInfo(`Ping test received: ${event.data.message}`);
          
          // Respond to ping - use * for origin in development to be more permissive
          try {
            window.parent.postMessage({
              type: 'PING_RESPONSE',
              message: 'Hello from AI Visual Studio!'
            }, '*'); // Less strict for testing
            console.log('Ping response sent');
            setDebugInfo('Ping response sent, waiting for data...');
          } catch (error) {
            console.error('Error sending ping response:', error);
            setDebugInfo(`Error sending ping response: ${error}`);
          }
          return;
        }
        
        // Handle any message with user data - be more tolerant of message format
        // Accept USER_DATA or AI_VISUAL_STUDIO_DATA or any message with the right fields
        if (event.data) {
          let userData = null;
          
          // Try different message formats
          if (event.data.type === 'USER_DATA') {
            console.log('USER_DATA message format detected');
            userData = event.data;
          } else if (event.data.type === 'AI_VISUAL_STUDIO_DATA' && event.data.userData) {
            console.log('AI_VISUAL_STUDIO_DATA message format detected');
            userData = event.data.userData;
          } else if (event.data.apiKeys || event.data.language || event.data.title) {
            // If it has any expected fields, try to use it directly
            console.log('Non-standard message format with user data detected');
            userData = event.data;
          }
          
          if (userData) {
            // Log what we found
            console.log('User data detected, summary:');
            
            // Check for API keys which might be in different formats
            const openrouterKey = userData.apiKeys?.openrouter || userData.openrouterApiKey || '';
            const openaiKey = userData.apiKeys?.openai || userData.openaiApiKey || '';
            const falaiKey = userData.apiKeys?.falai || userData.falaiApiKey || '';
            
            console.log('- API Keys present:', !!openrouterKey, !!openaiKey, !!falaiKey);
            console.log('- Language:', userData.language);
            console.log('- Genre:', userData.genre);
            console.log('- Title:', userData.title);
            console.log('- Characters count:', userData.characters?.length || 0);
            console.log('- Outline count:', userData.outline?.length || 0);
            console.log('- Chapters count:', userData.chapters?.length || 0);
            
            // Check if we have the minimum required data (fal.ai API key)
            if (falaiKey) {
              try {
                console.log('Initializing session with received data');
                
                // Normalize the data for sessionManager
                const normalizedData = {
                  apiKeys: {
                    openrouter: openrouterKey,
                    openai: openaiKey,
                    falai: falaiKey
                  },
                  language: userData.language || '',
                  genre: userData.genre || '',
                  title: userData.title || '',
                  location: userData.location || '',
                  timeline: userData.timeline || '',
                  characters: userData.characters || [],
                  outline: userData.outline || [],
                  chapters: userData.chapters || []
                };
                
                // Initialize the session with the normalized data
                sessionManager.initializeSession(normalizedData);
                
                // Set user data to trigger UI update
                setUserData(normalizedData);
                setIsLoading(false);
                console.log('Loading complete, showing dashboard');
              } catch (error) {
                console.error('Error initializing session:', error);
              }
            } else {
              console.log('No fal.ai API key found, displaying error');
              setUserData(null);
              setIsLoading(false);
            }
          } else {
            console.log('Message received but no user data found');
          }
        }
      } else {
        console.warn('Unauthorized origin:', event.origin);
      }
    }

    window.addEventListener('message', handleMessage);
    setDebugInfo('Message listener active, waiting for messages...');
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-indigo-900 text-white relative">
      <header className="p-6 border-b border-gray-800">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
            AI Visual Studio
          </h1>
          <div className="flex items-center space-x-2">
            {userData && userData.falaiApiKey ? (
              <div className="text-sm px-3 py-1 rounded-full bg-green-900 text-green-400">
                API Key Connected
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
            <h2 className="text-xl font-bold mb-2">Initializing AI Visual Studio...</h2>
            <p className="text-gray-400 text-center mb-4">Loading your creative workspace...</p>
          </div>
        ) : userData ? (
          <div className="space-y-8">
            {/* Story Info Panel */}
            <div className="bg-gray-800 bg-opacity-50 rounded-lg p-6 backdrop-blur-sm border border-gray-700">
              <h2 className="text-2xl font-bold mb-4">Story Information</h2>
              {userData.title || userData.genre || userData.language ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-gray-400 text-sm">Title</h3>
                    <p className="text-lg">{userData.title || "Untitled Story"}</p>
                  </div>
                  <div>
                    <h3 className="text-gray-400 text-sm">Genre</h3>
                    <p className="text-lg">{userData.genre || "Not specified"}</p>
                  </div>
                  <div>
                    <h3 className="text-gray-400 text-sm">Language</h3>
                    <p className="text-lg">{userData.language || "Not specified"}</p>
                  </div>
                  <div>
                    <h3 className="text-gray-400 text-sm">Location</h3>
                    <p className="text-lg">{userData.location || "Not specified"}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-300">No story details yet. You can start creating content from scratch!</p>
                </div>
              )}
            </div>

            {/* Characters Panel */}
            <div className="bg-gray-800 bg-opacity-50 rounded-lg p-6 backdrop-blur-sm border border-gray-700">
              <h2 className="text-2xl font-bold mb-4">Characters</h2>
              {userData.characters && userData.characters.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {userData.characters.map((character, index) => (
                    <div key={index} className="bg-gray-700 bg-opacity-50 p-4 rounded-lg">
                      <h3 className="font-bold">{character.name}</h3>
                      <p className="text-sm text-gray-300">{character.role || "No role specified"}</p>
                      <p className="text-xs mt-2 text-gray-400 line-clamp-3">{character.description || "No description"}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center">No characters found. You can create visual content without defined characters.</p>
              )}
            </div>

            {/* Project Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link href="/video" className="block">
                <div className="bg-gradient-to-br from-blue-800 to-indigo-900 hover:from-blue-700 hover:to-indigo-800 p-6 rounded-lg text-center transition-colors duration-300 h-full flex flex-col items-center justify-center">
                  <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <h3 className="text-xl font-bold">Video Creator</h3>
                  <p className="mt-2 text-gray-300">Generate videos based on your story</p>
                </div>
              </Link>

              <Link href="/music" className="block">
                <div className="bg-gradient-to-br from-purple-800 to-pink-900 hover:from-purple-700 hover:to-pink-800 p-6 rounded-lg text-center transition-colors duration-300 h-full flex flex-col items-center justify-center">
                  <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                  <h3 className="text-xl font-bold">Music Creator</h3>
                  <p className="mt-2 text-gray-300">Create custom music for your story</p>
                </div>
              </Link>

              <Link href="/image" className="block">
                <div className="bg-gradient-to-br from-green-800 to-teal-900 hover:from-green-700 hover:to-teal-800 p-6 rounded-lg text-center transition-colors duration-300 h-full flex flex-col items-center justify-center">
                  <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <h3 className="text-xl font-bold">Image Creator</h3>
                  <p className="mt-2 text-gray-300">Generate images from your story descriptions</p>
                </div>
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="mb-6 inline-block p-6 rounded-full bg-indigo-900 bg-opacity-50">
              <svg className="w-12 h-12 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Missing API Key</h2>
            <p className="text-gray-300 max-w-md mx-auto mb-6">
              To use the AI Visual Studio, you need to add a Fal.ai API key in your settings.
            </p>
            <div className="max-w-md mx-auto bg-gray-800 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">How to add your API key:</h3>
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
