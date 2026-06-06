import { getBodyTextStyle, getHeadingProps, MaterialSymbol } from "@worldnote/ui";
import { manifestoContent } from "@/components/landing/landingContent";
import { LANDING_ANCHORS } from "@/components/landing/landingAnchors";

export function LocalFirstManifesto() {
  return (
    <section
      id={LANDING_ANCHORS.security}
      className="scroll-mt-24 border-y border-white/10 bg-wn-mono-950 py-16 md:py-20"
    >
      <div className="mx-auto flex w-full max-w-[720px] flex-col items-center gap-6 px-6 text-center md:px-[46px]">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-wn-mono-900">
          <MaterialSymbol name="description" className="text-3xl text-wn-mono-300" />
        </div>

        <h2
          {...getHeadingProps("h2", {
            tone: "inverse",
            weight: "bold",
            className: "text-balance",
          })}
        >
          {manifestoContent.headline}
        </h2>

        <p
          className="max-w-xl text-balance leading-relaxed"
          style={getBodyTextStyle("body")}
        >
          {manifestoContent.subheadline}
        </p>
      </div>
    </section>
  );
}
