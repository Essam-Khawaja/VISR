/**
 * app/layout.tsx
 *
 * The HTML root for every page. Loads the local Plus Jakarta Sans (sans)
 * and Fraunces (display) fonts as CSS variables, applies the global
 * stylesheet, and mounts the LiquidCursor ambient effect that runs on the
 * landing, Flowgram, and Strategy Web surfaces.
 *
 * Sub-route layouts (`app/flowgram/layout.tsx`,
 * `app/strategyweb/layout.tsx`) add the shared sidebar shell on top of
 * this root. The landing page deliberately renders without the sidebar.
 */

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
  title: "VISR - Visual Intelligence for Student Roadmapping",
  description:
    "VISR (Visual Intelligence for Student Roadmapping) connects your strategy map to day and week execution, so goals, cuts, and dated tasks stay in sync.",
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
