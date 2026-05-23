import type { Metadata } from "next";
import { Urbanist } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

const urbanist = Urbanist({
  subsets: ["latin"],
  variable: "--font-urbanist",
  display: "swap",
});

export const metadata: Metadata = {
  title: "WorldNote",
  description: "Building better worlds — local-first worldbuilding.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${urbanist.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-wn-mono-950 text-wn-mono-50">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

