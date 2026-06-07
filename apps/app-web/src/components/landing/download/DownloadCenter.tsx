"use client";

import { landingCopy } from "@/components/landing/shared/copy";
import {
  Reveal,
  RevealItem,
  SectionHeader,
  SectionShell,
} from "@/components/landing/shared/Reveal";
import {
  DownloadCard,
  isRecommendedOs,
} from "@/components/landing/download/DownloadCard";
import { useGithubRelease } from "@/hooks/useGithubRelease";
import { getDownloadUrl } from "@/services/github/releases";

const PLATFORMS = ["windows", "macos", "linux"] as const;

/** Manual OS selection matrix with live GitHub release asset links. */
export function DownloadCenter() {
  const { download } = landingCopy;
  const { os, version, assetsByOs } = useGithubRelease();

  return (
    <SectionShell id="download" className="border-t border-wn-border">
      <Reveal>
        <SectionHeader
          title={download.sectionTitle}
          subtitle={download.sectionSubtitle}
        />
      </Reveal>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:items-stretch lg:grid-cols-3">
        {PLATFORMS.map((platform) => (
          <RevealItem key={platform} className="h-full">
            <DownloadCard
              os={platform}
              href={getDownloadUrl(assetsByOs, platform)}
              isRecommended={isRecommendedOs(os, platform)}
              version={version}
            />
          </RevealItem>
        ))}
      </div>
    </SectionShell>
  );
}
