import { VideoUpload } from "@/components/video-upload"
import { RoundedVideo } from "@/components/video-player"
import { VideoCatalogSelector } from "@/components/video-catalog"
import { InteractiveCard } from "@/components/interactive-card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Play, Activity, Target, Zap, Video } from "lucide-react"
import {
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Inter } from "next/font/google"

function CalculationCard({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <InteractiveCard className="bg-blue-500/70">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription className="text-gray-300">{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </InteractiveCard>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Activity className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight text-balance">ShotVision</span>
          </Link>

          <SignedIn>
            <UserButton />
          </SignedIn>
          <SignedOut>
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">Sign up</Button>
              </Link>
            </div>
          </SignedOut>
        </div>
      </header>

      {/* Signed In - Dashboard*/}
      <SignedIn>
        <div className="m-6 grid grid-cols-4 gap-4">
          <div className="row-span-2 col-start-1 row-start-1">
            <VideoUpload />
          </div>
          <div className="row-span-2 col-start-2 row-start-1">
            <VideoCatalogSelector />
          </div>
          <RoundedVideo src="/videoplayback.mp4" className="col-span-2 row-span-2 col-start-3 row-start-1" />
          <div className="row-start-3">
            <CalculationCard title="Phases" description="Card Description">
              <p>Calculations Here</p>
            </CalculationCard>
          </div>
          <div className="row-start-3">
            <CalculationCard title="Engine" description="Card Description">
              <p>Calculations Here</p>
            </CalculationCard>
          </div>
          <div className="row-start-3">
            <CalculationCard title="Transmission" description="Card Description">
              <p>Calculations Here</p>
            </CalculationCard>
          </div>
          <div className="row-start-3">
            <CalculationCard title="Driver" description="Card Description">
              <p>Calculations Here</p>
            </CalculationCard>
          </div>
          <div className="col-span-4">
            <CalculationCard title="Overall" description="Card Description">
              <p>Calculations Here</p>
            </CalculationCard>
          </div>
        </div>
      </SignedIn>

      {/* Signed Out - Intro */}
      <SignedOut>
        <section className="container mx-auto px-6 py-20 md:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm text-primary">
              <Zap className="h-4 w-4" />
              Powered by Mediapipe AI
            </div>

            <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tighter text-balance md:text-6xl lg:text-7xl">
              Perfect your tennis swing with <span className="text-primary">AI precision</span>
            </h1>

            <p className="mb-12 text-lg text-muted-foreground text-pretty md:text-xl">
              Upload your tennis videos and let computer vision analyze your form, technique, and biomechanics in
              real-time. Get instant feedback to improve your game.
            </p>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="border-t border-border bg-card/50 py-20">
          <div className="container mx-auto px-6">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight text-balance md:text-4xl">Analyze every angle</h2>
              <p className="text-muted-foreground text-pretty">
                Advanced computer vision technology breaks down your swing mechanics
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              <div className="rounded-xl border border-border bg-card p-8">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Activity className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-balance">Body Tracking</h3>
                <p className="text-muted-foreground text-pretty">
                  Mediapipe tracks 33 body landmarks to analyze your posture, balance, and movement patterns frame by
                  frame.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-8">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-balance">Swing Analysis</h3>
                <p className="text-muted-foreground text-pretty">
                  Get detailed insights on racket speed, contact point, follow-through, and power generation metrics.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-8">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Play className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-balance">Visual Feedback</h3>
                <p className="text-muted-foreground text-pretty">
                  Watch your swing with overlaid skeleton tracking, angle measurements, and side-by-side comparisons.
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
            <p className="text-sm text-muted-foreground">© 2025 ShotVision. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
