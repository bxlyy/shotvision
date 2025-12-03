"use client";

import React, { useState, useCallback } from "react";
import {
  Upload,
  Video as VideoIcon,
  FileVideo,
  X,
  UploadCloud,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Video } from "@/components/video-catalog";

interface VideoUploadProps {
  onUploadSuccess?: (video: Video) => void;
}

export function VideoUpload({ onUploadSuccess }: VideoUploadProps) {
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
      // 1. Get permission (uses API Route)
      const uploadRes = await fetch(
        `/api/upload-url?fileType=${encodeURIComponent(file.type)}`
      );
      if (!uploadRes.ok) throw new Error("Failed to get upload URL");

      const { uploadUrl, key } = await uploadRes.json();

      // 2. Upload to Backblaze
      const b2Response = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      if (!b2Response.ok) throw new Error("Failed to upload to storage");

      // 3. Save to database
      const saveRes = await fetch("/api/videos", {
        method: "POST",
        body: JSON.stringify({
          key: key,
          title: file.name,
        }),
      });

      if (!saveRes.ok) throw new Error("Failed to save video metadata");

      // 4. Handle Success
      const data = await saveRes.json();
      const serverVideoData = data.video || data;

      const optimisticVideo: Video = {
        _id: serverVideoData._id || serverVideoData.id || "temp-id",
        title: file.name,
        key: key,
        url: URL.createObjectURL(file), 
        createdAt: new Date().toISOString(),
        owner: "me", 
        ...serverVideoData, // Merge any other real data from server
      };
      
      if (onUploadSuccess) {
        onUploadSuccess(optimisticVideo);
      }

      setFile(null);
      // Removed alert for a smoother UI flow
      
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
            "group relative h-full rounded-2xl border-2 border-dashed border-border bg-card transition-all hover:border-primary hover:bg-primary/5",
            isDragging && "scale-[1.02] border-primary bg-primary/5"
          )}
        >
          <label
            htmlFor="video-upload"
            className="flex h-full cursor-pointer flex-col items-center justify-center px-8 py-16 transition-colors"
          >
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
              Drag and drop or click to browse • MP4, MOV, AVI
            </p>

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
                <VideoIcon className="h-6 w-6 text-primary" />
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