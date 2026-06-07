"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import {
  fetchLatestRelease,
  getDownloadUrl,
  mapAssetsByOs,
  RELEASES_PAGE_URL,
  type OsAssetMap,
} from "@/services/github/releases";
import {
  detectOs,
  OS_LABELS,
  type DetectedOs,
} from "@/services/os/detectOs";

const EMPTY_ASSETS: OsAssetMap = {
  windows: null,
  macos: null,
  linux: null,
};

function subscribeOs(): () => void {
  return () => {};
}

function getOsSnapshot(): DetectedOs {
  return detectOs(navigator.userAgent);
}

function getOsServerSnapshot(): DetectedOs {
  return "unknown";
}

/**
 * Client hook: detects visitor OS and loads the latest GitHub release assets.
 * Gracefully degrades to the releases page when the API is unavailable.
 */
export function useGithubRelease() {
  const os = useSyncExternalStore(
    subscribeOs,
    getOsSnapshot,
    getOsServerSnapshot,
  );
  const [version, setVersion] = useState<string | null>(null);
  const [assetsByOs, setAssetsByOs] = useState<OsAssetMap>(EMPTY_ASSETS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void fetchLatestRelease()
      .then((release) => {
        if (!release) {
          return;
        }

        setVersion(release.tag_name);
        setAssetsByOs(mapAssetsByOs(release));
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const primaryOs = os === "unknown" ? "windows" : os;
  const primaryHref =
    os === "unknown"
      ? RELEASES_PAGE_URL
      : getDownloadUrl(assetsByOs, primaryOs);

  return {
    os,
    label: OS_LABELS[os],
    version,
    primaryHref,
    assetsByOs,
    releasesPageUrl: RELEASES_PAGE_URL,
    isLoading,
  };
}
