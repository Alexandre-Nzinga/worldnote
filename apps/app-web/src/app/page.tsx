import { SiteNav } from "@/components/landing/Nav/SiteNav";
import { Hero } from "@/components/landing/Hero/Hero";
import { BentoGrid } from "@/components/landing/bento/BentoGrid";
import { ScreenshotCarousel } from "@/components/landing/carousel/ScreenshotCarousel";
import { DownloadCenter } from "@/components/landing/download/DownloadCenter";
import { SiteFooter } from "@/components/landing/Footer/SiteFooter";

/** WorldNote marketing landing page — composed from modular section components. */
export default function Home() {
  return (
    <>
      <SiteNav />
      <main className="flex-1">
        <Hero />
        <BentoGrid />
        <ScreenshotCarousel />
        <DownloadCenter />
      </main>
      <SiteFooter />
    </>
  );
}
