import { FALLBACK_RELEASES_URL, GITHUB_REPO } from "@/services/githubReleases/githubReleases";

const GITHUB_BASE = `https://github.com/${GITHUB_REPO}`;

export const LANDING_LINKS = {
  github: GITHUB_BASE,
  releases: FALLBACK_RELEASES_URL,
  documentation: `${GITHUB_BASE}#readme`,
  reportIssue: `${GITHUB_BASE}/issues/new`,
} as const;
