"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";

interface RoundedVideoProps
  extends React.VideoHTMLAttributes<HTMLVideoElement> {
  src: string;
  title?: string;
  className?: string;
  aspectRatio?: "video" | "square" | "portrait" | "auto";
}

export function RoundedVideo({
  src,
  title = "Annotated Swing Video",
  className,
  aspectRatio = "auto",
  ...props
}: RoundedVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  // Reset state if video source changes
  useEffect(() => {
    setHasStarted(false);
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, [src]);

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
    setHasStarted(true);
  }, [isPlaying]);

  return (
    <div className={cn(className)}>
      <div
        className={cn(
          // Base layout and rounding
          "group relative overflow-hidden rounded-2xl border-4 border-dashed border-slate-800 bg-black shadow-sm",
          // Force hardware acceleration to fix Safari border-radius clipping bugs
          "transform-gpu mask-image-fill",
          // Aspect ratio handling
          aspectRatio === "video" && "aspect-video",
          aspectRatio === "square" && "aspect-square",
          aspectRatio === "portrait" && "aspect-9/16",
          aspectRatio === "auto" && "h-full w-full"
        )}
      >
        {src ? (
          <video
            ref={videoRef}
            src={src}
            className="h-full w-full object-cover"
            playsInline
            controls={hasStarted} // Only show native controls after interaction
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onClick={(e) => {
              // Prevent click from toggling if controls are visible (optional preference)
              if (hasStarted) return;
              togglePlay();
            }}
            {...props}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted/20">
            <p className="text-muted-foreground text-sm">
              Select a video to play
            </p>
          </div>
        )}

        {/* Custom Play Button Overlay (Visible when paused or before start) */}
        {!isPlaying && (
          <div
            className="absolute inset-0 flex items-center justify-center bg-black/20 transition-all hover:bg-black/30 cursor-pointer"
            onClick={togglePlay}
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-background/90 text-primary shadow-lg transition-transform hover:scale-110 active:scale-95">
              <Play className="ml-1 h-6 w-6 fill-current" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
