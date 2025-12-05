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
  CheckCircle2,
  AlertCircle,
  Info, // Added Info icon for descriptions
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

// --- 1. CONFIGURATION: IDEAL RANGES ---
const IDEAL_RANGES = {
  engine: {
    separation: { min: 35, max: 55, label: "35°-55°" }, 
    shoulder_rot: { min: 130, max: 165, label: "130°-165°" }, 
    hip_rot: { min: 140, max: 170, label: "140°-170°" }, 
  },
  tempo: {
    rhythm: { min: 2.5, max: 3.1, label: "2.5-3.1" },
    fwd_duration: { min: 0.20, max: 0.35, label: "0.20s-0.35s" },
  },
};

// --- 2. CONFIGURATION: METRIC DESCRIPTIONS ---
// Descriptions derived from "What it Measures (Logic)" column in PDF 
const DESCRIPTIONS = {
  engine: {
    separation: "The 'Coil' or X-Factor. Difference between shoulder rotation and hip rotation at the peak of the backswing.",
    shoulder_rot: "Max rotation of upper body relative to baseline. Essential for loading the 'Engine'.",
    hip_rot: "Max rotation of pelvis. Hips must resist shoulders slightly to create separation.",
  },
  tempo: {
    rhythm: "Ratio of time spent in Backswing vs. Forward Swing (explosive release).",
    backswing_time: "The loading phase. Ends at the 'Racket Drop' or 'Max Extension'.",
    fwd_duration: "The explosive phase duration.",
  },
};

// --- Helper: Status Checker ---
const checkRange = (val: number | undefined, range: { min: number; max: number }) => {
  if (val === undefined || val === null) return false;
  const absVal = Math.abs(val); 
  return absVal >= range.min && absVal <= range.max;
};

// --- Helper: Get Status Color ---
const getCardStatusClass = (results: boolean[]) => {
  if (results.length === 0) return "";
  const passed = results.filter((r) => r).length;

  if (passed === results.length) return "border-green-500/50 bg-green-500/5"; 
  if (passed === 0) return "border-red-500/50 bg-red-500/5"; 
  return "border-yellow-500/50 bg-yellow-500/5"; 
};

// --- Component: Range Badge ---
const RangeBadge = ({ isGood, label }: { isGood: boolean; label: string }) => (
  <span className={`text-[10px] ml-auto font-mono px-2 py-0.5 rounded-full border ${
      isGood 
        ? "text-green-600 bg-green-500/10 border-green-500/20" 
        : "text-red-500 bg-red-500/10 border-red-500/20"
    }`}>
    {isGood ? "✓" : "Target"}: {label}
  </span>
);

// --- Component: Metric Description Helper ---
const MetricDesc = ({ text }: { text: string }) => (
  <div className="flex gap-1.5 items-start mt-1 mb-3 px-1">
    <Info className="w-3 h-3 text-muted-foreground/50 mt-0.5 shrink-0" />
    <p className="text-[10px] text-muted-foreground leading-tight">
      {text}
    </p>
  </div>
);

// --- Helper Component for State Management ---
const AnalysisState = ({
  loading,
  data,
  children,
}: {
  loading: boolean;
  data: any;
  children: React.ReactNode;
}) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground/80 gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="text-xs font-medium animate-pulse">Generating Inferences...</span>
      </div>
    );
  }

  const isEmptyObject = typeof data === "object" && data !== null && Object.keys(data).length === 0;

  if (!data || isEmptyObject) {
    return (
      <div className="flex h-full items-center justify-center py-8">
        <span className="text-sm font-medium text-muted-foreground/50 italic">
          Unavailable
        </span>
      </div>
    );
  }

  return <>{children}</>;
};

