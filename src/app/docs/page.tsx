"use client";

import { useEffect, useState } from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
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
  BookOpenIcon,
} from "lucide-react";

interface ModelCardProps {
  type: string;
  color: string;
  name: string;
  endpointId: string;
  description: string;
  cost: string;
  bestFor: string[];
  promptTips: string[];
  features: string[];
  inputAsset?: (string | { type: string; key: string })[];
  imageForFrame?: boolean;
  cameraControl?: boolean;
}

// Model card component for better reusability
function ModelCard({
  type,
  color,
  name,
  endpointId,
  description,
  cost,
  bestFor,
  promptTips,
  features,
  inputAsset,
  imageForFrame,
  cameraControl,
}: ModelCardProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };

  // Convert bestFor to array if it's a string
  const bestForArray = typeof bestFor === "string" ? [bestFor] : bestFor;

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <div
        className={`inline-block px-3 py-1 rounded-full bg-${color}-500/10 text-${color}-400 text-sm font-medium mb-4`}
      >
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
            <span>{inputAsset.join(", ")}</span>
          </div>
        )}
      </div>

      {/* Best Use Cases Expandable Section */}
      {bestForArray && bestForArray.length > 0 && (
        <div className="mt-4 border-t border-gray-700 pt-4">
          <button
            onClick={() => toggleSection("bestFor")}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center">
              <AlertTriangleIcon className="w-4 h-4 mr-2 text-green-400" />
              <span className="font-medium">Best Use Cases</span>
            </div>
            {expandedSection === "bestFor" ? (
              <ChevronUpIcon className="w-4 h-4" />
            ) : (
              <ChevronDownIcon className="w-4 h-4" />
            )}
          </button>

          {expandedSection === "bestFor" && (
            <div className="mt-3 pl-6">
              <ul className="space-y-2">
                {bestForArray.map((use, index) => (
                  <li
                    key={index}
                    className="flex items-start text-sm text-gray-300"
                  >
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
            onClick={() => toggleSection("promptTips")}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center">
              <LightbulbIcon className="w-4 h-4 mr-2 text-yellow-400" />
              <span className="font-medium">Prompt Techniques</span>
            </div>
            {expandedSection === "promptTips" ? (
              <ChevronUpIcon className="w-4 h-4" />
            ) : (
              <ChevronDownIcon className="w-4 h-4" />
            )}
          </button>

          {expandedSection === "promptTips" && (
            <div className="mt-3 pl-6">
              <ul className="space-y-2">
                {promptTips.map((tip, index) => (
                  <li
                    key={index}
                    className="flex items-start text-sm text-gray-300"
                  >
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
            onClick={() => toggleSection("features")}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center">
              <DollarSignIcon className="w-4 h-4 mr-2 text-purple-400" />
              <span className="font-medium">Features</span>
            </div>
            {expandedSection === "features" ? (
              <ChevronUpIcon className="w-4 h-4" />
            ) : (
              <ChevronDownIcon className="w-4 h-4" />
            )}
          </button>

          {expandedSection === "features" && (
            <div className="mt-3 pl-6">
              <ul className="space-y-2">
                {features.map((feature, index) => (
                  <li
                    key={index}
                    className="flex items-start text-sm text-gray-300"
                  >
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
          <h1 className="text-3xl font-bold mb-8 text-center">
            Video Starter Kit - Model Guide
          </h1>

          {/* Navigation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            <a
              href="#video-section"
              className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition-all"
            >
              <FilmIcon className="w-8 h-8 mb-4 text-blue-400" />
              <h3 className="font-bold text-xl mb-2 text-blue-400">
                Video Models
              </h3>
              <p className="text-gray-300 text-sm">
                Professional video generation
              </p>
            </a>

            <a
              href="#image-section"
              className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-purple-500 transition-all"
            >
              <ImageIcon className="w-8 h-8 mb-4 text-purple-400" />
              <h3 className="font-bold text-xl mb-2 text-purple-400">
                Image Models
              </h3>
              <p className="text-gray-300 text-sm">
                High-quality image generation
              </p>
            </a>

            <a
              href="#audio-section"
              className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-green-500 transition-all"
            >
              <MusicIcon className="w-8 h-8 mb-4 text-green-400" />
              <h3 className="font-bold text-xl mb-2 text-green-400">
                Audio Models
              </h3>
              <p className="text-gray-300 text-sm">Music and sound effects</p>
            </a>

            <a
              href="#voice-section"
              className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-yellow-500 transition-all"
            >
              <MicIcon className="w-8 h-8 mb-4 text-yellow-400" />
              <h3 className="font-bold text-xl mb-2 text-yellow-400">
                Voice Models
              </h3>
              <p className="text-gray-300 text-sm">
                Voiceover and dialogue generation
              </p>
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
                description="Google's cutting-edge video generation model, offering unprecedented quality, physics understanding, and cinematic excellence."
                cost="$1.25/5s ($0.25/additional second)"
                bestFor={[
                  "High-quality cinematic videos",
                  "Complex physical interactions",
                  "Extended durations (minutes)",
                  "High resolution (up to 4K)",
                ]}
                promptTips={[
                  "Write prompts like a movie script with detailed scene descriptions",
                  "Include camera movements and lens choices",
                  "Specify lighting details and atmosphere",
                  "Structure narrative with clear beginning, middle, end",
                ]}
                features={[
                  "Realistic motion physics",
                  "Professional cinematography",
                  "Reduced artifacts and flickering",
                  "Production-ready output quality",
                ]}
              />

              <ModelCard
                type="Fast Generation"
                color="green"
                name="LTX Video v0.95"
                endpointId="fal-ai/ltx-video-v095/multiconditioning"
                description="Generate videos from prompts or images using LTX Video-0.9.5 with multi-conditioning capabilities."
                cost="~$0.04-0.08/second"
                bestFor={[
                  "Rapid video prototyping",
                  "Image-to-video conversion",
                  "Quick concept testing",
                  "Budget-friendly video generation",
                ]}
                promptTips={[
                  "Use clear, concise descriptions",
                  "For image input, provide high-quality references",
                  "Specify motion direction explicitly",
                  "Describe simple, focused actions or scenes",
                ]}
                features={[
                  "Multi-conditional inputs",
                  "Fast generation times",
                  "Image guidance capability",
                  "Efficient for rapid iterations",
                ]}
                inputAsset={["image"]}
              />

              <ModelCard
                type="Physics Simulation"
                color="purple"
                name="Minimax Video-01-Live"
                endpointId="fal-ai/minimax/video-01-live"
                description="Specialized in turning static inputs into fluid animations with exceptional temporal consistency."
                cost="~$0.40/video"
                bestFor={[
                  "Bringing static images to life",
                  "Dynamic portrait animations",
                  "Face and character consistency",
                  "Both stylized and realistic content",
                ]}
                promptTips={[
                  "Describe specific actions and movements",
                  "Use image-to-video mode for best results",
                  "Include camera directions (pan, zoom)",
                  "Keep prompts in present tense like a film scene",
                ]}
                features={[
                  "Exceptional temporal consistency",
                  "Strong face and character handling",
                  "Smooth camera movements",
                  "Live2D-style animation capability",
                ]}
                inputAsset={["image"]}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <ModelCard
                type="High Quality"
                color="blue"
                name="Hunyuan Video"
                endpointId="fal-ai/hunyuan-video"
                description="Large-scale (13B parameter) video foundation model by Tencent focusing on cinematic quality and physical realism."
                cost="$0.40/video"
                bestFor={[
                  "Cinematic video quality",
                  "Realistic physical interactions",
                  "Coherent scene transitions",
                  "Movie-like footage generation",
                ]}
                promptTips={[
                  "Write detailed scene descriptions like movie snippets",
                  "Keep prompts logically consistent",
                  "Use temporal words (slowly, suddenly) to indicate timing",
                  "Specify camera and lighting details for cinematic results",
                ]}
                features={[
                  "Real-world physics simulation",
                  "Highly optimized (generates in under a minute)",
                  "High-fidelity HD output",
                  "Continuous action sequences",
                ]}
              />

              <ModelCard
                type="Professional"
                color="purple"
                name="Kling 1.5 Pro"
                endpointId="fal-ai/kling-video/v1.5/pro"
                description="Advanced video generator known for HD output (1080p) and enhanced physics simulation."
                cost="$0.10/second (~$0.50/5s video)"
                bestFor={[
                  "Professional-quality video",
                  "Complex physics interactions",
                  "High-resolution (1080p) output",
                  "Realistic physical simulations",
                ]}
                promptTips={[
                  "Start with an image when possible",
                  "Describe both scene and movement clearly",
                  "Emphasize physical interactions for best results",
                  "Use present tense and descriptive language",
                ]}
                features={[
                  "1080p HD output capability",
                  "Realistic physics engine",
                  "Support for image conditioning",
                  "Extended duration capabilities",
                ]}
                inputAsset={["image"]}
              />

              <ModelCard
                type="Standard"
                color="green"
                name="Kling 1.0 Standard"
                endpointId="fal-ai/kling-video/v1/standard/text-to-video"
                description="Earlier Kling model offering more accessible, faster generation at lower resolution."
                cost="~$0.05/second (Variable)"
                bestFor={[
                  "Quick video prototyping",
                  "Simpler scenes and actions",
                  "Faster turnaround times",
                  "Budget-conscious projects",
                ]}
                promptTips={[
                  "Use simpler, more concise prompts",
                  "Focus on single, clear actions or scenes",
                  "Specify style (cartoon, realistic) explicitly",
                  "Keep chronology short (one main scene)",
                ]}
                features={[
                  "Faster generation time",
                  "Lower resource requirements",
                  "Good for storyboarding",
                  "Camera movement controls",
                ]}
                cameraControl={true}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <ModelCard
                type="Dream Machine"
                color="blue"
                name="Luma Dream Machine"
                endpointId="fal-ai/luma-dream-machine"
                description="Video generation model known for immersive scene generation and consistent character interactions."
                cost="$0.50/video"
                bestFor={[
                  "Creative storytelling scenes",
                  "Dreamlike visual sequences",
                  "Multiple subjects interacting",
                  "Cinematic camera movements",
                ]}
                promptTips={[
                  "Include imaginative but visually concrete elements",
                  "Always specify some form of motion or change",
                  "Request specific camera movements for best results",
                  "Structure prompts to indicate sequence of events",
                ]}
                features={[
                  "Handles both realistic and stylized content",
                  "Relatively fast generation",
                  "Maintains physical accuracy",
                  "Supports both text and image inputs",
                ]}
                inputAsset={["image"]}
              />

              <ModelCard
                type="Audio-Video"
                color="purple"
                name="MMAudio V2"
                endpointId="fal-ai/mmaudio-v2"
                description="Audio generation model that creates synchronized soundtracks for videos from visual content and text prompts."
                cost="~$0.02-0.03/second of audio"
                bestFor={[
                  "Adding audio to silent videos",
                  "Synchronized sound effects",
                  "Background music generation",
                  "Complete audiovisual experiences",
                ]}
                promptTips={[
                  "Specify genre, mood, or sound types you want",
                  "Match audio description to video content",
                  "Be specific about musical style or ambient sounds",
                  "Include timing cues if needed",
                ]}
                features={[
                  "Multimodal inputs (video + text)",
                  "Synchronized audio generation",
                  "Capable of both music and sound effects",
                  "Returns complete audio-augmented video",
                ]}
                inputAsset={["video"]}
              />

              <ModelCard
                type="Animation"
                color="green"
                name="Sync.so LipSync"
                endpointId="fal-ai/sync-lipsync"
                description="Specialized model that animates a face video or image to lip-sync with speech audio."
                cost="$0.05/minute"
                bestFor={[
                  "Creating talking avatars",
                  "Dubbing videos in new languages",
                  "Virtual presenters",
                  "Giving voice to still images",
                ]}
                promptTips={[
                  "Provide clear face image/video with visible mouth",
                  "Use high-quality clean audio",
                  "Choose matching emotional expressions",
                  "Trim silence from start of audio if needed",
                ]}
                features={[
                  "High-quality synchronized lip movements",
                  "Works with images or videos as input",
                  "Fast processing",
                  "Supports multiple languages",
                ]}
                inputAsset={["video", "audio"]}
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
                description="Latest professional-grade FLUX model with 2K output capability and improved photorealism."
                cost="$0.10-0.30/image"
                bestFor={[
                  "High-resolution realistic images",
                  "Marketing and commercial work",
                  "Highly detailed scenes",
                  "Professional-grade visuals",
                ]}
                promptTips={[
                  "Include photography terminology (camera, lens, lighting)",
                  "Structure prompts clearly (subject, setting, style)",
                  "Be specific and provide vivid details",
                  "Consider reference images for style guidance",
                ]}
                features={[
                  "Up to 2K resolution output",
                  "Enhanced photorealism",
                  "Better text handling",
                  "High-fidelity detail rendering",
                ]}
              />

              <ModelCard
                type="Quick"
                color="blue"
                name="Flux Dev"
                endpointId="fal-ai/flux/dev"
                description="12 billion parameter flow transformer for high-quality image generation balancing quality and speed."
                cost="$0.05-0.15/image"
                bestFor={[
                  "Balanced quality and speed",
                  "Detailed artistic creations",
                  "Complex scene composition",
                  "Long-form descriptive prompts",
                ]}
                promptTips={[
                  "Use long-form prompts with rich detail",
                  "Employ weighted prompt segments with :: notation",
                  "Structure prompts into subject, style, background",
                  "20-40 inference steps for best quality",
                ]}
                features={[
                  "High resolution capabilities",
                  "Strong prompt understanding",
                  "Supports personal and commercial use",
                  "Handles complex, lengthy prompts",
                ]}
              />

              <ModelCard
                type="Fast"
                color="green"
                name="Flux Schnell"
                endpointId="fal-ai/flux/schnell"
                description="Speed-optimized FLUX variant generating high-quality images in just 1-4 diffusion steps."
                cost="$0.03-0.10/image"
                bestFor={[
                  "Ultra-fast generation",
                  "Rapid prototype iteration",
                  "High-volume image needs",
                  "Quick concept exploration",
                ]}
                promptTips={[
                  "Use same syntax as FLUX [dev]",
                  "Keep prompts focused and concise",
                  "Emphasize key elements with higher weights",
                  "Structure into segments (subject | style | etc.)",
                ]}
                features={[
                  "1-4 diffusion steps (fastest FLUX)",
                  "Output quality comparable to larger models",
                  "Perfect for testing prompt ideas quickly",
                  "Extremely cost-efficient",
                ]}
              />

              <ModelCard
                type="Typography"
                color="purple"
                name="SD 3.5 Large"
                endpointId="fal-ai/stable-diffusion-v35-large"
                description="Stability AI's latest diffusion model with improved image quality, typography, and prompt understanding."
                cost="$0.0006-0.0012/second of GPU time"
                bestFor={[
                  "Complex prompt handling",
                  "Text and typography needs",
                  "Multimodal generation (text+image)",
                  "High-quality detailed outputs",
                ]}
                promptTips={[
                  "Write rich, descriptive prompts",
                  "Organize by subject, setting, style, technical details",
                  "Use negative prompting to avoid issues",
                  "Include artist/style references for specific looks",
                ]}
                features={[
                  "Multimodal Diffusion Transformer architecture",
                  "Better text rendering in images",
                  "ControlNet and LoRA support",
                  "Resource efficiency improvements",
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
                description="Generative music model creating high-quality, diverse musical compositions from text prompts."
                cost="~$0.30-0.50/audio clip"
                bestFor={[
                  "Original music composition",
                  "Custom soundtracks",
                  "Genre-specific music creation",
                  "Mood-based audio generation",
                ]}
                promptTips={[
                  "Specify genre, mood, tempo, and instruments",
                  "Include BPM for rhythmic control",
                  "Mention era or artist references for style",
                  "Describe structure (intro, build, climax)",
                ]}
                features={[
                  "Multi-genre support",
                  "Coherent musical structure",
                  "High-quality output",
                  "Reference audio capability",
                ]}
                inputAsset={[
                  {
                    type: "audio",
                    key: "reference_audio_url",
                  },
                ]}
              />

              <ModelCard
                type="Audio"
                color="yellow"
                name="Stable Audio"
                endpointId="fal-ai/stable-audio"
                description="Stability AI's open-source text-to-audio model for music, sound effects, or ambience."
                cost="$0.0006-0.0012/second of GPU time"
                bestFor={[
                  "Music loops and samples",
                  "Sound effects generation",
                  "Ambient soundscapes",
                  "Background music",
                ]}
                promptTips={[
                  "Be concise with sound-focused descriptions",
                  "Specify tempo (BPM) for rhythmic content",
                  "Include genre and instrument details",
                  "Mention duration or 'loopable' if needed",
                ]}
                features={[
                  "Timing-conditioned latent diffusion",
                  "Efficient resource usage",
                  "Open for commercial use",
                  "Good tempo/beat adherence",
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
                description="State-of-the-art TTS model with natural and expressive voices, multilingual support, and emotional rendering."
                cost="$0.03/minute"
                bestFor={[
                  "High-quality voice narration",
                  "Emotional and expressive speech",
                  "Long-form content (audiobooks)",
                  "Multilingual content",
                ]}
                promptTips={[
                  "Use well-punctuated text for natural rhythm",
                  "Add emotive cues and punctuation for tone",
                  "Choose appropriate voice for content",
                  "Split long content into manageable chunks",
                ]}
                features={[
                  "Blazing-fast generation",
                  "Natural prosody and intonation",
                  "Support for multiple languages",
                  "Expressive emotional rendering",
                ]}
              />

              <ModelCard
                type="Dialogues"
                color="purple"
                name="PlayAI Dialog"
                endpointId="fal-ai/playai/tts/dialog"
                description="Multi-speaker dialogue generator creating natural-sounding conversational audio from formatted scripts."
                cost="$0.05/minute"
                bestFor={[
                  "Character dialogues",
                  "Storytelling with multiple voices",
                  "Games and interactive media",
                  "Animation voice-overs",
                ]}
                promptTips={[
                  "Format as 'Speaker name: dialogue' on each line",
                  "Use punctuation to guide natural speech patterns",
                  "Include emotive cues for better expression",
                  "Use consistent speaker labels throughout",
                ]}
                features={[
                  "Multiple distinct voice models",
                  "Natural back-and-forth timing",
                  "Expressive dialogue capability",
                  "Simple formatting requirements",
                ]}
              />

              <ModelCard
                type="Voice Clone"
                color="blue"
                name="F5 TTS"
                endpointId="fal-ai/f5-tts"
                description="Voice replication model that creates speech matching a reference voice sample."
                cost="$0.0006-0.0012/second of GPU time"
                bestFor={[
                  "Voice cloning applications",
                  "Custom voice creation",
                  "Matching specific voice characteristics",
                  "Personalized voice content",
                ]}
                promptTips={[
                  "Provide high-quality reference audio",
                  "Include matching reference text",
                  "Keep reference audio clean and noise-free",
                  "Use natural speech patterns in input text",
                ]}
                features={[
                  "Voice replication technology",
                  "Reference-based generation",
                  "Flow matching for natural speech",
                  "Seamless voice matching",
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
                    <li>• Minimax: ~$0.40/video</li>
                    <li>• Hunyuan: $0.40/video</li>
                    <li>• Kling Pro: $0.10/s (~$0.50/5s)</li>
                    <li>• Kling Standard: ~$0.05/s</li>
                    <li>• Luma: $0.50/video</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold mb-3 text-purple-400">
                    Image Costs
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li>• Flux Pro Ultra: $0.10-0.30/image</li>
                    <li>• Flux Dev: $0.05-0.15/image</li>
                    <li>• Flux Schnell: $0.03-0.10/image</li>
                    <li>• SD 3.5: $0.0006-0.0012/s of GPU time</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold mb-3 text-green-400">Audio Costs</h3>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li>• MMAudio V2: ~$0.02-0.03/s</li>
                    <li>• Minimax Music: ~$0.30-0.50/clip</li>
                    <li>• Stable Audio: $0.0006-0.0012/s of GPU time</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold mb-3 text-yellow-400">
                    Voice Costs
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li>• PlayHT TTS v3: $0.03/min</li>
                    <li>• PlayAI Dialog: $0.05/min</li>
                    <li>• F5 TTS: $0.0006-0.0012/s of GPU time</li>
                    <li>• Sync.so LipSync: $0.05/min</li>
                  </ul>
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-900/20 border border-blue-800/30 rounded-lg text-sm text-gray-300">
                <span className="font-medium text-blue-400">
                  Cost-saving tip:
                </span>{" "}
                GPU time-based models (like SD 3.5, Stable Audio, F5 TTS) often
                cost less than fixed-price models for simple generations. For
                example, a basic SD 3.5 image might only cost $0.01-0.02 if
                generated in 10-20 seconds, compared to $0.10+ for Flux models.
              </div>

              {/* Best Practices Tips */}
              <div className="mt-8 pt-6 border-t border-gray-700">
                <div className="flex items-center mb-4">
                  <AlertTriangleIcon className="w-5 h-5 mr-2 text-yellow-400" />
                  <h3 className="font-bold text-lg">Best Practices</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-sm text-gray-300">
                  <div>
                    <h4 className="font-medium mb-2 text-blue-400">
                      Video Tips
                    </h4>
                    <ul className="space-y-1">
                      <li>• Start with short clips (5-10s)</li>
                      <li>• Be specific with camera movements</li>
                      <li>• Describe lighting and atmosphere</li>
                      <li>• Test concepts with cheaper models first</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2 text-purple-400">
                      Image Tips
                    </h4>
                    <ul className="space-y-1">
                      <li>• Use detailed visual descriptions</li>
                      <li>• Specify style and artistic references</li>
                      <li>• Include composition details</li>
                      <li>• Iterate on successful outputs</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2 text-green-400">
                      Audio Tips
                    </h4>
                    <ul className="space-y-1">
                      <li>• Define genre and mood clearly</li>
                      <li>• Specify tempo and duration</li>
                      <li>• Reference similar tracks</li>
                      <li>• Note key transitions or moments</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2 text-yellow-400">
                      Voice Tips
                    </h4>
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
                <p className="text-gray-400 text-sm">
                  Contact support or check the documentation
                </p>
              </div>
              <div className="flex space-x-4">
                <a
                  href="/docs"
                  className="px-4 py-2 bg-blue-600 text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Documentation
                </a>
                <a
                  href="/support"
                  className="px-4 py-2 bg-gray-700 text-sm font-medium rounded-lg hover:bg-gray-600 transition-colors"
                >
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
