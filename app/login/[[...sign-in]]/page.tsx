import { SignIn } from "@clerk/nextjs"
import { dark } from "@clerk/themes"
import { AuthLayout } from "@/components/auth-layout"

export default function SignInPage() {
  return (
    <AuthLayout
      title="AI-powered tennis analysis"
      description="Upload your videos and let computer vision analyze every detail of your swing to help you play better."
    >
      <SignIn
        appearance={{
          baseTheme: dark,
          variables: {
            colorPrimary: "#6c47ff",
            fontFamily: "var(--font-geist-sans)",
          },
          elements: {
            card: "bg-transparent shadow-none w-full border-none p-0",
            headerTitle: "text-3xl font-bold tracking-tight text-foreground",
            headerSubtitle: "text-muted-foreground",
            socialButtonsBlockButton: "bg-background border-input hover:bg-accent hover:text-accent-foreground",
            formFieldInput: "bg-background border-input text-foreground",
            footer: "hidden",
          },
        }}
      />
    </AuthLayout>
  )
}