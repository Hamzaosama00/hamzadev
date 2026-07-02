import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Hamza — Frontend Developer & Digital Experience Engineer",
  description:
    "Hamza — Frontend Developer, Unity Game Developer, and AI Enthusiast. Building modern web experiences while preparing for an international software engineering career.",
  keywords: [
    "Hamza",
    "Frontend Developer",
    "Unity Developer",
    "AI Enthusiast",
    "Next.js",
    "React",
    "Three.js",
    "Portfolio",
    "Software Engineer",
  ],
  authors: [{ name: "Hamza" }],
  openGraph: {
    title: "Hamza — Frontend Developer & Digital Experience Engineer",
    description:
      "An interactive, cinematic developer portfolio. Built with Next.js, Three.js, GSAP, and Lenis.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hamza — Frontend Developer",
    description: "Building digital experiences that feel alive.",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} antialiased bg-black text-[#F2F2F2]`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
