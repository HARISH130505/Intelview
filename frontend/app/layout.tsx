import type { Metadata } from "next";
import { Inter, Outfit, JetBrains_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Intelview — AI-Powered Interview Intelligence Platform",
    template: "%s | Intelview",
  },
  description:
    "Transform scattered interview experiences into structured, AI-powered interview intelligence. Real company data, AI insights, mock interviews, and personalized preparation roadmaps.",
  keywords: [
    "interview preparation",
    "coding interview",
    "system design",
    "AI mock interview",
    "company interview experience",
    "technical interview",
    "FAANG interview",
  ],
  authors: [{ name: "Intelview Team" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://intelview.ai",
    siteName: "Intelview",
    title: "Intelview — AI-Powered Interview Intelligence Platform",
    description: "The Bloomberg of interview intelligence. Real data, AI insights, personalized prep.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Intelview — AI-Powered Interview Intelligence Platform",
    description: "Transform interview experiences into actionable intelligence.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${inter.variable} ${outfit.variable} ${jetbrainsMono.variable}`}
        suppressHydrationWarning
      >
        <body className="min-h-screen bg-dark-950 font-sans antialiased">
          {children}
          <Toaster
            position="bottom-right"
            theme="dark"
            toastOptions={{
              style: {
                background: "rgba(15, 23, 42, 0.95)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#f8fafc",
              },
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  );
}
