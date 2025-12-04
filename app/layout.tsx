import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

import {
  ClerkProvider,
} from "@clerk/nextjs";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

{/*
  Sharabh Ojha:
  The fonts and metadata provided here (although now changed) were part of the initial UI generated using Vercel's v0.app tool. 
  This initial generation helped us fully decide how we wanted our website to look. The fonts defined here and the first version of page.tsx were design choices we liked and ran with throughout the site.
  We obviously needed metadata for SEO and proper icon support, we just changed what the actual metadata was.

  Prompt used in initial v0 generation:
  Please generate the barebones UI (no backend!) for a website that takes video upload input and runs CV algorithms (i.e. Mediapipe) on it to analyze tennis swing. Key things to implement:
  A video upload component; A login/signup page
  The name of the site is ShotVision, and a detailed wireframe is provided (image attached). Use a dark theme; theme switching is not required
*/}

export const metadata: Metadata = {
  title: "ShotVision - AI Tennis Swing Analysis",
  description: "Analyze your tennis swing with computer vision powered by Mediapipe",
  icons: {
    icon: [
      {
        url: "/activity.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/activity.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
