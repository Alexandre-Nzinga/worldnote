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
  title: "WorldNote — Breathe life into the abyss",
  description:
    " ",
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
