import { getHeadingProps } from "@worldnote/ui";
import { featurePillars } from "@/components/landing/landingContent";
import { LANDING_ANCHORS } from "@/components/landing/landingAnchors";
import { FeaturePillarCard } from "./FeaturePillarCard";

export function FeaturePillars() {
  return (
    <section
      id={LANDING_ANCHORS.features}
      className="mx-auto w-full max-w-[1008px] scroll-mt-24"
    >
      <div className="mb-8">
        <h2
          {...getHeadingProps("h2", {
            tone: "inverse",
            weight: "bold",
            className: "text-balance",
          })}
        >
          The core ecosystem
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {featurePillars.map((pillar) => (
          <FeaturePillarCard
            key={pillar.headline}
            id={"id" in pillar ? pillar.id : undefined}
            variant={pillar.variant}
            headline={pillar.headline}
            body={pillar.body}
          />
        ))}
      </div>
    </section>
  );
}
