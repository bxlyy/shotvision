"use client";

import { useState } from "react";
import {
  Play,
  Activity,
  Target,
  Zap,
  RotateCw,
  Timer,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { VideoCatalogSelector, type Video } from "@/components/video-catalog";
import { RoundedVideo } from "@/components/video-player";
import { VideoUpload } from "@/components/video-upload";
import { CalculationCard } from "@/components/calculation-card";
import { PhaseItem } from "@/components/phase-item";
import { StatRow } from "@/components/stat-row";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { useVideoStatus } from "@/hooks/use-video-status";

// --- Helper Component for State Management ---
// Now accepts a boolean 'loading' prop for cleaner logic control
const AnalysisState = ({ 
  loading, 
  data, 
  children 
}: { 
  loading: boolean; 
  data: any; 
  children: React.ReactNode 
}) => {
  
  // 1. Loading State (Generating Inferences)
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground/80 gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="text-xs font-medium animate-pulse">Generating Inferences...</span>
      </div>
    );
  }

  // 2. Unavailable State (Processing done, but specific data attribute is missing)
  const isEmptyObject = typeof data === 'object' && data !== null && Object.keys(data).length === 0;
  
  if (!data || isEmptyObject) {
    return (
      <div className="flex h-full items-center justify-center py-8">
        <span className="text-sm font-medium text-muted-foreground/50 italic">
          Unavailable
        </span>
      </div>
    );
  }

  // 3. Available State
  return <>{children}</>;
};

