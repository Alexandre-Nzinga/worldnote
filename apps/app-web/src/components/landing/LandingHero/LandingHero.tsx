import { getBodyTextStyle, getHeadingProps } from "@worldnote/ui";
import { DownloadCta } from "@/components/landing/DownloadCta/DownloadCta";
import { heroContent } from "@/components/landing/landingContent";
import type { LatestReleaseState } from "@/services/githubReleases/useLatestRelease";
import { GlassWorldNoteLogo } from "./GlassWorldNoteLogo";
import { HeroCarousel } from "./HeroCarousel";

type LandingHeroProps = {
  release: LatestReleaseState;
};

export function LandingHero({ release }: LandingHeroProps) {
  const headingProps = getHeadingProps("display", {
    weight: "bold",
    className:
      "mb-10 max-w-3xl text-balance bg-linear-to-r from-wn-indigo-300 via-wn-azure-300 to-wn-azure-400 bg-clip-text text-transparent",
  });

  return (
    <section className="flex w-full flex-col items-center text-center">
      <h1
        className={`px-6 md:px-[46px] ${headingProps.className}`}
        style={{
          fontSize: headingProps.style.fontSize,
          letterSpacing: headingProps.style.letterSpacing,
          fontWeight: headingProps.style.fontWeight,
        }}
      >
        {heroContent.headline}
      </h1>

      <div className="relative mb-12 w-full">
        <HeroCarousel />
        <GlassWorldNoteLogo />
      </div>

      <p
        className="mx-auto mb-10 max-w-2xl px-6 text-balance leading-relaxed md:px-[46px]"
        style={getBodyTextStyle("body")}
      >
        {heroContent.subheadline}
      </p>

      <div className="px-6 md:px-[46px]">
        <DownloadCta release={release} />
      </div>
    </section>
  );
}
