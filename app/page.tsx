import { VideoUpload } from "@/components/video-upload"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Play, Activity, Target, Zap } from "lucide-react"
import {
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";

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

          <nav className="hidden items-center gap-8 md:flex">
            <Link href="#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              How It Works
            </Link>
          </nav>

          {/* 
          <SignedOut>
              <SignInButton />
              <SignUpButton>
                <button className="bg-[#6c47ff] text-ceramic-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer">
                  Sign Up
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          */}
          
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
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </header>

      {/* Hero Section */}
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

          {/* Video Upload Component */}
          <VideoUpload />
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
