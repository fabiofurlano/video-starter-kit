import React from "react";
import { Button } from "./button";

interface DownloadButtonProps {
  imageUrl: string;
  filename: string;
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  buttonText?: string;
}

export function DownloadButton({
  imageUrl,
  filename,
  className = "w-full",
  variant = "outline",
  size = "sm",
  buttonText = "Download Image",
}: DownloadButtonProps) {
  
  const handleDownload = async () => {
    try {
      // Fetch the image as a blob
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      // Create a blob URL and use it to trigger a proper save dialog
      const blobUrl = window.URL.createObjectURL(blob);
      
      // Create a temporary link element
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      
      // This is important to trigger the actual download dialog on the PC
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(blobUrl);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading image:", error);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleDownload}
    >
      <span className="flex items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mr-1.5"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        {buttonText}
      </span>
    </Button>
  );
} 