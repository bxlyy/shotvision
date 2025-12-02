"use client";

import React, { useState, useCallback } from "react";
import {
  Upload,
  Video,
  FileVideo,
  X,
  UploadCloud,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- UI Components (simulating @/components/ui/button) ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          variant === "default" &&
            "bg-primary text-primary-foreground hover:bg-primary/90",
          variant === "ghost" && "hover:bg-accent hover:text-accent-foreground",
          variant === "outline" &&
            "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
          size === "default" && "h-10 px-4 py-2",
          size === "sm" && "h-9 rounded-md px-3",
          size === "lg" && "h-11 rounded-md px-8",
          size === "icon" && "h-10 w-10",
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

// --- Main Component ---
export function VideoUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith("video/")) {
      setFile(droppedFile);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile && selectedFile.type.startsWith("video/")) {
        setFile(selectedFile);
      }
    },
    []
  );

  const handleRemove = useCallback(() => {
    if (isUploading) return;
    setFile(null);
  }, [isUploading]);

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);

    try {
      // Get permission (uses API Route (no S3 SDK needed here))
      const uploadRes = await fetch(
        `/api/upload-url?fileType=${encodeURIComponent(file.type)}`
      );
      if (!uploadRes.ok) throw new Error("Failed to get upload URL");

      const { uploadUrl, key } = await uploadRes.json();

      // Upload to Backblaze (uses standard browser fetch)
      const b2Response = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      if (!b2Response.ok) throw new Error("Failed to upload to storage");

      // Save to database
      const saveRes = await fetch("/api/videos", {
        method: "POST",
        body: JSON.stringify({
          key: key,
          title: file.name,
        }),
      });

      if (!saveRes.ok) throw new Error("Failed to save video metadata");

      alert("Success! Video uploaded.");
      setFile(null);
    } catch (error) {
      console.error(error);
      alert("Upload failed. Check console for details.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="h-full w-full">
      {!file ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            // Added 'group' for hover effects on children
            // Added hover:border-primary and hover:bg-primary/5 for "light up" effect
            "group relative h-full rounded-2xl border-2 border-dashed border-border bg-card transition-all hover:border-primary hover:bg-primary/5",
            isDragging && "scale-[1.02] border-primary bg-primary/5"
          )}
        >
          <label
            htmlFor="video-upload"
            className="flex h-full cursor-pointer flex-col items-center justify-center px-8 py-16 transition-colors"
          >
            {/* Icon Container: Added transition and group-hover:scale-110 */}

            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 ring-4 ring-background transition-transform duration-300 group-hover:scale-110">
              {isDragging ? (
                <FileVideo className="h-8 w-8 text-primary transition-colors" />
              ) : (
                <Upload className="h-8 w-8 text-primary transition-colors" />
              )}
            </div>
            <h3 className="mb-2 text-xl font-semibold text-balance">
              {isDragging ? "Drop your video here" : "Upload your tennis video"}
            </h3>
            <p className="mb-6 text-sm text-muted-foreground text-pretty">
              Drag and drop or click to browse • MP4, MOV, AVI up to 500MB
            </p>

            {/* Button: Added opacity-0 by default and group-hover:opacity-100 */}
            <Button
              type="button"
              size="lg"
              className="pointer-events-none opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            >
              <Upload className="mr-2 h-4 w-4" />
              Choose video
            </Button>
          </label>

          <input
            id="video-upload"
            type="file"
            accept="video/*"
            className="hidden"
            onChange={handleFileInput}
          />
        </div>
      ) : (
        <div className="flex h-full flex-col justify-center rounded-2xl border border-border bg-card p-8">
          <div className="mb-6 flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Video className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="mb-1 font-semibold text-balance">{file.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRemove}
              className="h-8 w-8"
              disabled={isUploading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleUpload}
              className="w-full"
              size="lg"
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <UploadCloud className="mr-2 h-4 w-4" />
                  Upload Video
                </>
              )}
            </Button>

            <p className="text-center text-xs text-muted-foreground text-pretty">
              {isUploading
                ? "Please wait while we send your video to the cloud..."
                : "Ready to upload"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Application Layout (for preview) ---
export default function App() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-8">
      <div className="w-full max-w-md">
        <VideoUpload />
      </div>
    </div>
  );
}
