import Link from "next/link"
import { Activity } from "lucide-react"

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  description: string
}

export function AuthLayout({ children, title, description }: AuthLayoutProps) {
  /* 
    Sharabh Ojha:
    Initially, this specific sign in layout was automatically created using Vercel's v0.app tool, albeit separately within the /login and /signup pages.
    To enhance maintainability and avoid code duplication, I refactored it into this AuthLayout component.
    Now, the login and signup pages can import this component and pass in the title, description, and children in the form of the Clerk SignIn and SignUp components.

    Prompt used in initial v0 generation:
    Please generate the barebones UI (no backend!) for a website that takes video upload input and runs CV algorithms (i.e. Mediapipe) on it to analyze tennis swing. Key things to implement:
    A video upload component; A login/signup page
    The name of the site is ShotVision, and a detailed wireframe is provided (image attached). Use a dark theme; theme switching is not required
  */
  return (
    <div className="flex min-h-screen">
      {/* Left side - Branding (Reusable) */}
      <div className="hidden w-1/2 items-center justify-center border-r border-border bg-card lg:flex">
        <div className="max-w-md px-8 text-center">
          <Link href="/" className="mb-8 inline-flex items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
              <Activity className="h-7 w-7 text-primary-foreground" />
            </div>
            <span className="text-3xl font-bold">ShotVision</span>
          </Link>
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-balance">
            {title}
          </h2>
          <p className="text-lg text-muted-foreground text-pretty">
            {description}
          </p>
        </div>
      </div>

      {/* Right side - Form Container */}
      <div className="flex w-full items-center justify-center px-6 lg:w-1/2">
        <div className="w-full max-w-sm">
          {/* Mobile Logo (Reusable) */}
          <div className="mb-8 text-center lg:hidden">
            <Link href="/" className="mb-6 inline-flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
                <Activity className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold">ShotVision</span>
            </Link>
          </div>

          {/* Adding the Sign In or Sign Up components here. */}
          {children}
        </div>
      </div>
    </div>
  )
}