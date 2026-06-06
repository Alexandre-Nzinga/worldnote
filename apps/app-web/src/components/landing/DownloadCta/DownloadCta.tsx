"use client";

import { Button, MaterialSymbol } from "@worldnote/ui";
import { useEffect, useMemo, useState } from "react";
import { heroContent } from "@/components/landing/landingContent";
import type { PlatformKey } from "@/services/githubReleases/githubReleases";
import type { LatestReleaseState } from "@/services/githubReleases/useLatestRelease";
import { useLatestRelease } from "@/services/githubReleases/useLatestRelease";
import {
  detectPlatform,
  platformLabel,
  type DetectedPlatform,
} from "@/services/platform/detectPlatform";

function resolveDownloadUrl(
  platform: PlatformKey,
  downloads: Partial<Record<PlatformKey, string>>,
  fallbackUrl: string,
): string {
  return downloads[platform] ?? fallbackUrl;
}

function resolvePrimaryPlatform(detected: DetectedPlatform): PlatformKey {
  if (detected === "unknown") {
    return "windows";
  }

  return detected;
}

type DownloadCtaProps = {
  release: LatestReleaseState;
};

export function DownloadCta({ release }: DownloadCtaProps) {
  const { status, downloads, fallbackUrl, version } = release;
  const [detectedPlatform, setDetectedPlatform] =
    useState<DetectedPlatform>("unknown");

  useEffect(() => {
    setDetectedPlatform(detectPlatform());
  }, []);

  const primaryPlatform = resolvePrimaryPlatform(detectedPlatform);

  const primaryHref = useMemo(() => {
    if (status === "error") {
      return fallbackUrl;
    }

    return resolveDownloadUrl(primaryPlatform, downloads, fallbackUrl);
  }, [status, primaryPlatform, downloads, fallbackUrl]);

  const primaryLabel =
    status === "error"
      ? "View releases on GitHub"
      : `Download for ${platformLabel[primaryPlatform]} — Free`;

  const isLoading = status === "loading";

  return (
    <div className="flex flex-col items-center gap-3">
      {isLoading ? (
        <span
          className="inline-flex min-h-9 min-w-[240px] animate-pulse items-center justify-center rounded-full bg-wn-mono-800 px-6 py-2 text-sm"
          aria-busy="true"
          aria-label="Loading latest release"
        >
          <span className="sr-only">Loading latest release</span>
        </span>
      ) : (
        <Button
          as="a"
          href={primaryHref}
          target="_blank"
          rel="noopener noreferrer"
          variant="white"
          size="sm"
          startContent={<MaterialSymbol name="download" className="text-base" />}
        >
          {primaryLabel}
        </Button>
      )}

      {status === "ready" && version ? (
        <span
          className="font-mono text-wn-mono-500"
          style={{
            fontSize: "13px",
            fontWeight: "var(--font-weight-wn-medium)",
          }}
        >
          {version}
        </span>
      ) : null}

      {!isLoading ? (
        <p
          className="text-center text-wn-mono-400"
          style={{
            fontSize: "14px",
            fontWeight: "var(--font-weight-wn-medium)",
          }}
        >
          <span>{heroContent.secondaryLinkPrefix} </span>
          <Button
            as="a"
            href={heroContent.secondaryLinkHref}
            variant="link"
            size="sm"
            className="inline align-baseline"
          >
            {heroContent.secondaryLinkLabel}
          </Button>
        </p>
      ) : null}
    </div>
  );
}

export function useLandingRelease() {
  return useLatestRelease();
}
