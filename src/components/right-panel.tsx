"use client";

import { useJobCreator } from "@/data/mutations";
import { queryKeys, useProject, useProjectMediaItems } from "@/data/queries";
import type { MediaItem } from "@/data/schema";
import {
  type GenerateData,
  type MediaType,
  useProjectId,
  useVideoProjectStore,
} from "@/data/store";
import { AVAILABLE_ENDPOINTS, type InputAsset } from "@/lib/fal";
import {
  ImageIcon,
  MicIcon,
  MusicIcon,
  LoaderCircleIcon,
  VideoIcon,
  ArrowLeft,
  TrashIcon,
  WandSparklesIcon,
  CrossIcon,
  XIcon,
} from "lucide-react";
import { MediaItemRow } from "./media-panel";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";

import { useEffect, useMemo, useState } from "react";
import { useUploadThing } from "@/lib/uploadthing";
import type { ClientUploadedFileData } from "uploadthing/types";
import { db } from "@/data/db";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  assetKeyMap,
  cn,
  getAssetKey,
  getAssetType,
  mapInputKey,
  resolveMediaUrl,
} from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "./ui/select";
import { enhancePrompt, LlmModelType } from "@/lib/prompt";
import { WithTooltip } from "./ui/tooltip";
import { Label } from "./ui/label";
import { VoiceSelector } from "./playht/voice-selector";
import { LoadingIcon } from "./ui/icons";
import { getMediaMetadata } from "@/lib/ffmpeg";
import CameraMovement from "./camera-control";
import { Sheet, SheetContent, SheetHeader, SheetTrigger } from "./ui/sheet";
import { ModelHelper } from "./model-helper";
import { PlusIcon } from "lucide-react";

type ModelEndpointPickerProps = {
  mediaType: string;
  onValueChange: (value: MediaType) => void;
} & Parameters<typeof Select>[0];

