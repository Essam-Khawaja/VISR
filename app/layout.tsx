import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Fraunces } from "next/font/google";
import "@/styles/globals.css";
import { LiquidCursor } from "@/components/shared/LiquidCursor";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Pathwise — Student Strategy Dashboard",
  description:
    "Pathwise connects the student strategy map to the day and week execution views, so goals, cuts, and dated tasks stay in sync.",
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