export default function HomePage() {
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);

  // Poll for updates
  const { data: freshData } = useVideoStatus(activeVideo?._id ?? null);

  // Compute the Display Video
  const isDataForCurrentVideo = freshData && freshData._id === activeVideo?._id;

  // We prioritize freshData (from DB) over activeVideo (from local state/upload)
  const displayVideo = activeVideo
    ? (isDataForCurrentVideo ? { ...activeVideo, ...freshData } : activeVideo)
    : null;
  const videoUrl = displayVideo?.url || activeVideo?.url;

  // 4. Extract analysis safely
  const analysis = displayVideo?.analysis || {};
  
  // LOGIC FIX:
  // If we have an active video, and status is NOT 'completed' (i.e. undefined), 
  // we consider it to be processing.
  const isProcessing = !!activeVideo && displayVideo?.status !== 'completed';

  const handleVideoChange = (video: Video | null) => {
    setActiveVideo(video);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Activity className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight text-balance">
              ShotVision
            </span>
          </Link>

          <SignedIn>
            <UserButton />
          </SignedIn>
          <SignedOut>
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm">Log in</Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">Sign up</Button>
              </Link>
            </div>
          </SignedOut>
        </div>
      </header>

      {/* Dashboard */}
      <SignedIn>
        <div className="m-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          
          {/* 1. Upload Component */}
          <div className="md:row-span-2 md:col-start-1 md:row-start-1">
            <VideoUpload onUploadSuccess={handleVideoChange} />
          </div>

          {/* 2. Video Selector */}
          <div className="md:row-span-2 md:col-start-2 md:row-start-1">
            <VideoCatalogSelector
              selectedVideo={displayVideo}
              onVideoSelect={handleVideoChange}
            />
          </div>

          {/* 3. Video Player */}
          <RoundedVideo
            src={videoUrl || ""}
            title={displayVideo?.title || "Select a video"}
            className="md:col-span-2 md:row-span-2 md:col-start-3 md:row-start-1"
          />

          {/* 4. Data Cards */}
          
          {/* CARD: PHASES */}
          <div className="md:row-start-3">
            <CalculationCard title="Phases" description="Swing Breakdown">
              <AnalysisState loading={isProcessing} data={analysis.phases}>
                <div className="space-y-1">
                  {analysis.phases && Object.entries(analysis.phases).map(([key, data]: any) => (
                    <PhaseItem key={key} name={key} data={data} />
                  ))}
                </div>
              </AnalysisState>
            </CalculationCard>
          </div>

          {/* CARD: ENGINE */}
          <div className="md:row-start-3">
            <CalculationCard title="Engine" description="Rotational Power">
              <AnalysisState loading={isProcessing} data={analysis.engine}>
                <div className="space-y-4">
                   {/* Highlight Metric: Separation (X-Factor) */}
                   <div className="rounded-lg bg-primary/5 p-3 text-center border border-primary/10">
                     <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Hip-Shldr Separation</span>
                     <div className="text-2xl font-bold text-primary my-1">
                       {analysis.engine?.hip_shoulder_separation?.max_value?.toFixed(1)}°
                     </div>
                     <span className="text-xs text-muted-foreground">
                       at {analysis.engine?.hip_shoulder_separation?.timestamp}s
                     </span>
                   </div>

                   <div className="space-y-1">
                     <StatRow 
                       label="Shoulder Rot" 
                       value={analysis.engine?.max_shoulder_rotation?.value} 
                       unit="°" 
                       icon={RotateCw}
                     />
                     <StatRow 
                       label="Hip Rot" 
                       value={analysis.engine?.max_hip_rotation?.value} 
                       unit="°"
                       icon={RotateCw} 
                     />
                   </div>
                </div>
              </AnalysisState>
            </CalculationCard>
          </div>

          {/* CARD: TRANSMISSION (Mapped to Tempo) */}
          <div className="md:row-start-3">
            <CalculationCard title="Transmission" description="Rhythm & Tempo">
               {/* Check for either tempo or transmission data */}
               <AnalysisState loading={isProcessing} data={analysis.tempo || analysis.transmission}>
                 <div className="space-y-2">
                   <div className="flex items-center justify-center p-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold tracking-tighter">
                          {analysis.tempo?.swing_rhythm_ratio?.toFixed(1)}:1
                        </div>
                        <div className="text-xs text-muted-foreground uppercase mt-1">Rhythm Ratio</div>
                      </div>
                   </div>
                   
                   <div className="space-y-1 bg-muted/30 rounded p-2">
                     <StatRow 
                       label="Backswing Time" 
                       value={analysis.tempo?.backswing_duration} 
                       unit="s"
                       icon={Timer} 
                     />
                     <StatRow 
                       label="Fwd Swing Time" 
                       value={analysis.tempo?.forward_swing_duration} 
                       unit="s"
                       icon={Zap} 
                     />
                   </div>
                 </div>
               </AnalysisState>
            </CalculationCard>
          </div>

          {/* CARD: DRIVER */}
          <div className="md:row-start-3">
            <CalculationCard title="Driver" description="Key Velocities">
              {/* Pass the primary data source (phases.contact) or secondary (driver) to the checker */}
              <AnalysisState loading={isProcessing} data={analysis.phases?.contact || analysis.driver}>
                {analysis.phases?.contact ? (
                  <div className="space-y-2">
                    <StatRow 
                      label="Wrist Velocity" 
                      value={analysis.phases.contact.wrist_velocity} 
                      unit="m/s" 
                      icon={TrendingUp}
                    />
                    <StatRow 
                      label="Elbow Angle" 
                      value={analysis.phases.contact.elbow_angle} 
                      unit="°"
                      icon={Target}
                    />
                    <div className="mt-4 pt-2 border-t border-border text-xs text-muted-foreground">
                      Velocity measured at impact frame {analysis.phases.contact.frame}.
                    </div>
                  </div>
                ) : (
                  // Fallback if driver data exists but not phase.contact
                  <pre className="text-xs overflow-auto">{JSON.stringify(analysis.driver, null, 2)}</pre>
                )}
              </AnalysisState>
            </CalculationCard>
          </div>
        </div>
      </SignedIn>

      {/* Signed Out - Intro */}
      {/*
        Sharabh Ojha:
        The landing page design was part of the initial UI generated using Vercel's v0.app tool. 
        While we preserved many elements from that initial design, some sections were moved (such as our VideoUpload component, which made more sense in the signed-in dashboard) to better fit our app's user flow.
        In addition, the scope of this page has vastly expanded since the initial generation, with the key addition being the dashboard itself, along with the many components that make it up.

        This initial generation helped us fully decide how we wanted our website to look. The implementation of this set of descriptions, combined with the fonts defined in layout.tsx, were design choices we liked and ran with throughout the site.

        Prompt used in initial v0 generation:
        Please generate the barebones UI (no backend!) for a website that takes video upload input and runs CV algorithms (i.e. Mediapipe) on it to analyze tennis swing. Key things to implement:
        A video upload component; A login/signup page
        The name of the site is ShotVision, and a detailed wireframe is provided (image attached). Use a dark theme; theme switching is not required
       */}
      <SignedOut>
        <section className="container mx-auto px-6 py-20 md:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm text-primary">
              <Zap className="h-4 w-4" />
              Powered by Mediapipe AI
            </div>

            <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tighter text-balance md:text-6xl lg:text-7xl">
              Perfect your tennis swing with{" "}
              <span className="text-primary">AI precision</span>
            </h1>

            <p className="mb-12 text-lg text-muted-foreground text-pretty md:text-xl">
              Upload your tennis videos and let computer vision analyze your
              form, technique, and biomechanics in real-time. Get instant
              feedback to improve your game.
            </p>
          </div>
        </section>

        {/* Features Section */}
        <section
          id="features"
          className="border-t border-border bg-card/50 py-20"
        >
          <div className="container mx-auto px-6">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight text-balance md:text-4xl">
                Analyze every angle
              </h2>
              <p className="text-muted-foreground text-pretty">
                Advanced computer vision technology breaks down your swing
                mechanics
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              <div className="rounded-xl border border-border bg-card p-8">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Activity className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-balance">
                  Body Tracking
                </h3>
                <p className="text-muted-foreground text-pretty">
                  Mediapipe tracks 33 body landmarks to analyze your posture,
                  balance, and movement patterns frame by frame.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-8">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-balance">
                  Swing Analysis
                </h3>
                <p className="text-muted-foreground text-pretty">
                  Get detailed insights on racket speed, contact point,
                  follow-through, and power generation metrics.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-8">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Play className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-balance">
                  Visual Feedback
                </h3>
                <p className="text-muted-foreground text-pretty">
                  Watch your swing with overlaid skeleton tracking, angle
                  measurements, and side-by-side comparisons.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="border-t border-border py-20">
          <div className="container mx-auto px-6 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-balance md:text-4xl">
              Ready to elevate your game?
            </h2>
            <p className="mb-8 text-lg text-muted-foreground text-pretty">
              Join thousands of players using AI to perfect their technique
            </p>
            <Link href="/signup">
              <Button size="lg" className="text-base">
                Get started for free
              </Button>
            </Link>
          </div>
        </section>
      </SignedOut>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary">
                <Activity className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">ShotVision</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 ShotVision. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}