function ModelEndpointPicker({
  mediaType,
  ...props
}: ModelEndpointPickerProps) {
  const endpoints = useMemo(
    () =>
      AVAILABLE_ENDPOINTS.filter((endpoint) => endpoint.category === mediaType),
    [mediaType],
  );
  return (
    <Select {...props}>
      <SelectTrigger className="text-base w-full minw-56 font-semibold">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {endpoints.map((endpoint) => (
          <SelectItem key={endpoint.endpointId} value={endpoint.endpointId}>
            <div className="flex flex-row gap-2 items-center">
              <span>{endpoint.label}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

type LlmModelPickerProps = {
  selectedModel: LlmModelType;
  onValueChange: (value: LlmModelType) => void;
} & Parameters<typeof Select>[0];

function LlmModelPicker({
  selectedModel,
  onValueChange,
  ...props
}: LlmModelPickerProps) {
  return (
    <Select
      defaultValue={selectedModel}
      onValueChange={onValueChange}
      {...props}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select LLM Model" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Meta Llama Models</SelectLabel>
          <SelectItem value="meta-llama/llama-3.2-1b-instruct">
            Llama 3.2 1B
          </SelectItem>
          <SelectItem value="meta-llama/llama-3.2-3b-instruct">
            Llama 3.2 3B
          </SelectItem>
          <SelectItem value="meta-llama/llama-3.1-8b-instruct">
            Llama 3.1 8B
          </SelectItem>
          <SelectItem value="meta-llama/llama-3.1-70b-instruct">
            Llama 3.1 70B
          </SelectItem>
        </SelectGroup>
        <SelectGroup>
          <SelectLabel>OpenAI Models</SelectLabel>
          <SelectItem value="openai/gpt-4o-mini">GPT-4o Mini</SelectItem>
          <SelectItem value="openai/gpt-4o">GPT-4o</SelectItem>
        </SelectGroup>
        <SelectGroup>
          <SelectLabel>Anthropic Models</SelectLabel>
          <SelectItem value="anthropic/claude-3.5-sonnet">
            Claude 3.5 Sonnet
          </SelectItem>
          <SelectItem value="anthropic/claude-3-5-haiku">
            Claude 3.5 Haiku
          </SelectItem>
          <SelectItem value="anthropic/claude-3-haiku">
            Claude 3 Haiku
          </SelectItem>
        </SelectGroup>
        <SelectGroup>
          <SelectLabel>Google Models</SelectLabel>
          <SelectItem value="google/gemini-pro-1.5">Gemini Pro 1.5</SelectItem>
          <SelectItem value="google/gemini-flash-1.5">
            Gemini Flash 1.5
          </SelectItem>
          <SelectItem value="google/gemini-flash-1.5-8b">
            Gemini Flash 1.5 8B
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

export default function RightPanel({
  onOpenChange,
}: {
  onOpenChange?: (open: boolean) => void;
}) {
  const videoProjectStore = useVideoProjectStore((s) => s);
  const {
    generateData,
    setGenerateData,
    resetGenerateData,
    endpointId,
    setEndpointId,
  } = videoProjectStore;

  const [tab, setTab] = useState<string>("generation");
  const [assetMediaType, setAssetMediaType] = useState("all");
  const projectId = useProjectId();
  const openGenerateDialog = useVideoProjectStore((s) => s.openGenerateDialog);
  const generateDialogOpen = useVideoProjectStore((s) => s.generateDialogOpen);
  const closeGenerateDialog = useVideoProjectStore(
    (s) => s.closeGenerateDialog,
  );
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const [isPanelClosed, setIsPanelClosed] = useState(false);

  const handleOnOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      closeGenerateDialog();
      resetGenerateData();
      return;
    }
    if (onOpenChange) {
      onOpenChange(isOpen);
    }
    openGenerateDialog();
  };

  const togglePanel = () => {
    setIsPanelClosed(!isPanelClosed);
  };

  const { data: project } = useProject(projectId);

  const { toast } = useToast();
  const enhancePromptMutation = useMutation({
    mutationFn: async () => {
      return enhancePrompt(generateData.prompt, {
        type: mediaType as any,
        project: project,
        model: llmModel,
      });
    },
    onSuccess: (enhancedPrompt) => {
      setGenerateData({ prompt: enhancedPrompt });
    },
    onError: (error: any) => {
      console.warn(
        "🚨 QUOTA-GUARD-TEST: Error caught in right-panel.tsx",
        error.message,
      );
      console.warn("Failed to create suggestion", error);

      // Check if the error is related to quota exceeded or missing Fal.ai API key
      const errorMessage = error?.message || "";
      const isQuotaExceeded =
        errorMessage.includes("quota exceeded") ||
        errorMessage.includes("Free tier quota");
      const isMissingApiKey =
        errorMessage.includes("API key") ||
        errorMessage.includes("401") ||
        errorMessage.toLowerCase().includes("unauthorized") ||
        localStorage.getItem("falai_key") === null ||
        localStorage.getItem("falai_key") === "";

      toast({
        title: "⚠️ FREE TIER LIMIT REACHED",
        description: isQuotaExceeded
          ? "You've reached your free tier limit. Please upgrade to continue. Go to Settings to subscribe."
          : isMissingApiKey
            ? "Missing Fal.ai API key. Please ensure your API key is properly set in the parent application."
            : "There was an unexpected error. Try again.",
        variant: isQuotaExceeded || isMissingApiKey ? "destructive" : "default",
        className: isQuotaExceeded
          ? "border-4 border-orange-400 shadow-lg shadow-red-900/20 font-bold"
          : "",
      });
    },
  });

  const { data: mediaItems = [] } = useProjectMediaItems(projectId);
  const mediaType = useVideoProjectStore((s) => s.generateMediaType);
  const setMediaType = useVideoProjectStore((s) => s.setGenerateMediaType);
  const llmModel = useVideoProjectStore((s) => s.llmModel);
  const setLlmModel = useVideoProjectStore((s) => s.setLlmModel);

  const endpoint = useMemo(
    () =>
      AVAILABLE_ENDPOINTS.find(
        (endpoint) => endpoint.endpointId === endpointId,
      ),
    [endpointId],
  );
  const handleMediaTypeChange = (mediaType: string) => {
    setMediaType(mediaType as MediaType);
    const endpoint = AVAILABLE_ENDPOINTS.find(
      (endpoint) => endpoint.category === mediaType,
    );

    const initialInput = endpoint?.initialInput || {};

    if (
      (mediaType === "video" &&
        endpoint?.endpointId === "fal-ai/hunyuan-video") ||
      mediaType !== "video"
    ) {
      setGenerateData({ image: null, ...initialInput });
    } else {
      setGenerateData({ ...initialInput });
    }

    setEndpointId(endpoint?.endpointId ?? AVAILABLE_ENDPOINTS[0].endpointId);
  };
  // TODO improve model-specific parameters
  type InputType = {
    prompt: string;
    image_url?: File | string | null;
    video_url?: File | string | null;
    audio_url?: File | string | null;
    image_size?: { width: number; height: number } | string;
    aspect_ratio?: string;
    seconds_total?: number;
    voice?: string;
    input?: string;
    reference_audio_url?: File | string | null;
    advanced_camera_control?: {
      movement_value: number;
      movement_type: string;
    };
  };

  const aspectRatioMap = {
    "16:9": { image: "landscape_16_9", video: "16:9" },
    "9:16": { image: "portrait_16_9", video: "9:16" },
    "1:1": { image: "square_1_1", video: "1:1" },
  };

  let imageAspectRatio: string | { width: number; height: number } | undefined;
  let videoAspectRatio: string | undefined;

  if (project?.aspectRatio) {
    imageAspectRatio = aspectRatioMap[project.aspectRatio].image;
    videoAspectRatio = aspectRatioMap[project.aspectRatio].video;
  }

  const input: InputType = {
    prompt: generateData.prompt,
    image_url: undefined,
    image_size: imageAspectRatio,
    aspect_ratio: videoAspectRatio,
    seconds_total: generateData.duration ?? undefined,
    voice:
      endpointId === "fal-ai/playht/tts/v3" ? generateData.voice : undefined,
    input:
      endpointId === "fal-ai/playht/tts/v3" ? generateData.prompt : undefined,
  };

  if (generateData.image) {
    input.image_url = generateData.image;
  }
  if (generateData.video_url) {
    input.video_url = generateData.video_url;
  }
  if (generateData.audio_url) {
    input.audio_url = generateData.audio_url;
  }
  if (generateData.reference_audio_url) {
    input.reference_audio_url = generateData.reference_audio_url;
  }

  if (generateData.advanced_camera_control) {
    input.advanced_camera_control = generateData.advanced_camera_control;
  }

  const extraInput =
    endpointId === "fal-ai/f5-tts"
      ? {
          gen_text: generateData.prompt,
          ref_audio_url:
            "https://github.com/SWivid/F5-TTS/raw/21900ba97d5020a5a70bcc9a0575dc7dec5021cb/tests/ref_audio/test_en_1_ref_short.wav",
          ref_text: "Some call me nature, others call me mother nature.",
          model_type: "F5-TTS",
          remove_silence: true,
        }
      : {};
  const createJob = useJobCreator({
    projectId,
    endpointId:
      generateData.image && mediaType === "video"
        ? endpoint?.imageForFrame
          ? endpointId // For models like LTX Video that handle images directly
          : `${endpointId}/image-to-video` // For other models that need the /image-to-video endpoint
        : endpointId,
    mediaType,
    input: {
      ...(endpoint?.initialInput || {}),
      ...mapInputKey(input, endpoint?.inputMap || {}),
      ...extraInput,
    },
  });

  const handleOnGenerate = async () => {
    try {
      await createJob.mutateAsync({} as any, {
        onSuccess: async () => {
          if (!createJob.isError) {
            handleOnOpenChange(false);
          }
        },
      });
    } catch (error: any) {
      console.warn("Media generation error:", error);

      // Check if the error is related to quota exceeded
      const errorMessage = error?.message || "";
      const isQuotaExceeded =
        errorMessage.includes("quota exceeded") ||
        errorMessage.includes("Free tier quota");

      toast({
        title: "⚠️ FREE TIER LIMIT REACHED",
        description: isQuotaExceeded
          ? "You've reached your free tier limit. Please upgrade to continue. Go to Settings to subscribe."
          : "There was an unexpected error. Try again.",
        variant: isQuotaExceeded ? "destructive" : "default",
        className: isQuotaExceeded
          ? "border-4 border-orange-400 shadow-lg shadow-red-900/20 font-bold"
          : "",
      });
    }
  };

  useEffect(() => {
    videoProjectStore.onGenerate = handleOnGenerate;
  }, [handleOnGenerate]);

  const handleSelectMedia = (media: MediaItem) => {
    const asset = endpoint?.inputAsset?.find((item) => {
      const assetType = getAssetType(item);

      if (
        assetType === "audio" &&
        (media.mediaType === "voiceover" || media.mediaType === "music")
      ) {
        return true;
      }
      return assetType === media.mediaType;
    });

    if (!asset) {
      setTab("generation");
      return;
    }

    setGenerateData({ [getAssetKey(asset)]: resolveMediaUrl(media) });
    setTab("generation");
  };

  const { startUpload, isUploading } = useUploadThing("fileUploader");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    try {
      const uploadedFiles = await startUpload(Array.from(files));
      if (uploadedFiles) {
        await handleUploadComplete(uploadedFiles);
      }
    } catch (err) {
      console.warn(`ERROR! ${err}`);
      toast({
        title: "Failed to upload file",
        description: "Please try again",
      });
    }
  };

  const handleUploadComplete = async (
    files: ClientUploadedFileData<{
      uploadedBy: string;
    }>[],
  ) => {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const mediaType = file.type.split("/")[0];
      const outputType = mediaType === "audio" ? "music" : mediaType;

      const data: Omit<MediaItem, "id"> = {
        projectId,
        kind: "uploaded",
        createdAt: Date.now(),
        mediaType: outputType as MediaType,
        status: "completed",
        url: file.url,
      };

      setGenerateData({
        ...generateData,
        [assetKeyMap[outputType as keyof typeof assetKeyMap]]: file.url,
      });

      const mediaId = await db.media.create(data);
      const media = await db.media.find(mediaId as string);

      if (media && media.mediaType !== "image") {
        const mediaMetadata = await getMediaMetadata(media as MediaItem);

        await db.media
          .update(media.id, {
            ...media,
            metadata: mediaMetadata?.media || {},
          })
          .finally(() => {
            queryClient.invalidateQueries({
              queryKey: queryKeys.projectMediaItems(projectId),
            });
          });
      }
    }
  };

  const handleLlmModelChange = (model: LlmModelType) => {
    setLlmModel(model);
  };

  return (
    <>
      {isPanelClosed && generateDialogOpen && (
        <button
          onClick={togglePanel}
          className="fixed bottom-20 right-6 z-50 p-3 rounded-full bg-primary shadow-lg hover:bg-primary/90 transition-all duration-300 flex items-center justify-center floating-media-button"
          aria-label="Open Media Panel"
        >
          <span className="text-white font-medium flex items-center">
            <PlusIcon className="w-5 h-5" />
            <span className="ml-1">Generate Media</span>
          </span>
        </button>
      )}
      <div
        className={cn(
          "flex flex-col border-l border-border w-[560px] min-w-[560px] z-50 transition-all duration-300 fixed top-0 bottom-0 overflow-y-auto right-panel-container",
          generateDialogOpen
            ? isPanelClosed
              ? "right-[-560px]"
              : "right-0"
            : "-right-[560px]",
        )}
      >
        <div className="flex-1 p-4 flex flex-col gap-4 border-b border-border h-full overflow-y-auto relative">
          <div className="flex flex-row items-center justify-between">
            <h2 className="text-sm text-muted-foreground font-semibold flex-1">
              Generate Media
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={togglePanel}
              className="flex items-center gap-2 hover:bg-white/10 transition-colors"
            >
              <XIcon className="w-6 h-6" />
            </Button>
          </div>
          <div className="w-full flex flex-col">
            <div className="flex w-full gap-2">
              <Button
                variant="ghost"
                onClick={() => handleMediaTypeChange("image")}
                className={cn(
                  mediaType === "image" && "bg-primary/20",
                  "h-14 flex flex-col justify-center w-1/4 rounded-md gap-2 items-center",
                )}
              >
                <ImageIcon className="w-4 h-4 opacity-50" />
                <span className="text-[10px]">Image</span>
              </Button>
              <Button
                variant="ghost"
                onClick={() => handleMediaTypeChange("video")}
                className={cn(
                  mediaType === "video" && "bg-primary/20",
                  "h-14 flex flex-col justify-center w-1/4 rounded-md gap-2 items-center",
                )}
              >
                <VideoIcon className="w-4 h-4 opacity-50" />
                <span className="text-[10px]">Video</span>
              </Button>
              <Button
                variant="ghost"
                onClick={() => handleMediaTypeChange("voiceover")}
                className={cn(
                  mediaType === "voiceover" && "bg-primary/20",
                  "h-14 flex flex-col justify-center w-1/4 rounded-md gap-2 items-center",
                )}
              >
                <MicIcon className="w-4 h-4 opacity-50" />
                <span className="text-[10px]">Voiceover</span>
              </Button>
              <Button
                variant="ghost"
                onClick={() => handleMediaTypeChange("music")}
                className={cn(
                  mediaType === "music" && "bg-primary/20",
                  "h-14 flex flex-col justify-center w-1/4 rounded-md gap-2 items-center",
                )}
              >
                <MusicIcon className="w-4 h-4 opacity-50" />
                <span className="text-[10px]">Music</span>
              </Button>
            </div>
            <div className="two-column-container">
              <div className="model-selectors-column">
                <div className="flex flex-col gap-2 justify-start font-medium text-base">
                  <div className="text-muted-foreground font-medium">Using</div>
                  <ModelEndpointPicker
                    mediaType={mediaType}
                    value={endpointId}
                    onValueChange={(endpointId) => {
                      resetGenerateData();
                      setEndpointId(endpointId);

                      const endpoint = AVAILABLE_ENDPOINTS.find(
                        (endpoint) => endpoint.endpointId === endpointId,
                      );

                      const initialInput = endpoint?.initialInput || {};
                      setGenerateData({ ...initialInput });
                    }}
                  />

                  <div className="mt-2">
                    <div className="text-muted-foreground">
                      LLM Model for Prompt Enhancement
                    </div>
                    <LlmModelPicker
                      selectedModel={llmModel}
                      onValueChange={handleLlmModelChange}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Select the LLM model to use for enhancing prompts. More
                      powerful models may produce better results but may cost
                      more credits.
                    </p>
                  </div>
                </div>
              </div>

              <div className="helper-column">
                {/* Model Helper Panel */}
                <div className="h-full flex flex-col">
                  <ModelHelper modelId={endpointId} />
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 relative">
            {endpoint?.inputAsset?.map((asset, index) => (
              <div key={getAssetType(asset)} className="flex w-full">
                <div className="flex flex-col w-full" key={getAssetType(asset)}>
                  <div className="flex justify-between">
                    <h4 className="capitalize text-muted-foreground mb-1 text-sm">
                      {getAssetType(asset)} Reference
                    </h4>
                    {tab === `asset-${getAssetType(asset)}` && (
                      <Button
                        variant="ghost"
                        onClick={() => setTab("generation")}
                        size="sm"
                      >
                        <ArrowLeft /> Back
                      </Button>
                    )}
                  </div>
                  {(tab === "generation" ||
                    tab !== `asset-${getAssetType(asset)}`) && (
                    <>
                      {!generateData[getAssetKey(asset)] && (
                        <div className="flex gap-2 justify-between mb-3">
                          <Button
                            variant="ghost"
                            onClick={() => {
                              setTab(`asset-${getAssetType(asset)}`);
                              setAssetMediaType(getAssetType(asset) ?? "all");
                            }}
                            className="cursor-pointer min-h-[30px] flex-1 flex flex-col items-center justify-center border border-dashed border-border rounded-md px-2"
                          >
                            <span className="text-muted-foreground text-xs text-center text-nowrap">
                              Select
                            </span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={isUploading}
                            className="cursor-pointer min-h-[30px] flex-1 flex flex-col items-center justify-center border border-dashed border-border rounded-md px-2"
                            asChild
                          >
                            <label htmlFor="assetUploadButton">
                              <Input
                                id="assetUploadButton"
                                type="file"
                                className="hidden"
                                onChange={handleFileUpload}
                                multiple={false}
                                disabled={isUploading}
                                accept="image/*,audio/*,video/*"
                              />
                              {isUploading ? (
                                <LoaderCircleIcon className="w-4 h-4 opacity-50 animate-spin" />
                              ) : (
                                <span className="text-muted-foreground text-xs text-center text-nowrap">
                                  Upload
                                </span>
                              )}
                            </label>
                          </Button>
                        </div>
                      )}
                      {generateData[getAssetKey(asset)] && (
                        <div className="cursor-pointer overflow-hidden relative w-full flex flex-col items-center justify-center border border-dashed border-border rounded-md bg-black/10 p-1">
                          <WithTooltip tooltip="Remove media">
                            <button
                              type="button"
                              className="p-1 rounded hover:bg-black/50 absolute top-1 z-50 bg-black/80 right-1 group-hover:text-white"
                              onClick={() =>
                                setGenerateData({
                                  [getAssetKey(asset)]: undefined,
                                })
                              }
                            >
                              <TrashIcon className="w-3 h-3 stroke-2" />
                            </button>
                          </WithTooltip>
                          {generateData[getAssetKey(asset)] && (
                            <SelectedAssetPreview
                              asset={asset}
                              data={generateData}
                            />
                          )}
                        </div>
                      )}
                    </>
                  )}
                  {tab === `asset-${getAssetType(asset)}` && (
                    <div className="flex items-center gap-2 flex-wrap overflow-y-auto max-h-80 divide-y divide-border">
                      {mediaItems
                        .filter((media) => {
                          if (assetMediaType === "all") return true;
                          if (
                            assetMediaType === "audio" &&
                            (media.mediaType === "voiceover" ||
                              media.mediaType === "music")
                          )
                            return true;
                          return media.mediaType === assetMediaType;
                        })
                        .map((job) => (
                          <MediaItemRow
                            draggable={false}
                            key={job.id}
                            data={job}
                            onOpen={handleSelectMedia}
                            className="cursor-pointer"
                          />
                        ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div className="relative bg-border rounded-lg pb-10 placeholder:text-base w-full resize-none">
              <Textarea
                className="text-base shadow-none focus:!ring-0 placeholder:text-base w-full h-24 resize-none"
                placeholder="Imagine..."
                value={generateData.prompt}
                rows={3}
                onChange={(e) => setGenerateData({ prompt: e.target.value })}
              />
              <WithTooltip tooltip="Enhance your prompt with AI-powered suggestions.">
                <div className="absolute bottom-2 right-2">
                  <Button
                    variant="secondary"
                    disabled={enhancePromptMutation.isPending}
                    className="bg-primary/20 text-white text-xs rounded-full h-6 px-3 hover:bg-primary/40 transition-colors"
                    onClick={() => enhancePromptMutation.mutate()}
                  >
                    {enhancePromptMutation.isPending ? (
                      <LoadingIcon />
                    ) : (
                      <WandSparklesIcon className="opacity-50" />
                    )}
                    Enhance Prompt
                  </Button>
                </div>
              </WithTooltip>
            </div>
          </div>

          {tab === "generation" && (
            <div className="flex flex-col gap-2 mb-2">
              {endpoint?.cameraControl && (
                <CameraMovement
                  value={generateData.advanced_camera_control}
                  onChange={(val) =>
                    setGenerateData({
                      advanced_camera_control: val
                        ? {
                            movement_value: val.value,
                            movement_type: val.movement,
                          }
                        : undefined,
                    })
                  }
                />
              )}
              {mediaType === "music" &&
                endpointId === "fal-ai/playht/tts/v3" && (
                  <div className="flex-1 flex flex-row gap-2">
                    {mediaType === "music" && (
                      <div className="flex flex-row items-center gap-1">
                        <Label>Duration</Label>
                        <Input
                          className="w-12 text-center tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          min={5}
                          max={30}
                          step={1}
                          type="number"
                          value={generateData.duration}
                          onChange={(e) =>
                            setGenerateData({
                              duration: Number.parseInt(e.target.value),
                            })
                          }
                        />
                        <span>s</span>
                      </div>
                    )}
                    {endpointId === "fal-ai/playht/tts/v3" && (
                      <VoiceSelector
                        value={generateData.voice}
                        onValueChange={(voice) => {
                          setGenerateData({ voice });
                        }}
                      />
                    )}
                  </div>
                )}
              <div className="flex flex-row gap-2">
                <Button
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                  disabled={
                    enhancePromptMutation.isPending || createJob.isPending
                  }
                  onClick={handleOnGenerate}
                >
                  Generate
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

const SelectedAssetPreview = ({
  data,
  asset,
}: {
  data: GenerateData;
  asset: InputAsset;
}) => {
  const assetType = getAssetType(asset);
  const assetKey = getAssetKey(asset);

  if (!data[assetKey]) return null;

  return (
    <>
      {assetType === "audio" && (
        <audio
          src={
            data[assetKey] && typeof data[assetKey] !== "string"
              ? URL.createObjectURL(data[assetKey])
              : data[assetKey] || ""
          }
          controls={true}
          className="w-full max-w-full"
        />
      )}
      {assetType === "video" && (
        <video
          src={
            data[assetKey] && typeof data[assetKey] !== "string"
              ? URL.createObjectURL(data[assetKey])
              : data[assetKey] || ""
          }
          controls={false}
          style={{ pointerEvents: "none" }}
          className="w-full max-h-[240px] object-contain"
        />
      )}
      {assetType === "image" && (
        <div className="w-full flex justify-center items-center p-2">
          <img
            id="image-preview"
            src={
              data[assetKey] && typeof data[assetKey] !== "string"
                ? URL.createObjectURL(data[assetKey])
                : data[assetKey] || ""
            }
            alt="Media Preview"
            className="max-h-[240px] object-contain rounded-md"
          />
        </div>
      )}
    </>
  );
};