export default function HomePage() {
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);
  const { data: freshData } = useVideoStatus(activeVideo?._id ?? null);
  const isDataForCurrentVideo = freshData && freshData._id === activeVideo?._id;

  const displayVideo = activeVideo
    ? isDataForCurrentVideo
      ? { ...activeVideo, ...freshData }
      : activeVideo
    : null;
  const videoUrl = displayVideo?.url || activeVideo?.url;

  const analysis = displayVideo?.analysis || {};
  const isProcessing = !!activeVideo && displayVideo?.status !== "completed";

  const handleVideoChange = (video: Video | null) => {
    setActiveVideo(video);
  };

  const normalizeAngle = (angle: number) => {
    let a = angle % 360;
    if (a > 180) a = 360 - a;
    return Math.abs(a);
  };

  // --- PRE-CALCULATE ENGINE STATUS ---
  // 1. Get Raw Values (FIXED: Accessing via 'engine' property)
  const engineData = analysis.engine || {};
  
  const rawSep = engineData?.hip_shoulder_separation?.max_value;
  const rawShldr = engineData?.max_shoulder_rotation?.value;
  const rawHip = engineData?.max_hip_rotation?.value;

  // 2. Normalize them for Display AND Checking
  // Now that raw values are found, this will correctly convert 316° -> 44°
  const sepVal = rawSep !== undefined ? normalizeAngle(rawSep) : undefined;
  const shldrVal = rawShldr !== undefined ? normalizeAngle(rawShldr) : undefined;
  const hipVal = rawHip !== undefined ? normalizeAngle(rawHip) : undefined;

  // 3. Check Status against new Djokovic Ranges
  const isSepGood = checkRange(sepVal, IDEAL_RANGES.engine.separation);
  const isShldrGood = checkRange(shldrVal, IDEAL_RANGES.engine.shoulder_rot);
  const isHipGood = checkRange(hipVal, IDEAL_RANGES.engine.hip_rot);

  // Checks if we have data to determine card color
  const engineStatusClass = (!isProcessing && engineData.max_shoulder_rotation)
    ? getCardStatusClass([isSepGood, isShldrGood, isHipGood])
    : "";

  // --- PRE-CALCULATE TEMPO STATUS ---
  const tempoData = analysis.tempo || analysis.transmission || {};
  const rhythmVal = tempoData?.swing_rhythm_ratio;
  const fwdTimeVal = tempoData?.forward_swing_duration;

  const isRhythmGood = checkRange(rhythmVal, IDEAL_RANGES.tempo.rhythm);
  const isTimeGood = checkRange(fwdTimeVal, IDEAL_RANGES.tempo.fwd_duration);

  const tempoStatusClass = (!isProcessing && tempoData.swing_rhythm_ratio)
    ? getCardStatusClass([isRhythmGood, isTimeGood])
    : "";

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
          
          {/* 1. Upload & Video Components (Unchanged) */}
          <div className="md:row-span-2 md:col-start-1 md:row-start-1">
            <VideoUpload onUploadSuccess={handleVideoChange} />
          </div>
          <div className="md:row-span-2 md:col-start-2 md:row-start-1">
            <VideoCatalogSelector
              selectedVideo={displayVideo}
              onVideoSelect={handleVideoChange}
            />
          </div>
          <RoundedVideo
            src={videoUrl || ""}
            title={displayVideo?.title || "Select a video"}
            className="md:col-span-2 md:row-span-2 md:col-start-3 md:row-start-1"
          />

          {/* 4. Data Cards */}
          
          {/* CARD: PHASES */}
          <div className="md:row-start-3">
            <CalculationCard title="Phases" description="Swing Breakdown"  className="h-full">
              <AnalysisState loading={isProcessing} data={analysis.phases}>
                <div className="space-y-1">
                  {analysis.phases &&
                    Object.entries(analysis.phases).map(([key, data]: any) => (
                      <PhaseItem key={key} name={key} data={data} />
                    ))}
                </div>
              </AnalysisState>
            </CalculationCard>
          </div>

          {/* CARD: ENGINE (With Descriptions) */}
          <div className="md:row-start-3">
            <CalculationCard 
              title="Engine" 
              description="Rotational Power"
              className={`h-full ${engineStatusClass}`}
            >
              <AnalysisState loading={isProcessing} data={analysis.engine}>
                <div className="space-y-4">
                  
                  {/* Highlight Metric: Separation */}
                  <div>
                    <div className={`rounded-lg p-3 text-center border transition-colors ${
                        isSepGood ? "bg-green-500/10 border-green-500/20" : "bg-primary/5 border-primary/10"
                      }`}>
                      <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                        Hip-Shldr Separation
                      </span>
                      <div className="text-2xl font-bold text-primary my-1 flex items-center justify-center gap-2">
                        {sepVal?.toFixed(1)}°
                        {isSepGood ? <CheckCircle2 className="w-4 h-4 text-green-500"/> : <AlertCircle className="w-4 h-4 text-amber-500"/>}
                      </div>
                      <div className="flex justify-center mt-1">
                          <RangeBadge isGood={isSepGood} label={IDEAL_RANGES.engine.separation.label} />
                      </div>
                    </div>
                    {/* Description */}
                    <MetricDesc text={DESCRIPTIONS.engine.separation} />
                  </div>

                  <div className="space-y-3">
                    {/* Shoulder Rotation Row */}
                    <div>
                        <div className="flex items-center justify-between mb-1">
                             <span className="text-xs text-muted-foreground">Ideal: {IDEAL_RANGES.engine.shoulder_rot.label}</span>
                             <div className={`w-2 h-2 rounded-full ${isShldrGood ? 'bg-green-500' : 'bg-red-400'}`} />
                        </div>
                        <StatRow
                          label="Shoulder Rot"
                          value={shldrVal}
                          unit="°"
                          icon={RotateCw}
                        />
                        <MetricDesc text={DESCRIPTIONS.engine.shoulder_rot} />
                    </div>

                    {/* Hip Rotation Row */}
                    <div>
                        <div className="flex items-center justify-between mb-1">
                             <span className="text-xs text-muted-foreground">Ideal: {IDEAL_RANGES.engine.hip_rot.label}</span>
                             <div className={`w-2 h-2 rounded-full ${isHipGood ? 'bg-green-500' : 'bg-red-400'}`} />
                        </div>
                        <StatRow
                          label="Hip Rot"
                          value={hipVal}
                          unit="°"
                          icon={RotateCw}
                        />
                        <MetricDesc text={DESCRIPTIONS.engine.hip_rot} />
                    </div>
                  </div>
                </div>
              </AnalysisState>
            </CalculationCard>
          </div>

          {/* CARD: TRANSMISSION / TEMPO (With Descriptions) */}
          <div className="md:row-start-3">
            <CalculationCard 
              title="Transmission" 
              description="Rhythm & Tempo"
              className={`h-full ${tempoStatusClass}`}
            >
              <AnalysisState loading={isProcessing} data={analysis.tempo || analysis.transmission}>
                <div className="space-y-2">
                  
                  {/* Rhythm Ratio */}
                  <div>
                    <div className="flex items-center justify-center pt-2 px-4 pb-2">
                      <div className="text-center w-full">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <div className="text-3xl font-bold tracking-tighter">
                              {rhythmVal?.toFixed(1)}:1
                          </div>
                        </div>
                        <div className="flex justify-center mb-2">
                          <RangeBadge isGood={isRhythmGood} label={IDEAL_RANGES.tempo.rhythm.label} />
                        </div>
                        <div className="text-xs text-muted-foreground uppercase">Rhythm Ratio</div>
                      </div>
                    </div>
                    <div className="px-2">
                      <MetricDesc text={DESCRIPTIONS.tempo.rhythm} />
                    </div>
                  </div>

                  <div className="space-y-2 bg-muted/30 rounded p-3">
                    {/* Backswing */}
                    <div>
                      <StatRow
                        label="Backswing Time"
                        value={tempoData?.backswing_duration}
                        unit="s"
                        icon={Timer}
                      />
                      <MetricDesc text={DESCRIPTIONS.tempo.backswing_time} />
                    </div>
                    
                    {/* Forward Swing */}
                    <div className="pt-2 border-t border-border/50">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] text-muted-foreground ml-8">Target: {IDEAL_RANGES.tempo.fwd_duration.label}</span>
                            <span className={`text-[10px] ${isTimeGood ? 'text-green-500' : 'text-red-500'}`}>
                                {isTimeGood ? "Good" : "Adjust"}
                            </span>
                        </div>
                        <StatRow
                          label="Fwd Swing Time"
                          value={fwdTimeVal}
                          unit="s"
                          icon={Zap}
                        />
                         <MetricDesc text={DESCRIPTIONS.tempo.fwd_duration} />
                    </div>
                  </div>
                </div>
              </AnalysisState>
            </CalculationCard>
          </div>

          {/* CARD: DRIVER */}
          <div className="md:row-start-3">
            <CalculationCard title="Driver" description="Key Velocities" className="h-full">
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
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(analysis.driver, null, 2)}
                  </pre>
                )}
              </AnalysisState>
            </CalculationCard>
          </div>

          {/* CARD: SCORE */}
          <div className="md:row-start-4 md:col-span-4">
            <CalculationCard title="Overall Score" description="Swing Quality, with each metric scored out of 100">
              <AnalysisState loading={isProcessing} data={displayVideo?.score}>
                <div className="flex flex-col items-center justify-center py-6">
                  
                  {/* 1. Main Total Score */}
                  <div className="text-center mb-8">
                    <div className="text-6xl font-extrabold text-primary tracking-tighter">
                      {displayVideo?.score?.total ?? "N/A"}
                    </div>
                    <div className="text-sm font-medium text-muted-foreground uppercase tracking-widest mt-2">
                      Total Score / 100
                    </div>
                  </div>

                  {/* 2. Breakdown Grid */}
                  {displayVideo?.score && typeof displayVideo.score === 'object' && (
                    <div className="w-full max-w-2xl grid grid-cols-2 md:grid-cols-4 gap-4 px-4">
                      
                      <div className="flex flex-col items-center p-3 rounded-lg bg-muted/30 border border-border/50">
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Separation</span>
                        <span className="text-xl font-bold">{Math.round(displayVideo.score.separation)}</span>
                      </div>

                      <div className="flex flex-col items-center p-3 rounded-lg bg-muted/30 border border-border/50">
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Shoulder Rot</span>
                        <span className="text-xl font-bold">{Math.round(displayVideo.score.shoulderRotation)}</span>
                      </div>

                      <div className="flex flex-col items-center p-3 rounded-lg bg-muted/30 border border-border/50">
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Hip Rot</span>
                        <span className="text-xl font-bold">{Math.round(displayVideo.score.hipRotation)}</span>
                      </div>

                      <div className="flex flex-col items-center p-3 rounded-lg bg-muted/30 border border-border/50">
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Tempo</span>
                        <span className="text-xl font-bold">{Math.round(displayVideo.score.tempo)}</span>
                      </div>

                    </div>
                  )}
                </div>
              </AnalysisState>
            </CalculationCard>
          </div>

          {/* LEADERBOARDS */}

          {/* 1: 5 Best Personal Scores; should provide the name of the video and the score */}
          <div className="md:row-start-5 md:col-span-2">

          </div>
          {/* 2: 5 Best Scores Across All Users; should provide the first name of the user and the score */}
          <div className="md:row-start-5 md:col-span-2">

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