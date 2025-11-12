import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { PlanjoExperienceProvider } from "@/components/providers/PlanjoExperienceProvider";

const planjoSans = Space_Grotesk({
  variable: "--font-planjo-sans",
  subsets: ["latin"],
  display: "swap",
});

const planjoMono = JetBrains_Mono({
  variable: "--font-planjo-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Planjo · Flow operating system for ambitious builders",
  description:
    "Planjo keeps solo builders in flow with an addictive workspace that blends planning, focus, and momentum tracking.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${planjoSans.variable} ${planjoMono.variable} antialiased bg-[#02030a] text-white`}>
        <SessionProvider>
          <PlanjoExperienceProvider>{children}</PlanjoExperienceProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
