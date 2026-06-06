"use client";

import { Button, getBodyTextStyle, getHeadingProps, MaterialSymbol } from "@worldnote/ui";
import { downloadMatrixContent } from "@/components/landing/landingContent";
import { LANDING_ANCHORS } from "@/components/landing/landingAnchors";
import { landingGlassCardClassName } from "@/components/landing/shared/landingCardStyles";
import type { PlatformKey } from "@/services/githubReleases/githubReleases";
import type { LatestReleaseState } from "@/services/githubReleases/useLatestRelease";
import { platformLabel } from "@/services/platform/detectPlatform";

type DownloadMatrixProps = {
  release: LatestReleaseState;
};

const platformIcons: Record<PlatformKey, string> = {
  windows: "desktop_windows",
  mac: "laptop_mac",
  linux: "terminal",
};

function getAssetsForPlatform(
  release: LatestReleaseState,
  platform: PlatformKey,
) {
  return (
    release.assetGroups.find((group) => group.platform === platform)?.assets ??
    []
  );
}

export function DownloadMatrix({ release }: DownloadMatrixProps) {
  const { status, version, fallbackUrl } = release;

  return (
    <section
      id={LANDING_ANCHORS.download}
      className="mx-auto w-full max-w-[1008px] scroll-mt-24"
    >
      <div className="mb-3 flex flex-col gap-2">
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
        <h2
          {...getHeadingProps("h2", {
            tone: "inverse",
            weight: "bold",
            className: "text-balance",
          })}
        >
          {downloadMatrixContent.headline}
        </h2>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        {downloadMatrixContent.platforms.map((platformCard) => {
          const assets = getAssetsForPlatform(release, platformCard.platform);
          const hasAssets = assets.length > 0 && status === "ready";

          return (
            <article
              key={platformCard.platform}
              className={landingGlassCardClassName}
              style={{ borderRadius: "var(--radius-wn-card)" }}
            >
              <div className="flex flex-col gap-4 p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-wn-mono-800">
                    <MaterialSymbol
                      name={platformIcons[platformCard.platform]}
                      className="text-xl text-wn-mono-300"
                    />
                  </div>
                  <div className="min-w-0">
                    <h3
                      {...getHeadingProps("h4", {
                        tone: "inverse",
                        weight: "semibold",
                        className: "text-balance",
                      })}
                    >
                      {platformCard.title}
                    </h3>
                    <p
                      className="mt-1 text-balance"
                      style={getBodyTextStyle("small")}
                    >
                      {platformCard.subtitle}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  {status === "loading" ? (
                    <span
                      className="inline-flex h-9 animate-pulse rounded-full bg-wn-mono-800"
                      aria-busy="true"
                      aria-label={`Loading ${platformLabel[platformCard.platform]} downloads`}
                    />
                  ) : hasAssets ? (
                    assets.map((asset) => (
                      <Button
                        key={asset.url}
                        as="a"
                        href={asset.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                        startContent={
                          <MaterialSymbol name="download" className="text-base" />
                        }
                      >
                        {asset.format}
                      </Button>
                    ))
                  ) : (
                    <Button
                      as="a"
                      href={fallbackUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      startContent={
                        <MaterialSymbol name="open_in_new" className="text-base" />
                      }
                    >
                      View {platformLabel[platformCard.platform]} on GitHub
                    </Button>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
