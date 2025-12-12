import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { PlanjoExperienceProvider } from "@/components/providers/PlanjoExperienceProvider";

// Using local font definitions as fallback for environments that can't reach Google Fonts
// In production with Google Fonts access, you can switch back to:
// import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
const planjoSans = localFont({
  src: [
    {
      path: "../../node_modules/@fontsource/space-grotesk/files/space-grotesk-latin-400-normal.woff2",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-planjo-sans",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

const planjoMono = localFont({
  src: [
    {
      path: "../../node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff2",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-planjo-mono",
  display: "swap",
  fallback: ["ui-monospace", "monospace"],
});

export const metadata: Metadata = {
  title: "Planjo · Flow operating system for ambitious builders",
  description:
    "Planjo keeps solo builders in flow with an addictive workspace that blends planning, focus, and momentum tracking.",
  applicationName: "Planjo",
  authors: [{ name: "Planjo" }],
  keywords: ["project management", "productivity", "task management", "flow state", "solo developer", "kanban"],
  manifest: "/manifest.json",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://planjo.dev"),
  openGraph: {
    title: "Planjo · Flow operating system for ambitious builders",
    description:
      "Planjo keeps solo builders in flow with an addictive workspace that blends planning, focus, and momentum tracking.",
    url: "/",
    siteName: "Planjo",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "Planjo - Flow operating system for ambitious builders",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Planjo · Flow operating system for ambitious builders",
    description:
      "Planjo keeps solo builders in flow with an addictive workspace that blends planning, focus, and momentum tracking.",
    images: ["/og-image.svg"],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0a0e24",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${planjoSans.variable} ${planjoMono.variable} antialiased bg-[#02030a] text-white`}>
        <SessionProvider>
          <PlanjoExperienceProvider>{children}</PlanjoExperienceProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
