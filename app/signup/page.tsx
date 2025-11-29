import { SignupForm } from "@/components/signup-form"
import { Activity } from "lucide-react"
import Link from "next/link"

export default function SignupPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left side - Branding */}
      <div className="hidden w-1/2 items-center justify-center border-r border-border bg-card lg:flex">
        <div className="max-w-md px-8 text-center">
          <Link href="/" className="mb-8 inline-flex items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
              <Activity className="h-7 w-7 text-primary-foreground" />
            </div>
            <span className="text-3xl font-bold">ShotVision</span>
          </Link>
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-balance">Start improving today</h2>
          <p className="text-lg text-muted-foreground text-pretty">
            Join thousands of players using AI-powered computer vision to perfect their tennis technique.
          </p>
        </div>
      </div>

      {/* Right side - Signup Form */}
      <div className="flex w-full items-center justify-center px-6 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center lg:hidden">
            <Link href="/" className="mb-6 inline-flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
                <Activity className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold">ShotVision</span>
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold tracking-tight text-balance">Create your account</h1>
            <p className="text-muted-foreground text-pretty">Get started with your free account today</p>
          </div>

          <SignupForm />

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
