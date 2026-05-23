import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { GlowFollow } from "@/components/signature/GlowFollow";
import { Grain } from "@/components/signature/Grain";
import "@/styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Pathwise — You say the what. We tell you the how.",
  description:
    "A strategic planning dashboard for ambitious university students. Pathwise tells you what's actually worth executing on.",
  themeColor: "#080c14",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${display.variable}`}>
      <body className="bg-base text-primary antialiased">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <GlowFollow />
        <Grain />
        <div className="relative z-[2]">{children}</div>
      </body>
    </html>
  );
}
