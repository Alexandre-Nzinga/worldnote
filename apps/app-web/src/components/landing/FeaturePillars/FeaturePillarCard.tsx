import { getBodyTextStyle, getHeadingProps } from "@worldnote/ui";
import type { PillarVariant } from "@/components/landing/landingContent";
import { landingGlassCardClassName } from "@/components/landing/shared/landingCardStyles";
import { VisualPlaceholder } from "@/components/landing/shared/VisualPlaceholder";

type FeaturePillarCardProps = {
  id?: string;
  variant: PillarVariant;
  headline: string;
  body: string;
};

export function FeaturePillarCard({
  id,
  variant,
  headline,
  body,
}: FeaturePillarCardProps) {
  return (
    <article
      {...(id ? { id } : {})}
      className={[landingGlassCardClassName, id ? "scroll-mt-24" : ""]
        .filter(Boolean)
        .join(" ")}
      style={{ borderRadius: "var(--radius-wn-card)" }}
    >
      <div className="p-2.5">
        <VisualPlaceholder variant={variant} />
      </div>

      <div className="flex flex-col gap-3 px-4 pb-5 pt-1">
        <h3
          {...getHeadingProps("h3", {
            tone: "inverse",
            weight: "bold",
            className: "text-balance",
          })}
        >
          {headline}
        </h3>
        <p className="text-balance leading-relaxed" style={getBodyTextStyle("body")}>
          {body}
        </p>
      </div>
    </article>
  );
}
