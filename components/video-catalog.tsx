"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Library,
  PlayCircle,
  X,
  Film,
  ChevronRight,
  LayoutGrid,
  Loader2,
  AlertCircle,
  Save,
  Pencil,
  Trash2,
  AlertTriangle,
  ListFilter,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
  const [filter, setFilter] = useState<
    "name-asc" | "name-desc" | "date-asc" | "date-desc"
  >("name-asc");
  const [search, setSearch] = useState("");

  // State for data fetching
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State for editing
  const [editTitle, setEditTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // State for deleting
  const [isDeleting, setIsDeleting] = useState(false); // Controls loading state during delete
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); // Controls "Are you sure?" view

  // Initialize edit form when selectedVideo changes
  useEffect(() => {
    if (selectedVideo) {
      setEditTitle(selectedVideo.title);
    }
  }, [selectedVideo]);

  const handleSelectVideo = (video: Video) => {
    onVideoSelect(video);
    setIsOpen(false);
  };

  const handleClearVideo = () => {
    onVideoSelect(null);
  };

  const handleUpdateVideo = async () => {
    if (!selectedVideo) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/videos/${selectedVideo._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-app-source": "shotvision-web",
        },
        body: JSON.stringify({ title: editTitle }),
      });

      if (!response.ok) throw new Error("Failed to update");

      // 1. Update local selected video state
      const updatedVideo = { ...selectedVideo, title: editTitle };
      onVideoSelect(updatedVideo);

      // 2. Update the video in the list if it's currently loaded
      setVideos((prev) =>
        prev.map((v) =>
          v._id === selectedVideo._id ? { ...v, title: editTitle } : v
        )
      );

      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update video details", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteVideo = async () => {
    if (!selectedVideo) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/videos/${selectedVideo._id}`, {
        method: "DELETE",
        headers: {
          "x-app-source": "shotvision-web",
        },
      });

      if (!response.ok) throw new Error("Failed to delete");

      // Remove from local list
      setVideos((prev) => prev.filter((v) => v._id !== selectedVideo._id));

      // Clear selection
      onVideoSelect(null);

      // Close modal
      setIsEditing(false);
      setShowDeleteConfirm(false);
    } catch (err) {
      console.error("Failed to delete video", err);
    } finally {
      setIsDeleting(false);
    }
  };
  const changeFilter = () => {
    if (filter === "name-asc") setFilter("name-desc");
    else if (filter === "name-desc") setFilter("date-asc");
    else if (filter === "date-asc") setFilter("date-desc");
    else if (filter === "date-desc") setFilter("name-asc");
  };

  // Fetch videos only when the modal is opened
  useEffect(() => {
    if (isOpen) {
      const fetchVideos = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const response = await fetch("/api/videos", {
            headers: {
              "x-app-source": "shotvision-web",
            },
          });

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

  const sortedVideos = useMemo(() => {
    if (videos.length === 0) return [];
    return [...videos].sort((a, b) => {
      if (filter === "name-asc") {
        return a.title.localeCompare(b.title);
      }
      if (filter === "name-desc") {
        return b.title.localeCompare(a.title);
      }
      if (filter === "date-asc") {
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      }
      if (filter === "date-desc") {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }
      return 0;
    });
  }, [videos, filter]);

  const filteredVideos = useMemo(() => {
    if (search.trim() === "") return sortedVideos;
    return sortedVideos.filter((video) =>
      video.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, sortedVideos]);

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
                onClick={() => {
                  setEditTitle(selectedVideo.title); // Reset title on open
                  setIsEditing(true);
                }}
                className="h-8 justify-end px-2 text-muted-foreground hover:text-primary"
              >
                Edit
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Edit Video Details Modal */}
      {isEditing && selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="relative flex w-full max-w-md flex-col rounded-2xl bg-card shadow-2xl animate-in zoom-in-95 duration-200 border border-border"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Pencil className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    {showDeleteConfirm ? "Delete Video" : "Edit Video Details"}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {showDeleteConfirm
                      ? "This action cannot be undone"
                      : "Update video information"}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setIsEditing(false);
                  setShowDeleteConfirm(false);
                }}
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </Button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 p-6 space-y-4">
              {!showDeleteConfirm ? (
                // NORMAL EDIT VIEW

                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Video Title
                    </label>

                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="e.g. Forehand Analysis 1"
                    />
                  </div>

                  <div className="text-xs text-muted-foreground">
                    <p>
                      Original File:{" "}
                      <span className="font-mono bg-muted px-1 rounded">
                        {selectedVideo.key}
                      </span>
                    </p>

                    <p>Uploaded: {formatDate(selectedVideo.createdAt)}</p>
                  </div>
                </>
              ) : (
                // DELETE CONFIRMATION VIEW

                <div className="flex flex-col items-center justify-center gap-4 py-4 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                    <AlertTriangle className="h-6 w-6 text-destructive" />
                  </div>

                  <div className="space-y-2">
                    <p className="font-medium">
                      Are you sure you want to delete{" "}
                      <span className="font-bold">{selectedVideo.title}</span>?
                    </p>

                    <p className="text-sm text-muted-foreground">
                      This will permanently delete the video from your library
                      and storage.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}

            <div className="border-t border-border bg-muted/20 px-6 py-4 rounded-b-2xl">
              {!showDeleteConfirm ? (
                // NORMAL FOOTER

                <div className="flex justify-between items-center w-full">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Video
                  </Button>

                  <div className="flex gap-3">
                    <Button
                      variant="ghost"
                      onClick={() => setIsEditing(false)}
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>

                    <Button
                      onClick={handleUpdateVideo}
                      disabled={isSaving || !editTitle.trim()}
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                // DELETE CONFIRM FOOTER

                <div className="flex justify-end gap-3 w-full">
                  <Button
                    variant="ghost"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isDeleting}
                  >
                    Cancel
                  </Button>

                  <Button
                    variant="destructive"
                    onClick={handleDeleteVideo}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      "Yes, Delete Video"
                    )}
                  </Button>
                </div>
              )}
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
              <div className="flex gap-2">
                <Input
                  className="flex"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search videos..."
                />
                <Button variant="ghost" onClick={() => changeFilter()}>
                  <ListFilter className="h-5 w-5" />
                  <p>
                    {filter === "name-asc"
                      ? "A-Z"
                      : filter === "name-desc"
                      ? "Z-A"
                      : filter === "date-asc"
                      ? "Oldest"
                      : "Newest"}
                  </p>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-5 w-5 text-muted-foreground" />
                </Button>
              </div>
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
                  {filteredVideos.map((video) => (
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
