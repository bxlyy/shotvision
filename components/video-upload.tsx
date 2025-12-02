"use client";

import type React from "react";
import { useState, useCallback } from "react";
import {
  Upload,
  Video,
  FileVideo,
  X,
  UploadCloud,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
    <div className="mx-auto w-full max-w-2xl">
      {!file ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            "relative rounded-2xl border-2 border-dashed border-border bg-card transition-all",
            isDragging && "border-primary bg-primary/5 scale-[1.02]"
          )}
        >
          <label
            htmlFor="video-upload"
            className="flex cursor-pointer flex-col items-center justify-center px-8 py-16 transition-colors hover:bg-muted/50"
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              {isDragging ? (
                <FileVideo className="h-8 w-8 text-primary" />
              ) : (
                <Upload className="h-8 w-8 text-primary" />
              )}
            </div>
            <h3 className="mb-2 text-xl font-semibold text-balance">
              {isDragging ? "Drop your video here" : "Upload your tennis video"}
            </h3>
            <p className="mb-6 text-sm text-muted-foreground text-pretty">
              Drag and drop or click to browse • MP4, MOV, AVI up to 500MB
            </p>
            <Button type="button" size="lg">
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
        <div className="rounded-2xl border border-border bg-card p-8">
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
