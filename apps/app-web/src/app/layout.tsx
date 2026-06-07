import type { Metadata } from "next";
import { Inter, Urbanist } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

const urbanist = Urbanist({
  subsets: ["latin"],
  variable: "--font-urbanist",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "WorldNote",
  description:
    "The offline, non-linear worldbuilding app for authors and game designers. Drag, drop, and link characters, timelines, and lore on a living canvas.",
  openGraph: {
    title: "WorldNote",
    description:
      "The offline, non-linear worldbuilding app for authors and game designers.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${urbanist.variable} ${inter.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-wn-bg text-wn-text">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
