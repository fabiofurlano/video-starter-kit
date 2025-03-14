"use client";

import { useEffect, useState } from 'react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { 
  FilmIcon, 
  ImageIcon, 
  MusicIcon, 
  MicIcon,
  LightbulbIcon,
  AlertTriangleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  DollarSignIcon,
  BookOpenIcon
} from "lucide-react";

// Model card component for better reusability
function ModelCard({ 
  type, 
  color, 
  name, 
  endpointId,
  description = "",
  cost = "Variable",
  bestFor = [], 
  promptTips = [],
  features = [],
  inputAsset = []
}: {
  type: string;
  color: string;
  name: string;
  endpointId: string;
  description?: string;
  cost?: string;
  bestFor?: string[] | string;
  promptTips?: string[];
  features?: string[];
  inputAsset?: string[];
}) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  
  const toggleSection = (section: string) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };

  // Convert bestFor to array if it's a string
  const bestForArray = typeof bestFor === 'string' ? [bestFor] : bestFor;

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <div className={`inline-block px-3 py-1 rounded-full bg-${color}-500/10 text-${color}-400 text-sm font-medium mb-4`}>
        {type}
      </div>
      <h3 className="font-bold text-lg mb-2">{name}</h3>
      <div className="text-xs text-gray-400 mb-4">{endpointId}</div>
      
      {/* Basic Info */}
      <div className="space-y-3 text-sm text-gray-300">
        <p className="text-gray-300">{description}</p>
        <div className="flex justify-between">
          <span className="text-gray-400">Cost:</span>
          <span>{cost}</span>
        </div>
        {inputAsset && inputAsset.length > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-400">Accepts:</span>
            <span>{inputAsset.join(', ')}</span>
          </div>
        )}
      </div>
      
      {/* Best Use Cases Expandable Section */}
      {bestForArray && bestForArray.length > 0 && (
        <div className="mt-4 border-t border-gray-700 pt-4">
          <button 
            onClick={() => toggleSection('bestFor')}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center">
              <AlertTriangleIcon className="w-4 h-4 mr-2 text-green-400" />
              <span className="font-medium">Best Use Cases</span>
            </div>
            {expandedSection === 'bestFor' ? 
              <ChevronUpIcon className="w-4 h-4" /> : 
              <ChevronDownIcon className="w-4 h-4" />
            }
          </button>
          
          {expandedSection === 'bestFor' && (
            <div className="mt-3 pl-6">
              <ul className="space-y-2">
                {bestForArray.map((use, index) => (
                  <li key={index} className="flex items-start text-sm text-gray-300">
                    <span className="text-green-400 mr-2">•</span>
                    <span>{use}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      
      {/* Prompt Techniques Section */}
      {promptTips && promptTips.length > 0 && (
        <div className="mt-4 border-t border-gray-700 pt-4">
          <button 
            onClick={() => toggleSection('promptTips')}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center">
              <LightbulbIcon className="w-4 h-4 mr-2 text-yellow-400" />
              <span className="font-medium">Prompt Techniques</span>
            </div>
            {expandedSection === 'promptTips' ? 
              <ChevronUpIcon className="w-4 h-4" /> : 
              <ChevronDownIcon className="w-4 h-4" />
            }
          </button>
          
          {expandedSection === 'promptTips' && (
            <div className="mt-3 pl-6">
              <ul className="space-y-2">
                {promptTips.map((tip, index) => (
                  <li key={index} className="flex items-start text-sm text-gray-300">
                    <span className="text-yellow-400 mr-2">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      
      {/* Features Expandable Section */}
      {features && features.length > 0 && (
        <div className="mt-4 border-t border-gray-700 pt-4">
          <button 
            onClick={() => toggleSection('features')}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center">
              <DollarSignIcon className="w-4 h-4 mr-2 text-purple-400" />
              <span className="font-medium">Features</span>
            </div>
            {expandedSection === 'features' ? 
              <ChevronUpIcon className="w-4 h-4" /> : 
              <ChevronDownIcon className="w-4 h-4" />
            }
          </button>
          
          {expandedSection === 'features' && (
            <div className="mt-3 pl-6">
              <ul className="space-y-2">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-start text-sm text-gray-300">
                    <span className="text-purple-400 mr-2">•</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function DocsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-900">
      <Header />
      <main className="flex-grow p-6 text-white">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold mb-8 text-center">Video Starter Kit - Model Guide</h1>
          
          {/* Navigation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            <a href="#video-section" className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition-all">
              <FilmIcon className="w-8 h-8 mb-4 text-blue-400" />
              <h3 className="font-bold text-xl mb-2 text-blue-400">Video Models</h3>
              <p className="text-gray-300 text-sm">Professional video generation</p>
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
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <ModelCard
                type="Professional"
                color="blue"
                name="Veo 2"
                endpointId="fal-ai/veo2"
                description="Veo creates videos with realistic motion and high quality output, up to 4K."
                cost="$1.25/5s ($0.25/additional second)"
                bestFor={[
                  "High-quality cinematic videos",
                  "Up to 4K resolution outputs",
                  "Realistic motion generation",
                  "Professional content creation"
                ]}
                promptTips={[
                  "Use cinematic language in prompts",
                  "Describe camera movements explicitly",
                  "Include lighting details for realism",
                  "Keep prompts under 75 words for best results"
                ]}
                features={[
                  "Up to 4K resolution",
                  "Realistic motion physics",
                  "High-fidelity output",
                  "Detailed textures"
                ]}
              />

              <ModelCard
                type="Fast Generation"
                color="green"
                name="LTX Video v0.95"
                endpointId="fal-ai/ltx-video-v095/multiconditioning"
                description="Generate videos from prompts, images using LTX Video-0.9.5"
                cost="~$0.04-0.08/second"
                inputAsset={["image"]}
                bestFor={[
                  "Rapid video prototyping",
                  "Image-to-video conversion",
                  "Budget-friendly video generation",
                  "Testing concepts quickly"
                ]}
                promptTips={[
                  "Keep prompts concise and direct",
                  "For image conditioning, use clear reference images",
                  "Specify motion direction clearly",
                  "Use simple descriptions for best results"
                ]}
                features={[
                  "Image conditioning capability",
                  "Fast generation times",
                  "Multi-conditioning options",
                  "Good for rapid iterations"
                ]}
              />

              <ModelCard
                type="Physics Simulation"
                color="purple"
                name="Minimax Video"
                endpointId="fal-ai/minimax/video-01-live"
                description="High quality video, realistic motion and physics"
                cost="Variable (pay per compute)"
                inputAsset={["image"]}
                bestFor={[
                  "Videos with realistic physics",
                  "Motion that follows physical laws",
                  "Natural movement sequences",
                  "Image-guided video creation"
                ]}
                promptTips={[
                  "Describe physical interactions clearly",
                  "Specify object properties (weight, material)",
                  "Include environmental factors (wind, gravity)",
                  "Reference natural physical phenomena"
                ]}
                features={[
                  "Realistic physics simulation",
                  "Image input capability",
                  "Natural motion rendering",
                  "High-quality output"
                ]}
              />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <ModelCard
                type="High Quality"
                color="blue"
                name="Hunyuan"
                endpointId="fal-ai/hunyuan-video"
                description="High visual quality, motion diversity and text alignment"
                cost="Variable (pay per compute)"
                bestFor={[
                  "Visually stunning videos",
                  "Complex motion sequences",
                  "Text-aligned content creation",
                  "Diverse visual styles"
                ]}
                promptTips={[
                  "Use detailed visual descriptions",
                  "Specify desired motion patterns",
                  "Include text elements if needed",
                  "Reference visual styles clearly"
                ]}
                features={[
                  "Excellent text alignment",
                  "Diverse motion capabilities",
                  "High visual fidelity",
                  "Strong prompt adherence"
                ]}
              />
              
              <ModelCard
                type="Professional"
                color="purple"
                name="Kling 1.5 Pro"
                endpointId="fal-ai/kling-video/v1.5/pro"
                description="High quality video"
                cost="Variable (pay per compute)"
                inputAsset={["image"]}
                bestFor={[
                  "Professional-grade videos",
                  "Image-guided generation",
                  "High-fidelity outputs",
                  "Commercial applications"
                ]}
                promptTips={[
                  "Provide high-quality reference images",
                  "Describe desired motion clearly",
                  "Specify visual style details",
                  "Include scene composition elements"
                ]}
                features={[
                  "Image input support",
                  "Professional quality output",
                  "Strong visual consistency",
                  "High resolution capability"
                ]}
              />
              
              <ModelCard
                type="Standard"
                color="green"
                name="Kling 1.0 Standard"
                endpointId="fal-ai/kling-video/v1/standard/text-to-video"
                description="High quality video with camera control"
                cost="Variable (pay per compute)"
                bestFor={[
                  "Videos with specific camera movements",
                  "Controlled visual narratives",
                  "Dynamic scene exploration",
                  "Directorial vision implementation"
                ]}
                promptTips={[
                  "Include camera directions in prompts",
                  "Specify movement type (pan, zoom, etc.)",
                  "Note camera speed and timing",
                  "Describe scene composition from camera perspective"
                ]}
                features={[
                  "Camera control capabilities",
                  "Dynamic movement options",
                  "Cinematic possibilities",
                  "Director-style control"
                ]}
              />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <ModelCard
                type="Dream Machine"
                color="blue"
                name="Luma Dream Machine 1.5"
                endpointId="fal-ai/luma-dream-machine"
                description="High quality video"
                cost="Variable (pay per compute)"
                inputAsset={["image"]}
                bestFor={[
                  "Dreamlike visual sequences",
                  "Artistic video creation",
                  "Image-based video generation",
                  "Creative explorations"
                ]}
                promptTips={[
                  "Use evocative, imaginative language",
                  "Include mood and atmosphere descriptions",
                  "Reference artistic styles or visual aesthetics",
                  "Describe transitions between visual elements"
                ]}
                features={[
                  "Dreamlike visual effects",
                  "Image input capabilities",
                  "Artistic quality output",
                  "Creative transformation options"
                ]}
              />
              
              <ModelCard
                type="Audio-Video"
                color="purple"
                name="MMAudio V2"
                endpointId="fal-ai/mmaudio-v2"
                description="MMAudio generates synchronized audio given video and/or text inputs. It can be combined with video models to get videos with audio."
                cost="Variable (pay per compute)"
                inputAsset={["video"]}
                bestFor={[
                  "Adding synchronized audio to videos",
                  "Sound design for silent videos",
                  "Audio-visual content creation",
                  "Enhanced video experiences"
                ]}
                promptTips={[
                  "Describe desired sound atmosphere",
                  "Specify audio style and mood",
                  "Note key moments for audio emphasis",
                  "Include audio reference descriptions"
                ]}
                features={[
                  "Audio generation for videos",
                  "Synchronization capabilities",
                  "Text-guided audio creation",
                  "Integrated audio-visual output"
                ]}
              />
              
              <ModelCard
                type="Animation"
                color="green"
                name="Sync.so LipSync 1.8.0"
                endpointId="fal-ai/sync-lipsync"
                description="Generate realistic lipsync animations from audio using advanced algorithms for high-quality synchronization."
                cost="Variable (pay per compute)"
                inputAsset={["video", "audio"]}
                bestFor={[
                  "Character lip synchronization",
                  "Dialogue animation",
                  "Virtual presenters",
                  "Animated content creation"
                ]}
                promptTips={[
                  "Provide clear audio with distinct speech",
                  "Use video with visible mouth/face",
                  "Ensure good lighting in source video",
                  "Keep audio properly normalized"
                ]}
                features={[
                  "Realistic lip movement synchronization",
                  "Works with multiple languages",
                  "High-quality animation results",
                  "Support for various face angles"
                ]}
              />
            </div>
          </section>
          
          {/* Image Models Section */}
          <section id="image-section" className="mb-16">
            <div className="flex items-center mb-8">
              <ImageIcon className="w-8 h-8 mr-4 text-purple-400" />
              <h2 className="text-2xl font-bold">Image Models</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <ModelCard
                type="Professional"
                color="purple"
                name="Flux Pro 1.1 Ultra"
                endpointId="fal-ai/flux-pro/v1.1-ultra"
                description="FLUX.1 [pro] is a professional-grade model that generates premium quality images from text, optimized for commercial applications and professional creative workflows."
                cost="$0.10-0.30/image"
                bestFor={[
                  "High-end professional images",
                  "Detailed artistic creations",
                  "Commercial-quality outputs",
                  "Complex scenes with fine details"
                ]}
                promptTips={[
                  "Provide detailed visual descriptions",
                  "Include artistic style references",
                  "Specify composition and lighting",
                  "Add details about perspective and mood"
                ]}
                features={[
                  "Ultra-high quality output",
                  "Excellent detail rendering",
                  "Advanced style capabilities",
                  "Professional-grade results"
                ]}
              />

              <ModelCard
                type="Quick"
                color="blue"
                name="Flux Dev"
                endpointId="fal-ai/flux/dev"
                description="FLUX.1 [dev] is a 12 billion parameter flow transformer that generates high-quality images from text. It is suitable for personal and commercial use."
                cost="$0.05-0.15/image"
                bestFor={[
                  "Rapid prototyping",
                  "Quick concept exploration",
                  "Testing visual ideas",
                  "Budget-friendly generation"
                ]}
                promptTips={[
                  "Keep prompts concise",
                  "Focus on main elements",
                  "Use simple descriptors",
                  "Iterate quickly between generations"
                ]}
                features={[
                  "Fast generation times",
                  "Good quality-to-speed ratio",
                  "Excellent for iterations",
                  "Developer-friendly options"
                ]}
              />
              
              <ModelCard
                type="Fast"
                color="green"
                name="Flux Schnell"
                endpointId="fal-ai/flux/schnell"
                description="FLUX.1 [schnell] is a 12 billion parameter flow transformer that generates high-quality images from text in 1 to 4 steps, suitable for personal and commercial use."
                cost="$0.03-0.10/image"
                bestFor={[
                  "Ultra-fast generation",
                  "Quick sketches and mockups",
                  "Mass image creation",
                  "Speed-critical applications"
                ]}
                promptTips={[
                  "Use brief, clear descriptions",
                  "Focus on single main subjects",
                  "Limit style complexity",
                  "Use short phrases instead of sentences"
                ]}
                features={[
                  "Fastest generation option",
                  "Suitable for batch processing",
                  "Good for initial concepts",
                  "Economical resource usage"
                ]}
              />
              
              <ModelCard
                type="Typography"
                color="purple"
                name="SD 3.5 Large"
                endpointId="fal-ai/stable-diffusion-v35-large"
                description="Image quality, typography, complex prompt understanding"
                cost="Variable (pay per compute)"
                bestFor={[
                  "Text and typography needs",
                  "Complex prompt handling",
                  "Detailed image generation",
                  "Higher conceptual understanding"
                ]}
                promptTips={[
                  "Be explicit about text requirements",
                  "Use detailed descriptions for complex concepts",
                  "Include typography style references",
                  "Specify text positioning and emphasis"
                ]}
                features={[
                  "Excellent text rendering",
                  "Advanced prompt understanding",
                  "High-quality output",
                  "Large parameter model capabilities"
                ]}
              />
            </div>
          </section>
          
          {/* Audio Models Section */}
          <section id="audio-section" className="mb-16">
            <div className="flex items-center mb-8">
              <MusicIcon className="w-8 h-8 mr-4 text-green-400" />
              <h2 className="text-2xl font-bold">Audio Models</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ModelCard
                type="Music"
                color="green"
                name="Minimax Music"
                endpointId="fal-ai/minimax-music"
                description="Advanced AI techniques to create high-quality, diverse musical compositions"
                cost="Variable (pay per compute)"
                inputAsset={["audio"]}
                bestFor={[
                  "Original music composition",
                  "Reference-based music creation",
                  "Custom soundtracks",
                  "Mood-specific music"
                ]}
                promptTips={[
                  "Describe musical genre and mood",
                  "Specify tempo and intensity",
                  "Include instrument preferences",
                  "Provide reference audio for style guidance"
                ]}
                features={[
                  "High-quality music generation",
                  "Support for reference audio",
                  "Diverse musical styles",
                  "Advanced composition capabilities"
                ]}
              />

              <ModelCard
                type="Audio"
                color="yellow"
                name="Stable Audio"
                endpointId="fal-ai/stable-audio"
                description="Stable Diffusion music creation with high-quality tracks"
                cost="Variable (pay per compute)"
                bestFor={[
                  "Stable, consistent audio generation",
                  "High-quality music tracks",
                  "Noise-free audio content",
                  "Clean music production"
                ]}
                promptTips={[
                  "Specify audio duration needs",
                  "Describe desired audio characteristics",
                  "Include mood and energy level",
                  "Note any specific audio elements"
                ]}
                features={[
                  "Stable Diffusion technology for audio",
                  "Clean output quality",
                  "Consistent generation results",
                  "High-fidelity audio production"
                ]}
              />
            </div>
          </section>
          
          {/* Voice Models Section */}
          <section id="voice-section" className="mb-16">
            <div className="flex items-center mb-8">
              <MicIcon className="w-8 h-8 mr-4 text-yellow-400" />
              <h2 className="text-2xl font-bold">Voice Models</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ModelCard
                type="Natural Speech"
                color="yellow"
                name="PlayHT TTS v3"
                endpointId="fal-ai/playht/tts/v3"
                description="Fluent and faithful speech with flow matching"
                cost="$0.03/minute (~33 minutes per $1)"
                bestFor={[
                  "Natural-sounding narration",
                  "Video voiceovers",
                  "Content narration",
                  "Professional voice work"
                ]}
                promptTips={[
                  "Use proper punctuation for natural pauses",
                  "Mark emphasis with formatting when possible",
                  "Structure text in conversational patterns",
                  "Include pronunciation guides for unusual terms"
                ]}
                features={[
                  "Flow matching technology",
                  "Natural speech patterns",
                  "Multi-voice options",
                  "High-quality output"
                ]}
              />

              <ModelCard
                type="Dialogues"
                color="purple"
                name="PlayAI Text-to-Speech Dialog"
                endpointId="fal-ai/playai/tts/dialog"
                description="Generate natural-sounding multi-speaker dialogues. Perfect for expressive outputs, storytelling, games, animations, and interactive media."
                cost="$0.05/minute (~20 minutes per $1)"
                bestFor={[
                  "Multi-speaker conversations",
                  "Character dialogues",
                  "Interactive narratives",
                  "Game and animation voicing"
                ]}
                promptTips={[
                  "Clearly mark different speakers",
                  "Include emotional cues in brackets",
                  "Structure conversation naturally",
                  "Add pauses and timing notes"
                ]}
                features={[
                  "Multiple voice support",
                  "Natural conversation flow",
                  "Speaker distinction",
                  "Emotional expression capabilities"
                ]}
              />

              <ModelCard
                type="Voice Clone"
                color="blue"
                name="F5 TTS"
                endpointId="fal-ai/f5-tts"
                description="Fluent and faithful speech with flow matching"
                cost="Variable (pay per compute)"
                bestFor={[
                  "Voice cloning applications",
                  "Custom voice creation",
                  "Personalized content",
                  "Consistent voice identity"
                ]}
                promptTips={[
                  "Provide high-quality reference audio",
                  "Include reference text matching the audio",
                  "Keep reference audio clear and noise-free",
                  "Use natural speech patterns in prompts"
                ]}
                features={[
                  "Voice replication technology",
                  "Flow matching for natural speech",
                  "Reference audio capabilities",
                  "Custom voice development"
                ]}
              />
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
                    <li>• Veo 2: $1.25/5s, +$0.25/s after</li>
                    <li>• LTX: ~$0.04-0.08/s</li>
                    <li>• Others: Variable based on compute</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold mb-3 text-purple-400">Image Costs</h3>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li>• Flux Pro Ultra: $0.10-0.30/image</li>
                    <li>• Flux Dev: $0.05-0.15/image</li>
                    <li>• Flux Schnell: $0.03-0.10/image</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold mb-3 text-green-400">Audio Costs</h3>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li>• Minimax Music: Variable</li>
                    <li>• Stable Audio: Variable</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold mb-3 text-yellow-400">Voice Costs</h3>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li>• PlayHT TTS v3: $0.03/min</li>
                    <li>• PlayAI Dialog: $0.05/min</li>
                    <li>• F5 TTS: Variable</li>
                  </ul>
                </div>
              </div>

              {/* Best Practices Tips */}
              <div className="mt-8 pt-6 border-t border-gray-700">
                <div className="flex items-center mb-4">
                  <AlertTriangleIcon className="w-5 h-5 mr-2 text-yellow-400" />
                  <h3 className="font-bold text-lg">Best Practices</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-sm text-gray-300">
                  <div>
                    <h4 className="font-medium mb-2 text-blue-400">Video Tips</h4>
                    <ul className="space-y-1">
                      <li>• Start with short clips (5-10s)</li>
                      <li>• Be specific with camera movements</li>
                      <li>• Describe lighting and atmosphere</li>
                      <li>• Test concepts with cheaper models first</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2 text-purple-400">Image Tips</h4>
                    <ul className="space-y-1">
                      <li>• Use detailed visual descriptions</li>
                      <li>• Specify style and artistic references</li>
                      <li>• Include composition details</li>
                      <li>• Iterate on successful outputs</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2 text-green-400">Audio Tips</h4>
                    <ul className="space-y-1">
                      <li>• Define genre and mood clearly</li>
                      <li>• Specify tempo and duration</li>
                      <li>• Reference similar tracks</li>
                      <li>• Note key transitions or moments</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2 text-yellow-400">Voice Tips</h4>
                    <ul className="space-y-1">
                      <li>• Use proper punctuation for pacing</li>
                      <li>• Mark emphasis appropriately</li>
                      <li>• Include pronunciation guides</li>
                      <li>• Provide high-quality voice samples</li>
                    </ul>
                  </div>
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