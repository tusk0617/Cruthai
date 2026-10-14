import type { Metadata } from "next";
import { JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import { PLANS } from "@/config/pricing";
import { Demo } from "@/components/landing/Demo";
import { Hero } from "@/components/landing/Hero";
import { Navbar } from "@/components/landing/Navbar";
import { Bento, Faq, FinalCta, Footer, HowItWorks, Personas, PlatformStrip, Pricing, ProblemSolution, Trust } from "@/components/landing/Sections";

const sans = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-sans-lp", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono-lp", display: "swap" });

const TITLE = "crutha.ai — Rencana Video Siap Shooting dari Brief Produk";
const DESC = "Ubah brief produk jadi hook, script per timestamp, scene, shot list, dan editing guide untuk TikTok, Reels, dan Shorts. Gratis 5 plan, tanpa kartu kredit.";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://cruthai.vercel.app"),
  title: TITLE,
  description: DESC,
  alternates: { canonical: "/" },
  openGraph: { title: TITLE, description: DESC, type: "website", locale: "id_ID", siteName: "crutha.ai", url: "/" },
  twitter: { card: "summary", title: TITLE, description: DESC },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "crutha.ai",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description: DESC,
  offers: PLANS.map((p) => ({ "@type": "Offer", name: p.name, price: p.priceIdr, priceCurrency: "IDR" })),
};

export default function Landing() {
  return (
    <div className={`${sans.variable} ${mono.variable} lp min-h-screen overflow-x-clip bg-lbg text-lfg`}>
      <noscript><style>{`.lp-reveal{opacity:1!important;transform:none!important}`}</style></noscript>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <Navbar />
      <main>
        <Hero />
        <PlatformStrip />
        <ProblemSolution />
        <Bento />
        <HowItWorks />
        <Demo />
        <Personas />
        <Trust />
        <Pricing />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
