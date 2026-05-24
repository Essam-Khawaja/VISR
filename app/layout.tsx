import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "@/styles/globals.css";
import { LiquidCursor } from "@/components/shared/LiquidCursor";

const sans = localFont({
  src: [
    {
      path: "../assets/fonts/plus-jakarta-sans-latin-300-normal.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../assets/fonts/plus-jakarta-sans-latin-400-normal.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../assets/fonts/plus-jakarta-sans-latin-500-normal.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../assets/fonts/plus-jakarta-sans-latin-600-normal.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../assets/fonts/plus-jakarta-sans-latin-700-normal.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-sans",
  display: "swap",
});

const display = localFont({
  src: [
    {
      path: "../assets/fonts/fraunces-latin-400-normal.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../assets/fonts/fraunces-latin-500-normal.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../assets/fonts/fraunces-latin-600-normal.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../assets/fonts/fraunces-latin-400-italic.woff2",
      weight: "400",
      style: "italic",
    },
    {
      path: "../assets/fonts/fraunces-latin-500-italic.woff2",
      weight: "500",
      style: "italic",
    },
    {
      path: "../assets/fonts/fraunces-latin-600-italic.woff2",
      weight: "600",
      style: "italic",
    },
  ],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pathwise — Two ways to plan your week",
  description:
    "Pathwise is one home for two perspectives on student life: StraighterNoodles for your daily flow, and Pathwise Strategy for the big-picture map.",
};

export const viewport: Viewport = {
  themeColor: "#FBF8F2",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable}`}>
      <body className="min-h-screen bg-base text-primary antialiased">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <LiquidCursor />
        {children}
      </body>
    </html>
  );
}
