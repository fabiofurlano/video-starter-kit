# Video Starter Kit Model Guide

This comprehensive guide provides detailed information about all AI models available in the Video Starter Kit, including usage tips, pricing, and best practices for optimal results.

## Table of Contents

- [Video Models](#video-models) 🎬
  - [Veo 2](#veo-2)
  - [LTX Video v0.95](#ltx-video-v095)
  - [Minimax Video 01 Live](#minimax-video-01-live)
  - [Hunyuan](#hunyuan)
  - [Kling 1.5 Pro](#kling-15-pro)
  - [Kling 1.0 Standard](#kling-10-standard)
  - [Luma Dream Machine 1.5](#luma-dream-machine-15)
  - [MMAudio V2](#mmaudio-v2)
  - [sync.so -- lipsync 1.8.0](#syncso----lipsync-180)
- [Image Models](#image-models) 🖼️
  - [Flux Dev](#flux-dev)
  - [Flux Schnell](#flux-schnell)
  - [Flux Pro 1.1 Ultra](#flux-pro-11-ultra)
  - [Stable Diffusion 3.5 Large](#stable-diffusion-35-large)
- [Music Models](#music-models) 🎵
  - [Minimax Music](#minimax-music)
  - [Stable Audio](#stable-audio)
- [Voiceover Models](#voiceover-models) 🎙️
  - [PlayHT TTS v3](#playht-tts-v3)
  - [PlayAI Text-to-Speech Dialog](#playai-text-to-speech-dialog)
  - [F5 TTS](#f5-tts)

---

## Video Models

<div style="background-color: rgba(0, 123, 255, 0.1); border-left: 4px solid #007bff; padding: 1rem; margin-bottom: 1.5rem;">
<strong>💡 Pro Tip:</strong> Video models transform text prompts or images into dynamic video content. They vary in style, quality, and motion capabilities.
</div>

### Veo 2

<div style="display: flex; align-items: center; margin-bottom: 1rem;">
<span style="background-color: #f2f7ff; color: #0057b8; padding: 0.25rem 0.5rem; border-radius: 4px; font-weight: bold; margin-right: 0.5rem;">PROFESSIONAL</span>
<span style="background-color: #fff8e6; color: #bb6a00; padding: 0.25rem 0.5rem; border-radius: 4px; font-weight: bold;">HIGH QUALITY</span>
</div>

![Veo 2 Example](/images/models/veo2-placeholder.jpg)

Veo 2 creates videos with realistic motion and high-quality output, up to 4K resolution.

**Endpoint ID:** `fal-ai/veo2`

**✨ Capabilities:**
- Text-to-video generation
- High-quality 4K resolution output
- Realistic motion and physics
- Detailed textures and lighting

**💰 Pricing:**
- Base price: $1.25 for 5-second video
- Additional seconds: $0.25 per second (limited time offer)
- Regular pricing: $2.50 for 5-second video, $0.50 per additional second

**🔍 Best Prompts Include:**
- Detailed scene descriptions
- Lighting information
- Camera movement
- Stylistic preferences

<div style="background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 4px; padding: 1rem; margin: 1rem 0;">
<strong>Example Prompt:</strong>
<pre style="background-color: #f1f3f5; padding: 0.5rem; border-radius: 4px; overflow-x: auto;">The camera floats gently through rows of pastel-painted wooden beehives, buzzing honeybees gliding in and out of frame. The motion settles on a beekeeper standing at the center, wearing a pristine white beekeeping suit gleaming in the golden afternoon light. Behind him, tall sunflowers sway rhythmically in the breeze. Shot with a 35mm lens on Kodak Portra 400 film, the golden light creates rich textures.</pre>
</div>

**📝 Tips:**
- Include camera movement terms like "panning," "zooming," "dolly shot"
- Specify film stock for consistent aesthetics (e.g., "Kodak Portra 400")
- Mention specific lens types for different looks (e.g., "35mm lens," "85mm portrait lens")
- Describe lighting conditions in detail

---

### LTX Video v0.95

<div style="display: flex; align-items: center; margin-bottom: 1rem;">
<span style="background-color: #f2f7ff; color: #0057b8; padding: 0.25rem 0.5rem; border-radius: 4px; font-weight: bold; margin-right: 0.5rem;">NEW</span>
<span style="background-color: #e6f7ee; color: #00843d; padding: 0.25rem 0.5rem; border-radius: 4px; font-weight: bold;">IMAGE-GUIDED</span>
</div>

![LTX Video Example](/images/models/ltx-video-placeholder.jpg)

LTX Video is a new multiconditioning model that can generate videos from both text prompts and reference images.

**Endpoint ID:** `fal-ai/ltx-video-v095/multiconditioning`

**✨ Capabilities:**
- Generate videos from text prompts
- Use reference images as visual guides
- Direct image-to-video conversion without separate endpoint

**🔧 Unique Features:**
- **imageForFrame:** Can use input images directly as reference for video frames

**⚙️ Best Practices:**
- For image-guided generation, use clear, high-quality reference images
- Balance text prompt specificity with visual guidance from images
- Use descriptive motion terms when you want specific movements

<div style="background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 4px; padding: 1rem; margin: 1rem 0;">
<strong>Example Prompt with Image:</strong>
<pre style="background-color: #f1f3f5; padding: 0.5rem; border-radius: 4px; overflow-x: auto;">A tranquil forest scene with sunlight filtering through leaves, gentle wind creating subtle movement in the branches</pre>
</div>

**📝 Tips:**
- Upload a reference image along with your prompt for better results
- The model will use both your text and image to guide the video generation

---

### Minimax Video 01 Live

<div style="display: flex; align-items: center; margin-bottom: 1rem;">
<span style="background-color: #fff8e6; color: #bb6a00; padding: 0.25rem 0.5rem; border-radius: 4px; font-weight: bold; margin-right: 0.5rem;">VERSATILE</span>
<span style="background-color: #e6f7ee; color: #00843d; padding: 0.25rem 0.5rem; border-radius: 4px; font-weight: bold;">IMAGE-GUIDED</span>
</div>

![Minimax Video Example](/images/models/minimax-video-placeholder.jpg)

Generates high-quality videos with realistic motion and accurate physics simulation.

**Endpoint ID:** `fal-ai/minimax/video-01-live`

**✨ Capabilities:**
- Text-to-video generation
- Image-to-video transformation
- Realistic physics and motion

**🖼️ Input Assets:** Supports image input for video generation

<div style="background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 4px; padding: 1rem; margin: 1rem 0;">
<strong>Example Prompt:</strong>
<pre style="background-color: #f1f3f5; padding: 0.5rem; border-radius: 4px; overflow-x: auto;">A stylish woman walks down a Tokyo street filled with warm glowing neon and animated city signage. She wears a black leather jacket, a long red dress, and black boots, and carries a black purse.</pre>
</div>

**📝 Tips:**
- Include specific character actions for better motion
- Describe detailed environments for richer scenes
- Specify clothing and items for better character rendering

---

### Hunyuan

<div style="display: flex; align-items: center; margin-bottom: 1rem;">
<span style="background-color: #f2f7ff; color: #0057b8; padding: 0.25rem 0.5rem; border-radius: 4px; font-weight: bold; margin-right: 0.5rem;">HIGH QUALITY</span>
<span style="background-color: #fff8e6; color: #bb6a00; padding: 0.25rem 0.5rem; border-radius: 4px; font-weight: bold;">DIVERSE MOTION</span>
</div>

![Hunyuan Example](/images/models/hunyuan-placeholder.jpg)

Produces videos with high visual quality, diverse motion patterns, and strong alignment with text prompts.

**Endpoint ID:** `fal-ai/hunyuan-video`

**✨ Capabilities:**
- High visual fidelity
- Diverse motion patterns
- Strong text-to-video alignment

<div style="background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 4px; padding: 1rem; margin: 1rem 0;">
<strong>Example Prompt:</strong>
<pre style="background-color: #f1f3f5; padding: 0.5rem; border-radius: 4px; overflow-x: auto;">A serene lakeside at dawn, with mist rising from the water's surface, gentle ripples spreading across the lake as a fish jumps, mountains reflected in the clear water, golden sunlight gradually illuminating the scene</pre>
</div>

**📝 Tips:**
- Use detailed descriptions of lighting and atmosphere
- Include a mix of static and dynamic elements
- Specify the mood or emotional tone of the scene

---

### Kling 1.5 Pro

<div style="display: flex; align-items: center; margin-bottom: 1rem;">
<span style="background-color: #f2f7ff; color: #0057b8; padding: 0.25rem 0.5rem; border-radius: 4px; font-weight: bold; margin-right: 0.5rem;">PROFESSIONAL</span>
<span style="background-color: #e6f7ee; color: #00843d; padding: 0.25rem 0.5rem; border-radius: 4px; font-weight: bold;">IMAGE-GUIDED</span>
</div>

![Kling Pro Example](/images/models/kling-pro-placeholder.jpg)

Generates high-quality videos with an emphasis on visual quality and smooth motion.

**Endpoint ID:** `fal-ai/kling-video/v1.5/pro`

**✨ Capabilities:**
- High-quality video generation
- Image-to-video transformation

**🖼️ Input Assets:** Supports image input for video generation

<div style="background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 4px; padding: 1rem; margin: 1rem 0;">
<strong>Example Prompt:</strong>
<pre style="background-color: #f1f3f5; padding: 0.5rem; border-radius: 4px; overflow-x: auto;">A macro shot of a vivid blue morpho butterfly slowly opening and closing its wings while perched on a bright orange flower. Dew drops on the petals glisten in the soft morning light.</pre>
</div>

**📝 Tips:**
- Specify camera perspectives (macro, wide-angle, etc.)
- Include details about lighting and atmosphere
- Describe motions clearly and specifically

---

### Kling 1.0 Standard

<div style="display: flex; align-items: center; margin-bottom: 1rem;">
<span style="background-color: #fff8e6; color: #bb6a00; padding: 0.25rem 0.5rem; border-radius: 4px; font-weight: bold; margin-right: 0.5rem;">CAMERA CONTROL</span>
<span style="background-color: #f8e5ff; color: #6f42c1; padding: 0.25rem 0.5rem; border-radius: 4px; font-weight: bold;">STANDARD</span>
</div>

![Kling Standard Example](/images/models/kling-standard-placeholder.jpg)

Standard video generation model with camera control capabilities.

**Endpoint ID:** `fal-ai/kling-video/v1/standard/text-to-video`

**✨ Capabilities:**
- Text-to-video generation
- Camera movement control

**🎥 Features:**
- **cameraControl:** Allows for specifying camera movements during generation

<div style="background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 4px; padding: 1rem; margin: 1rem 0;">
<strong>Example Prompt with Camera Control:</strong>
<pre style="background-color: #f1f3f5; padding: 0.5rem; border-radius: 4px; overflow-x: auto;">A drone shot of a Mediterranean coastal town, white buildings with blue roofs against the deep blue sea, boats in the harbor, people walking along narrow streets</pre>
</div>

**📝 Tips for Camera Control:**
- Use the Camera Control panel to specify movement type
- Options include pan, tilt, zoom, rotation, and dolly movements
- Adjust the intensity of the movement using the slider

---

### Luma Dream Machine 1.5

<div style="display: flex; align-items: center; margin-bottom: 1rem;">
<span style="background-color: #f2f7ff; color: #0057b8; padding: 0.25rem 0.5rem; border-radius: 4px; font-weight: bold; margin-right: 0.5rem;">HIGH QUALITY</span>
<span style="background-color: #e6f7ee; color: #00843d; padding: 0.25rem 0.5rem; border-radius: 4px; font-weight: bold;">IMAGE-GUIDED</span>
</div>

![Luma Dream Machine Example](/images/models/luma-placeholder.jpg)

High-quality video generation with support for image-guided generation.

**Endpoint ID:** `fal-ai/luma-dream-machine`

**✨ Capabilities:**
- High-quality video generation
- Image-to-video transformation

**🖼️ Input Assets:** Supports image input for video generation

<div style="background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 4px; padding: 1rem; margin: 1rem 0;">
<strong>Example Prompt:</strong>
<pre style="background-color: #f1f3f5; padding: 0.5rem; border-radius: 4px; overflow-x: auto;">A futuristic cityscape at night, glowing holographic advertisements reflect in puddles on the street, flying cars zoom between towering skyscrapers, neon lights cast colorful shadows</pre>
</div>

**📝 Tips:**
- Include both static and dynamic elements
- Specify lighting details for better atmosphere
- When using image input, ensure it matches your text description

---

### MMAudio V2

<div style="display: flex; align-items: center; margin-bottom: 1rem;">
<span style="background-color: #f8e5ff; color: #6f42c1; padding: 0.25rem 0.5rem; border-radius: 4px; font-weight: bold; margin-right: 0.5rem;">AUDIO</span>
<span style="background-color: #fff8e6; color: #bb6a00; padding: 0.25rem 0.5rem; border-radius: 4px; font-weight: bold;">SYNCED SOUND</span>
</div>

![MMAudio Example](/images/models/mmaudio-placeholder.jpg)

Generates synchronized audio for videos using text and video inputs.

**Endpoint ID:** `fal-ai/mmaudio-v2`

**✨ Capabilities:**
- Generate synchronized audio for videos
- Create sound effects based on text descriptions
- Combine with video models for complete audio-visual experiences

**🎞️ Input Assets:** Requires video input

<div style="background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 4px; padding: 1rem; margin: 1rem 0;">
<strong>Example Prompt:</strong>
<pre style="background-color: #f1f3f5; padding: 0.5rem; border-radius: 4px; overflow-x: auto;">Background city ambient noise with distant traffic, occasional car horns, people chatting, and footsteps on pavement</pre>
</div>

**📝 Tips:**
- Be specific about the type of sounds you want
- Describe layered audio elements for richer soundscapes
- Mention timing details if specific audio cues are needed

---

### sync.so -- lipsync 1.8.0

<div style="display: flex; align-items: center; margin-bottom: 1rem;">
<span style="background-color: #f8e5ff; color: #6f42c1; padding: 0.25rem 0.5rem; border-radius: 4px; font-weight: bold; margin-right: 0.5rem;">AUDIO</span>
<span style="background-color: #fff8e6; color: #bb6a00; padding: 0.25rem 0.5rem; border-radius: 4px; font-weight: bold;">LIP SYNC</span>
</div>

![Lip Sync Example](/images/models/lipsync-placeholder.jpg)

Generates realistic lip-syncing animations from audio inputs.

**Endpoint ID:** `fal-ai/sync-lipsync`

**✨ Capabilities:**
- Generate lip-sync animations from audio
- Create realistic mouth movements for characters
- Synchronize speech with video content

**🎞️ Input Assets:** Requires both video and audio inputs

**📝 Tips:**
- Use clear, high-quality audio for best results
- Close-up videos of faces work best for lip-syncing
- Ensure the face in the video is well-lit and clearly visible

---

## Image Models

<div style="background-color: rgba(25, 135, 84, 0.1); border-left: 4px solid #198754; padding: 1rem; margin-bottom: 1.5rem;">
<strong>💡 Pro Tip:</strong> Image models convert text prompts into static images with various styles and qualities. They're perfect for creating reference images or standalone visual content.
</div>

### Flux Dev

<div style="display: flex; align-items: center; margin-bottom: 1rem;">
<span style="background-color: #f8e5ff; color: #6f42c1; padding: 0.25rem 0.5rem; border-radius: 4px; font-weight: bold; margin-right: 0.5rem;">VERSATILE</span>
<span style="background-color: #fff8e6; color: #bb6a00; padding: 0.25rem 0.5rem; border-radius: 4px; font-weight: bold;">GENERAL PURPOSE</span>
</div>

![Flux Dev Example](/images/models/flux-dev-placeholder.jpg)

General-purpose text-to-image model for generating images from text prompts.

**Endpoint ID:** `fal-ai/flux/dev`

**✨ Capabilities:**
- Text-to-image generation
- General-purpose image creation

<div style="background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 4px; padding: 1rem; margin: 1rem 0;">
<strong>Example Prompt:</strong>
<pre style="background-color: #f1f3f5; padding: 0.5rem; border-radius: 4px; overflow-x: auto;">A photorealistic image of a coastal city at sunset, golden light reflecting off skyscraper windows, palm trees lining the boulevard, small boats in the harbor, wispy clouds in the orange and purple sky</pre>
</div>

**📝 Tips:**
- Include detailed descriptions of visual elements
- Specify lighting and atmosphere
- Mention style preferences if you have any

---

### Flux Schnell

<div style="display: flex; align-items: center; margin-bottom: 1rem;">
<span style="background-color: #f8e5ff; color: #6f42c1; padding: 0.25rem 0.5rem; border-radius: 4px; font-weight: bold; margin-right: 0.5rem;">FAST</span>
<span style="background-color: #fff8e6; color: #bb6a00; padding: 0.25rem 0.5rem; border-radius: 4px; font-weight: bold;">QUICK ITERATIONS</span>
</div>

![Flux Schnell Example](/images/models/flux-schnell-placeholder.jpg)

Fast variant of the Flux text-to-image model for quicker generations.

**Endpoint ID:** `fal-ai/flux/schnell`

**✨ Capabilities:**
- Faster text-to-image generation
- Similar quality to Flux Dev with faster processing

<div style="background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 4px; padding: 1rem; margin: 1rem 0;">
<strong>Example Prompt:</strong>
<pre style="background-color: #f1f3f5; padding: 0.5rem; border-radius: 4px; overflow-x: auto;">A detailed watercolor painting of a medieval castle on a hilltop, autumn trees with red and orange leaves surrounding it, a winding path leading to the gate, small figures of knights and horses in the foreground</pre>
</div>

**📝 Tips:**
- Similar to Flux Dev but optimized for speed
- Great for rapid iterations and testing

---

### Flux Pro 1.1 Ultra

<div style="display: flex; align-items: center; margin-bottom: 1rem;">
<span style="background-color: #f2f7ff; color: #0057b8; padding: 0.25rem 0.5rem; border-radius: 4px; font-weight: bold; margin-right: 0.5rem;">PROFESSIONAL</span>
<span style="background-color: #fff8e6; color: #bb6a00; padding: 0.25rem 0.5rem; border-radius: 4px; font-weight: bold;">HIGH QUALITY</span>
</div>

![Flux Pro Example](/images/models/flux-pro-placeholder.jpg)

Professional-grade text-to-image model with enhanced visual quality.

**Endpoint ID:** `fal-ai/flux-pro/v1.1-ultra`

**✨ Capabilities:**
- High-quality text-to-image generation
- Enhanced detail and composition

<div style="background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 4px; padding: 1rem; margin: 1rem 0;">
<strong>Example Prompt:</strong>
<pre style="background-color: #f1f3f5; padding: 0.5rem; border-radius: 4px; overflow-x: auto;">A hyper-realistic portrait of an elderly fisherman with weathered skin and deep wrinkles, wearing a faded blue cap, warm golden hour lighting, detailed texture of beard stubble and salt-crusted skin, shot with a Canon EOS R5 85mm f/1.2 lens</pre>
</div>

**📝 Tips:**
- Include camera and lens details for photorealistic outputs
- Specify lighting conditions in detail
- Use technical photography terms for better results

---

### Stable Diffusion 3.5 Large

<div style="display: flex; align-items: center; margin-bottom: 1rem;">
<span style="background-color: #f2f7ff; color: #0057b8; padding: 0.25rem 0.5rem; border-radius: 4px; font-weight: bold; margin-right: 0.5rem;">ADVANCED</span>
<span style="background-color: #fff8e6; color: #bb6a00; padding: 0.25rem 0.5rem; border-radius: 4px; font-weight: bold;">TYPOGRAPHY</span>
</div>

![Stable Diffusion Example](/images/models/sd35-placeholder.jpg)

Advanced text-to-image model with improved typography and complex prompt understanding.

**Endpoint ID:** `fal-ai/stable-diffusion-v35-large`

**✨ Capabilities:**
- High-quality image generation
- Excellent typography rendering
- Complex prompt understanding

<div style="background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 4px; padding: 1rem; margin: 1rem 0;">
<strong>Example Prompt:</strong>
<pre style="background-color: #f1f3f5; padding: 0.5rem; border-radius: 4px; overflow-x: auto;">A detailed cyberpunk street scene with Japanese and English neon signs saying "DIGITAL DREAMS" and "未来の都市", holographic advertisements, people with cybernetic implants walking under umbrella drones in the rain, reflective puddles on the ground</pre>
</div>

**📝 Tips:**
- Great for scenes requiring text or typography
- Can handle multi-language text prompts
- Excels at complex, detailed scenes

---

## Music Models

<div style="background-color: rgba(108, 117, 125, 0.1); border-left: 4px solid #6c757d; padding: 1rem; margin-bottom: 1.5rem;">
<strong>💡 Pro Tip:</strong> Music models generate original audio compositions based on text descriptions. They can create everything from simple beats to complex arrangements.
</div>

### Minimax Music

<div style="display: flex; align-items: center; margin-bottom: 1rem;">
<span style="background-color: #f8e5ff; color: #6f42c1; padding: 0.25rem 0.5rem; border-radius: 4px; font-weight: bold; margin-right: 0.5rem;">VERSATILE</span>
<span style="background-color: #fff8e6; color: #bb6a00; padding: 0.25rem 0.5rem; border-radius: 4px; font-weight: bold;">REFERENCE AUDIO</span>
</div>

![Minimax Music Example](/images/models/minimax-music-placeholder.jpg)

Creates high-quality, diverse musical compositions with advanced AI techniques.

**Endpoint ID:** `fal-ai/minimax-music`

**✨ Capabilities:**
- Generate diverse musical compositions
- Create various music styles and genres
- Option to use reference audio for style matching

**🎵 Input Assets:** Optionally supports audio reference input

<div style="background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 4px; padding: 1rem; margin: 1rem 0;">
<strong>Example Prompt:</strong>
<pre style="background-color: #f1f3f5; padding: 0.5rem; border-radius: 4px; overflow-x: auto;">Upbeat electronic dance music with energetic synth leads, deep bass, and a driving drum beat at 128 BPM, building to a euphoric drop with arpeggiated melodies</pre>
</div>

**📝 Tips:**
- Specify BPM (beats per minute) for rhythm control
- Include instrument details
- Describe mood and energy level
- Mention genre or style references

---

### Stable Audio

<div style="display: flex; align-items: center; margin-bottom: 1rem;">
<span style="background-color: #f8e5ff; color: #6f42c1; padding: 0.25rem 0.5rem; border-radius: 4px; font-weight: bold; margin-right: 0.5rem;">VERSATILE</span>
<span style="background-color: #fff8e6; color: #bb6a00; padding: 0.25rem 0.5rem; border-radius: 4px; font-weight: bold;">SOUND EFFECTS</span>
</div>

![Stable Audio Example](/images/models/stable-audio-placeholder.jpg)

Generate high-quality music tracks and sound effects using Stability AI's audio model.

**Endpoint ID:** `fal-ai/stable-audio`

**✨ Capabilities:**
- Generate music in various styles
- Create sound effects and ambient sounds
- Produce variable-length audio outputs

<div style="background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 4px; padding: 1rem; margin: 1rem 0;">
<strong>Example Prompts:</strong>

For Music:
<pre style="background-color: #f1f3f5; padding: 0.5rem; border-radius: 4px; overflow-x: auto;">128 BPM tech house drum loop with deep bass, crisp hi-hats, and a driving kick drum</pre>

For Sound Effects:
<pre style="background-color: #f1f3f5; padding: 0.5rem; border-radius: 4px; overflow-x: auto;">Door slam. High-quality, stereo.</pre>
</div>

**📝 Tips:**
- For music, specify BPM, genre, and instruments
- For sound effects, add "High-quality, stereo" to your prompt
- Keep prompts concise but descriptive
- Describe the mood or feeling you want to convey

---

## Voiceover Models

<div style="background-color: rgba(220, 53, 69, 0.1); border-left: 4px solid #dc3545; padding: 1rem; margin-bottom: 1.5rem;">
<strong>💡 Pro Tip:</strong> Voiceover models convert text into natural-sounding speech. They're ideal for narration, dialogue, and character voices in your projects.
</div>

### PlayHT TTS v3

<div style="display: flex; align-items: center; margin-bottom: 1rem;">
<span style="background-color: #f2f7ff; color: #0057b8; padding: 0.25rem 0.5rem; border-radius: 4px; font-weight: bold; margin-right: 0.5rem;">NATURAL</span>
<span style="background-color: #fff8e6; color: #bb6a00; padding: 0.25rem 0.5rem; border-radius: 4px; font-weight: bold;">EMOTIONAL</span>
</div>

![PlayHT Example](/images/models/playht-placeholder.jpg)

Generates fluent and natural speech with improved emotional tones.

**Endpoint ID:** `fal-ai/playht/tts/v3`

**✨ Capabilities:**
- High-quality text-to-speech
- Natural-sounding voice synthesis
- Fast processing for efficient workflows

**🗣️ Default Voice:** Dexter (English (US)/American)

**💰 Pricing:** $0.03 per minute per audio minute generated

**🎯 Example Usage:**
- Narration for videos
- Voiceovers for presentations
- Audio content creation

**📝 Tips:**
- Use natural language patterns for best results
- Add punctuation to control pacing and pauses
- For emphasis, use italics or capitalize words

---

### PlayAI Text-to-Speech Dialog

<div style="display: flex; align-items: center; margin-bottom: 1rem;">
<span style="background-color: #f2f7ff; color: #0057b8; padding: 0.25rem 0.5rem; border-radius: 4px; font-weight: bold; margin-right: 0.5rem;">DIALOGUE</span>
<span style="background-color: #fff8e6; color: #bb6a00; padding: 0.25rem 0.5rem; border-radius: 4px; font-weight: bold;">MULTI-SPEAKER</span>
</div>

![PlayAI Dialog Example](/images/models/playai-dialog-placeholder.jpg)

Generates natural-sounding multi-speaker dialogues for storytelling and interactive media.

**Endpoint ID:** `fal-ai/playai/tts/dialog`

**✨ Capabilities:**
- Multi-speaker dialogue generation
- Natural-sounding conversations
- Enhanced expressiveness for storytelling

**🗣️ Default Voices:**
- Speaker 1: Jennifer (English (US)/American)
- Speaker 2: Furio (English (IT)/Italian)

<div style="background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 4px; padding: 1rem; margin: 1rem 0;">
<strong>Example Input:</strong>
<pre style="background-color: #f1f3f5; padding: 0.5rem; border-radius: 4px; overflow-x: auto;">Speaker 1: Have you heard about the new AI technologies?
Speaker 2: Yes, they're fascinating! I've been reading about them extensively.
Speaker 1: What interests you the most about them?
Speaker 2: The way they can create content that seems so human-like.</pre>
</div>

**📝 Tips:**
- Use speaker prefixes consistently
- Include natural conversational elements
- Vary sentence length and structure for realism
- Include emotional cues in parentheses for better expression

---

### F5 TTS

<div style="display: flex; align-items: center; margin-bottom: 1rem;">
<span style="background-color: #f2f7ff; color: #0057b8; padding: 0.25rem 0.5rem; border-radius: 4px; font-weight: bold; margin-right: 0.5rem;">VOICE CLONING</span>
<span style="background-color: #fff8e6; color: #bb6a00; padding: 0.25rem 0.5rem; border-radius: 4px; font-weight: bold;">REFERENCE AUDIO</span>
</div>

![F5 TTS Example](/images/models/f5-tts-placeholder.jpg)

Fluent and faithful speech synthesis with flow matching technology.

**Endpoint ID:** `fal-ai/f5-tts`

**✨ Capabilities:**
- High-quality text-to-speech
- Reference audio matching
- Natural speech patterns

**⚙️ Default Settings:**
- Uses a reference audio and text
- Removes silence by default

**🎯 Example Usage:**
- Voice cloning with reference audio
- Consistent voice styling across projects
- Voice preservation for legacy content

**📝 Tips:**
- Provide clear reference audio for better voice matching
- Ensure reference text matches the audio for accurate voice learning
- Keep generated text in a similar style to the reference for best results

---

## General Tips for All Models

<div style="background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 1.5rem; margin: 2rem 0;">

### 🧠 Prompt Engineering

1. **Be Specific:** The more details you provide, the better the AI can match your vision
2. **Use Visual Language:** Describe what you want to see, hear, or experience
3. **Include Technical Details:** For appropriate models, include camera specs, music terminology, or voice characteristics
4. **Experiment:** Try different prompts and variations to find what works best

### 🔄 Optimal Workflow

1. **Start Simple:** Begin with basic prompts and add complexity
2. **Iterate:** Use generated results to inform your next prompt
3. **Combine Models:** Use multiple models together for comprehensive projects
4. **Save Successful Prompts:** Keep a library of prompts that work well

### 💼 Resource Usage

1. **Consider Costs:** Be aware of the pricing for each model
2. **Batch Processing:** Plan your generations to maximize efficiency
3. **Test First:** Use shorter generations initially to test concepts

</div>

---

*This guide will be regularly updated as new models are added or existing models are updated.* 