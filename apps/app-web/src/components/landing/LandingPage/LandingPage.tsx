"use client";

import { DownloadMatrix } from "@/components/landing/DownloadMatrix/DownloadMatrix";
import { useLandingRelease } from "@/components/landing/DownloadCta/DownloadCta";
import { FeaturePillars } from "@/components/landing/FeaturePillars/FeaturePillars";
import { LandingFooter } from "@/components/landing/LandingFooter/LandingFooter";
import { LandingHeader } from "@/components/landing/LandingHeader/LandingHeader";
import { LandingHero } from "@/components/landing/LandingHero/LandingHero";
import { LocalFirstManifesto } from "@/components/landing/LocalFirstManifesto/LocalFirstManifesto";
import { WorkflowGuide } from "@/components/landing/WorkflowGuide/WorkflowGuide";
import { pageShellClassName } from "@/components/shell/pageShellStyles";

export function LandingPage() {
  const release = useLandingRelease();

  return (
    <div className={pageShellClassName}>
      <LandingHeader />

      <main className="relative z-10 flex flex-1 flex-col gap-20 pb-6 pt-10 md:gap-24 md:pt-14">
        <div className="flex flex-col gap-20 md:gap-24">
          <LandingHero release={release} />
          <div className="px-6 md:px-[46px]">
            <FeaturePillars />
          </div>
        </div>

        <LocalFirstManifesto />

        <div className="flex flex-col gap-20 px-6 md:gap-24 md:px-[46px]">
          <WorkflowGuide />
          <DownloadMatrix release={release} />
          <LandingFooter />
        </div>
      </main>
    </div>
  );
}
