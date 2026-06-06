"use client";

import { useEffect, useState } from "react";
import {
  FALLBACK_RELEASES_URL,
  fetchLatestRelease,
  type PlatformAssetGroup,
  type PlatformDownloads,
} from "@/services/githubReleases/githubReleases";

export type ReleaseStatus = "loading" | "ready" | "error";

export type LatestReleaseState = {
  status: ReleaseStatus;
  version: string | null;
  downloads: PlatformDownloads;
  assetGroups: PlatformAssetGroup[];
  fallbackUrl: string;
};

export function useLatestRelease(): LatestReleaseState {
  const [state, setState] = useState<LatestReleaseState>({
    status: "loading",
    version: null,
    downloads: {},
    assetGroups: [],
    fallbackUrl: FALLBACK_RELEASES_URL,
  });

  useEffect(() => {
    let cancelled = false;

    async function loadLatestRelease() {
      try {
        const release = await fetchLatestRelease();

        if (cancelled) {
          return;
        }

        setState({
          status: "ready",
          version: release.version,
          downloads: release.downloads,
          assetGroups: release.assetGroups,
          fallbackUrl: FALLBACK_RELEASES_URL,
        });
      } catch {
        if (cancelled) {
          return;
        }

        setState({
          status: "error",
          version: null,
          downloads: {},
          assetGroups: [],
          fallbackUrl: FALLBACK_RELEASES_URL,
        });
      }
    }

    void loadLatestRelease();

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
