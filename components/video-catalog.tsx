"use client";

import React, { useState, useEffect } from "react";
import {
  Library,
  PlayCircle,
  X,
  Film,
  ChevronRight,
  LayoutGrid,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// --- Types ---
export interface Video {
  _id: string;
  title: string;
  key: string;
  url: string; // signed URL
  createdAt: string;
  owner: string;
}

interface VideoCatalogSelectorProps {
  selectedVideo: Video | null;
  onVideoSelect: (video: Video | null) => void;
}

export function VideoCatalogSelector({
  selectedVideo,
  onVideoSelect,
}: VideoCatalogSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // State for data fetching
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelectVideo = (video: Video) => {
    onVideoSelect(video);
    setIsOpen(false);
  };

  const handleClearVideo = () => {
    onVideoSelect(null);
  };

  // Fetch videos only when the modal is opened
  useEffect(() => {
    if (isOpen) {
      const fetchVideos = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const response = await fetch("/api/videos");

          if (!response.ok) {
            throw new Error("Failed to fetch videos");
          }

          const data = await response.json();
          // Adjust 'data.videos' based on your actual API response structure
          setVideos(data.videos || data);
        } catch (err) {
          console.error("Error loading videos:", err);
          setError("Could not load your video library.");
        } finally {
          setIsLoading(false);
        }
      };

      fetchVideos();
    }
  }, [isOpen]);

  // Helper to format MongoDB dates
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="flex h-full w-full flex-col gap-6">
      {/* "Currently Viewing" Status Card */}
      <div className="shrink-0 rounded-2xl border border-border bg-card p-6 shadow-sm transition-all">
        <div className="flex items-center justify-between gap-4"> 
          <div className="space-y-1 flex-1 min-w-0">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Currently viewing
            </h4>
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors", // Added shrink-0 to icon
                  selectedVideo
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                )}
              >
                <PlayCircle className="h-5 w-5" />
              </div>
              <span
                className={cn(
                  "text-lg font-medium truncate block",
                  selectedVideo
                    ? "text-foreground"
                    : "text-muted-foreground italic"
                )}
              >
                {selectedVideo ? selectedVideo.title : "None"}
              </span>
            </div>
          </div>

          {selectedVideo && (
            <div className="flex flex-col gap-2 shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearVideo}
                className="h-8 justify-end px-2 text-muted-foreground hover:text-destructive"
              >
                Clear
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="h-8 justify-end px-2 text-muted-foreground hover:text-destructive"
              >
                Edit
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Edit Video Details Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="relative flex h-[600px] w-full max-w-3xl flex-col rounded-2xl bg-card shadow-2xl animate-in zoom-in-95 duration-200 border border-border"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <LayoutGrid className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    Edit Video Details
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Modify the metadata for your selected video
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditing(false)}
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </Button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-auto bg-muted/30 p-6">
              {/* Content for editing video details goes here */}
            </div>
          </div>
        </div>
      )}

      {/* Catalog Trigger Area */}
      <div
        onClick={() => setIsOpen(true)}
        className={cn(
          "flex-1 flex flex-col justify-center",
          "group relative cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed border-border bg-card p-10 text-center transition-all hover:border-primary hover:bg-primary/5"
        )}
      >
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 ring-4 ring-background transition-all group-hover:scale-105">
            <Library className="h-8 w-8 text-primary transition-colors" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-balance">
              Or, view videos from your catalog
            </h3>
            <p className="text-sm text-muted-foreground text-pretty">
              Select from your previously uploaded matches and drills
            </p>
          </div>

          <Button
            variant="outline"
            className="mt-2 pointer-events-none border-primary/50 text-primary opacity-0 transition-all group-hover:opacity-100"
          >
            Open Library
          </Button>
        </div>
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="relative flex h-[600px] w-full max-w-3xl flex-col rounded-2xl bg-card shadow-2xl animate-in zoom-in-95 duration-200 border border-border"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <LayoutGrid className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    Video Catalog
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Select a video to view analysis
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </Button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-auto bg-muted/30 p-6">
              {/* Loading state */}
              {isLoading && (
                <div className="flex h-full flex-col items-center justify-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">
                    Loading your videos...
                  </p>
                </div>
              )}

              {/* Error state */}
              {!isLoading && error && (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-destructive">
                  <AlertCircle className="h-8 w-8" />
                  <p className="text-sm font-medium">{error}</p>
                  <Button variant="outline" onClick={() => setIsOpen(false)}>
                    Close
                  </Button>
                </div>
              )}

              {/* Empty (no video) state */}
              {!isLoading && !error && videos.length === 0 && (
                <div className="flex h-full flex-col items-center justify-center gap-2">
                  <Film className="h-10 w-10 text-muted-foreground/50" />
                  <p className="text-muted-foreground">
                    No videos found in your library.
                  </p>
                </div>
              )}

              {/* Video list */}
              {!isLoading && !error && videos.length > 0 && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {videos.map((video) => (
                    <button
                      key={video._id}
                      onClick={() => handleSelectVideo(video)}
                      className="group flex flex-col items-start gap-3 rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary/50 hover:shadow-md"
                    >
                      <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg bg-muted">
                        <Film className="h-8 w-8 text-muted-foreground transition-transform group-hover:scale-110" />

                        {/* "PLAY" Overlay on hover */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/10 opacity-0 transition-opacity group-hover:opacity-100">
                          <PlayCircle className="h-10 w-10 text-white drop-shadow-md" />
                        </div>
                      </div>

                      <div className="w-full min-w-0">
                        <p
                          className="truncate font-medium text-foreground"
                          title={video.title}
                        >
                          {video.title}
                        </p>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {formatDate(video.createdAt)}
                          </span>
                          <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-border bg-card px-6 py-4">
              <div className="flex justify-end gap-3">
                <Button variant="ghost" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
