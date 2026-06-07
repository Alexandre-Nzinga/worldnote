"use client";

import { Button } from "@worldnote/ui";
import clsx from "clsx";
import type { DownloadOs } from "@/services/github/releases";
import {
  OS_FILE_HINTS,
  OS_NAMES,
  type DetectedOs,
} from "@/services/os/detectOs";

type DownloadCardProps = {
  os: DownloadOs;
  href: string;
  isRecommended: boolean;
  version: string | null;
};

/** Single platform column in the download matrix. */
export function DownloadCard({
  os,
  href,
  isRecommended,
  version,
}: DownloadCardProps) {
  return (
    <article
      className={clsx(
        "flex h-full flex-col rounded-wn-card border bg-wn-surface p-6 transition-colors",
        isRecommended
          ? "border-wn-border-strong ring-1 ring-wn-border-strong"
          : "border-wn-border hover:border-wn-border-strong",
      )}
    >
      <h3 className="text-wn-h5 font-wn-semibold text-wn-text">
        {OS_NAMES[os]}
      </h3>
      <p className="mt-1 text-wn-small text-wn-text-subtle">
        {OS_FILE_HINTS[os]}
      </p>

      {version ? (
        <p className="mt-3 text-wn-xs font-wn-medium text-wn-text-muted">
          {version}
        </p>
      ) : null}

      <div className="mt-6">
        <Button
          variant={isRecommended ? "white" : "secondary"}
          size="base"
          fullWidth
          as="a"
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="!min-h-11 !py-3"
        >
          Download
        </Button>
      </div>
    </article>
  );
}

/** Resolve whether a platform card should use the highlighted style. */
export function isRecommendedOs(
  detected: DetectedOs,
  platform: DownloadOs,
): boolean {
  if (detected === "unknown") {
    return platform === "windows";
  }
  return detected === platform;
}
