import type { Metadata, Viewport } from "next";
import { SwRegister } from "@/components/SwRegister";
import "./globals.css";

export const metadata: Metadata = {
  title: "crutha.ai — AI Pre-Production Planner for Short-Form Video",
  description: "From Product Brief to Shoot-Ready Video Plan. Hook, script, scene, shot list, dan editing guide untuk TikTok, Reels, dan Shorts.",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
  appleWebApp: { capable: true, title: "crutha.ai", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#4f46e5",
};

const themeScript = `try{var t=localStorage.getItem("cp-theme");if(t==="dark"||(!t&&matchMedia("(prefers-color-scheme: dark)").matches))document.documentElement.classList.add("dark")}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
      <body>{children}<SwRegister /></body>
    </html>
  );
}
