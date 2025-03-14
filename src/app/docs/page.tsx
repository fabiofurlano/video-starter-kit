"use client";

import { useEffect, useState } from 'react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { 
  FilmIcon, 
  ImageIcon, 
  MusicIcon, 
  MicIcon
} from "lucide-react";

export default function DocsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-900">
      <Header />
      <main className="flex-grow p-6 text-white">
        <div className="container mx-auto max-w-5xl">
          <h1 className="text-3xl font-bold mb-8 text-center">Video Starter Kit - Model Guide</h1>
          
          {/* Navigation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            <a href="#video-section" className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition-all">
              <FilmIcon className="w-8 h-8 mb-4 text-blue-400" />
              <h3 className="font-bold text-xl mb-2 text-blue-400">Video Models</h3>
              <p className="text-gray-300 text-sm">Professional 4K video generation</p>
            </a>
            
            <a href="#image-section" className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-purple-500 transition-all">
              <ImageIcon className="w-8 h-8 mb-4 text-purple-400" />
              <h3 className="font-bold text-xl mb-2 text-purple-400">Image Models</h3>
              <p className="text-gray-300 text-sm">High-quality image generation</p>
            </a>
            
            <a href="#audio-section" className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-green-500 transition-all">
              <MusicIcon className="w-8 h-8 mb-4 text-green-400" />
              <h3 className="font-bold text-xl mb-2 text-green-400">Audio Models</h3>
              <p className="text-gray-300 text-sm">Music and sound effects</p>
            </a>
            
            <a href="#voice-section" className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-yellow-500 transition-all">
              <MicIcon className="w-8 h-8 mb-4 text-yellow-400" />
              <h3 className="font-bold text-xl mb-2 text-yellow-400">Voice Models</h3>
              <p className="text-gray-300 text-sm">Voiceover and dialogue generation</p>
            </a>
          </div>
          
          {/* Video Models Section */}
          <section id="video-section" className="mb-16">
            <div className="flex items-center mb-8">
              <FilmIcon className="w-8 h-8 mr-4 text-blue-400" />
              <h2 className="text-2xl font-bold">Video Models</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="inline-block px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-sm font-medium mb-4">
                  Professional
                </div>
                <h3 className="font-bold mb-4">Veo 2</h3>
                <div className="space-y-3 text-sm text-gray-300">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Quality:</span>
                    <span>4K Professional</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Cost:</span>
                    <span>$1.25 / 5s</span>
                  </div>
                  <div className="mt-4 p-3 bg-gray-900 rounded-lg text-xs">
                    "Cinematic drone shot over mountains at sunrise"
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="inline-block px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-sm font-medium mb-4">
                  Image-Guided
                </div>
                <h3 className="font-bold mb-4">LTX Video</h3>
                <div className="space-y-3 text-sm text-gray-300">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Best for:</span>
                    <span>Image to Video</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Cost:</span>
                    <span>Variable</span>
                  </div>
                  <div className="mt-4 p-3 bg-gray-900 rounded-lg text-xs">
                    "Transform photo into nature scene"
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="inline-block px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-sm font-medium mb-4">
                  Physics
                </div>
                <h3 className="font-bold mb-4">Minimax</h3>
                <div className="space-y-3 text-sm text-gray-300">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Best for:</span>
                    <span>Realistic Motion</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Cost:</span>
                    <span>Variable</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
          
          {/* Image Models Section */}
          <section id="image-section" className="mb-16">
            <div className="flex items-center mb-8">
              <ImageIcon className="w-8 h-8 mr-4 text-purple-400" />
              <h2 className="text-2xl font-bold">Image Models</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="inline-block px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-sm font-medium mb-4">
                  Professional
                </div>
                <ul className="space-y-4">
                  <li>
                    <strong className="block mb-2">Flux Pro Ultra</strong>
                    <span className="text-sm text-gray-300">Highest quality, detailed outputs</span>
                  </li>
                  <li>
                    <strong className="block mb-2">SD 3.5</strong>
                    <span className="text-sm text-gray-300">Text & typography specialist</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="inline-block px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-sm font-medium mb-4">
                  Quick Work
                </div>
                <ul className="space-y-4">
                  <li>
                    <strong className="block mb-2">Flux Dev</strong>
                    <span className="text-sm text-gray-300">General purpose, fast results</span>
                  </li>
                  <li>
                    <strong className="block mb-2">Flux Schnell</strong>
                    <span className="text-sm text-gray-300">Rapid testing and iterations</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>
          
          {/* Audio Models Section */}
          <section id="audio-section" className="mb-16">
            <div className="flex items-center mb-8">
              <MusicIcon className="w-8 h-8 mr-4 text-green-400" />
              <h2 className="text-2xl font-bold">Audio Models</h2>
            </div>
            
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="inline-block px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-sm font-medium mb-4">
                    Music
                  </div>
                  <ul className="space-y-4">
                    <li>
                      <strong className="block mb-2">Minimax Music</strong>
                      <span className="text-sm text-gray-300">Full music compositions</span>
                    </li>
                    <li>
                      <strong className="block mb-2">Stable Audio</strong>
                      <span className="text-sm text-gray-300">Music & sound effects</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <div className="inline-block px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-400 text-sm font-medium mb-4">
                    Effects
                  </div>
                  <ul className="space-y-4">
                    <li>
                      <strong className="block mb-2">MMAudio</strong>
                      <span className="text-sm text-gray-300">Professional sound effects</span>
                    </li>
                    <li>
                      <strong className="block mb-2">Lipsync</strong>
                      <span className="text-sm text-gray-300">Character animation sync</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
          
          {/* Voice Models Section */}
          <section id="voice-section" className="mb-16">
            <div className="flex items-center mb-8">
              <MicIcon className="w-8 h-8 mr-4 text-yellow-400" />
              <h2 className="text-2xl font-bold">Voice Models</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="inline-block px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-400 text-sm font-medium mb-4">
                  Natural Speech
                </div>
                <h3 className="font-bold mb-4">PlayHT TTS v3</h3>
                <div className="space-y-3 text-sm text-gray-300">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Cost:</span>
                    <span>$0.03/minute</span>
                  </div>
                  <div className="mt-4 p-3 bg-gray-900 rounded-lg text-xs">
                    Perfect for video narration
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="inline-block px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-sm font-medium mb-4">
                  Dialogues
                </div>
                <h3 className="font-bold mb-4">PlayAI Dialog</h3>
                <div className="space-y-3 text-sm text-gray-300">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Best for:</span>
                    <span>Multi-speaker scenes</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="inline-block px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-sm font-medium mb-4">
                  Voice Clone
                </div>
                <h3 className="font-bold mb-4">F5 TTS</h3>
                <div className="space-y-3 text-sm text-gray-300">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Best for:</span>
                    <span>Custom voices</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
          
          {/* Quick Reference */}
          <section className="mb-16">
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-8 border border-gray-700">
              <h2 className="text-2xl font-bold mb-6">Quick Reference</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <h3 className="font-bold mb-3 text-blue-400">Video Costs</h3>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li>• Veo 2: $1.25/5s</li>
                    <li>• Others: Variable</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold mb-3 text-purple-400">Image Costs</h3>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li>• Pro: $0.10-0.30</li>
                    <li>• Quick: $0.05-0.15</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold mb-3 text-green-400">Audio Costs</h3>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li>• Music: Variable</li>
                    <li>• Effects: Variable</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold mb-3 text-yellow-400">Voice Costs</h3>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li>• Standard: $0.03/min</li>
                    <li>• Custom: Variable</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
          
          {/* Help Section */}
          <section>
            <div className="bg-gray-800 rounded-xl p-6 flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="mb-4 md:mb-0">
                <h2 className="text-xl font-bold mb-2">Need Help?</h2>
                <p className="text-gray-400 text-sm">Contact support or check the documentation</p>
              </div>
              <div className="flex space-x-4">
                <a href="/docs" className="px-4 py-2 bg-blue-600 text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                  Documentation
                </a>
                <a href="/support" className="px-4 py-2 bg-gray-700 text-sm font-medium rounded-lg hover:bg-gray-600 transition-colors">
                  Support
                </a>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
} 