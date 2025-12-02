import { SignIn } from "@clerk/nextjs"
import { dark } from "@clerk/themes"
import { Activity } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
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
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-balance">
            AI-powered tennis analysis
          </h2>
          <p className="text-lg text-muted-foreground text-pretty">
            Upload your videos and let computer vision analyze every detail of your swing to help you play better.
          </p>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex w-full items-center justify-center px-6 lg:w-1/2">
        <div className="w-full max-w-sm">
          {/* Mobile Logo */}
          <div className="mb-8 text-center lg:hidden">
            <Link href="/" className="mb-6 inline-flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
                <Activity className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold">ShotVision</span>
            </Link>
          </div>

          {/* Clerk Sign In Component */}
          <SignIn 
            appearance={{
              baseTheme: dark,
              variables: { 
                colorPrimary: "#6c47ff", // Matches your header button color
                fontFamily: "var(--font-geist-sans)",
              },
              elements: {
                // Remove default card styling to blend with your layout
                card: "bg-transparent shadow-none w-full border-none p-0",
                headerTitle: "text-3xl font-bold tracking-tight text-foreground",
                headerSubtitle: "text-muted-foreground",
                socialButtonsBlockButton: "bg-background border-input hover:bg-accent hover:text-accent-foreground",
                formFieldInput: "bg-background border-input text-foreground",
                footer: "hidden" // Hiding default footer to use your custom one if preferred, or remove this line to use Clerk's
              }
            }}
          />
        </div>
      </div>
    </div>
  )
}